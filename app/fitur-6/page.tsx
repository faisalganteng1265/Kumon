'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllProjects } from '@/lib/supabase/projects';
import type { Project } from '@/types/projects';
import ProjectList from '@/components/fitur-6/ProjectList';
import CreateProjectModal from '@/components/fitur-6/CreateProjectModal';
import MyProjectsTab from '@/components/fitur-6/MyProjectsTab';
import MyApplicationsTab from '@/components/fitur-6/MyApplicationsTab';
import { Plus, Briefcase, Users, FileText } from 'lucide-react';

type TabType = 'all' | 'my-projects' | 'my-applications';

export default function ProjectCollaborationPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Project['status'] | 'all'>('all');

  useEffect(() => {
    loadProjects();
  }, [filterStatus]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getAllProjects(filterStatus === 'all' ? undefined : filterStatus);
      setProjects(data);
    } catch (error: any) {
      console.error('Error loading projects:', error);
      console.error('Error details:', error?.message, error?.details, error?.hint);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = () => {
    loadProjects();
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Project Collaboration Hub
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Temukan proyek menarik atau buat proyek Anda sendiri.
              Kolaborasi dengan talenta terbaik untuk mewujudkan ide-ide hebat!
            </p>
            {user && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Buat Project Baru
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Projects</p>
                <p className="text-3xl font-bold text-white mt-1">{projects.length}</p>
              </div>
              <Briefcase className="w-12 h-12 text-blue-400" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Open Projects</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {projects.filter(p => p.status === 'open').length}
                </p>
              </div>
              <FileText className="w-12 h-12 text-green-400" />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Active Collaborators</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {projects.reduce((acc, p) => acc + (p.members?.length || 0), 0)}
                </p>
              </div>
              <Users className="w-12 h-12 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-white text-blue-600 shadow-lg'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            Semua Project
          </button>
          {user && (
            <>
              <button
                onClick={() => setActiveTab('my-projects')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'my-projects'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Project Saya
              </button>
              <button
                onClick={() => setActiveTab('my-applications')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'my-applications'
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                Aplikasi Saya
              </button>
            </>
          )}
        </div>

        {/* Filter by Status */}
        {activeTab === 'all' && (
          <div className="mb-6">
            <label className="text-white font-semibold mb-2 block">Filter Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as Project['status'] | 'all')}
              className="bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}

        {/* Content based on active tab */}
        <div className="mt-8">
          {activeTab === 'all' && (
            <ProjectList
              projects={projects}
              loading={loading}
              onRefresh={loadProjects}
            />
          )}
          {activeTab === 'my-projects' && user && (
            <MyProjectsTab userId={user.id} onRefresh={loadProjects} />
          )}
          {activeTab === 'my-applications' && user && (
            <MyApplicationsTab userId={user.id} />
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {user && (
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleProjectCreated}
          userId={user.id}
        />
      )}
    </div>
  );
}
