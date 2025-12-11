'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAllProjects } from '@/lib/supabase/projects';
import type { Project } from '@/types/projects';
import ProjectList from '@/components/fitur-6/ProjectList';
import CreateProjectModal from '@/components/fitur-6/CreateProjectModal';
import MyProjectsTab from '@/components/fitur-6/MyProjectsTab';
import MyApplicationsTab from '@/components/fitur-6/MyApplicationsTab';
import { Plus, Briefcase, Users, FileText } from 'lucide-react';
import StaggeredMenu from '@/components/StaggeredMenu';
import ProfileModal from '@/components/ProfileModal';
import UserProfile from '@/components/UserProfile';
import { supabase } from '@/lib/supabase';

type TabType = 'all' | 'my-projects' | 'my-applications';

export default function ProjectCollaborationPage() {
  const { user, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
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


  const pageContent = (
    <div className="min-h-screen" style={{ backgroundColor: '#fef9ed', fontFamily: "'Fredoka', sans-serif" }}>


      {/* Language Toggle Buttons */}
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

      {/* Top Left Navigation */}
      <div className="fixed top-14 sm:top-16 md:top-4 left-3 sm:left-4 md:left-40 z-[1005] md:pt-1 flex flex-col md:flex-row items-start md:items-center gap-2 sm:gap-3 md:gap-4">
        {user && (
          <>
            <UserProfile position="inline" />
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500 text-white rounded-lg text-xs sm:text-sm font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 flex items-center gap-1.5 sm:gap-2 cursor-pointer"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{t('projects.buttons.createProject')}</span>
              <span className="sm:hidden">Create</span>
            </button>
          </>
        )}
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-40 sm:pt-44 md:pt-40 lg:pt-28 pb-8">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1
              className="text-2xl sm:text-3xl pb-10 md:text-4xl lg:text-5xl font-bold text-black mb-3 sm:mb-4"
              style={{ fontFamily: "'Organic Relief', sans-serif" }}
            >
              {t('projects.title').toUpperCase()}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              {t('projects.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-8 sm:mb-10 md:mb-12">
          <div className="bg-blue-400 rounded-lg p-4 sm:p-5 md:p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-xs sm:text-sm font-bold">{t('projects.stats.totalProjects')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{projects.length}</p>
              </div>
              <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
            </div>
          </div>
          <div className="bg-green-500 rounded-lg p-4 sm:p-5 md:p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-xs sm:text-sm font-bold">{t('projects.stats.openProjects')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  {projects.filter(p => p.status === 'open').length}
                </p>
              </div>
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
            </div>
          </div>
          <div className="bg-purple-500 rounded-lg p-4 sm:p-5 md:p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-xs sm:text-sm font-bold">{t('projects.stats.activeCollaborators')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  {projects.reduce((acc, p) => acc + (p.members?.length || 0), 0)}
                </p>
              </div>
              <Users className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-lg text-sm sm:text-base font-bold border-2 border-black transition-all duration-200 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-red-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
            }`}
          >
            {t('projects.tabs.all')}
          </button>
          {user && (
            <>
              <button
                onClick={() => setActiveTab('my-projects')}
                className={`px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-lg text-sm sm:text-base font-bold border-2 border-black transition-all duration-200 cursor-pointer ${
                  activeTab === 'my-projects'
                    ? 'bg-red-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                {t('projects.tabs.myProjects')}
              </button>
              <button
                onClick={() => setActiveTab('my-applications')}
                className={`px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 rounded-lg text-sm sm:text-base font-bold border-2 border-black transition-all duration-200 cursor-pointer ${
                  activeTab === 'my-applications'
                    ? 'bg-red-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                    : 'bg-white text-black hover:translate-x-[2px] hover:translate-y-[2px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
              >
                {t('projects.tabs.myApplications')}
              </button>
            </>
          )}
        </div>

        {/* Filter by Status */}
        {activeTab === 'all' && (
          <div className="mb-4 sm:mb-6">
            <label className="text-black text-sm sm:text-base font-bold mb-2 block">{t('projects.filter.status')}</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as Project['status'] | 'all')}
              className="bg-white border-2 border-black text-black text-sm sm:text-base rounded-lg px-3 py-2 sm:px-4 font-semibold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer w-full sm:w-auto"
            >
              <option value="all" className="bg-white text-black cursor-pointer">{t('projects.status.all')}</option>
              <option value="open" className="bg-white text-black cursor-pointer">{t('projects.status.open')}</option>
              <option value="in_progress" className="bg-white text-black cursor-pointer">{t('projects.status.inProgress')}</option>
              <option value="completed" className="bg-white text-black cursor-pointer">{t('projects.status.completed')}</option>
              <option value="cancelled" className="bg-white text-black cursor-pointer">{t('projects.status.cancelled')}</option>
            </select>
          </div>
        )}

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
            { label: 'Project Colabollator', ariaLabel: 'Go to feature 6', link: '/fitur-6'},
          ]}
          displaySocials={false}
          displayItemNumbering={true}
          logoUrl=""
          menuButtonColor="#fff"
          openMenuButtonColor="#fff"
          accentColor="#ffffff"
          changeMenuColorOnOpen={true}
          isFixed={true}
        />

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

  // Add CSS for fade-in animation
  return (
    <>
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
      {pageContent}
    </>
  );
}
