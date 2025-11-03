'use client';

import { useState } from 'react';
import AnimatedContent from './AnimatedContent';

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
  description?: string;
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

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

export default function SmartScheduleBuilder() {
  const [courses, setCourses] = useState<ScheduleItem[]>([]);
  const [activities, setActivities] = useState<ScheduleItem[]>([]);
  const [optimizedSchedule, setOptimizedSchedule] = useState<OptimizedSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'result'>('input');
  const [activityMode, setActivityMode] = useState<'flexible' | 'specific'>('flexible');

 
  const [newCourse, setNewCourse] = useState<Partial<ScheduleItem>>({
    type: 'kuliah',
    name: '',
    day: 'Senin',
    startTime: '07:00',
    endTime: '09:00',
    description: ''
  });


  const [newActivity, setNewActivity] = useState<Partial<ScheduleItem>>({
    type: 'kegiatan',
    name: '',
    duration: 60,
    priority: 'sedang',
    isFlexible: true,
    hasSpecificTime: false,
    description: ''
  });

  const addCourse = () => {
    if (!newCourse.name || !newCourse.day || !newCourse.startTime || !newCourse.endTime) {
      alert('Lengkapi semua field!');
      return;
    }
    setCourses([...courses, { ...newCourse, id: Date.now().toString() } as ScheduleItem]);
    setNewCourse({
      type: 'kuliah',
      name: '',
      day: 'Senin',
      startTime: '07:00',
      endTime: '09:00',
      description: ''
    });
  };

  const addActivity = () => {
    if (!newActivity.name) {
      alert('Nama kegiatan harus diisi!');
      return;
    }

    if (activityMode === 'specific') {
      if (!newActivity.specificDay || !newActivity.specificTime) {
        alert('Pilih hari dan waktu untuk kegiatan!');
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
        alert('Durasi kegiatan harus diisi!');
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
      alert('Tambahkan minimal 1 jadwal kuliah atau kegiatan!');
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
      setActiveTab('result');
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Terjadi kesalahan: ${error.message}`);
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
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-8 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-5xl font-bold text-teal-600 mb-3">
              SMART SCHEDULE BUILDER
            </h1>
            <p className="text-gray-600 text-lg">
              AI bantu atur jadwal kuliah dan kegiatanmu agar seimbang dan produktif
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setActiveTab('input')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'input'
                  ? 'bg-teal-500 text-white shadow-lg'
                  : 'bg-white text-teal-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              INPUT JADWAL
            </button>
            <button
              onClick={() => setActiveTab('result')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'result'
                  ? 'bg-teal-500 text-white shadow-lg'
                  : 'bg-white text-teal-600 border border-gray-300 hover:bg-gray-50'
              }`}
              disabled={!optimizedSchedule}
            >
              JADWAL OPTIMAL
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto px-6 py-8">
        {/* Input Tab */}
        {activeTab === 'input' && (
          <AnimatedContent>
          <div className="space-y-8">
            {/* Section Title */}
            <AnimatedContent direction="horizontal" reverse={true}>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-teal-600">
                INPUT JADWAL & KEGIATAN
              </h2>
              <div className="h-1 w-32 bg-gradient-to-r from-transparent via-teal-500 to-transparent mx-auto mt-3"></div>
            </div>
            </AnimatedContent>

            {/* Main Grid - Side by Side */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
              
              {/* LEFT SIDE - JADWAL KULIAH */}
              <AnimatedContent direction="horizontal" reverse={true} delay={0.2}>
              <div className="space-y-6 bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl font-bold text-teal-600">JADWAL KULIAH</h3>
                  <div className="px-4 py-2 bg-teal-100 border border-teal-200 rounded-full">
                    <span className="text-teal-700 font-semibold">{courses.length} Kuliah</span>
                  </div>
                </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center w-full bg-gray-50 rounded-lg border border-gray-300 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
                      <input
                        type="text"
                        placeholder="Nama Mata Kuliah"
                        value={newCourse.name}
                        onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                        className="w-full bg-transparent text-gray-800 px-4 py-3 focus:outline-none"
                      />
                      <span className="px-4 text-gray-500">📖</span>
                    </div>
                    
                    <select
                      value={newCourse.day}
                      onChange={(e) => setNewCourse({ ...newCourse, day: e.target.value })}
                      className="w-full bg-gray-50 text-gray-800 rounded-lg px-4 py-3 border border-gray-300 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                    >
                      {days.map(day => (
                        <option key={day} value={day} className="bg-white text-gray-800">{day}</option>
                      ))}
                    </select>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-600 text-sm mb-2 block">Jam Mulai</label>
                        <select
                          value={newCourse.startTime}
                          onChange={(e) => setNewCourse({ ...newCourse, startTime: e.target.value })}
                          className="w-full bg-gray-50 text-gray-800 rounded-lg px-4 py-3 border border-gray-300 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                        >
                          {timeSlots.map(time => (
                            <option key={time} value={time} className="bg-white text-gray-800">{time}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-gray-600 text-sm mb-2 block">Jam Selesai</label>
                        <select
                          value={newCourse.endTime}
                          onChange={(e) => setNewCourse({ ...newCourse, endTime: e.target.value })}
                          className="w-full bg-gray-50 text-gray-800 rounded-lg px-4 py-3 border border-gray-300 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                        >
                          {timeSlots.map(time => (
                            <option key={time} value={time} className="bg-white text-gray-800">{time}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Lokasi/Keterangan (opsional)"
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                      className="w-full bg-gray-50 text-gray-800 rounded-lg px-4 py-3 border border-gray-300 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                    />
                    
                    <button
                      onClick={addCourse}
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
                    >
                      + TAMBAH KULIAH
                    </button>
                </div>

                {/* Course List */}
                {courses.length > 0 && (
                  <div className="space-y-3">
                    {courses.map(course => (
                      <div key={course.id} className="bg-gray-50 border-l-4 border-teal-500 rounded-r-lg p-4 flex justify-between items-center transition-all hover:shadow-md">
                        <div className="flex-1">
                          <p className="text-gray-800 font-semibold text-lg">{course.name}</p>
                          <p className="text-gray-500 text-sm mt-1">
                            {course.day} • {course.startTime} - {course.endTime}
                          </p>
                          {course.description && (
                            <p className="text-gray-400 text-sm mt-1">{course.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeCourse(course.id!)}
                          className="text-red-500 hover:text-red-700 transition-colors text-2xl ml-4 hover:scale-110"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </AnimatedContent>

              {/* RIGHT SIDE - KEGIATAN */}
              <AnimatedContent direction="horizontal" delay={0.2}>
              <div className="space-y-6 bg-white p-8 rounded-lg shadow-md">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl font-bold text-fuchsia-600">KEGIATAN LAIN</h3>
                  <div className="px-4 py-2 bg-fuchsia-100 border border-fuchsia-200 rounded-full">
                    <span className="text-fuchsia-700 font-semibold">{activities.length} Kegiatan</span>
                  </div>
                </div>

                  {/* Activity Mode Toggle */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                      onClick={() => setActivityMode('flexible')}
                      className={`py-4 px-4 rounded-lg font-semibold transition-all ${
                        activityMode === 'flexible'
                          ? 'bg-fuchsia-500 text-white shadow-lg'
                          : 'bg-white text-fuchsia-600 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-sm">WAKTU FLEKSIBEL</div>
                      <div className="text-xs opacity-75 mt-1">AI tentukan waktu</div>
                    </button>
                    <button
                      onClick={() => setActivityMode('specific')}
                      className={`py-4 px-4 rounded-lg font-semibold transition-all ${
                        activityMode === 'specific'
                          ? 'bg-yellow-500 text-white shadow-lg'
                          : 'bg-white text-yellow-600 border border-gray-300 hover:bg-gray-50'
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
                        className="w-full bg-gray-50 text-gray-800 rounded-lg px-4 py-3 border border-gray-300 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 transition-all"
                      />
                      
                      <select
                        value={newActivity.duration}
                        onChange={(e) => setNewActivity({ ...newActivity, duration: Number(e.target.value) })}
                        className="w-full bg-gray-50 text-gray-800 rounded-lg px-4 py-3 border border-gray-300 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 transition-all"
                      >
                        <option value={30} className="bg-white text-gray-800">30 menit</option>
                        <option value={60} className="bg-white text-gray-800">1 jam</option>
                        <option value={90} className="bg-white text-gray-800">1.5 jam</option>
                        <option value={120} className="bg-white text-gray-800">2 jam</option>
                        <option value={180} className="bg-white text-gray-800">3 jam</option>
                      </select>
                      
                      <select
                        value={newActivity.priority}
                        onChange={(e) => setNewActivity({ ...newActivity, priority: e.target.value as any })}
                        className="w-full bg-gray-50 text-gray-800 rounded-lg px-4 py-3 border border-gray-300 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 transition-all"
                      >
                        <option value="tinggi" className="bg-white text-gray-800">Prioritas Tinggi</option>
                        <option value="sedang" className="bg-white text-gray-800">Prioritas Sedang</option>
                        <option value="rendah" className="bg-white text-gray-800">Prioritas Rendah</option>
                      </select>
                      
                      <select
                        value={newActivity.mustBeBefore || ''}
                        onChange={(e) => setNewActivity({ ...newActivity, mustBeBefore: e.target.value || undefined })}
                        className="w-full bg-gray-50 text-gray-800 rounded-lg px-4 py-3 border border-gray-300 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 transition-all"
                      >
                        <option value="" className="bg-white text-gray-800">Kapan saja</option>
                        <option value="12:00" className="bg-white text-gray-800">Sebelum jam 12:00</option>
                        <option value="15:00" className="bg-white text-gray-800">Sebelum jam 15:00</option>
                        <option value="18:00" className="bg-white text-gray-800">Sebelum jam 18:00</option>
                        <option value="20:00" className="bg-white text-gray-800">Sebelum jam 20:00</option>
                      </select>
                      
                      <input
                        type="text"
                        placeholder="Keterangan (opsional)"
                        value={newActivity.description}
                        onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                        className="w-full bg-gray-50 text-gray-800 rounded-lg px-4 py-3 border border-gray-300 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 transition-all"
                      />
                      
                      <button
                        onClick={addActivity}
                        className="w-full bg-fuchsia-500 hover:bg-fuchsia-600 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
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
                        className="w-full bg-gray-50 text-gray-800 rounded-lg px-4 py-3 border border-gray-300 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all"
                      />
                      
                      <select
                        value={newActivity.specificDay || 'Senin'}
                        onChange={(e) => setNewActivity({ ...newActivity, specificDay: e.target.value })}
                        className="w-full bg-gray-50 text-gray-800 rounded-lg px-4 py-3 border border-gray-300 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all"
                      >
                        {days.map(day => (
                          <option key={day} value={day} className="bg-white text-gray-800">{day}</option>
                        ))}
                      </select>
                      
                      <select
                        value={newActivity.specificTime || '09:00'}
                        onChange={(e) => setNewActivity({ ...newActivity, specificTime: e.target.value })}
                        className="w-full bg-gray-50 text-gray-800 rounded-lg px-4 py-3 border border-gray-300 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all"
                      >
                        {timeSlots.map(time => (
                          <option key={time} value={time} className="bg-white text-gray-800">{time}</option>
                        ))}
                      </select>
                      
                      <select
                        value={newActivity.duration}
                        onChange={(e) => setNewActivity({ ...newActivity, duration: Number(e.target.value) })}
                        className="w-full bg-gray-50 text-gray-800 rounded-lg px-4 py-3 border border-gray-300 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all"
                      >
                        <option value={30} className="bg-white text-gray-800">30 menit</option>
                        <option value={60} className="bg-white text-gray-800">1 jam</option>
                        <option value={90} className="bg-white text-gray-800">1.5 jam</option>
                        <option value={120} className="bg-white text-gray-800">2 jam</option>
                        <option value={180} className="bg-white text-gray-800">3 jam</option>
                      </select>
                      
                      <input
                        type="text"
                        placeholder="Keterangan (opsional)"
                        value={newActivity.description}
                        onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                        className="w-full bg-gray-50 text-gray-800 rounded-lg px-4 py-3 border border-gray-300 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-all"
                      />
                      
                      <button
                        onClick={addActivity}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-md hover:shadow-lg"
                      >
                        + TAMBAH KEGIATAN
                      </button>
                    </div>
                  )}
                </div>

                {/* Activity List */}
                {activities.length > 0 && (
                  <div className="space-y-3">
                    {activities.map(activity => (
                      <div key={activity.id} className={`bg-gray-50 rounded-r-lg p-4 flex justify-between items-center transition-all hover:shadow-md ${
                        activity.hasSpecificTime ? 'border-l-4 border-yellow-500' : 'border-l-4 border-fuchsia-500'
                      }`}>
                        <div className="flex-1">
                          <p className={`font-semibold text-lg ${activity.hasSpecificTime ? 'text-yellow-700' : 'text-fuchsia-700'}`}>
                            {activity.name}
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            {activity.hasSpecificTime ? (
                              <>{activity.specificDay} • {activity.specificTime} • {activity.duration} menit</>
                            ) : (
                              <>Durasi: {activity.duration} menit • {activity.priority}</>
                            )}
                          </p>
                          {activity.description && (
                            <p className="text-gray-400 text-sm mt-1">{activity.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeActivity(activity.id!)}
                          className="text-red-500 hover:text-red-700 transition-colors text-2xl ml-4 hover:scale-110"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              </AnimatedContent>
            </div>

            {/* Generate Button */}
            <AnimatedContent>
            <button
              onClick={generateSchedule}
              disabled={isLoading || (courses.length === 0 && activities.length === 0)}
              className="w-full bg-gradient-to-r from-teal-500 via-fuchsia-500 to-pink-500 text-white py-5 rounded-xl font-bold text-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>AI SEDANG MENYUSUN JADWAL OPTIMAL...</span>
                </>
              ) : (
                <span>GENERATE JADWAL OPTIMAL DENGAN AI</span>
              )}
            </button>
            </AnimatedContent>
          </div>
          </AnimatedContent>
        )}

        {/* Result Tab */}
        {activeTab === 'result' && optimizedSchedule && (
          <AnimatedContent>
          <div className="space-y-8">
            {/* Analysis Cards - 4 Column Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <AnimatedContent direction="horizontal" reverse={true}>
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-md">
                <div className="text-4xl font-bold text-teal-600 mb-2">{optimizedSchedule.analysis.totalKuliah}</div>
                <div className="text-gray-500 text-sm uppercase tracking-wider">Total Kuliah</div>
              </div>
              </AnimatedContent>
              <AnimatedContent direction="horizontal" reverse={true} delay={0.1}>
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-md">
                <div className="text-4xl font-bold text-fuchsia-600 mb-2">{optimizedSchedule.analysis.totalKegiatan}</div>
                <div className="text-gray-500 text-sm uppercase tracking-wider">Total Kegiatan</div>
              </div>
              </AnimatedContent>
              <AnimatedContent direction="horizontal" delay={0.1}>
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-md">
                <div className="text-4xl font-bold text-lime-600 mb-2">{optimizedSchedule.analysis.avgStudyHoursPerDay.toFixed(1)}h</div>
                <div className="text-gray-500 text-sm uppercase tracking-wider">Belajar/Hari</div>
              </div>
              </AnimatedContent>
              <AnimatedContent direction="horizontal" delay={0.2}>
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center shadow-md">
                <div className="text-2xl font-bold text-yellow-600 mb-2">{optimizedSchedule.analysis.workLoadBalance}</div>
                <div className="text-gray-500 text-sm uppercase tracking-wider">Beban Kerja</div>
              </div>
              </AnimatedContent>
            </div>

            {/* Warnings */}
            {optimizedSchedule.warnings && optimizedSchedule.warnings.length > 0 && (
              <AnimatedContent>
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 shadow-md">
                <h3 className="text-2xl font-bold text-red-600 mb-4 flex items-center gap-2">
                  PERINGATAN
                </h3>
                <ul className="space-y-2">
                  {optimizedSchedule.warnings.map((warning, i) => (
                    <li key={i} className="text-red-800 flex items-start gap-3 bg-red-100 p-3 rounded-lg">
                      <span className="text-red-600 font-bold">•</span>
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
              <h2 className="text-3xl font-bold text-teal-600">
                JADWAL MINGGUAN OPTIMAL
              </h2>
              <div className="h-1 w-32 bg-gradient-to-r from-transparent via-teal-500 to-transparent mx-auto mt-3"></div>
            </div>
            </AnimatedContent>

            {/* Weekly Schedule - 3 Column Grid for Better Readability */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(optimizedSchedule.optimizedSchedule).map(([day, schedule], dayIndex) => (
                <AnimatedContent key={day} delay={dayIndex * 0.1}>
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-lg transition-all">
                  <h3 className="text-xl font-bold text-teal-600 mb-4 pb-3 border-b-2 border-gray-200 uppercase tracking-wider">
                    {day}
                  </h3>
                  <div className="space-y-3">
                    {schedule.map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-3 border-l-4 border-teal-500 hover:shadow-md transition-all"
                      >
                        {/* Time Badge */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-teal-100 px-2 py-1 rounded border border-teal-200">
                            <div className="text-teal-700 font-mono text-xs font-bold">
                              {item.time}
                            </div>
                          </div>
                          <span className={`w-2 h-2 rounded-full ${getColorClass(item.color)}`}></span>
                        </div>

                        {/* Content */}
                        <h4 className="text-gray-800 font-semibold mb-1">{item.activity}</h4>
                        
                        {item.description && (
                          <p className="text-gray-600 text-sm mb-1">{item.description}</p>
                        )}
                        
                        {item.location && (
                          <p className="text-gray-500 text-xs">{item.location}</p>
                        )}

                        {/* Type Badge */}
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            item.type === 'kuliah' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                            item.type === 'kegiatan' ? 'bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-200' :
                            item.type === 'routine' ? 'bg-gray-200 text-gray-800 border border-gray-300' :
                            'bg-lime-100 text-lime-800 border border-lime-200'
                          }`}>
                            {item.type.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                </AnimatedContent>
              ))}
            </div>

            {/* Recommendations & Tips - 2 Column Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recommendations */}
              <AnimatedContent direction="horizontal" reverse={true} delay={0.3}>
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-lime-600 mb-4 uppercase tracking-wider">
                  REKOMENDASI AI
                </h2>
                <ul className="space-y-3">
                  {optimizedSchedule.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border-l-4 border-lime-500">
                      <span className="text-lime-600 font-bold text-lg">✓</span>
                      <span className="text-gray-700 text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
              </AnimatedContent>

              {/* Tips */}
              <AnimatedContent direction="horizontal" delay={0.3}>
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-yellow-600 mb-4 uppercase tracking-wider">
                  TIPS PRODUKTIVITAS
                </h2>
                <ul className="space-y-3">
                  {optimizedSchedule.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border-l-4 border-yellow-500">
                      <span className="text-yellow-600 font-bold text-lg">★</span>
                      <span className="text-gray-700 text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
              </AnimatedContent>
            </div>
          </div>
          </AnimatedContent>
        )}

        {activeTab === 'result' && !optimizedSchedule && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-md">
            <h3 className="text-3xl font-bold text-teal-600 mb-3">BELUM ADA JADWAL</h3>
            <p className="text-gray-500 mb-6">Generate jadwal terlebih dahulu di tab Input Jadwal</p>
            <button
              onClick={() => setActiveTab('input')}
              className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-md"
            >
              KE INPUT JADWAL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}