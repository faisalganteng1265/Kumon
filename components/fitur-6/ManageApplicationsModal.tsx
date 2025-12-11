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
      <div className="bg-white border-4 border-black rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-scrollbar" style={{ fontFamily: "'Fredoka', sans-serif" }}>
        {/* Header */}
        <div className="sticky top-0 bg-white text-black p-6 rounded-t-2xl border-b-4 border-black">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-black">Kelola Aplikasi</h2>
              <p className="text-gray-700 font-semibold">{project.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-black hover:bg-gray-200 rounded-full p-2 transition-all border-2 border-black"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-6 border-b-4 border-black">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-yellow-400 rounded-xl p-4 text-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-black text-sm font-bold">Pending</p>
              <p className="text-2xl font-bold text-black">{pendingCount}</p>
            </div>
            <div className="bg-green-500 rounded-xl p-4 text-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-white text-sm font-bold">Accepted</p>
              <p className="text-2xl font-bold text-white">{acceptedCount}</p>
            </div>
            <div className="bg-red-500 rounded-xl p-4 text-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-white text-sm font-bold">Rejected</p>
              <p className="text-2xl font-bold text-white">{rejectedCount}</p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="p-6 border-b-4 border-black">
          <label className="block text-black font-bold mb-3">Filter Status:</label>
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as 'all' | ProjectApplication['status'])
            }
            className="w-full md:w-auto px-4 py-3 bg-white border-2 border-black text-black rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 transition-all hover:bg-gray-100 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <option value="all" className="bg-white text-black py-2">Semua</option>
            <option value="pending" className="bg-white text-black py-2">Pending</option>
            <option value="accepted" className="bg-white text-black py-2">Accepted</option>
            <option value="rejected" className="bg-white text-black py-2">Rejected</option>
          </select>
        </div>

        {/* Applications List */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-700 font-semibold">Tidak ada aplikasi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <div
                  key={application.id}
                  className={`border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                    application.status === 'accepted'
                      ? 'bg-green-100'
                      : application.status === 'rejected'
                      ? 'bg-red-100'
                      : 'bg-gray-100'
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <User className="w-4 h-4 text-black mr-2" />
                        <span className="font-bold text-black">
                          {application.user?.username ||
                            application.user?.email ||
                            'Unknown User'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{application.user?.email}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border-2 border-black ${
                        application.status === 'accepted'
                          ? 'bg-green-500 text-white'
                          : application.status === 'rejected'
                          ? 'bg-red-500 text-white'
                          : 'bg-yellow-500 text-black'
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
                    <span className="inline-block px-3 py-1 bg-blue-400 text-white border-2 border-black rounded-full text-sm font-bold">
                      {application.role?.role_name}
                    </span>
                  </div>

                  {/* Message */}
                  {application.message && (
                    <div className="mb-3">
                      <div className="flex items-start">
                        <MessageSquare className="w-4 h-4 text-black mr-2 mt-1" />
                        <p className="text-gray-700 text-sm">{application.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  <div className="text-xs text-gray-600 mb-3 font-semibold">
                    Applied {new Date(application.created_at).toLocaleString('id-ID')}
                  </div>

                  {/* Actions */}
                  {application.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateStatus(application.id, 'accepted')}
                        disabled={processingId === application.id}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-xl font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
        <div className="sticky bottom-0 bg-white border-t-4 border-black p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 text-black rounded-xl font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            Tutup
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .modal-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 16px;
        }

        .modal-scrollbar::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 16px;
        }

        .modal-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        /* Firefox */
        .modal-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #9ca3af transparent;
        }
      `}</style>
    </div>
  );
}
