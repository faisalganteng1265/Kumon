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
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | ProjectApplication['status']>('pending');

  useEffect(() => {
    if (isOpen) {
      loadApplications();
    }
  }, [isOpen, filterStatus]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await getProjectApplications(
        project.id,
        filterStatus === 'all' ? undefined : filterStatus
      );
      setApplications(data);
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

  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const acceptedCount = applications.filter((a) => a.status === 'accepted').length;
  const rejectedCount = applications.filter((a) => a.status === 'rejected').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Kelola Aplikasi</h2>
              <p className="text-blue-100">{project.title}</p>
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
        <div className="p-6 border-b">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <p className="text-yellow-600 text-sm font-semibold">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-green-600 text-sm font-semibold">Accepted</p>
              <p className="text-2xl font-bold text-green-900">{acceptedCount}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-red-600 text-sm font-semibold">Rejected</p>
              <p className="text-2xl font-bold text-red-900">{rejectedCount}</p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="p-6 border-b">
          <label className="block text-gray-700 font-semibold mb-2">Filter Status:</label>
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as 'all' | ProjectApplication['status'])
            }
            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Applications List */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Tidak ada aplikasi</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className={`border rounded-lg p-4 ${
                    application.status === 'accepted'
                      ? 'bg-green-50 border-green-200'
                      : application.status === 'rejected'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <User className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="font-semibold text-gray-900">
                          {application.user?.username ||
                            application.user?.email ||
                            'Unknown User'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
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
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {application.role?.role_name}
                    </span>
                  </div>

                  {/* Message */}
                  {application.message && (
                    <div className="mb-3">
                      <div className="flex items-start">
                        <MessageSquare className="w-4 h-4 text-gray-500 mr-2 mt-1" />
                        <p className="text-gray-700 text-sm">{application.message}</p>
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
        <div className="sticky bottom-0 bg-white border-t p-6">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
