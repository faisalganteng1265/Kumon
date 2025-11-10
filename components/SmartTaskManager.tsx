'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Pie } from 'react-chartjs-2';
import ParticleBackground from '@/components/ParticleBackground';
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
  // Fetch Tasks from Supabase
  // ====================================

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

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
        {/* Stats Cards - Separated with Glassmorphism */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total - Blue Transparent */}
          <div className="bg-blue-500/20 backdrop-blur-md rounded-xl p-4 shadow-xl border border-blue-500/30 hover:scale-[1.02] transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <svg className="w-6 h-6 text-blue-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-blue-300 text-xs font-semibold mb-1">Total</h3>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>

          {/* Selesai - Green Transparent */}
          <div className="bg-green-500/20 backdrop-blur-md rounded-xl p-4 shadow-xl border border-green-500/30 hover:scale-[1.02] transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <svg className="w-6 h-6 text-green-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-green-300 text-xs font-semibold mb-1">Selesai</h3>
              <p className="text-2xl font-bold text-white">{stats.completed}</p>
            </div>
          </div>

          {/* Pending - Yellow Transparent */}
          <div className="bg-yellow-500/20 backdrop-blur-md rounded-xl p-4 shadow-xl border border-yellow-500/30 hover:scale-[1.02] transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <svg className="w-6 h-6 text-yellow-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-yellow-300 text-xs font-semibold mb-1">Pending</h3>
              <p className="text-2xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>

          {/* Terlambat - Red Transparent */}
          <div className="bg-red-500/20 backdrop-blur-md rounded-xl p-4 shadow-xl border border-red-500/30 hover:scale-[1.02] transition-all duration-300">
            <div className="flex flex-col items-center text-center">
              <svg className="w-6 h-6 text-red-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-red-300 text-xs font-semibold mb-1">Terlambat</h3>
              <p className="text-2xl font-bold text-white">{stats.overdue}</p>
            </div>
          </div>
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
            <div className="space-y-3">
              {getUniqueCategories().map((cat) => {
                const count = tasks.filter(t => t.category === cat).length;
                return (
                  <div key={cat} className="group hover:scale-[1.02] transition-all duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📖</span>
                      <div className="flex-1 flex justify-between items-center">
                        <span className="text-white font-semibold text-xs truncate">{cat}</span>
                        <span className="text-gray-300 text-xs ml-2">{count}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2 border border-gray-600/30">
                      <div
                        className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-white to-gray-300"
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

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen flex flex-col overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Main Content with z-index */}
      <div className="relative z-10 h-screen flex flex-col overflow-hidden">
      {/* Top Headers Row */}
      <div className="flex">
        {/* Left Header - HEADER */}
        <div className="w-[70%] bg-black/880 p-4 flex items-center justify-center ">
          <h1 className="text-2xl font-bold text-white text-center flex items-center gap-3">
            <Image
              src="/AICAMPUS.png"
              alt="Smart Task Manager"
              width={40}
              height={40}
            />
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
          <div className="bg-black/890 p-4  ">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterCategory('all')}
                  className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${
                    filterCategory === 'all'
                      ? 'bg-white text-black shadow-lg scale-105'
                      : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  📚 Semua Matkul
                </button>
                {getUniqueCategories().map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 border ${
                      filterCategory === cat
                        ? 'bg-white text-black shadow-lg scale-105'
                        : 'bg-gray-800 text-white hover:bg-gray-700 border-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    filterStatus === 'all'
                      ? 'bg-white text-black shadow-lg scale-105'
                      : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    filterStatus === 'pending'
                      ? 'bg-gray-400 text-black shadow-lg scale-105'
                      : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilterStatus('completed')}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    filterStatus === 'completed'
                      ? 'bg-gray-900 text-white shadow-lg scale-105'
                      : 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
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
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => {
                  const isOverdue = !task.completed && new Date(task.deadline) < new Date();

                  return (
                    <div
                      key={task.id}
                      className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/70 transition-all duration-300 hover:shadow-lg shadow-xl"
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
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-900/50 text-blue-200 border border-blue-700/50 backdrop-blur-sm">
                                📖 {task.category}
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
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                                isOverdue
                                  ? 'bg-red-900/50 text-red-200 border border-red-700/50'
                                  : 'bg-gray-700/50 text-gray-200 border border-gray-600/50'
                              }`}>
                                📅 {new Date(task.deadline).toLocaleDateString('id-ID', {
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
            )}
          </div>

          {/* Bottom Button */}
          <div className="bg-black/880 p-4 border-t-2 border-black ">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full bg-gray-800 text-white py-4 rounded-xl font-bold hover:bg-gray-700 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Tugas
            </button>
          </div>
        </div>

        {/* Right Side - STATISTIK (30%) */}
        <div className="w-[30%] bg-black/880 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {renderStatistics()}
          </div>
        </div>
      </div>

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
                    <option value="low">🟢 Rendah</option>
                    <option value="medium">🟡 Sedang</option>
                    <option value="high">🔴 Tinggi</option>
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
