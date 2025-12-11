'use client';

import { useState, useEffect } from 'react';
import AnimatedContent from './AnimatedContent';
import ParticleBackground from './ParticleBackground';
import StaggeredMenu from './StaggeredMenu';
import CalendarView from './CalendarView';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/contexts/LanguageContext';

// Dynamically import CalendarView to avoid SSR issues
const DynamicCalendarView = dynamic(() => import('./CalendarView'), { ssr: false });

interface ScheduleItem {
  id?: string;
  type: 'kuliah' | 'kegiatan';
  name: string;
  day?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  priority?: 'tinggi' | 'sedang' | 'rendah';
  isFlexible?: boolean;
  hasSpecificTime?: boolean;
  specificDay?: string;
  specificTime?: string;
  mustBeBefore?: string;
  location?: string;
  description?: string;
  courseType?: 'teori' | 'praktikum' | 'lab' | 'seminar';
}

interface DaySchedule {
  time: string;
  activity: string;
  type: string;
  location?: string;
  description?: string;
  color?: string;
}

interface OptimizedSchedule {
  optimizedSchedule: {
    [key: string]: DaySchedule[];
  };
  analysis: {
    totalKuliah: number;
    totalKegiatan: number;
    avgStudyHoursPerDay: number;
    avgFreeHoursPerDay: number;
    workLoadBalance: string;
  };
  recommendations: string[];
  tips: string[];
  warnings?: string[];
}

const getDays = (t: (key: string) => string) => [
  t('schedule.days.monday'),
  t('schedule.days.tuesday'),
  t('schedule.days.wednesday'),
  t('schedule.days.thursday'),
  t('schedule.days.friday'),
  t('schedule.days.saturday'),
  t('schedule.days.sunday')
];

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

export default function SmartScheduleBuilder() {
  const { t } = useLanguage();
  const days = getDays(t);
  const [courses, setCourses] = useState<ScheduleItem[]>([]);
  const [activities, setActivities] = useState<ScheduleItem[]>([]);
  const [optimizedSchedule, setOptimizedSchedule] = useState<OptimizedSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'result' | 'calendar'>('input');
  const [activityMode, setActivityMode] = useState<'flexible' | 'specific'>('flexible');
  const [showPopup, setShowPopup] = useState<'jadwal' | 'kegiatan' | null>(null);


  const [newCourse, setNewCourse] = useState<Partial<ScheduleItem>>({
    type: 'kuliah',
    name: '',
    day: days[0],
    startTime: '07:00',
    endTime: '09:00',
    location: '',
    description: '',
    courseType: 'teori'
  });


  const [newActivity, setNewActivity] = useState<Partial<ScheduleItem>>({
    type: 'kegiatan',
    name: '',
    duration: 60,
    priority: 'sedang',
    isFlexible: true,
    hasSpecificTime: false,
    specificDay: days[0],
    specificTime: '09:00',
    description: ''
  });

  const [editedOptimizedSchedule, setEditedOptimizedSchedule] = useState<OptimizedSchedule | null>(null);
  const [expandedDays, setExpandedDays] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (optimizedSchedule) {
      // Perform a deep copy to ensure editedOptimizedSchedule is independent
      setEditedOptimizedSchedule(JSON.parse(JSON.stringify(optimizedSchedule)));
      // Collapse all days by default
      const allDays: { [key: string]: boolean } = {};
      Object.keys(optimizedSchedule.optimizedSchedule).forEach(day => {
        allDays[day] = false;
      });
      setExpandedDays(allDays);
    }
  }, [optimizedSchedule]);

  const toggleDay = (day: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  // Reset activity fields when mode changes
  useEffect(() => {
    if (activityMode === 'specific') {
      setNewActivity(prev => ({
        ...prev,
        specificDay: prev.specificDay || days[0],
        specificTime: prev.specificTime || '09:00',
        duration: prev.duration || 60
      }));
    } else {
      setNewActivity(prev => ({
        ...prev,
        duration: prev.duration || 60
      }));
    }
  }, [activityMode, days]);

  const handleScheduleItemChange = (
    day: string,
    index: number,
    field: keyof DaySchedule,
    value: string
  ) => {
    if (!editedOptimizedSchedule) return;

    const updatedSchedule = { ...editedOptimizedSchedule.optimizedSchedule };
    const dayActivities = [...updatedSchedule[day]];
    dayActivities[index] = {
      ...dayActivities[index],
      [field]: value,
    };
    updatedSchedule[day] = dayActivities;

    setEditedOptimizedSchedule({
      ...editedOptimizedSchedule,
      optimizedSchedule: updatedSchedule,
    });
  };

  const addCourse = () => {
    if (!newCourse.name || !newCourse.day || !newCourse.startTime || !newCourse.endTime) {
      alert(t('schedule.alerts.fillFields'));
      return;
    }
    setCourses([...courses, { ...newCourse, id: Date.now().toString() } as ScheduleItem]);
    setNewCourse({
      type: 'kuliah',
      name: '',
      day: days[0],
      startTime: '07:00',
      endTime: '09:00',
      location: '',
      description: '',
      courseType: 'teori'
    });
  };

  const addActivity = () => {
    if (!newActivity.name || newActivity.name.trim() === '') {
      alert(t('schedule.alerts.activityNameRequired'));
      return;
    }

    if (activityMode === 'specific') {
      if (!newActivity.specificDay || !newActivity.specificTime) {
        alert(t('schedule.alerts.selectDayTime'));
        return;
      }
      if (!newActivity.duration) {
        alert(t('schedule.alerts.durationRequired'));
        return;
      }
      setActivities([...activities, {
        ...newActivity,
        id: Date.now().toString(),
        hasSpecificTime: true,
        isFlexible: false
      } as ScheduleItem]);
    } else {
      if (!newActivity.duration) {
        alert(t('schedule.alerts.durationRequired'));
        return;
      }
      setActivities([...activities, {
        ...newActivity,
        id: Date.now().toString(),
        hasSpecificTime: false,
        isFlexible: true
      } as ScheduleItem]);
    }

    setNewActivity({
      type: 'kegiatan',
      name: '',
      duration: 60,
      priority: 'sedang',
      isFlexible: true,
      hasSpecificTime: false,
      specificDay: days[0],
      specificTime: '09:00',
      description: ''
    });
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const removeActivity = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const generateSchedule = async () => {
    if (courses.length === 0 && activities.length === 0) {
      alert(t('schedule.alerts.minOneItem'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courses,
          activities,
          preferences: {
            wakeUpTime: '06:00',
            sleepTime: '23:00',
            breakDuration: 60,
            studySessionDuration: 120
          }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate schedule');
      }

      const data: OptimizedSchedule = await response.json();
      setOptimizedSchedule(data);
      // Initialize edited schedule and collapsed days immediately
      setEditedOptimizedSchedule(JSON.parse(JSON.stringify(data)));
      const allDays: { [key: string]: boolean } = {};
      Object.keys(data.optimizedSchedule).forEach(day => {
        allDays[day] = false;
      });
      setExpandedDays(allDays);
      setActiveTab('result');
    } catch (error: any) {
      console.error('Error:', error);
      alert(t('schedule.alerts.error') + ': ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getColorClass = (color?: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-500',
      green: 'bg-lime-500',
      purple: 'bg-fuchsia-500',
      orange: 'bg-yellow-500',
      red: 'bg-red-500',
      gray: 'bg-gray-600',
      yellow: 'bg-yellow-500',
      pink: 'bg-pink-500',
      teal: 'bg-teal-500'
    };
    return colors[color || 'gray'] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#fef9ed' }}>
      {/* Particle Background */}
      <ParticleBackground />

      {/* Staggered Menu Navigation */}
      <StaggeredMenu
        position="right"
        colors={['#0a0a0a', '#1a1a1a', '#2a2a2a']}
        items={[
          { label: 'HOME', ariaLabel: 'Go to home page', link: '/' },
          { label: 'AI Campus Chatbot', ariaLabel: 'Go to feature 1', link: '/fitur-1' },
          { label: 'Smart Schedule', ariaLabel: 'Go to feature 3', link: '/fitur-3' },
          { label: 'Peer Connect', ariaLabel: 'Go to feature 4', link: '/fitur-4' },
          { label: 'Smart Task Manager', ariaLabel: 'Go to feature 5', link: '/fitur-5' },
          { label: 'Project Colabollator', ariaLabel: 'Go to feature 6', link: '/fitur-6' }
        ]}
        displaySocials={false}
        displayItemNumbering={true}
        logoUrl="/AICAMPUS.png"
        menuButtonColor="#fff"
        openMenuButtonColor="#fff"
        accentColor="#ffffff"
        changeMenuColorOnOpen={true}
        isFixed={true}
      />

      {/* Header */}
      <div className="py-8 px-6 shadow-sm relative z-10" style={{ backgroundColor: '#fef9ed' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-bold text-black mb-3 pt-25" style={{ fontFamily: "'Organic Relief', sans-serif" }}>
              {t('schedule.title')}
            </h1>
            <p className="text-black text-lg pt-10 sm:text-3xl" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              {t('schedule.subtitle')}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setActiveTab('input')}
              className={`px-8 py-3 rounded-3xl font-semibold transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                activeTab === 'input'
                  ? 'bg-[#ff5757] text-white'
                  : 'bg-white text-black hover:bg-[#ff5757] hover:text-white'
              }`}
            >
              {t('schedule.tabs.input')}
            </button>
            <button
              onClick={() => setActiveTab('result')}
              className={`px-8 py-3 rounded-3xl font-semibold transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                activeTab === 'result'
                  ? 'bg-[#ff5757] text-white'
                  : optimizedSchedule
                    ? 'bg-white text-black hover:bg-[#ff5757] hover:text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
              }`}
              disabled={!optimizedSchedule}
            >
              {t('schedule.tabs.result')}
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-8 py-3 rounded-3xl font-semibold transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                activeTab === 'calendar'
                  ? 'bg-[#ff5757] text-white'
                  : optimizedSchedule
                    ? 'bg-white text-black hover:bg-[#ff5757] hover:text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
              }`}
              disabled={!optimizedSchedule}
            >
               {t('schedule.tabs.calendar')}
            </button>
          </div>
        </div>
      </div>

      <div className="max-auto mx-auto px-6 py-8 relative z-10">
        {/* Input Tab */}
        {activeTab === 'input' && (
          <AnimatedContent>
          <div className="max-w-[1600px] mx-auto space-y-8">
            {/* Main Grid - Side by Side */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

              {/* LEFT SIDE - JADWAL KULIAH */}
              <AnimatedContent direction="horizontal" reverse={true} delay={0.2}>
              <div className="space-y-6 bg-white p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black min-h-[500px] flex flex-col transition-all">
                {/* Clickable Header Box */}
                <button
                  onClick={() => setShowPopup('jadwal')}
                  className="relative bg-white p-3 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ff5757] hover:text-white hover:scale-105 active:scale-95 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-black group-hover:text-white" >{t('schedule.courses.title')}</h3>
                    <div className="px-3 py-1 bg-[#ff5757]/20 border border-black rounded-full">
                      <span className="text-black group-hover:text-white text-sm font-semibold">{courses.length} {t('schedule.courses.count')}</span>
                    </div>
                  </div>
                </button>

                  {/* Moved to popup - keeping only the list here */}
                  {false && (<div className="space-y-4">
                    <div className="flex items-center w-full bg-gray-700/30 rounded-lg border border-gray-600/50 hover:bg-white/95 hover:border-white focus-within:bg-white/95 focus-within:border-white focus-within:ring-1 focus-within:ring-white transition-all group">
                      <input
                        type="text"
                        placeholder="Nama Mata Kuliah"
                        value={newCourse.name}
                        onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                        className="w-full bg-transparent text-gray-200 group-hover:text-gray-800 group-focus-within:text-gray-800 px-4 py-3 focus:outline-none placeholder:text-gray-500 group-hover:placeholder:text-gray-400 group-focus-within:placeholder:text-gray-400"
                      />
                      <span className="px-4 text-gray-500"></span>
                    </div>

                    <select
                      value={newCourse.day}
                      onChange={(e) => setNewCourse({ ...newCourse, day: e.target.value })}
                      className="w-full bg-gray-700/30 text-gray-200 rounded-lg px-4 py-3 border border-gray-600/50 hover:bg-white/95 hover:text-gray-800 hover:border-white focus:bg-white/95 focus:text-gray-800 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
                    >
                      {days.map(day => (
                        <option key={day} value={day} className="bg-neutral-700 text-gray-200">{day}</option>
                      ))}
                    </select>

                    <select
                      value={newCourse.courseType}
                      onChange={(e) => setNewCourse({ ...newCourse, courseType: e.target.value as any })}
                      className="w-full bg-gray-700/30 text-gray-200 rounded-lg px-4 py-3 border border-gray-600/50 hover:bg-white/95 hover:text-gray-800 hover:border-white focus:bg-white/95 focus:text-gray-800 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
                    >
                      <option value="teori" className="bg-neutral-700 text-gray-200">Teori</option>
                      <option value="praktikum" className="bg-neutral-700 text-gray-200">Praktikum</option>
                      <option value="lab" className="bg-neutral-700 text-gray-200">Lab</option>
                      <option value="seminar" className="bg-neutral-700 text-gray-200">Seminar</option>
                    </select>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-400 text-sm mb-2 block">Jam Mulai</label>
                        <select
                          value={newCourse.startTime}
                          onChange={(e) => setNewCourse({ ...newCourse, startTime: e.target.value })}
                          className="w-full bg-gray-700/30 text-gray-200 rounded-lg px-4 py-3 border border-gray-600/50 hover:bg-white/95 hover:text-gray-800 hover:border-white focus:bg-white/95 focus:text-gray-800 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
                        >
                          {timeSlots.map(time => (
                            <option key={time} value={time} className="bg-neutral-700 text-gray-200">{time}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm mb-2 block">Jam Selesai</label>
                        <select
                          value={newCourse.endTime}
                          onChange={(e) => setNewCourse({ ...newCourse, endTime: e.target.value })}
                          className="w-full bg-gray-700/30 text-gray-200 rounded-lg px-4 py-3 border border-gray-600/50 hover:bg-white/95 hover:text-gray-800 hover:border-white focus:bg-white/95 focus:text-gray-800 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
                        >
                          {timeSlots.map(time => (
                            <option key={time} value={time} className="bg-neutral-700 text-gray-200">{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Lokasi (opsional)"
                      value={newCourse.location || ''}
                      onChange={(e) => setNewCourse({ ...newCourse, location: e.target.value })}
                      className="w-full bg-gray-700/30 text-gray-200 rounded-lg px-4 py-3 border border-gray-600/50 hover:bg-white/95 hover:text-gray-800 hover:border-white focus:bg-white/95 focus:text-gray-800 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all placeholder:text-gray-500 hover:placeholder:text-gray-400 focus:placeholder:text-gray-400"
                    />

                    <input
                      type="text"
                      placeholder="Keterangan (opsional)"
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                      className="w-full bg-gray-700/30 text-gray-200 rounded-lg px-4 py-3 border border-gray-600/50 hover:bg-white/95 hover:text-gray-800 hover:border-white focus:bg-white/95 focus:text-gray-800 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all placeholder:text-gray-500 hover:placeholder:text-gray-400 focus:placeholder:text-gray-400"
                    />

                    <button
                      onClick={addCourse}
                      className="w-full bg-gray-700/30 border border-gray-600/50 hover:bg-white/95 hover:border-white text-gray-200 hover:text-gray-800 px-6 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
                    >
                      + TAMBAH KULIAH
                    </button>
                </div>)}

                {/* Course List */}
                {courses.length > 0 && (
                  <div className="space-y-4 flex-1">
                    {courses.map(course => (
                      <div key={course.id} className="bg-white border-2 border-black rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:scale-[1.02] transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-black font-bold text-xl mb-2">
                              {course.name}
                            </h4>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="px-3 py-1 bg-[#ff5757]/20 border border-black rounded-lg">
                                <p className="text-black text-sm font-semibold">
                                  {course.day}
                                </p>
                              </div>
                              <div className="px-3 py-1 bg-[#ff5757]/20 border border-black rounded-lg">
                                <p className="text-black text-sm font-semibold">
                                  {course.startTime} - {course.endTime}
                                </p>
                              </div>
                              {course.courseType && (
                                <div className="px-3 py-1 bg-[#ff5757]/20 border border-black rounded-lg">
                                  <span className="text-black text-sm font-semibold">
                                    {course.courseType === 'teori' && t('schedule.courseTypes.theory')}
                                    {course.courseType === 'praktikum' && t('schedule.courseTypes.practicum')}
                                    {course.courseType === 'lab' && t('schedule.courseTypes.lab')}
                                    {course.courseType === 'seminar' && t('schedule.courseTypes.seminar')}
                                  </span>
                                </div>
                              )}
                            </div>
                            {course.location && (
                              <p className="text-black text-sm mt-2">📍 {course.location}</p>
                            )}
                            {course.description && (
                              <p className="text-black text-sm mt-1">📝 {course.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeCourse(course.id!)}
                            className="text-[#ff5757] hover:text-red-700 transition-all text-3xl ml-4 hover:scale-125 active:scale-95 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </AnimatedContent>

              {/* RIGHT SIDE - KEGIATAN LAIN */}
              <AnimatedContent direction="horizontal" delay={0.2}>
              <div className="space-y-6 bg-white p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black min-h-[500px] flex flex-col transition-all">
                {/* Clickable Header Box */}
                <button
                  onClick={() => setShowPopup('kegiatan')}
                  className="relative bg-white p-3 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ff5757] hover:text-white hover:scale-105 active:scale-95 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-black group-hover:text-white" >{t('schedule.activities.title')}</h3>
                    <div className="px-3 py-1 bg-[#ff5757]/20 border border-black rounded-full">
                      <span className="text-black group-hover:text-white text-sm font-semibold">{activities.length} {t('schedule.activities.count')}</span>
                    </div>
                  </div>
                </button>

                  {/* Moved to popup */}
                  {false && (<div className="space-y-6">
                  {/* Activity Mode Toggle */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      onClick={() => setActivityMode('flexible')}
                      className={`py-4 px-4 rounded-lg font-semibold transition-all ${
                        activityMode === 'flexible'
                          ? 'bg-white/95 text-gray-800 shadow-lg'
                          : 'bg-gray-700/30 text-gray-200 border border-gray-600/50 hover:bg-white/95 hover:text-gray-800 hover:border-white'
                      }`}
                    >
                      <div className="text-sm">WAKTU FLEKSIBEL</div>
                      <div className="text-xs opacity-75 mt-1">AI tentukan waktu</div>
                    </button>
                    <button
                      onClick={() => setActivityMode('specific')}
                      className={`py-4 px-4 rounded-lg font-semibold transition-all ${
                        activityMode === 'specific'
                          ? 'bg-white/95 text-gray-800 shadow-lg'
                          : 'bg-gray-700/30 text-gray-200 border border-gray-600/50 hover:bg-white/95 hover:text-gray-800 hover:border-white'
                      }`}
                    >
                      <div className="text-sm">WAKTU SPESIFIK</div>
                      <div className="text-xs opacity-75 mt-1">Waktu ditentukan</div>
                    </button>
                  </div>

                  {/* Flexible Activity Form */}
                  {activityMode === 'flexible' && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Nama Kegiatan"
                        value={newActivity.name}
                        onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                        className="w-full bg-gray-700/30 text-gray-200 rounded-lg px-4 py-3 border border-gray-600/50 hover:bg-white/95 hover:text-gray-800 hover:border-white focus:bg-white/95 focus:text-gray-800 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all placeholder:text-gray-500 hover:placeholder:text-gray-400 focus:placeholder:text-gray-400"
                      />

                      <select
                        value={newActivity.duration}
                        onChange={(e) => setNewActivity({ ...newActivity, duration: Number(e.target.value) })}
                        className="w-full bg-gray-700/30 text-gray-200 rounded-lg px-4 py-3 border border-gray-600/50 hover:bg-white/95 hover:text-gray-800 hover:border-white focus:bg-white/95 focus:text-gray-800 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
                      >
                        <option value={30} className="bg-neutral-700 text-gray-200">30 menit</option>
                        <option value={60} className="bg-neutral-700 text-gray-200">1 jam</option>
                        <option value={90} className="bg-neutral-700 text-gray-200">1.5 jam</option>
                        <option value={120} className="bg-neutral-700 text-gray-200">2 jam</option>
                        <option value={180} className="bg-neutral-700 text-gray-200">3 jam</option>
                      </select>

                      <select
                        value={newActivity.priority}
                        onChange={(e) => setNewActivity({ ...newActivity, priority: e.target.value as any })}
                        className="w-full bg-gray-700/30 text-gray-200 rounded-lg px-4 py-3 border border-gray-600/50 hover:bg-white/95 hover:text-gray-800 hover:border-white focus:bg-white/95 focus:text-gray-800 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
                      >
                        <option value="tinggi" className="bg-neutral-700 text-gray-200">Prioritas Tinggi</option>
                        <option value="sedang" className="bg-neutral-700 text-gray-200">Prioritas Sedang</option>
                        <option value="rendah" className="bg-neutral-700 text-gray-200">Prioritas Rendah</option>
                      </select>

                      <select
                        value={newActivity.mustBeBefore || ''}
                        onChange={(e) => setNewActivity({ ...newActivity, mustBeBefore: e.target.value || undefined })}
                        className="w-full bg-gray-700/30 text-gray-200 rounded-lg px-4 py-3 border border-gray-600/50 hover:bg-white/95 hover:text-gray-800 hover:border-white focus:bg-white/95 focus:text-gray-800 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
                      >
                        <option value="" className="bg-neutral-700 text-gray-200">Kapan saja</option>
                        <option value="12:00" className="bg-neutral-700 text-gray-200">Sebelum jam 12:00</option>
                        <option value="15:00" className="bg-neutral-700 text-gray-200">Sebelum jam 15:00</option>
                        <option value="18:00" className="bg-neutral-700 text-gray-200">Sebelum jam 18:00</option>
                        <option value="20:00" className="bg-neutral-700 text-gray-200">Sebelum jam 20:00</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Keterangan (opsional)"
                        value={newActivity.description}
                        onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                        className="w-full bg-gray-700/30 text-gray-200 rounded-lg px-4 py-3 border border-gray-600/50 hover:bg-white/95 hover:text-gray-800 hover:border-white focus:bg-white/95 focus:text-gray-800 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all placeholder:text-gray-500 hover:placeholder:text-gray-400 focus:placeholder:text-gray-400"
                      />
                      
                      <button
                        onClick={addActivity}
                        className="w-full bg-gray-700/30 border border-gray-600/50 hover:bg-white/95 hover:border-white text-gray-200 hover:text-gray-800 px-6 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
                      >
                        + TAMBAH KEGIATAN
                      </button>
                    </div>
                  )}

                  {/* Specific Time Activity Form */}
                  {activityMode === 'specific' && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Nama Kegiatan"
                        value={newActivity.name}
                        onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                        className="w-full bg-gray-700/30 text-gray-200 rounded-lg px-4 py-3 border border-gray-600/50 hover:bg-white/95 hover:text-gray-800 hover:border-white focus:bg-white/95 focus:text-gray-800 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all placeholder:text-gray-500 hover:placeholder:text-gray-400 focus:placeholder:text-gray-400"
                      />

                      <select
                        value={newActivity.specificDay || 'Senin'}
                        onChange={(e) => setNewActivity({ ...newActivity, specificDay: e.target.value })}
                        className="w-full bg-gray-700/30 text-gray-200 rounded-lg px-4 py-3 border border-gray-600/50 hover:bg-white/95 hover:text-gray-800 hover:border-white focus:bg-white/95 focus:text-gray-800 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
                      >
                        {days.map(day => (
                          <option key={day} value={day} className="bg-neutral-700 text-gray-200">{day}</option>
                        ))}
                      </select>

                      <select
                        value={newActivity.specificTime || '09:00'}
                        onChange={(e) => setNewActivity({ ...newActivity, specificTime: e.target.value })}
                        className="w-full bg-gray-700/30 text-gray-200 rounded-lg px-4 py-3 border border-gray-600/50 hover:bg-white/95 hover:text-gray-800 hover:border-white focus:bg-white/95 focus:text-gray-800 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
                      >
                        {timeSlots.map(time => (
                          <option key={time} value={time} className="bg-neutral-700 text-gray-200">{time}</option>
                        ))}
                      </select>

                      <select
                        value={newActivity.duration}
                        onChange={(e) => setNewActivity({ ...newActivity, duration: Number(e.target.value) })}
                        className="w-full bg-gray-700/30 text-gray-200 rounded-lg px-4 py-3 border border-gray-600/50 hover:bg-white/95 hover:text-gray-800 hover:border-white focus:bg-white/95 focus:text-gray-800 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all"
                      >
                        <option value={30} className="bg-neutral-700 text-gray-200">30 menit</option>
                        <option value={60} className="bg-neutral-700 text-gray-200">1 jam</option>
                        <option value={90} className="bg-neutral-700 text-gray-200">1.5 jam</option>
                        <option value={120} className="bg-neutral-700 text-gray-200">2 jam</option>
                        <option value={180} className="bg-neutral-700 text-gray-200">3 jam</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Keterangan (opsional)"
                        value={newActivity.description}
                        onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                        className="w-full bg-gray-700/30 text-gray-200 rounded-lg px-4 py-3 border border-gray-600/50 hover:bg-white/95 hover:text-gray-800 hover:border-white focus:bg-white/95 focus:text-gray-800 focus:border-white focus:outline-none focus:ring-1 focus:ring-white transition-all placeholder:text-gray-500 hover:placeholder:text-gray-400 focus:placeholder:text-gray-400"
                      />
                      
                      <button
                        onClick={addActivity}
                        className="w-full bg-gray-700/30 border border-gray-600/50 hover:bg-white/95 hover:border-white text-gray-200 hover:text-gray-800 px-6 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
                      >
                        + TAMBAH KEGIATAN
                      </button>
                    </div>
                  )}
                </div>)}

                {/* Activity List */}
                {activities.length > 0 && (
                  <div className="space-y-4 flex-1">
                    {activities.map(activity => (
                      <div key={activity.id} className="bg-white border-2 border-black rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:scale-[1.02] transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-black font-bold text-xl mb-2">
                              {activity.name}
                            </h4>
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {activity.hasSpecificTime ? (
                                <>
                                  <div className="px-3 py-1 bg-[#ff5757]/20 border border-black rounded-lg">
                                    <p className="text-black text-sm font-semibold">{activity.specificDay}</p>
                                  </div>
                                  <div className="px-3 py-1 bg-[#ff5757]/20 border border-black rounded-lg">
                                    <p className="text-black text-sm font-semibold">{activity.specificTime}</p>
                                  </div>
                                  <div className="px-3 py-1 bg-[#ff5757]/20 border border-black rounded-lg">
                                    <p className="text-black text-sm font-semibold">{activity.duration} {t('schedule.minute')}</p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="px-3 py-1 bg-[#ff5757]/20 border border-black rounded-lg">
                                    <p className="text-black text-sm font-semibold">{activity.duration} {t('schedule.minute')}</p>
                                  </div>
                                  <div className="px-3 py-1 bg-[#ff5757]/20 border border-black rounded-lg">
                                    <p className="text-black text-sm font-semibold capitalize">
                                      {activity.priority === 'tinggi' && t('schedule.priorities.high')}
                                      {activity.priority === 'sedang' && t('schedule.priorities.medium')}
                                      {activity.priority === 'rendah' && t('schedule.priorities.low')}
                                    </p>
                                  </div>
                                  <div className="px-3 py-1 bg-[#ff5757]/20 border border-black rounded-lg">
                                    <p className="text-black text-sm font-semibold">{t('schedule.flexible')}</p>
                                  </div>
                                </>
                              )}
                            </div>
                            {activity.description && (
                              <p className="text-black text-sm mt-2">📝 {activity.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => removeActivity(activity.id!)}
                            className="text-[#ff5757] hover:text-red-700 transition-all text-3xl ml-4 hover:scale-125 active:scale-95 font-bold"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </AnimatedContent>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateSchedule}
              disabled={isLoading || (courses.length === 0 && activities.length === 0)}
              className="w-full bg-white border-2 border-black hover:bg-[#ff5757] text-black hover:text-white py-5 rounded-3xl font-bold text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('schedule.buttons.generating')}</span>
                </>
              ) : (
                <span>{t('schedule.buttons.generate')}</span>
              )}
            </button>
          </div>
          </AnimatedContent>
        )}

        {/* Result Tab */}
        {activeTab === 'result' && optimizedSchedule && (
          <AnimatedContent>
          <div className="space-y-8">
            {/* Analysis Cards - 4 Column Grid */}
            {optimizedSchedule.analysis && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <AnimatedContent direction="horizontal" reverse={true}>
              <div className="bg-white border-2 border-black rounded-3xl p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-4xl font-bold text-black mb-2">{optimizedSchedule.analysis?.totalKuliah || 0}</div>
                <div className="text-black text-sm uppercase tracking-wider">{t('schedule.analysis.totalCourses')}</div>
              </div>
              </AnimatedContent>
              <AnimatedContent direction="horizontal" reverse={true} delay={0.1}>
              <div className="bg-white border-2 border-black rounded-3xl p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-4xl font-bold text-black mb-2">{optimizedSchedule.analysis?.totalKegiatan || 0}</div>
                <div className="text-black text-sm uppercase tracking-wider">{t('schedule.analysis.totalActivities')}</div>
              </div>
              </AnimatedContent>
              <AnimatedContent direction="horizontal" delay={0.1}>
              <div className="bg-white border-2 border-black rounded-3xl p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-4xl font-bold text-black mb-2">{(optimizedSchedule.analysis?.avgStudyHoursPerDay || 0).toFixed(1)}h</div>
                <div className="text-black text-sm uppercase tracking-wider">{t('schedule.analysis.studyPerDay')}</div>
              </div>
              </AnimatedContent>
              <AnimatedContent direction="horizontal" delay={0.2}>
              <div className="bg-white border-2 border-black rounded-3xl p-6 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="text-2xl font-bold text-black mb-2">{optimizedSchedule.analysis?.workLoadBalance || 'N/A'}</div>
                <div className="text-black text-sm uppercase tracking-wider">{t('schedule.analysis.workload')}</div>
              </div>
              </AnimatedContent>
            </div>
            )}

            {/* Warnings */}
            {optimizedSchedule.warnings && optimizedSchedule.warnings.length > 0 && (
              <AnimatedContent>
              <div className="bg-white border-2 border-black rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-2xl font-bold text-[#ff5757] mb-4 flex items-center gap-2">
                  {t('schedule.warnings.title')}
                </h3>
                <ul className="space-y-2">
                  {optimizedSchedule.warnings.map((warning, i) => (
                    <li key={i} className="text-black flex items-start gap-3 bg-[#ff5757]/10 p-3 rounded-lg border border-black">
                      <span className="text-[#ff5757] font-bold">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
              </AnimatedContent>
            )}

            {/* Weekly Schedule Title */}
            <AnimatedContent>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-black" style={{ fontFamily: "'Organic Relief', sans-serif" }}>
                {t('schedule.weekly.title')}
              </h2>
              <div className="h-1 w-32 bg-gradient-to-r from-transparent via-black to-transparent mx-auto mt-3"></div>
            </div>
            </AnimatedContent>

            {/* Weekly Schedule - Collapsible Grid */}
            <div className="space-y-6">
              {/* First Row - 4 Days */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {editedOptimizedSchedule && Object.entries(editedOptimizedSchedule.optimizedSchedule).slice(0, 4).map(([day, schedule], dayIndex) => (
                  <AnimatedContent key={day} delay={dayIndex * 0.05}>
                    <div className="flex flex-col gap-4">
                      {/* Day Header - Clickable */}
                      <button
                        onClick={() => toggleDay(day)}
                        className="bg-white border-2 border-black rounded-3xl p-5 text-center hover:bg-[#ff5757] transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group"
                      >
                        <h3 className="text-xl font-bold uppercase tracking-wider text-black group-hover:text-white transition-colors">
                          {day}
                        </h3>
                        <div className="text-xs mt-1 text-black group-hover:text-white transition-colors">
                          {expandedDays[day] ? t('schedule.collapse.close') : t('schedule.collapse.open')}
                        </div>
                      </button>

                      {/* Schedule Table - Collapsible */}
                      {expandedDays[day] && (
                        <div className="bg-white border-2 border-black rounded-3xl overflow-hidden animate-fadeIn shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <table className="w-full">
                            <tbody>
                              {schedule.map((item, index) => (
                                <tr key={index} className="border-b border-gray-300 hover:bg-[#ff5757]/10 transition-colors">
                                  <td className="p-3 align-top w-32">
                                    <div className="text-[#ff5757] font-mono text-sm font-bold whitespace-nowrap">
                                      {item.time}
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <input
                                      type="text"
                                      value={item.activity}
                                      onChange={(e) => handleScheduleItemChange(day, index, 'activity', e.target.value)}
                                      className="w-full bg-transparent text-black text-sm font-semibold focus:outline-none border-b border-transparent focus:border-[#ff5757]"
                                    />
                                    {item.location && (
                                      <div className="text-xs text-gray-600 mt-1">📍 {item.location}</div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </AnimatedContent>
                ))}
              </div>

              {/* Second Row - 3 Days */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {editedOptimizedSchedule && Object.entries(editedOptimizedSchedule.optimizedSchedule).slice(4, 7).map(([day, schedule], dayIndex) => (
                  <AnimatedContent key={day} delay={(dayIndex + 4) * 0.05}>
                    <div className="flex flex-col gap-4">
                      {/* Day Header - Clickable */}
                      <button
                        onClick={() => toggleDay(day)}
                        className="bg-white border-2 border-black rounded-3xl p-5 text-center hover:bg-[#ff5757] transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group"
                      >
                        <h3 className="text-xl font-bold uppercase tracking-wider text-black group-hover:text-white transition-colors">
                          {day}
                        </h3>
                        <div className="text-xs mt-1 text-black group-hover:text-white transition-colors">
                          {expandedDays[day] ? t('schedule.collapse.close') : t('schedule.collapse.open')}
                        </div>
                      </button>

                      {/* Schedule Table - Collapsible */}
                      {expandedDays[day] && (
                        <div className="bg-white border-2 border-black rounded-3xl overflow-hidden animate-fadeIn shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <table className="w-full">
                            <tbody>
                              {schedule.map((item, index) => (
                                <tr key={index} className="border-b border-gray-300 hover:bg-[#ff5757]/10 transition-colors">
                                  <td className="p-3 align-top w-32">
                                    <div className="text-[#ff5757] font-mono text-sm font-bold whitespace-nowrap">
                                      {item.time}
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <input
                                      type="text"
                                      value={item.activity}
                                      onChange={(e) => handleScheduleItemChange(day, index, 'activity', e.target.value)}
                                      className="w-full bg-transparent text-black text-sm font-semibold focus:outline-none border-b border-transparent focus:border-[#ff5757]"
                                    />
                                    {item.location && (
                                      <div className="text-xs text-gray-600 mt-1">📍 {item.location}</div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </AnimatedContent>
                ))}
              </div>
            </div>
          </div>
          </AnimatedContent>
        )}

        {activeTab === 'result' && !optimizedSchedule && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-3xl font-bold text-black mb-3" style={{ fontFamily: "'Organic Relief', sans-serif" }}>{t('schedule.empty.title')}</h3>
            <p className="text-black mb-6">{t('schedule.empty.description')}</p>
            <button
              onClick={() => setActiveTab('input')}
              className="bg-white border-2 border-black hover:bg-[#ff5757] text-black hover:text-white px-8 py-3 rounded-3xl font-bold transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              {t('schedule.empty.button')}
            </button>
          </div>
        )}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && optimizedSchedule && (
          <AnimatedContent>
            <DynamicCalendarView
              optimizedSchedule={editedOptimizedSchedule?.optimizedSchedule || optimizedSchedule.optimizedSchedule}
              scheduleItems={[...courses, ...activities]}
            />
          </AnimatedContent>
        )}

        {activeTab === 'calendar' && !optimizedSchedule && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-3xl font-bold text-black mb-3" style={{ fontFamily: "'Organic Relief', sans-serif" }}>{t('schedule.empty.title')}</h3>
            <p className="text-black mb-6">{t('schedule.empty.description')}</p>
            <button
              onClick={() => setActiveTab('input')}
              className="bg-white border-2 border-black hover:bg-[#ff5757] text-black hover:text-white px-8 py-3 rounded-3xl font-bold transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              {t('schedule.empty.button')}
            </button>
          </div>
        )}
      </div>

      {/* Pop-up Modal */}
      {showPopup && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPopup(null)}
        >
          <div
            className="bg-white backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-black relative"
            onClick={(e) => e.stopPropagation()}
          >
            {showPopup === 'jadwal' && (
              <div className="space-y-6">
                {/* Close Button */}
                <div className="flex justify-end -mt-2 -mr-2 mb-2">
                  <button
                    onClick={() => setShowPopup(null)}
                    className="text-black hover:text-[#ff5757] text-3xl font-bold transition-all hover:scale-125 active:scale-95 hover:rotate-90"
                  >
                    ×
                  </button>
                </div>
                <h2 className="text-3xl font-bold text-black mb-6" style={{ fontFamily: "'Organic Relief', sans-serif" }}>
                  {t('schedule.modal.addCourse')}
                </h2>

                <input
                  type="text"
                  placeholder={t('schedule.placeholders.courseName')}
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  className="w-full bg-white text-black rounded-3xl px-4 py-3 border-2 border-black hover:border-[#ff5757] focus:border-[#ff5757] focus:outline-none transition-all placeholder:text-gray-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />

                <select
                  value={newCourse.day}
                  onChange={(e) => setNewCourse({ ...newCourse, day: e.target.value })}
                  className="w-full bg-white text-black rounded-3xl px-4 py-3 border-2 border-black hover:border-[#ff5757] focus:border-[#ff5757] focus:outline-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  {days.map(day => (
                    <option key={day} value={day} className="bg-white text-black">{day}</option>
                  ))}
                </select>

                <select
                  value={newCourse.courseType}
                  onChange={(e) => setNewCourse({ ...newCourse, courseType: e.target.value as any })}
                  className="w-full bg-white text-black rounded-3xl px-4 py-3 border-2 border-black hover:border-[#ff5757] focus:border-[#ff5757] focus:outline-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <option value="teori" className="bg-white text-black">{t('schedule.courseTypes.theory')}</option>
                  <option value="praktikum" className="bg-white text-black">{t('schedule.courseTypes.practicum')}</option>
                  <option value="lab" className="bg-white text-black">{t('schedule.courseTypes.lab')}</option>
                  <option value="seminar" className="bg-white text-black">{t('schedule.courseTypes.seminar')}</option>
                </select>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-black text-sm mb-2 block font-semibold">{t('schedule.labels.startTime')}</label>
                    <select
                      value={newCourse.startTime}
                      onChange={(e) => setNewCourse({ ...newCourse, startTime: e.target.value })}
                      className="w-full bg-white text-black rounded-3xl px-4 py-3 border-2 border-black hover:border-[#ff5757] focus:border-[#ff5757] focus:outline-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      {timeSlots.map(time => (
                        <option key={time} value={time} className="bg-white text-black">{time}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-black text-sm mb-2 block font-semibold">{t('schedule.labels.endTime')}</label>
                    <select
                      value={newCourse.endTime}
                      onChange={(e) => setNewCourse({ ...newCourse, endTime: e.target.value })}
                      className="w-full bg-white text-black rounded-3xl px-4 py-3 border-2 border-black hover:border-[#ff5757] focus:border-[#ff5757] focus:outline-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      {timeSlots.map(time => (
                        <option key={time} value={time} className="bg-white text-black">{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder={t('schedule.placeholders.location')}
                  value={newCourse.location || ''}
                  onChange={(e) => setNewCourse({ ...newCourse, location: e.target.value })}
                  className="w-full bg-white text-black rounded-3xl px-4 py-3 border-2 border-black hover:border-[#ff5757] focus:border-[#ff5757] focus:outline-none transition-all placeholder:text-gray-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />

                <input
                  type="text"
                  placeholder={t('schedule.placeholders.description')}
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full bg-white text-black rounded-3xl px-4 py-3 border-2 border-black hover:border-[#ff5757] focus:border-[#ff5757] focus:outline-none transition-all placeholder:text-gray-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                />

                <button
                  onClick={() => {
                    addCourse();
                    setShowPopup(null);
                  }}
                  className="w-full bg-[#ff5757] hover:bg-red-600 text-white px-6 py-3 rounded-3xl font-bold transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:scale-105 active:scale-95 border-2 border-black"
                >
                  {t('schedule.buttons.addCourse')}
                </button>
              </div>
            )}

            {showPopup === 'kegiatan' && (
              <div className="space-y-6">
                {/* Close Button */}
                <div className="flex justify-end -mt-2 -mr-2 mb-2">
                  <button
                    onClick={() => setShowPopup(null)}
                    className="text-black hover:text-[#ff5757] text-3xl font-bold transition-all hover:scale-125 active:scale-95 hover:rotate-90"
                  >
                    ×
                  </button>
                </div>
                <h2 className="text-3xl font-bold text-black mb-6" style={{ fontFamily: "'Organic Relief', sans-serif" }}>
                  {t('schedule.modal.addActivity')}
                </h2>

                {/* Activity Mode Toggle */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActivityMode('flexible')}
                    className={`py-4 px-4 rounded-3xl font-semibold transition-all hover:scale-105 active:scale-95 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                      activityMode === 'flexible'
                        ? 'bg-[#ff5757] text-white'
                        : 'bg-white text-black hover:bg-[#ff5757] hover:text-white'
                    }`}
                  >
                    <div className="text-sm">{t('schedule.mode.flexible')}</div>
                    <div className="text-xs opacity-75 mt-1">{t('schedule.mode.flexibleDesc')}</div>
                  </button>
                  <button
                    onClick={() => setActivityMode('specific')}
                    className={`py-4 px-4 rounded-3xl font-semibold transition-all hover:scale-105 active:scale-95 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                      activityMode === 'specific'
                        ? 'bg-[#ff5757] text-white'
                        : 'bg-white text-black hover:bg-[#ff5757] hover:text-white'
                    }`}
                  >
                    <div className="text-sm">{t('schedule.mode.specific')}</div>
                    <div className="text-xs opacity-75 mt-1">{t('schedule.mode.specificDesc')}</div>
                  </button>
                </div>

                {/* Flexible Activity Form */}
                {activityMode === 'flexible' && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder={t('schedule.placeholders.activityName')}
                      value={newActivity.name}
                      onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                      className="w-full bg-gray-100 text-black rounded-3xl px-4 py-3 border-2 border-gray-300 hover:border-[#ff5757] focus:border-[#ff5757] focus:outline-none transition-all placeholder:text-gray-500"
                    />

                    <select
                      value={newActivity.duration}
                      onChange={(e) => setNewActivity({ ...newActivity, duration: Number(e.target.value) })}
                      className="w-full bg-gray-100 text-black rounded-3xl px-4 py-3 border-2 border-gray-300 hover:border-[#ff5757] focus:border-[#ff5757] focus:outline-none transition-all"
                    >
                      <option value={30} className="bg-white text-black">{t('schedule.durations.30min')}</option>
                      <option value={60} className="bg-white text-black">{t('schedule.durations.1hour')}</option>
                      <option value={90} className="bg-white text-black">{t('schedule.durations.1.5hours')}</option>
                      <option value={120} className="bg-white text-black">{t('schedule.durations.2hours')}</option>
                      <option value={180} className="bg-white text-black">{t('schedule.durations.3hours')}</option>
                    </select>

                    <select
                      value={newActivity.priority}
                      onChange={(e) => setNewActivity({ ...newActivity, priority: e.target.value as any })}
                      className="w-full bg-gray-100 text-black rounded-3xl px-4 py-3 border-2 border-gray-300 hover:border-[#ff5757] focus:border-[#ff5757] focus:outline-none transition-all"
                    >
                      <option value="tinggi" className="bg-white text-black">{t('schedule.priorities.high')}</option>
                      <option value="sedang" className="bg-white text-black">{t('schedule.priorities.medium')}</option>
                      <option value="rendah" className="bg-white text-black">{t('schedule.priorities.low')}</option>
                    </select>

                    <select
                      value={newActivity.mustBeBefore || ''}
                      onChange={(e) => setNewActivity({ ...newActivity, mustBeBefore: e.target.value || undefined })}
                      className="w-full bg-gray-100 text-black rounded-3xl px-4 py-3 border-2 border-gray-300 hover:border-[#ff5757] focus:border-[#ff5757] focus:outline-none transition-all"
                    >
                      <option value="" className="bg-white text-black">{t('schedule.timing.anytime')}</option>
                      <option value="12:00" className="bg-white text-black">{t('schedule.timing.before12')}</option>
                      <option value="15:00" className="bg-white text-black">{t('schedule.timing.before15')}</option>
                      <option value="18:00" className="bg-white text-black">{t('schedule.timing.before18')}</option>
                      <option value="20:00" className="bg-white text-black">{t('schedule.timing.before20')}</option>
                    </select>

                    <input
                      type="text"
                      placeholder={t('schedule.placeholders.description')}
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                      className="w-full bg-gray-100 text-black rounded-3xl px-4 py-3 border-2 border-gray-300 hover:border-[#ff5757] focus:border-[#ff5757] focus:outline-none transition-all placeholder:text-gray-500"
                    />
                  </div>
                )}

                {/* Specific Time Activity Form */}
                {activityMode === 'specific' && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder={t('schedule.placeholders.activityName')}
                      value={newActivity.name}
                      onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
                      className="w-full bg-gray-100 text-black rounded-3xl px-4 py-3 border-2 border-gray-300 hover:border-[#ff5757] focus:border-[#ff5757] focus:outline-none transition-all placeholder:text-gray-500"
                    />

                    <select
                      value={newActivity.specificDay || 'Senin'}
                      onChange={(e) => setNewActivity({ ...newActivity, specificDay: e.target.value })}
                      className="w-full bg-gray-100 text-black rounded-3xl px-4 py-3 border-2 border-gray-300 hover:border-[#ff5757] focus:border-[#ff5757] focus:outline-none transition-all"
                    >
                      {days.map(day => (
                        <option key={day} value={day} className="bg-white text-black">{day}</option>
                      ))}
                    </select>

                    <select
                      value={newActivity.specificTime || '09:00'}
                      onChange={(e) => setNewActivity({ ...newActivity, specificTime: e.target.value })}
                      className="w-full bg-gray-100 text-black rounded-3xl px-4 py-3 border-2 border-gray-300 hover:border-[#ff5757] focus:border-[#ff5757] focus:outline-none transition-all"
                    >
                      {timeSlots.map(time => (
                        <option key={time} value={time} className="bg-white text-black">{time}</option>
                      ))}
                    </select>

                    <select
                      value={newActivity.duration}
                      onChange={(e) => setNewActivity({ ...newActivity, duration: Number(e.target.value) })}
                      className="w-full bg-gray-100 text-black rounded-3xl px-4 py-3 border-2 border-gray-300 hover:border-[#ff5757] focus:border-[#ff5757] focus:outline-none transition-all"
                    >
                      <option value={30} className="bg-white text-black">{t('schedule.durations.30min')}</option>
                      <option value={60} className="bg-white text-black">{t('schedule.durations.1hour')}</option>
                      <option value={90} className="bg-white text-black">{t('schedule.durations.1.5hours')}</option>
                      <option value={120} className="bg-white text-black">{t('schedule.durations.2hours')}</option>
                      <option value={180} className="bg-white text-black">{t('schedule.durations.3hours')}</option>
                    </select>

                    <input
                      type="text"
                      placeholder={t('schedule.placeholders.description')}
                      value={newActivity.description}
                      onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                      className="w-full bg-gray-100 text-black rounded-3xl px-4 py-3 border-2 border-gray-300 hover:border-[#ff5757] focus:border-[#ff5757] focus:outline-none transition-all placeholder:text-gray-500"
                    />
                  </div>
                )}

                <button
                  onClick={() => {
                    addActivity();
                    setShowPopup(null);
                  }}
                  className="w-full bg-[#ff5757] hover:bg-red-600 text-white px-6 py-3 rounded-3xl font-bold transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:scale-105 active:scale-95 border-2 border-black mt-6"
                >
                  {t('schedule.buttons.addActivity')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}