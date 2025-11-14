'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Pie } from 'react-chartjs-2';
import ParticleBackground from '@/components/ParticleBackground';
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

  // Task State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Memuat data autentikasi...');
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
      setLoadingMessage('Memuat data autentikasi...');
      return;
    }

    if (hasInitialized) return;

    const initializeSmartTaskManager = async () => {
      setHasInitialized(true);

      if (!user) {
        setLoadingMessage('Kamu belum login. Redirecting...');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      }

      // User is authenticated, fetch tasks
      await fetchTasks();
    };

    initializeSmartTaskManager();
  }, [loading, user, hasInitialized]);

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
      alert('Gagal menambahkan tugas. Silakan coba lagi.');
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
      alert('Gagal mengubah status tugas. Silakan coba lagi.');
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
      alert('Gagal menghapus tugas. Silakan coba lagi.');
    }
  };

  // ====================================
  // AI Assistant Functions
  // ====================================

  const handleAIAnalysis = async (type: 'prioritize' | 'estimate') => {
    if (tasks.length === 0) {
      alert('Belum ada tugas untuk dianalisis!');
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
        throw new Error(data.error || 'Gagal mendapatkan analisis AI');
      }

      setAiResponse(data.response);
    } catch (error: any) {
      console.error('Error getting AI analysis:', error);
      setAiResponse(`❌ Maaf, terjadi kesalahan: ${error.message}`);
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
      labels: ['Selesai', 'Pending', 'Terlambat'],
      datasets: [
        {
          data: [stats.completed, stats.pending, stats.overdue],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',    // green
            'rgba(234, 179, 8, 0.8)',    // yellow
            'rgba(239, 68, 68, 0.8)',    // red
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(234, 179, 8, 1)',
            'rgba(239, 68, 68, 1)',
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
        {/* Stats Cards - 4 boxes in single row */}
        <div className="grid grid-cols-4 gap-2">
          {/* Total - Blue Transparent */}
          <button
            onClick={() => {
              setFilterCategory('all');
              setFilterStatus('all');
            }}
            className="bg-blue-500/20 backdrop-blur-md rounded-lg p-3 shadow-xl border border-blue-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer hover:border-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
          >
            <div className="flex flex-col items-center text-center">
              <svg className="w-5 h-5 text-blue-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-blue-300 text-[10px] font-semibold mb-0.5">Total</h3>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
          </button>

          {/* Selesai - Green Transparent */}
          <button
            onClick={() => {
              setFilterStatus('completed');
            }}
            className="bg-green-500/20 backdrop-blur-md rounded-lg p-3 shadow-xl border border-green-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer hover:border-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]"
          >
            <div className="flex flex-col items-center text-center">
              <svg className="w-5 h-5 text-green-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-green-300 text-[10px] font-semibold mb-0.5">Selesai</h3>
              <p className="text-xl font-bold text-white">{stats.completed}</p>
            </div>
          </button>

          {/* Pending - Yellow Transparent */}
          <button
            onClick={() => {
              setFilterStatus('pending');
            }}
            className="bg-yellow-500/20 backdrop-blur-md rounded-lg p-3 shadow-xl border border-yellow-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.5)]"
          >
            <div className="flex flex-col items-center text-center">
              <svg className="w-5 h-5 text-yellow-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-yellow-300 text-[10px] font-semibold mb-0.5">Pending</h3>
              <p className="text-xl font-bold text-white">{stats.pending}</p>
            </div>
          </button>

          {/* Terlambat - Red Transparent */}
          <button
            onClick={() => {
              setFilterStatus('pending');
            }}
            className="bg-red-500/20 backdrop-blur-md rounded-lg p-3 shadow-xl border border-red-500/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer hover:border-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]"
          >
            <div className="flex flex-col items-center text-center">
              <svg className="w-5 h-5 text-red-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-red-300 text-[10px] font-semibold mb-0.5">Terlambat</h3>
              <p className="text-xl font-bold text-white">{stats.overdue}</p>
            </div>
          </button>
        </div>

        {/* Pie Chart - Black Glassmorphism */}
        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-gray-700/50">
          <h3 className="text-white font-bold text-sm mb-3">Distribusi Tugas</h3>
          {stats.total > 0 ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-40 h-40">
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-gray-400 text-sm">Belum ada data untuk ditampilkan</p>
            </div>
          )}
        </div>

        {/* Progress - Black Glassmorphism */}
        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-gray-700/50">
          <h3 className="text-white font-bold text-sm mb-3">Progress Keseluruhan</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-gray-300">Completion Rate</span>
                <span className="text-white font-semibold">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-700/50 rounded-full h-3 border border-gray-600/30">
                <div
                  className="bg-gradient-to-r from-white to-gray-300 h-3 rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown - Black Glassmorphism */}
        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-gray-700/50">
          <h3 className="text-white font-bold text-sm mb-3">Tugas per Mata Kuliah</h3>
          {getUniqueCategories().length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-300 text-xs">Belum ada kategori</p>
              <p className="text-gray-500 text-xs mt-1">Tambahkan tugas untuk melihat statistik</p>
            </div>
          ) : (
            <div className="space-y-2">
              {getUniqueCategories().map((cat) => {
                const count = tasks.filter(t => t.category === cat).length;
                return (
                  <div key={cat} className="group hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">📖</span>
                      <div className="flex-1 flex justify-between items-center">
                        <span className="text-white font-semibold text-[10px] truncate">{cat}</span>
                        <span className="text-gray-300 text-[10px] ml-2">{count}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-1 border border-gray-600/30">
                      <div
                        className="h-1 rounded-full transition-all duration-500 bg-gradient-to-r from-white to-gray-300"
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

        {/* AI Assistant Buttons */}
        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-gray-700">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <Image src="/GEMINIICON.png" alt="AI Assistant" width={24} height={24} className="object-contain" />
            AI Assistant
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => handleAIAnalysis('prioritize')}
              disabled={stats.pending === 0}
              className="w-full bg-gray-300 hover:bg-white text-purple-600 py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Prioritas Tugas
            </button>
            <button
              onClick={() => handleAIAnalysis('estimate')}
              disabled={stats.pending === 0}
              className="w-full bg-gray-300 hover:bg-white text-blue-600 py-3 px-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/50 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Estimasi Waktu
            </button>
          </div>
          <p className="text-gray-400 text-[10px] mt-3 text-center">
            AI akan menganalisis tugas-tugas kamu
          </p>
        </div>
      </div>
    );
  };

  if (loading || isLoading || !hasInitialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <Atom color="#06b6d4" size="large" />
          <p className="text-white text-lg mt-6">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen flex flex-col overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Logo positioned at top-left corner */}
      <Link href="/" className="absolute top-4 left-4 z-50 hover:opacity-80 transition-opacity cursor-pointer">
        <Image
          src="/AICAMPUS.png"
          alt="AI Campus Logo"
          width={50}
          height={50}
          className="object-contain"
        />
      </Link>

      {/* Main Content with z-index */}
      <div className="relative z-10 h-screen flex flex-col overflow-hidden">
      {/* Top Headers Row */}
      <div className="flex">
        {/* Left Header - HEADER */}
        <div className="w-[70%] bg-black/880 p-4 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-white text-center">
            Smart Task Manager
          </h1>
        </div>

        {/* Right Header - Statistik */}
        <div className="w-[30%] bg-black/880 p-4 flex items-center justify-center">
          <h2 className="text-2xl font-bold text-white">Statistik</h2>
        </div>
      </div>

      {/* Main Content Row */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - 70% */}
        <div className="w-[70%] flex flex-col">
          {/* HEADER FILTER */}
          <div className="bg-black/890 p-4">
            <div className="flex items-center justify-between relative">
              {/* Custom Dropdown Button for Mata Kuliah */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="px-6 py-3 rounded-xl font-semibold bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-white/50 hover:bg-gray-700 transition-all duration-300 cursor-pointer flex items-center gap-2"
                >
                  <Image src="/TASKICON.png" alt="Task" width={20} height={20} className="object-contain" />
                  {filterCategory === 'all' ? 'Semua Mata Kuliah' : filterCategory}
                  <svg className={`w-4 h-4 transition-transform duration-300 ${showFilterDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu - Only Mata Kuliah */}
                {showFilterDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-[400px] bg-gray-900/95 backdrop-blur-xl border-2 border-gray-700/50 rounded-2xl shadow-2xl z-50 p-6">
                    <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                      <Image src="/TASKICON.png" alt="Task" width={20} height={20} className="object-contain" /> Pilih Mata Kuliah
                    </h3>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                      <button
                        onClick={() => {
                          setFilterCategory('all');
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                          filterCategory === 'all'
                            ? 'bg-white/10 border-white text-white'
                            : 'bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:border-gray-600'
                        }`}
                      >
                        <div className="font-semibold text-sm">Semua Mata Kuliah</div>
                        <div className="text-xs text-gray-400 mt-1">Tampilkan semua tugas</div>
                      </button>
                      {getUniqueCategories().map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setFilterCategory(cat);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                            filterCategory === cat
                              ? 'bg-white/10 border-white text-white'
                              : 'bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:border-gray-600'
                          }`}
                        >
                          <div className="font-semibold text-sm">{cat}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {tasks.filter(t => t.category === cat).length} tugas
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Filter Buttons on Right */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    filterStatus === 'all'
                      ? 'bg-white text-black shadow-lg scale-105'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    filterStatus === 'pending'
                      ? 'bg-white text-black shadow-lg scale-105'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilterStatus('completed')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    filterStatus === 'completed'
                      ? 'bg-white text-black shadow-lg scale-105'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                  }`}
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-black/880 overflow-y-auto p-6">
            {/* Task list content here */}
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto mb-6 relative">
                    <svg className="w-full h-full text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Belum Ada Tugas</h3>
                  <p className="text-gray-400 mb-6">Klik tombol + untuk menambahkan tugas baru</p>
                  {/* Tambah Tugas Button - Moved here */}
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-gray-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-700 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 mx-auto shadow-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Tugas
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
                      className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/70 transition-all duration-300 hover:shadow-lg shadow-xl hover:-translate-y-2 cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleToggleComplete(task.id)}
                          className={`flex-shrink-0 w-7 h-7 rounded-full border-2 transition-all duration-300 ${
                            task.completed
                              ? 'bg-green-500 border-green-500'
                              : 'border-gray-500 hover:border-gray-400 bg-gray-900/50'
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
                            <h3 className={`text-lg font-bold text-white ${task.completed ? 'line-through opacity-60' : ''}`}>
                              {task.title}
                            </h3>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>

                          {task.description && (
                            <p className={`text-gray-300 text-sm mb-4 ${task.completed ? 'line-through opacity-60' : ''}`}>
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3">
                            {task.category && (
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/50 text-blue-200 border border-blue-700/50 backdrop-blur-sm flex items-center gap-1">
                                <Image src="/TASKICON.png" alt="Task" width={14} height={14} className="object-contain" /> {task.category}
                              </span>
                            )}

                            <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                              task.priority === 'high'
                                ? 'bg-red-900/50 text-red-200 border border-red-700/50'
                                : task.priority === 'medium'
                                ? 'bg-yellow-900/50 text-yellow-200 border border-yellow-700/50'
                                : 'bg-green-900/50 text-green-200 border border-green-700/50'
                            }`}>
                              {task.priority === 'high' && '🔴'}
                              {task.priority === 'medium' && '🟡'}
                              {task.priority === 'low' && '🟢'}
                              {task.priority.toUpperCase()}
                            </span>

                            {task.deadline && (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm flex items-center gap-1 ${
                                isOverdue
                                  ? 'bg-red-900/50 text-red-200 border border-red-700/50'
                                  : 'bg-gray-700/50 text-gray-200 border border-gray-600/50'
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
                  className="w-full bg-gray-800 text-white py-4 rounded-xl font-bold hover:bg-gray-700 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Tugas
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - STATISTIK (30%) */}
        <div className="w-[30%] bg-black/880 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {renderStatistics()}
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800/95 rounded-3xl p-8 max-w-3xl w-full border border-gray-700 animate-fade-in shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Image src="/GEMINIICON.png" alt="AI Assistant" width={32} height={32} className="object-contain" />
                {aiAnalysisType === 'prioritize' ? 'Rekomendasi Prioritas Tugas' : 'Estimasi Waktu Pengerjaan'}
              </h2>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-gray-300 hover:text-white transition-colors hover:scale-110"
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
                    <span className="w-4 h-4 bg-gray-400 rounded-full animate-bounce"></span>
                    <span
                      className="w-4 h-4 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></span>
                    <span
                      className="w-4 h-4 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    ></span>
                  </div>
                  <p className="text-white text-lg">AI sedang menganalisis tugas-tugas kamu...</p>
                  <p className="text-gray-300 text-sm mt-2">Mohon tunggu sebentar</p>
                </div>
              ) : (
                <div className="bg-gray-900/60 rounded-2xl p-6 border border-gray-700">
                  <div className="prose prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-100 leading-relaxed text-sm">
                      {aiResponse}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {!isAILoading && (
              <div className="mt-6 pt-4 border-t border-gray-700">
                <button
                  onClick={() => setShowAIModal(false)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold transition-all duration-300 hover:scale-[1.02] border border-white/30"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/880 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 max-w-2xl w-full border border-gray-600/50 animate-fade-in shadow-2xl shadow-gray-500/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Tambah Tugas Baru</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white transition-colors hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 font-semibold mb-2">Judul Tugas</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Contoh: Mengerjakan PR Matematika"
                  className="w-full bg-gray-800/70 text-white rounded-xl px-4 py-3 border border-gray-600/50 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-2">Deskripsi</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Detail tugas..."
                  rows={3}
                  className="w-full bg-gray-800/70 text-white rounded-xl px-4 py-3 border border-gray-600/50 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Mata Kuliah</label>
                  <input
                    type="text"
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                    placeholder="Contoh: Matematika, Fisika, dll"
                    list="categories-list"
                    className="w-full bg-gray-800/70 text-white rounded-xl px-4 py-3 border border-gray-600/50 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20 transition-all"
                  />
                  <datalist id="categories-list">
                    {getUniqueCategories().map(cat => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Prioritas</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full bg-gray-800/70 text-white rounded-xl px-4 py-3 border border-gray-600/50 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20 transition-all"
                  >
                    <option value="low">Rendah</option>
                    <option value="medium">Sedang</option>
                    <option value="high">Tinggi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Deadline</label>
                  <input
                    type="date"
                    value={newTask.deadline}
                    onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                    className="w-full bg-gray-800/70 text-white rounded-xl px-4 py-3 border border-gray-600/50 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-400/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddTask}
                  disabled={!newTask.title.trim()}
                  className="flex-1 bg-white text-black py-3 rounded-xl font-bold hover:shadow-xl hover:shadow-white/30 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed border border-gray-400"
                >
                  Tambah Tugas
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-800/70 text-gray-200 py-3 rounded-xl font-bold hover:bg-gray-700/70 transition-all duration-300 hover:scale-[1.02] border border-gray-600/50"
                >
                  Batal
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
