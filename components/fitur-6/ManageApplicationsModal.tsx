'use client';

import { useState, useEffect } from 'react';
import type { Project, ProjectApplication } from '@/types/projects';
import { getProjectApplications, updateApplicationStatus } from '@/lib/supabase/projects';
import { X, Check, XCircle, Loader2, User, Mail, MessageSquare } from 'lucide-react';

interface ManageApplicationsModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ManageApplicationsModal({
  project,
  isOpen,
  onClose,
  onSuccess,
}: ManageApplicationsModalProps) {
  const [allApplications, setAllApplications] = useState<ProjectApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | ProjectApplication['status']>('pending');

  useEffect(() => {
    if (isOpen) {
      loadApplications();
    }
  }, [isOpen]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await getProjectApplications(project.id);
      setAllApplications(data);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    applicationId: string,
    status: ProjectApplication['status']
  ) => {
    try {
      setProcessingId(applicationId);
      await updateApplicationStatus(applicationId, status);
      await loadApplications();
      onSuccess();
    } catch (error: any) {
      console.error('Error updating application:', error);
      alert(error.message || 'Gagal mengupdate aplikasi');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = allApplications.filter((a) => a.status === 'pending').length;
  const acceptedCount = allApplications.filter((a) => a.status === 'accepted').length;
  const rejectedCount = allApplications.filter((a) => a.status === 'rejected').length;
  
  // Filter applications based on selected status
  const filteredApplications = filterStatus === 'all'
    ? allApplications
    : allApplications.filter((a) => a.status === filterStatus);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 rounded-t-2xl border-b border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Kelola Aplikasi</h2>
              <p className="text-gray-300">{project.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-gray-700">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800/50 backdrop-blur-md rounded-lg p-4 text-center border border-gray-700">
              <p className="text-yellow-400 text-sm font-semibold">Pending</p>
              <p className="text-2xl font-bold text-white">{pendingCount}</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-md rounded-lg p-4 text-center border border-gray-700">
              <p className="text-green-400 text-sm font-semibold">Accepted</p>
              <p className="text-2xl font-bold text-white">{acceptedCount}</p>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-md rounded-lg p-4 text-center border border-gray-700">
              <p className="text-red-400 text-sm font-semibold">Rejected</p>
              <p className="text-2xl font-bold text-white">{rejectedCount}</p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="p-6 border-b border-gray-700">
          <label className="block text-white font-semibold mb-3">Filter Status:</label>
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as 'all' | ProjectApplication['status'])
            }
            className="w-full md:w-auto px-4 py-3 bg-gray-800/90 backdrop-blur-md border-2 border-blue-500/50 text-white rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all hover:bg-gray-700/90 cursor-pointer shadow-lg"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              paddingRight: '3rem'
            }}
          >
            <option value="all" className="bg-gray-800 text-white  py-2">Semua</option>
            <option value="pending" className="bg-gray-800 text-white py-2">Pending</option>
            <option value="accepted" className="bg-gray-800 text-white py-2">Accepted</option>
            <option value="rejected" className="bg-gray-800 text-white py-2">Rejected</option>
          </select>
        </div>

        {/* Applications List */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400">Tidak ada aplikasi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div
                  key={application.id}
                  className={`border rounded-lg p-4 ${
                    application.status === 'accepted'
                      ? 'bg-green-900/30 border-green-600/50'
                      : application.status === 'rejected'
                      ? 'bg-red-900/30 border-red-600/50'
                      : 'bg-gray-800/50 border-gray-700'
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-semibold text-white">
                          {application.user?.username ||
                            application.user?.email ||
                            'Unknown User'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{application.user?.email}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
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

                  {/* Role */}
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-full text-sm font-semibold">
                      {application.role?.role_name}
                    </span>
                  </div>

                  {/* Message */}
                  {application.message && (
                    <div className="mb-3">
                      <div className="flex items-start">
                        <MessageSquare className="w-4 h-4 text-gray-400 mr-2 mt-1" />
                        <p className="text-gray-300 text-sm">{application.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-xs text-gray-500 mb-3">
                    Applied {new Date(application.created_at).toLocaleString('id-ID')}
                  </div>

                  {/* Actions */}
                  {application.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(application.id, 'accepted')}
                        disabled={processingId === application.id}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all disabled:opacity-50 flex items-center justify-center"
                      >
                        {processingId === application.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Accept
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(application.id, 'rejected')}
                        disabled={processingId === application.id}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center"
                      >
                        {processingId === application.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-800 text-gray-300 rounded-lg font-semibold hover:bg-gray-700 transition-all border border-gray-600"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
