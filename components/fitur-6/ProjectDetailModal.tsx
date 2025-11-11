'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Project, ProjectApplication } from '@/types/projects';
import { getProjectApplications, updateProjectStatus } from '@/lib/supabase/projects';
import ApplyModal from './ApplyModal';
import ManageApplicationsModal from './ManageApplicationsModal';
import ProgressSlider from './ProgressSlider';
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
  Edit3,
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
  const [currentProgress, setCurrentProgress] = useState(project.progress || 0);
  const [lastProjectId, setLastProjectId] = useState(project.id);
  const [showProgressNotification, setShowProgressNotification] = useState(false);
  const [notificationProgress, setNotificationProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(project.status);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isInitiator = user?.id === project.initiator_id;

  // Only reset progress and status when opening modal or switching to a different project
  useEffect(() => {
    if (isOpen && project.id !== lastProjectId) {
      console.log('Project changed, resetting progress to:', project.progress);
      setCurrentProgress(project.progress || 0);
      setCurrentStatus(project.status);
      setLastProjectId(project.id);
    }
  }, [isOpen, project.id, project.progress, project.status, lastProjectId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

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

  const handleProgressUpdate = (newProgress: number) => {
    console.log('Progress update callback called with:', newProgress);
    // Update local state immediately for instant UI feedback
    setCurrentProgress(newProgress);
    console.log('Local state updated to:', newProgress);
    // Force a re-render by updating the project object's progress property
    project.progress = newProgress;

    // If progress is 100%, also update status to completed
    if (newProgress === 100) {
      setCurrentStatus('completed');
      project.status = 'completed';
    }

    // Clear any existing timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    // Show progress notification
    console.log('Setting notification progress to:', newProgress);
    setNotificationProgress(newProgress);
    console.log('Setting showProgressNotification to true');
    setShowProgressNotification(true);

    // Hide notification after 3 seconds
    notificationTimeoutRef.current = setTimeout(() => {
      console.log('Hiding notification after 3 seconds');
      setShowProgressNotification(false);
    }, 3000);

    // Refresh the project list in parent (this will update the card view)
    onRefresh();
  };

  const handleStatusChange = async (newStatus: Project['status']) => {
    if (!isInitiator) return;

    try {
      setUpdatingStatus(true);
      await updateProjectStatus(project.id, newStatus);
      setCurrentStatus(newStatus);
      project.status = newStatus;
      setIsEditingStatus(false);
      onRefresh();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Progress Success Notification */}
      {showProgressNotification && (
        <div className="fixed top-4 right-4 z-[9999] bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center animate-pulse transition-all duration-300 ease-in-out transform border-2 border-green-600">
          <CheckCircle className="w-6 h-6 mr-3" />
          <span className="font-bold text-lg">You updated your progress to {notificationProgress}%</span>
        </div>
      )}
      
      
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto dark-scrollbar">
          {/* Header - Sticky */}
          <div className="sticky top-0 bg-gray-900 text-white p-6 rounded-t-2xl border-b border-gray-700 z-10 backdrop-blur-md shadow-lg">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{project.title}</h2>

                  {/* Status Display/Edit */}
                  {isInitiator && !isEditingStatus ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[currentStatus]}`}
                      >
                        {statusLabels[currentStatus]}
                      </span>
                      <button
                        onClick={() => setIsEditingStatus(true)}
                        className="text-blue-400 hover:text-blue-300 transition-all"
                        title="Change status"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : isInitiator && isEditingStatus ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={currentStatus}
                        onChange={(e) => handleStatusChange(e.target.value as Project['status'])}
                        disabled={updatingStatus}
                        className="bg-gray-800 border border-gray-600 text-white rounded-lg px-5 py-2.5 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer w-[160px]"
                      >
                        <option value="open" className="bg-gray-900">Open</option>
                        <option value="in_progress" className="bg-gray-900">In Progress</option>
                        <option value="completed" className="bg-gray-900">Completed</option>
                        <option value="cancelled" className="bg-gray-900">Cancelled</option>
                      </select>
                      <button
                        onClick={() => setIsEditingStatus(false)}
                        disabled={updatingStatus}
                        className="text-gray-400 hover:text-gray-300 transition-all"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[currentStatus]}`}
                    >
                      {statusLabels[currentStatus]}
                    </span>
                  )}
                </div>
                <div className="flex items-center text-gray-300 text-sm">
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

            {/* Stats - Also sticky with header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-4 border border-gray-700">
                <div className="flex items-center text-blue-400 mb-1">
                  <Users className="w-5 h-5 mr-2" />
                  <span className="text-sm font-semibold">Collaborators</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {totalRolesFilled}/{totalRolesNeeded}
                </p>
              </div>
              <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-4 border border-gray-700">
                <div className="flex items-center text-purple-400 mb-1">
                  <Briefcase className="w-5 h-5 mr-2" />
                  <span className="text-sm font-semibold">Roles</span>
                </div>
                <p className="text-2xl font-bold text-white">{project.roles?.length || 0}</p>
              </div>
              <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-4 border border-gray-700">
                <div className="flex items-center text-green-400 mb-1">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm font-semibold">Applications</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {applications.filter((a) => a.status === 'pending').length}
                </p>
              </div>
              <div className="bg-gray-800/80 backdrop-blur-md rounded-lg p-4 border border-gray-700">
                <div className="flex items-center text-orange-400 mb-1">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span className="text-sm font-semibold">Created</span>
                </div>
                <p className="text-sm font-bold text-white">
                  {new Date(project.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">

            {/* Description */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3">Deskripsi Project</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{project.description}</p>
            </div>

            {/* Progress Slider */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <ProgressSlider
                projectId={project.id}
                currentProgress={currentProgress}
                onUpdate={handleProgressUpdate}
                isInitiator={isInitiator}
              />
            </div>

            {/* Deadline */}
            {project.deadline && (
              <div className="bg-gray-800/50 border border-orange-600/50 rounded-lg p-4">
                <div className="flex items-center text-orange-400">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="font-semibold">
                    Deadline: {new Date(project.deadline).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </div>
            )}

            {/* Roles Needed */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3">Role yang Dibutuhkan</h3>
              <div className="space-y-3">
                {project.roles?.map((role) => (
                  <div
                    key={role.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-white">{role.role_name}</h4>
                      <span className="text-sm text-gray-400">
                        {role.filled_count}/{role.required_count} filled
                      </span>
                    </div>
                    {role.description && (
                      <p className="text-gray-400 text-sm">{role.description}</p>
                    )}
                    {role.filled_count >= role.required_count && (
                      <div className="mt-2 flex items-center text-green-400 text-sm">
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
                <h3 className="text-lg font-bold text-white mb-3">Aplikasi Anda</h3>
                <div className="space-y-2">
                  {userApplications.map((app) => (
                    <div
                      key={app.id}
                      className={`border rounded-lg p-3 ${
                        app.status === 'accepted'
                          ? 'bg-green-900/30 border-green-600/50'
                          : app.status === 'rejected'
                          ? 'bg-red-900/30 border-red-600/50'
                          : 'bg-yellow-900/30 border-yellow-600/50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white">
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
            <div className="flex gap-3 pt-4 border-t border-gray-700">
              {isInitiator && (
                <button
                  onClick={() => setShowManageModal(true)}
                  className="flex-1 px-6 py-3 bg-gray-700/50 text-white rounded-lg font-semibold hover:bg-gray-600/50 transition-all flex items-center justify-center border border-gray-600"
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
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg font-semibold hover:bg-gray-800 transition-all"
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
