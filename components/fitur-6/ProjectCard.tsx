'use client';

import type { Project } from '@/types/projects';
import { Calendar, Users, Briefcase, Clock } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
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

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const totalRolesNeeded = project.roles?.reduce((acc, role) => acc + role.required_count, 0) || 0;
  const totalRolesFilled = project.roles?.reduce((acc, role) => acc + role.filled_count, 0) || 0;

  return (
    <div
      onClick={onClick}
      className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-6 hover:bg-white/20 transition-all cursor-pointer group hover:scale-105 hover:shadow-2xl"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-2">
          {project.title}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${statusColors[project.status]}`}>
          {statusLabels[project.status]}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
        {project.description}
      </p>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-300 text-sm">
          <Users className="w-4 h-4 mr-2 text-blue-400" />
          <span>
            {totalRolesFilled}/{totalRolesNeeded} Collaborators
          </span>
        </div>
        <div className="flex items-center text-gray-300 text-sm">
          <Briefcase className="w-4 h-4 mr-2 text-purple-400" />
          <span>{project.roles?.length || 0} Roles</span>
        </div>
        {project.deadline && (
          <div className="flex items-center text-gray-300 text-sm">
            <Clock className="w-4 h-4 mr-2 text-orange-400" />
            <span>Deadline: {new Date(project.deadline).toLocaleDateString('id-ID')}</span>
          </div>
        )}
      </div>

      {/* Roles Preview */}
      {project.roles && project.roles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {project.roles.slice(0, 3).map((role) => (
            <span
              key={role.id}
              className="px-2 py-1 bg-blue-500/30 text-blue-200 text-xs rounded-full border border-blue-400/30"
            >
              {role.role_name}
            </span>
          ))}
          {project.roles.length > 3 && (
            <span className="px-2 py-1 bg-gray-500/30 text-gray-300 text-xs rounded-full">
              +{project.roles.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center text-gray-400 text-xs">
          <Calendar className="w-3 h-3 mr-1" />
          <span>Created {new Date(project.created_at).toLocaleDateString('id-ID')}</span>
        </div>
      </div>
    </div>
  );
}
