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
  open: 'bg-blue-500',
  in_progress: 'bg-purple-500',
  completed: 'bg-green-500',
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
        <div className="fixed top-4 right-4 z-[9999] bg-green-500 text-white px-6 py-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center animate-pulse transition-all duration-300 ease-in-out transform"
             style={{ fontFamily: "'Fredoka', sans-serif" }}>
          <CheckCircle className="w-6 h-6 mr-3" />
          <span className="font-bold text-lg">You updated your progress to {notificationProgress}%</span>
        </div>
      )}


      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white border-4 border-black rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
             style={{ fontFamily: "'Fredoka', sans-serif" }}>
          {/* Header - Sticky */}
          <div className="sticky top-0 bg-white text-black p-6 pb-0 rounded-t-3xl z-10 border-b-2 border-black">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{project.title}</h2>

                  {/* Status Display/Edit */}
                  {isInitiator && !isEditingStatus ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold text-white border-2 border-black ${statusColors[currentStatus]}`}
                      >
                        {statusLabels[currentStatus]}
                      </span>
                      <button
                        onClick={() => setIsEditingStatus(true)}
                        className="text-blue-500 hover:text-blue-600 transition-all p-1 bg-blue-100 rounded-lg border-2 border-black"
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
                        className="bg-white border-2 border-black text-black rounded-lg px-5 py-2.5 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer w-[160px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <option value="open" className="bg-white">Open</option>
                        <option value="in_progress" className="bg-white">In Progress</option>
                        <option value="completed" className="bg-white">Completed</option>
                        <option value="cancelled" className="bg-white">Cancelled</option>
                      </select>
                      <button
                        onClick={() => setIsEditingStatus(false)}
                        disabled={updatingStatus}
                        className="text-red-500 hover:text-red-600 transition-all p-1 bg-red-100 rounded-lg border-2 border-black"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold text-white border-2 border-black ${statusColors[currentStatus]}`}
                    >
                      {statusLabels[currentStatus]}
                    </span>
                  )}
                </div>
                <div className="flex items-center text-gray-700 text-sm font-semibold">
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
                className="text-black hover:bg-gray-200 rounded-lg p-2 transition-all border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Stats - Also sticky with header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pb-6">
              <div className="bg-blue-400 rounded-lg p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center text-white mb-1">
                  <Users className="w-5 h-5 mr-2" />
                  <span className="text-sm font-bold">Collaborators</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {totalRolesFilled}/{totalRolesNeeded}
                </p>
              </div>
              <div className="bg-purple-500 rounded-lg p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center text-white mb-1">
                  <Briefcase className="w-5 h-5 mr-2" />
                  <span className="text-sm font-bold">Roles</span>
                </div>
                <p className="text-2xl font-bold text-white">{project.roles?.length || 0}</p>
              </div>
              <div className="bg-green-500 rounded-lg p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center text-white mb-1">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="text-sm font-bold">Applications</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {applications.filter((a) => a.status === 'pending').length}
                </p>
              </div>
              <div className="bg-orange-500 rounded-lg p-4 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center text-white mb-1">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span className="text-sm font-bold">Created</span>
                </div>
                <p className="text-sm font-bold text-white">
                  {new Date(project.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* 2 Column Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column - Description, Progress, Deadline */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div className="bg-gray-100 border-2 border-black rounded-lg p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-lg font-bold text-black mb-3">Deskripsi Project</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
                </div>

                {/* Progress Slider */}
                <div className="bg-gray-100 border-2 border-black rounded-lg p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <ProgressSlider
                    projectId={project.id}
                    currentProgress={currentProgress}
                    onUpdate={handleProgressUpdate}
                    isInitiator={isInitiator}
                  />
                </div>

                {/* Deadline */}
                {project.deadline && (
                  <div className="bg-orange-100 border-2 border-black rounded-lg p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center text-orange-600 font-bold">
                      <Clock className="w-5 h-5 mr-2" />
                      <span className="font-bold">
                        Deadline: {new Date(project.deadline).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Roles Needed */}
              <div className="lg:col-span-1">
                <div className="bg-gray-100 border-2 border-black rounded-lg p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-lg font-bold text-black mb-3">Role yang Dibutuhkan</h3>
                  <div className="space-y-3">
                    {project.roles?.map((role) => (
                      <div
                        key={role.id}
                        className="bg-white border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-black">{role.role_name}</h4>
                          <span className="text-sm text-gray-700 font-semibold">
                            {role.filled_count}/{role.required_count} filled
                          </span>
                        </div>
                        {role.description && (
                          <p className="text-gray-600 text-sm">{role.description}</p>
                        )}
                        {role.filled_count >= role.required_count && (
                          <div className="mt-2 flex items-center text-green-600 text-sm font-semibold">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span>Role sudah terpenuhi</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* User's Applications - Full Width */}
            {userApplications.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-black mb-3">Aplikasi Anda</h3>
                <div className="space-y-2">
                  {userApplications.map((app) => (
                    <div
                      key={app.id}
                      className={`border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                        app.status === 'accepted'
                          ? 'bg-green-100'
                          : app.status === 'rejected'
                          ? 'bg-red-100'
                          : 'bg-yellow-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-black">
                          {app.role?.role_name}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-bold border-2 border-black ${
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
            <div className="flex gap-3 pt-4 mt-6 border-t-2 border-black">
              {isInitiator && (
                <button
                  onClick={() => setShowManageModal(true)}
                  className="flex-1 px-6 py-3 bg-purple-500 text-white rounded-lg font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Kelola Aplikasi
                </button>
              )}
              {canApply && (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  disabled={project.status !== 'open'}
                >
                  Apply ke Project
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-3 border-2 border-black text-black rounded-lg font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
