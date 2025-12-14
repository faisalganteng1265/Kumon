'use client';

import { useState, useEffect } from 'react';
import { getMyApplications } from '@/lib/supabase/projects';
import type { ProjectApplication } from '@/types/projects';
import { Loader2, Calendar, Briefcase, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ProjectDetailModal from './ProjectDetailModal';

interface MyApplicationsTabProps {
  userId: string;
}

export default function MyApplicationsTab({ userId }: MyApplicationsTabProps) {
  const { t } = useLanguage();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  useEffect(() => {
    loadMyApplications();
  }, [userId]);

  const loadMyApplications = async () => {
    try {
      setLoading(true);
      const data = await getMyApplications(userId);
      setApplications(data);
    } catch (error: any) {
      console.error('Error loading my applications:', error);
      console.error('Error message:', error?.message);
      console.error('Error details:', error?.details);
      console.error('Error hint:', error?.hint);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-white rounded-2xl p-12 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="text-xl text-black font-bold" style={{ fontFamily: "'Fredoka', sans-serif" }}>{t('projects.empty.noApplications')}</p>
          <p className="text-gray-700 mt-2 font-semibold" style={{ fontFamily: "'Fredoka', sans-serif" }}>{t('projects.empty.noApplicationsDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {applications.map((application) => (
        <div
          key={application.id}
          className={`rounded-xl border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
            application.status === 'accepted'
              ? 'bg-green-100'
              : application.status === 'rejected'
              ? 'bg-red-100'
              : 'bg-white'
          }`}
          style={{ fontFamily: "'Fredoka', sans-serif" }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-black mb-1">
                {application.project?.title}
              </h3>
              <p className="text-gray-700 text-sm line-clamp-2 font-semibold">
                {application.project?.description}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-4 border-2 border-black ${
                application.status === 'accepted'
                  ? 'bg-green-500 text-white'
                  : application.status === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-yellow-400 text-black'
              }`}
            >
              {application.status === 'accepted'
                ? t('projects.manage.accepted')
                : application.status === 'rejected'
                ? t('projects.manage.rejected')
                : t('projects.manage.pending')}
            </span>
          </div>

          {/* Role Applied */}
          <div className="mb-4">
            <div className="inline-flex items-center px-3 py-1 bg-blue-400 text-white rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <img src="totalproject.png" alt="project" className="w-2 h-2 sm:w-5 sm:h-5 md:w-5 md:h-5 " />
              <span className="font-bold pl-2">{application.role?.role_name}</span>
            </div>
          </div>

          {/* Message */}
          {application.message && (
            <div className="mb-4 p-3 bg-gray-100 rounded-lg border-2 border-black">
              <p className="text-black text-sm italic font-semibold">&quot;{application.message}&quot;</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-100 rounded-lg p-3 border-2 border-black">
              <div className="flex items-center text-gray-700 text-xs mb-1">
                <img src="deadline.png" alt="applied" className="w-2 h-2 sm:w-3 sm:h-3 md:w-3 md:h-3 " />
                <span className="font-bold p-1">{t('projects.labels.applied')}</span>
              </div>
              <p className="text-black text-sm font-bold">
                {new Date(application.created_at).toLocaleDateString('id-ID')}
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 border-2 border-black">
              <div className="flex items-center text-gray-700 text-xs mb-1">
                <img src="clock.png" alt="clock" className="w-2 h-2 sm:w-3 sm:h-3 md:w-3 md:h-3 " />
                <span className="font-bold pl-1">{t('projects.labels.projectStatus')}</span>
              </div>
              <p className="text-black text-sm font-bold capitalize">
                {application.project?.status?.replace('_', ' ')}
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 border-2 border-black">
              <div className="flex items-center text-gray-700 text-xs mb-1">
                <img src="totalproject.png" alt="initiator" className="w-2 h-2 sm:w-3 sm:h-3 md:w-3 md:h-3 " />
                <span className="font-bold pl-1">{t('projects.labels.initiator')}</span>
              </div>
              <p className="text-black text-sm font-bold truncate">
                {application.project?.initiator?.username ||
                  application.project?.initiator?.email?.split('@')[0] ||
                  'Unknown'}
              </p>
            </div>
          </div>

          {/* Status Message */}
          {application.status === 'accepted' && (
            <div className="flex items-center text-white text-sm bg-green-500 rounded-lg p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <img src="checklist.png" alt="checklist" className="w-2 h-2 sm:w-3 sm:h-3 md:w-3 md:h-3 " />
              <span className="font-bold pl-2">{t('projects.application.accepted')}</span>
            </div>
          )}
          {application.status === 'rejected' && (
            <div className="flex items-center text-white text-sm bg-red-500 rounded-lg p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <XCircle className="w-5 h-5 mr-2" />
              <span className="font-bold">{t('projects.application.rejected')}</span>
            </div>
          )}
          {application.status === 'pending' && (
            <div className="flex items-center text-black text-sm bg-yellow-400 rounded-lg p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Clock className="w-5 h-5 mr-2" />
              <span className="font-bold">{t('projects.application.pending')}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
