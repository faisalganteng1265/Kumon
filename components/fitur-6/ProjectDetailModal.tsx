'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Project, ProjectApplication } from '@/types/projects';
import { getProjectApplications } from '@/lib/supabase/projects';
import ApplyModal from './ApplyModal';
import ManageApplicationsModal from './ManageApplicationsModal';
import {
  X,
  Calendar,
  Users,
  Briefcase,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Settings,
} from 'lucide-react';

interface ProjectDetailModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const statusColors = {
  open: 'bg-green-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-gray-500',
  cancelled: 'bg-red-500',
};

const statusLabels = {
  open: 'Open',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function ProjectDetailModal({
  project,
  isOpen,
  onClose,
  onRefresh,
}: ProjectDetailModalProps) {
  const { user } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [applications, setApplications] = useState<ProjectApplication[]>([]);
  const [userApplications, setUserApplications] = useState<ProjectApplication[]>([]);

  const isInitiator = user?.id === project.initiator_id;

  useEffect(() => {
    if (isOpen && user) {
      loadApplications();
    }
  }, [isOpen, user]);

  const loadApplications = async () => {
    if (!user) return;

    try {
      const allApps = await getProjectApplications(project.id);
      setApplications(allApps);

      // Filter user's applications
      const userApps = allApps.filter((app) => app.user_id === user.id);
      setUserApplications(userApps);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const totalRolesNeeded = project.roles?.reduce((acc, role) => acc + role.required_count, 0) || 0;
  const totalRolesFilled = project.roles?.reduce((acc, role) => acc + role.filled_count, 0) || 0;

  const canApply = user && !isInitiator && project.status === 'open';

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{project.title}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[project.status]}`}
                  >
                    {statusLabels[project.status]}
                  </span>
                </div>
                <div className="flex items-center text-blue-100 text-sm">
                  <User className="w-4 h-4 mr-1" />
                  <span>
                    By{' '}
                    {project.initiator?.username ||
                      project.initiator?.email ||
                      'Unknown'}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center text-blue-600 mb-1">
                  <Users className="w-5 h-5 mr-2" />
                  <span className="text-sm font-semibold">Collaborators</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">
                  {totalRolesFilled}/{totalRolesNeeded}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center text-purple-600 mb-1">
                  <Briefcase className="w-5 h-5 mr-2" />
                  <span className="text-sm font-semibold">Roles</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">{project.roles?.length || 0}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center text-green-600 mb-1">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm font-semibold">Applications</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {applications.filter((a) => a.status === 'pending').length}
                </p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center text-orange-600 mb-1">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span className="text-sm font-semibold">Created</span>
                </div>
                <p className="text-sm font-bold text-orange-900">
                  {new Date(project.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Deskripsi Project</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
            </div>

            {/* Deadline */}
            {project.deadline && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center text-orange-700">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="font-semibold">
                    Deadline: {new Date(project.deadline).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
            )}

            {/* Roles Needed */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Role yang Dibutuhkan</h3>
              <div className="space-y-3">
                {project.roles?.map((role) => (
                  <div
                    key={role.id}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{role.role_name}</h4>
                      <span className="text-sm text-gray-600">
                        {role.filled_count}/{role.required_count} filled
                      </span>
                    </div>
                    {role.description && (
                      <p className="text-gray-600 text-sm">{role.description}</p>
                    )}
                    {role.filled_count >= role.required_count && (
                      <div className="mt-2 flex items-center text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span>Role sudah terpenuhi</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* User's Applications */}
            {userApplications.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Aplikasi Anda</h3>
                <div className="space-y-2">
                  {userApplications.map((app) => (
                    <div
                      key={app.id}
                      className={`border rounded-lg p-3 ${
                        app.status === 'accepted'
                          ? 'bg-green-50 border-green-200'
                          : app.status === 'rejected'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">
                          {app.role?.role_name}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            app.status === 'accepted'
                              ? 'bg-green-500 text-white'
                              : app.status === 'rejected'
                              ? 'bg-red-500 text-white'
                              : 'bg-yellow-500 text-white'
                          }`}
                        >
                          {app.status === 'accepted'
                            ? 'Accepted'
                            : app.status === 'rejected'
                            ? 'Rejected'
                            : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {isInitiator && (
                <button
                  onClick={() => setShowManageModal(true)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Kelola Aplikasi
                </button>
              )}
              {canApply && (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                  disabled={project.status !== 'open'}
                >
                  Apply ke Project
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && user && (
        <ApplyModal
          project={project}
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            setShowApplyModal(false);
            loadApplications();
            onRefresh();
          }}
          userId={user.id}
        />
      )}

      {/* Manage Applications Modal */}
      {showManageModal && (
        <ManageApplicationsModal
          project={project}
          isOpen={showManageModal}
          onClose={() => setShowManageModal(false)}
          onSuccess={() => {
            loadApplications();
            onRefresh();
          }}
        />
      )}
    </>
  );
}
