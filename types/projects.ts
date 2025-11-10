export interface Project {
  id: string;
  title: string;
  description: string;
  initiator_id: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  deadline?: string;
  max_collaborators: number;
  initiator?: {
    id: string;
    username?: string;
    email: string;
    avatar_url?: string;
  };
  roles?: ProjectRole[];
  members?: ProjectMember[];
  applications?: ProjectApplication[];
}

export interface ProjectRole {
  id: string;
  project_id: string;
  role_name: string;
  description?: string;
  required_count: number;
  filled_count: number;
  created_at: string;
}

export interface ProjectApplication {
  id: string;
  project_id: string;
  user_id: string;
  role_id: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username?: string;
    email: string;
    avatar_url?: string;
  };
  role?: ProjectRole;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role_id: string;
  joined_at: string;
  user?: {
    id: string;
    username?: string;
    email: string;
    avatar_url?: string;
  };
  role?: ProjectRole;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  deadline?: string;
  max_collaborators?: number;
  roles: {
    role_name: string;
    description?: string;
    required_count: number;
  }[];
}

export interface ApplyToProjectInput {
  project_id: string;
  role_id: string;
  message?: string;
}
