import { supabase } from '../supabase';
import type {
  Project,
  ProjectRole,
  ProjectApplication,
  ProjectMember,
  CreateProjectInput,
  ApplyToProjectInput,
} from '@/types/projects';

// Projects CRUD
export async function getAllProjects(status?: Project['status']) {
  let query = supabase
    .from('projects')
    .select(`
      *,
      initiator:profiles!initiator_id (
        id,
        username,
        email,
        avatar_url
      ),
      roles:project_roles (*),
      members:project_members (
        *,
        user:profiles!user_id (
          id,
          username,
          email,
          avatar_url
        ),
        role:project_roles!role_id (*)
      )
    `)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Project[];
}

export async function getProjectById(id: string) {
  const { data, error} = await supabase
    .from('projects')
    .select(`
      *,
      initiator:profiles!initiator_id (
        id,
        username,
        email,
        avatar_url
      ),
      roles:project_roles (*),
      members:project_members (
        *,
        user:profiles!user_id (
          id,
          username,
          email,
          avatar_url
        ),
        role:project_roles!role_id (*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Project;
}

export async function getMyProjects(userId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      initiator:profiles!initiator_id (
        id,
        username,
        email,
        avatar_url
      ),
      roles:project_roles (*),
      members:project_members (
        *,
        user:profiles!user_id (
          id,
          username,
          email,
          avatar_url
        ),
        role:project_roles!role_id (*)
      )
    `)
    .eq('initiator_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Project[];
}

export async function createProject(userId: string, input: CreateProjectInput) {
  // Create project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      title: input.title,
      description: input.description,
      initiator_id: userId,
      deadline: input.deadline,
      max_collaborators: input.max_collaborators || 10,
    })
    .select()
    .single();

  if (projectError) throw projectError;

  // Create roles
  if (input.roles && input.roles.length > 0) {
    const roles = input.roles.map((role) => ({
      project_id: project.id,
      role_name: role.role_name,
      description: role.description,
      required_count: role.required_count,
    }));

    const { error: rolesError } = await supabase
      .from('project_roles')
      .insert(roles);

    if (rolesError) throw rolesError;
  }

  return project;
}

export async function updateProject(
  projectId: string,
  updates: Partial<Omit<Project, 'id' | 'initiator_id' | 'created_at' | 'updated_at'>>
) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProjectProgress(projectId: string, progress: number) {
  // Validate progress is between 0 and 100
  if (progress < 0 || progress > 100) {
    throw new Error('Progress must be between 0 and 100');
  }

  // Automatically update status to 'completed' when progress reaches 100%
  const updates: any = { progress };
  if (progress === 100) {
    updates.status = 'completed';
  }

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProjectStatus(projectId: string, status: Project['status']) {
  const { data, error } = await supabase
    .from('projects')
    .update({ status })
    .eq('id', projectId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProject(projectId: string) {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) throw error;
}

// Project Roles
export async function getProjectRoles(projectId: string) {
  const { data, error } = await supabase
    .from('project_roles')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as ProjectRole[];
}

export async function addProjectRole(
  projectId: string,
  role: Omit<ProjectRole, 'id' | 'project_id' | 'created_at' | 'filled_count'>
) {
  const { data, error } = await supabase
    .from('project_roles')
    .insert({
      project_id: projectId,
      ...role,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProjectRole(roleId: string) {
  const { error } = await supabase
    .from('project_roles')
    .delete()
    .eq('id', roleId);

  if (error) throw error;
}

// Project Applications
export async function applyToProject(userId: string, input: ApplyToProjectInput) {
  const { data, error } = await supabase
    .from('project_applications')
    .insert({
      project_id: input.project_id,
      user_id: userId,
      role_id: input.role_id,
      message: input.message,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProjectApplications(projectId: string, status?: ProjectApplication['status']) {
  let query = supabase
    .from('project_applications')
    .select(`
      *,
      user:profiles!user_id (
        id,
        username,
        email,
        avatar_url
      ),
      role:project_roles!role_id (*)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as ProjectApplication[];
}

export async function getMyApplications(userId: string) {
  const { data, error } = await supabase
    .from('project_applications')
    .select(`
      *,
      project:projects!project_id (
        *,
        initiator:profiles!initiator_id (
          id,
          username,
          email,
          avatar_url
        )
      ),
      role:project_roles!role_id (*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false});

  if (error) throw error;
  return data;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ProjectApplication['status']
) {
  const { data, error } = await supabase
    .from('project_applications')
    .update({ status })
    .eq('id', applicationId)
    .select(`
      *,
      role:project_roles!role_id (*)
    `)
    .single();

  if (error) throw error;

  // If accepted, add to project members and update filled_count
  if (status === 'accepted') {
    const application = data as ProjectApplication & { role: ProjectRole };

    // Add to members
    await supabase.from('project_members').insert({
      project_id: application.project_id,
      user_id: application.user_id,
      role_id: application.role_id,
    });

    // Update filled_count
    await supabase
      .from('project_roles')
      .update({ filled_count: (application.role?.filled_count || 0) + 1 })
      .eq('id', application.role_id);
  }

  return data;
}

export async function withdrawApplication(applicationId: string) {
  const { error } = await supabase
    .from('project_applications')
    .delete()
    .eq('id', applicationId);

  if (error) throw error;
}

// Project Members
export async function getProjectMembers(projectId: string) {
  const { data, error } = await supabase
    .from('project_members')
    .select(`
      *,
      user:profiles!user_id (
        id,
        username,
        email,
        avatar_url
      ),
      role:project_roles!role_id (*)
    `)
    .eq('project_id', projectId)
    .order('joined_at', { ascending: false });

  if (error) throw error;
  return data as ProjectMember[];
}

export async function removeProjectMember(memberId: string) {
  // Get member info first
  const { data: member, error: fetchError } = await supabase
    .from('project_members')
    .select('*, role:project_roles!role_id (*)')
    .eq('id', memberId)
    .single();

  if (fetchError) throw fetchError;

  // Remove member
  const { error: deleteError } = await supabase
    .from('project_members')
    .delete()
    .eq('id', memberId);

  if (deleteError) throw deleteError;

  // Update filled_count
  const memberWithRole = member as ProjectMember & { role: ProjectRole };
  if (memberWithRole.role) {
    await supabase
      .from('project_roles')
      .update({ filled_count: Math.max(0, (memberWithRole.role.filled_count || 1) - 1) })
      .eq('id', memberWithRole.role_id);
  }
}

export async function getMyJoinedProjects(userId: string) {
  const { data, error } = await supabase
    .from('project_members')
    .select(`
      *,
      project:projects!project_id (
        *,
        initiator:profiles!initiator_id (
          id,
          username,
          email,
          avatar_url
        ),
        roles:project_roles (*)
      ),
      role:project_roles!role_id (*)
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false});

  if (error) throw error;
  return data;
}
