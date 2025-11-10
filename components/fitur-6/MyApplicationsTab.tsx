'use client';

import { useState, useEffect } from 'react';
import { getMyApplications } from '@/lib/supabase/projects';
import type { ProjectApplication } from '@/types/projects';
import { Loader2, Calendar, Briefcase, CheckCircle, XCircle, Clock } from 'lucide-react';

interface MyApplicationsTabProps {
  userId: string;
}

export default function MyApplicationsTab({ userId }: MyApplicationsTabProps) {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20">
          <p className="text-xl text-gray-300">Anda belum apply ke project manapun</p>
          <p className="text-gray-400 mt-2">Mulai eksplorasi dan apply ke project yang menarik!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <div
          key={application.id}
          className={`bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 ${
            application.status === 'accepted'
              ? 'border-green-400/50 bg-green-900/20'
              : application.status === 'rejected'
              ? 'border-red-400/50 bg-red-900/20'
              : ''
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">
                {application.project?.title}
              </h3>
              <p className="text-gray-300 text-sm line-clamp-2">
                {application.project?.description}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${
                application.status === 'accepted'
                  ? 'bg-green-500 text-white'
                  : application.status === 'rejected'
                  ? 'bg-red-500 text-white'
                  : 'bg-yellow-500 text-white'
              }`}
            >
              {application.status === 'accepted'
                ? 'Accepted'
                : application.status === 'rejected'
                ? 'Rejected'
                : 'Pending'}
            </span>
          </div>

          {/* Role Applied */}
          <div className="mb-4">
            <div className="inline-flex items-center px-3 py-1 bg-blue-500/30 text-blue-200 rounded-full border border-blue-400/30">
              <Briefcase className="w-4 h-4 mr-2" />
              <span className="font-semibold">{application.role?.role_name}</span>
            </div>
          </div>

          {/* Message */}
          {application.message && (
            <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-gray-300 text-sm italic">&quot;{application.message}&quot;</p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center text-gray-400 text-xs mb-1">
                <Calendar className="w-3 h-3 mr-1" />
                <span>Applied</span>
              </div>
              <p className="text-white text-sm font-semibold">
                {new Date(application.created_at).toLocaleDateString('id-ID')}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center text-gray-400 text-xs mb-1">
                <Clock className="w-3 h-3 mr-1" />
                <span>Project Status</span>
              </div>
              <p className="text-white text-sm font-semibold capitalize">
                {application.project?.status?.replace('_', ' ')}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center text-gray-400 text-xs mb-1">
                <Briefcase className="w-3 h-3 mr-1" />
                <span>Initiator</span>
              </div>
              <p className="text-white text-sm font-semibold truncate">
                {application.project?.initiator?.username ||
                  application.project?.initiator?.email?.split('@')[0] ||
                  'Unknown'}
              </p>
            </div>
          </div>

          {/* Status Message */}
          {application.status === 'accepted' && (
            <div className="flex items-center text-green-300 text-sm bg-green-900/30 rounded-lg p-3">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Selamat! Aplikasi Anda diterima. Anda sekarang bagian dari project ini.</span>
            </div>
          )}
          {application.status === 'rejected' && (
            <div className="flex items-center text-red-300 text-sm bg-red-900/30 rounded-lg p-3">
              <XCircle className="w-5 h-5 mr-2" />
              <span>Aplikasi Anda ditolak. Jangan berkecil hati, coba apply ke project lain!</span>
            </div>
          )}
          {application.status === 'pending' && (
            <div className="flex items-center text-yellow-300 text-sm bg-yellow-900/30 rounded-lg p-3">
              <Clock className="w-5 h-5 mr-2" />
              <span>Aplikasi Anda sedang direview oleh initiator project.</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
