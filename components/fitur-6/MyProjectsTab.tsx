'use client';

import { useState, useEffect } from 'react';
import { getMyProjects } from '@/lib/supabase/projects';
import type { Project } from '@/types/projects';
import ProjectCard from './ProjectCard';
import ProjectDetailModal from './ProjectDetailModal';
import { Loader2 } from 'lucide-react';

interface MyProjectsTabProps {
  userId: string;
  onRefresh: () => void;
}

export default function MyProjectsTab({ userId, onRefresh }: MyProjectsTabProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    loadMyProjects();
  }, [userId]);

  const loadMyProjects = async () => {
    try {
      setLoading(true);
      const data = await getMyProjects(userId);
      setProjects(data);
    } catch (error) {
      console.error('Error loading my projects:', error);
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

  if (projects.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20">
          <p className="text-xl text-gray-300">Anda belum membuat project</p>
          <p className="text-gray-400 mt-2">Mulai buat project pertama Anda!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => setSelectedProject(project)}
          />
        ))}
      </div>

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          onRefresh={() => {
            loadMyProjects();
            onRefresh();
          }}
        />
      )}
    </>
  );
}
