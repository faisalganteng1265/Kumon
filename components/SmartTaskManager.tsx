'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Pie } from 'react-chartjs-2';
import StaggeredMenu from '@/components/StaggeredMenu';
import { Atom } from 'react-loading-indicators';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// ====================================
// TypeScript Interfaces
// ====================================

interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  completed: boolean;
  created_at: string;
}

// ====================================
// Main Component
// ====================================

export default function SmartTaskManager() {
  const { user, loading } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  // Task State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(t('tasks.loading.auth'));
  const [hasInitialized, setHasInitialized] = useState(false);

  // AI Assistant State
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiAnalysisType, setAiAnalysisType] = useState<'prioritize' | 'estimate'>('prioritize');

  // Form State
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    deadline: '',
  });

  // Get unique categories from tasks
  const getUniqueCategories = (): string[] => {
    const cats = new Set(tasks.map(t => t.category).filter(c => c));
    return Array.from(cats);
  };


  // ====================================
  // Initialize: Check Auth & Fetch Tasks
  // ====================================

  useEffect(() => {
    if (loading) {
      setLoadingMessage(t('tasks.loading.auth'));
      return;
    }

    if (hasInitialized) return;

    const initializeSmartTaskManager = async () => {
      setHasInitialized(true);

      if (!user) {
        setLoadingMessage(t('tasks.loading.data'));
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      }

      // User is authenticated, fetch tasks
      await fetchTasks();
    };

    initializeSmartTaskManager();
  }, [loading, user, hasInitialized, t]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTasks(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setIsLoading(false);
    }
  };

  // ====================================
  // Task CRUD Operations
  // ====================================

  const handleAddTask = async () => {
    if (!user || !newTask.title.trim()) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          {
            user_id: user.id,
            title: newTask.title,
            description: newTask.description,
            category: newTask.category,
            priority: newTask.priority,
            deadline: newTask.deadline,
            completed: false,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        // Add the new task to the top of the list
        setTasks(prev => [data, ...prev]);
      }

      // Reset form and close modal
      setShowAddModal(false);
      setNewTask({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        deadline: '',
      });
    } catch (error) {
      console.error('Error adding task:', error);
      alert(t('tasks.alerts.addError'));
      // Fallback: fetch all tasks again
      await fetchTasks();
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    if (!user) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        )
      );
    } catch (error) {
      console.error('Error toggling task:', error);
      alert(t('tasks.alerts.updateError'));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(t('tasks.alerts.deleteError'));
    }
  };

  // ====================================
  // AI Assistant Functions
  // ====================================

  const handleAIAnalysis = async (type: 'prioritize' | 'estimate') => {
    if (tasks.length === 0) {
      alert(t('tasks.ai.noTasks'));
      return;
    }

    setAiAnalysisType(type);
    setShowAIModal(true);
    setIsAILoading(true);
    setAiResponse('');

    try {
      const response = await fetch('/api/tasks/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tasks,
          analysisType: type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('tasks.errors.fetch'));
      }

      setAiResponse(data.response);
    } catch (error: any) {
      console.error('Error getting AI analysis:', error);
      setAiResponse(`❌ ${t('tasks.ai.error')}: ${error.message}`);
    } finally {
      setIsAILoading(false);
    }
  };

  // ====================================
  // Filter Tasks
  // ====================================

  const filteredTasks = tasks.filter(task => {
    const categoryMatch = filterCategory === 'all' || task.category === filterCategory;
    const statusMatch =
      filterStatus === 'all' ||
      (filterStatus === 'completed' && task.completed) ||
      (filterStatus === 'pending' && !task.completed);
    return categoryMatch && statusMatch;
  });

  // ====================================
  // Statistics
  // ====================================

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => !t.completed && new Date(t.deadline) < new Date()).length,
  };

  // ====================================
  // Render Functions
  // ====================================

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-lime-500';
      default: return 'bg-gray-500';
    }
  };


  const renderStatistics = () => {
    // Prepare data for pie chart
    const pieChartData = {
      labels: [t('tasks.chart.completed'), t('tasks.chart.pending'), t('tasks.chart.overdue')],
      datasets: [
        {
          data: [stats.completed, stats.pending, stats.overdue],
          backgroundColor: [
            '#22c55e',    // green-500 solid - same as Selesai card
            '#facc15',    // yellow-400 solid - same as Pending card
            '#ef4444',    // red-500 solid - same as Terlambat card
          ],
          borderColor: [
            '#000000',    // black border for neobrutalism
            '#000000',
            '#000000',
          ],
          borderWidth: 2,
        },
      ],
    };

    const pieChartOptions = {
      responsive: true,
      maintainAspectRatio: true,
    
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(255, 255, 255, 0.5)',
          borderWidth: 1,
          padding: 10,
          displayColors: true,
          callbacks: {
            label: function(context: any) {
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = total > 0 ? Math.round((context.raw / total) * 100) : 0;
              return `${context.label}: ${context.raw} (${percentage}%)`;
            }
          }
        },
      },
    };

    return (
      <div className="space-y-4">
        {/* Statistik Header */}
        <h2 className="text-2xl font-bold text-black">{t('tasks.stats.statistics')}</h2>

        {/* Stats Cards - 2x2 grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Total - Blue */}
          <button
            onClick={() => {
              setFilterCategory('all');
              setFilterStatus('all');
            }}
            className="bg-blue-400 rounded-lg p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer"
          >
            <div className="flex flex-col items-center text-center">
              <svg className="w-5 h-5 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-white text-[10px] font-bold mb-0.5">{t('tasks.stats.total')}</h3>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
          </button>

          {/* Selesai - Green */}
          <button
            onClick={() => {
              setFilterStatus('completed');
            }}
            className="bg-green-500 rounded-lg p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer"
          >
            <div className="flex flex-col items-center text-center">
              <svg className="w-5 h-5 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-white text-[10px] font-bold mb-0.5">{t('tasks.stats.completed')}</h3>
              <p className="text-xl font-bold text-white">{stats.completed}</p>
            </div>
          </button>

          {/* Pending - Yellow */}
          <button
            onClick={() => {
              setFilterStatus('pending');
            }}
            className="bg-yellow-400 rounded-lg p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer"
          >
            <div className="flex flex-col items-center text-center">
              <svg className="w-5 h-5 text-black mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-black text-[10px] font-bold mb-0.5">{t('tasks.stats.pending')}</h3>
              <p className="text-xl font-bold text-black">{stats.pending}</p>
            </div>
          </button>

          {/* Terlambat - Red */}
          <button
            onClick={() => {
              setFilterStatus('pending');
            }}
            className="bg-red-500 rounded-lg p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer"
          >
            <div className="flex flex-col items-center text-center">
              <svg className="w-5 h-5 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-white text-[10px] font-bold mb-0.5">{t('tasks.stats.overdue')}</h3>
              <p className="text-xl font-bold text-white">{stats.overdue}</p>
            </div>
          </button>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-lg p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-black font-bold text-sm mb-3">{t('tasks.chart.distribution')}</h3>
          {stats.total > 0 ? (
            <div className="h-48 flex items-center justify-center">
              <div className="relative w-40 h-40 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-gray-600 text-sm">{t('tasks.chart.noData')}</p>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="bg-white rounded-lg p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-black font-bold text-sm mb-3">{t('tasks.stats.progress')}</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-700">{t('tasks.stats.completionRate')}</span>
                <span className="text-black font-bold">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 border-2 border-black">
                <div
                  className="bg-green-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <h3 className="text-black font-bold text-sm mb-3">{t('tasks.stats.categoryBreakdown')}</h3>
          {getUniqueCategories().length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-700 text-xs">{t('tasks.stats.noCategory')}</p>
              <p className="text-gray-500 text-xs mt-1">{t('tasks.stats.noCategoryDesc')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {getUniqueCategories().map((cat) => {
                const count = tasks.filter(t => t.category === cat).length;
                return (
                  <div key={cat} className="group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">📖</span>
                      <div className="flex-1 flex justify-between items-center">
                        <span className="text-black font-bold text-[10px] truncate">{cat}</span>
                        <span className="text-gray-700 text-[10px] ml-2">{count}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 border-2 border-black">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-blue-400"
                        style={{
                          width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    );
  };

  if (loading || isLoading || !hasInitialized) {
    return (
      <div className="relative h-screen overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#fef9ed' }}>
        <div className="relative z-10 text-center px-4">
          <div className="mb-6 sm:mb-8 animate-bounce">
            <Image
              src="/logo1.png"
              alt="Loading..."
              width={120}
              height={120}
              className="mx-auto"
            />
          </div>
          <p
            className="text-gray-800 text-lg sm:text-xl md:text-2xl font-semibold"
            style={{
              textShadow: '0 0 20px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.2)',
              fontFamily: "'Fredoka', sans-serif"
            }}
            suppressHydrationWarning
          >
            {loadingMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden" style={{ backgroundColor: '#fef9ed', fontFamily: "'Fredoka', sans-serif" }}>
      {/* Staggered Menu Navigation */}
      <StaggeredMenu
        position="right"
        colors={['#0a0a0a', '#1a1a1a', '#2a2a2a']}
        items={[
          { label: 'HOME', ariaLabel: 'Go to home page', link: '/' },
          { label: 'AI Campus Chatbot', ariaLabel: 'Go to feature 1', link: '/fitur-1' },
          { label: 'Smart Schedule', ariaLabel: 'Go to feature 3', link: '/fitur-3' },
          { label: 'Peer Connect', ariaLabel: 'Go to feature 4', link: '/fitur-4' },
          { label: 'Smart Task Manager', ariaLabel: 'Go to feature 5', link: '/fitur-5', color: '#ef4444' },
          { label: 'Project Colabollator', ariaLabel: 'Go to feature 6', link: '/fitur-6' }
        ]}
        displaySocials={false}
        displayItemNumbering={true}
        menuButtonColor="#fff"
        openMenuButtonColor="#fff"
        accentColor="#ffffff"
        changeMenuColorOnOpen={true}
        isFixed={true}
        logoUrl=""
      />

      {/* Language Toggle - Top Right */}
      <div className="fixed top-4 sm:top-6 md:top-8 right-4 sm:right-8 md:right-80 z-[9999] flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setLanguage('id')}
          className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            language === 'id'
              ? 'bg-red-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600'
              : 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100'
          }`}
        >
          ID
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            language === 'en'
              ? 'bg-red-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600'
              : 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100'
          }`}
        >
          EN
        </button>
      </div>

      {/* Main Content with z-index */}
      <div className="relative z-10 h-screen flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="relative bg-white/80 backdrop-blur-md border-b-2 border-black p-3 sm:p-4 overflow-hidden">
        {/* Cloud Decorations - Multiple clouds scattered at bottom */}
        {/* Far Left */}
        <Image
          src="/awan1.png"
          alt="Cloud decoration"
          width={180}
          height={130}
          className="absolute bottom-2 left-4 opacity-100"
        />

        {/* Left Center */}
        <Image
          src="/awan1.png"
          alt="Cloud decoration"
          width={160}
          height={115}
          className="absolute bottom-25 left-[15%] opacity-100"
        />

        {/* Center Left */}
        <Image
          src="/awan1.png"
          alt="Cloud decoration"
          width={170}
          height={120}
          className="absolute top-30 left-[28%] opacity-100"
        />

        {/* Center Right */}
        <Image
          src="/awan1.png"
          alt="Cloud decoration"
          width={170}
          height={120}
          className="absolute bottom-35 right-[28%] opacity-100"
        />

        {/* Right Center */}
        <Image
          src="/awan1.png"
          alt="Cloud decoration"
          width={160}
          height={115}
          className="absolute bottom-1 right-[15%] opacity-100"
        />

        {/* Far Right */}
        <Image
          src="/awan1.png"
          alt="Cloud decoration"
          width={180}
          height={130}
          className="absolute bottom-10 right-1 opacity-100"
        />

        <h1
          className="text-2xl sm:text-3xl pt-15 pb-10 md:text-4xl lg:text-5xl font-bold text-black text-center relative z-10"
          style={{
            fontFamily: "'Organic Relief', sans-serif"
          }}
        >
          {t('tasks.title').toUpperCase()}
        </h1>
      </div>

      {/* Main Content Row */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - Task List */}
        <div className="flex-1 flex flex-col">
          {/* HEADER FILTER */}
          <div className="bg-white border-b-2 border-black p-4">
            <div className="flex items-center justify-between relative">
              {/* Custom Dropdown Button for Mata Kuliah */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="px-6 py-3 rounded-lg font-bold bg-white text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 flex items-center gap-2"
                >
                  <Image src="/TASKICON.png" alt="Task" width={20} height={20} className="object-contain" />
                  {filterCategory === 'all' ? t('tasks.filter.category') : filterCategory}
                  <svg className={`w-4 h-4 transition-transform duration-300 ${showFilterDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu - Only Mata Kuliah */}
                {showFilterDropdown && (
                  <>
                    {/* Backdrop overlay */}
                    <div
                      className="fixed inset-0 z-[9998]"
                      onClick={() => setShowFilterDropdown(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-[400px] bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-[9999] p-6">
                    <h3 className="text-black font-bold text-sm mb-3 flex items-center gap-2">
                      <Image src="/TASKICON.png" alt="Task" width={20} height={20} className="object-contain" /> {t('tasks.filter.selectCategory')}
                    </h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                      <button
                        onClick={() => {
                          setFilterCategory('all');
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                          filterCategory === 'all'
                            ? 'bg-red-500 border-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                            : 'bg-white border-black text-black hover:translate-x-[2px] hover:translate-y-[2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                      >
                        <div className="font-semibold text-sm">{t('tasks.filter.category')}</div>
                        <div className="text-xs opacity-70 mt-1">{t('tasks.empty.description')}</div>
                      </button>
                      {getUniqueCategories().map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setFilterCategory(cat);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                            filterCategory === cat
                              ? 'bg-red-500 border-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                              : 'bg-white border-black text-black hover:translate-x-[2px] hover:translate-y-[2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                          }`}
                        >
                          <div className="font-semibold text-sm">{cat}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {tasks.filter(t => t.category === cat).length} {t('tasks.count')}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  </>
                )}
              </div>

              {/* Status Filter Buttons on Right */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold border-2 border-black transition-all duration-200 ${
                    filterStatus === 'all'
                      ? 'bg-red-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {t('tasks.status.all')}
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold border-2 border-black transition-all duration-200 ${
                    filterStatus === 'pending'
                      ? 'bg-red-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {t('tasks.status.pending')}
                </button>
                <button
                  onClick={() => setFilterStatus('completed')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold border-2 border-black transition-all duration-200 ${
                    filterStatus === 'completed'
                      ? 'bg-red-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  }`}
                >
                  {t('tasks.status.completed')}
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar" style={{ backgroundColor: '#fef9ed' }}>
            {/* Task list content here */}
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-6 relative">
                    <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-2">{t('tasks.empty.title')}</h3>
                  <p className="text-gray-600 mb-6">{t('tasks.empty.description')}</p>
                  {/* Tambah Tugas Button - Moved here */}
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-red-500 text-white px-8 py-3 rounded-lg font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('tasks.buttons.addTask')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Task Grid - 2 columns */}
                <div className="grid grid-cols-2 gap-4">
                {filteredTasks.map((task) => {
                  const isOverdue = !task.completed && new Date(task.deadline) < new Date();

                  return (
                    <div
                      key={task.id}
                      className="bg-white rounded-lg p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleToggleComplete(task.id)}
                          className={`flex-shrink-0 w-7 h-7 rounded-full border-2 border-black transition-all duration-200 ${
                            task.completed
                              ? 'bg-green-500'
                              : 'bg-white hover:bg-gray-100'
                          }`}
                        >
                          {task.completed && (
                            <svg className="w-full h-full text-white p-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <h3 className={`text-lg font-bold text-black ${task.completed ? 'line-through opacity-60' : ''}`}>
                              {task.title}
                            </h3>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="flex-shrink-0 text-red-500 hover:text-red-600 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          {task.description && (
                            <p className={`text-gray-700 text-sm mb-4 ${task.completed ? 'line-through opacity-60' : ''}`}>
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2">
                            {task.category && (
                              <span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-800 border-2 border-black flex items-center gap-1">
                                <Image src="/TASKICON.png" alt="Task" width={14} height={14} className="object-contain" /> {task.category}
                              </span>
                            )}

                            <span className={`px-3 py-1 rounded-lg text-xs font-bold border-2 border-black ${
                              task.priority === 'high'
                                ? 'bg-red-500 text-white'
                                : task.priority === 'medium'
                                ? 'bg-yellow-400 text-black'
                                : 'bg-green-500 text-white'
                            }`}>
                              {t(`tasks.priorities.${task.priority}`).toUpperCase()}
                            </span>

                            {task.deadline && (
                              <span className={`px-3 py-1 rounded-lg text-xs font-bold border-2 border-black flex items-center gap-1 ${
                                isOverdue
                                  ? 'bg-red-500 text-white'
                                  : 'bg-gray-200 text-black'
                              }`}>
                                <Image src="/TASKICON.png" alt="Task" width={14} height={14} className="object-contain" /> {new Date(task.deadline).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>

                {/* Tambah Tugas Button - At bottom of task list */}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full bg-red-500 text-white py-4 rounded-lg font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('tasks.buttons.addTask')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - STATISTIK (30%) */}
        <div className="w-[30%] bg-white border-l-2 border-black flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {renderStatistics()}
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-fade-in max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black flex items-center gap-3">
                <Image src="/GEMINIICON.png" alt="AI Assistant" width={32} height={32} className="object-contain" />
                {aiAnalysisType === 'prioritize' ? t('tasks.ai.prioritizeTitle') : t('tasks.ai.estimateTitle')}
              </h2>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-gray-700 hover:text-black transition-colors hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isAILoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="flex gap-3 mb-6">
                    <span className="w-4 h-4 bg-red-500 rounded-full animate-bounce"></span>
                    <span
                      className="w-4 h-4 bg-red-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></span>
                    <span
                      className="w-4 h-4 bg-red-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    ></span>
                  </div>
                  <p className="text-black text-lg font-bold">{t('tasks.ai.analyzing')}</p>
                  <p className="text-gray-700 text-sm mt-2">{t('tasks.ai.wait')}</p>
                </div>
              ) : (
                <div className="bg-gray-100 rounded-lg p-6 border-2 border-black">
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed text-sm">
                      {aiResponse}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {!isAILoading && (
              <div className="mt-6 pt-4 border-t-2 border-black">
                <button
                  onClick={() => setShowAIModal(false)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                >
                  {t('tasks.buttons.close')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-black">{t('tasks.modal.addTitle')}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-700 hover:text-black transition-colors hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-black font-bold mb-2">{t('tasks.form.title')}</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder={t('tasks.placeholders.title')}
                  className="w-full bg-gray-100 text-black rounded-lg px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-black font-bold mb-2">{t('tasks.form.description')}</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder={t('tasks.placeholders.description')}
                  rows={3}
                  className="w-full bg-gray-100 text-black rounded-lg px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-black font-bold mb-2">{t('tasks.form.category')}</label>
                  <input
                    type="text"
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    placeholder={t('tasks.placeholders.category')}
                    list="categories-list"
                    className="w-full bg-gray-100 text-black rounded-lg px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  />
                  <datalist id="categories-list">
                    {getUniqueCategories().map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-black font-bold mb-2">{t('tasks.form.priority')}</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full bg-gray-100 text-black rounded-lg px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  >
                    <option value="low">{t('tasks.priorities.low')}</option>
                    <option value="medium">{t('tasks.priorities.medium')}</option>
                    <option value="high">{t('tasks.priorities.high')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-black font-bold mb-2">{t('tasks.form.deadline')}</label>
                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    className="w-full bg-gray-100 text-black rounded-lg px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddTask}
                  disabled={!newTask.title.trim()}
                  className="flex-1 bg-red-500 text-white py-3 rounded-lg font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('tasks.buttons.addTask')}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 text-black py-3 rounded-lg font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                >
                  {t('tasks.buttons.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(26, 26, 26, 0.6);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(153, 153, 153, 0.5);
          border-radius: 10px;
          transition: all 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(204, 204, 204, 0.8);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out forwards;
        }

        @keyframes gradient-shift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
      </div>
    </div>
  );
}
