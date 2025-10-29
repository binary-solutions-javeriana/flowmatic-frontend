'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Calendar, User, Mail, Edit2, Trash2, AlertCircle, CheckSquare, Users } from 'lucide-react';
import type { Project } from '@/lib/types/project-types';
import { getProjectStateColor } from '@/lib/projects/utils';
import { useDeleteProject } from '@/lib/projects';
import { authApi } from '@/lib/authenticated-api';
import { useAuthState } from '@/lib/auth-store';
import ProjectModal from './ProjectModal';
import { formatDateSafe } from './utils';

interface ProjectMember {
  UserID: number;
  ProjectID: number;
  Name: string;
  Mail: string;
  RoleID: number | null;
  RoleName: string | null;
}

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onUpdate?: () => void;
  onViewTasks?: (projectId: number) => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  project,
  onUpdate,
  onViewTasks
}) => {
  const router = useRouter();
  const { user } = useAuthState();
  const { deleteProject, loading: deleting } = useDeleteProject();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Check if current user is a student (case insensitive and multiple possible values)
  const userRole = (user?.user_metadata?.role as string)?.toLowerCase() || '';
  const isStudent = userRole === 'estudiante' || userRole === 'student' || userRole === 'alumno';

  if (!isOpen || !project) return null;

  const statusColors = getProjectStateColor(project.state);
  const expectedDeleteText = `I want to delete ${project.name_proyect}`;
  const isDeleteConfirmValid = deleteConfirmText === expectedDeleteText;

  const handleDelete = async () => {
    if (!isDeleteConfirmValid) {
      setError('Please type the confirmation text exactly as shown');
      return;
    }

    try {
      setError(null);
      const success = await deleteProject(project.proyect_id);
      if (success) {
        onClose();
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmText('');
    setError(null);
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    if (onUpdate) onUpdate();
  };

  const handleViewTasks = () => {
    onClose();
    if (onViewTasks) {
      onViewTasks(project.proyect_id);
    } else {
      // Fallback to router if onViewTasks is not provided
      router.push(`/dashboard/projects/${project.proyect_id}/tasks`);
    }
  };

  const handleViewMembers = async () => {
    if (!showMembers) {
      setMembersLoading(true);
      try {
        console.log('[ProjectDetailsModal] Fetching members for project:', project.proyect_id);
        const response = await authApi.get<{data: ProjectMember[], meta: any}>(`/projects/${project.proyect_id}/users`);
        console.log('[ProjectDetailsModal] Raw response:', response);
        console.log('[ProjectDetailsModal] Response data:', response?.data);
        console.log('[ProjectDetailsModal] Data length:', response?.data?.length);
        setMembers(response?.data || []);
      } catch (err) {
        console.error('Failed to fetch project members:', err);
        setMembers([]);
      } finally {
        setMembersLoading(false);
      }
    }
    setShowMembers(!showMembers);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-[#9fdbc2]/30 animate-[fadeIn_0.2s_ease-out]">
          {/* Header */}
          <div className="relative px-8 py-6 border-b border-[#9fdbc2]/20">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-[#0c272d]">
                    {project.name_proyect}
                  </h2>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors}`}>
                    {project.state}
                  </span>
                  {project.type && (
                    <span className="inline-block px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-sm font-semibold">
                      📋 {project.type}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-[#0c272d]/40 hover:text-[#0c272d] hover:bg-[#9fdbc2]/10 rounded-xl p-2 transition-all duration-200"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200/50 rounded-xl p-4 text-red-700 text-sm flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            {/* Project Information */}
            <div className="space-y-6">
              {/* Description */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#0c272d]">Description</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-[#0c272d]/70 leading-relaxed">
                    {project.description || 'No description available'}
                  </p>
                </div>
              </div>

              {/* Email */}
              {project.mail && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#0c272d]">Project Email</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center space-x-2 text-sm text-[#0c272d]/70">
                      <Mail className="w-4 h-4 text-[#14a67e]" />
                      <span>{project.mail}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              {(project.start_date || project.end_date) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-[#0c272d]">Timeline</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-2">
                    {project.start_date && (
                      <div className="flex items-center space-x-2 text-sm text-[#0c272d]/70">
                        <Calendar className="w-4 h-4 text-[#14a67e]" />
                        <span className="font-medium">Start Date:</span>
                        <span>{formatDateSafe(project.start_date)}</span>
                      </div>
                    )}
                    {project.end_date && (
                      <div className="flex items-center space-x-2 text-sm text-[#0c272d]/70">
                        <Calendar className="w-4 h-4 text-[#14a67e]" />
                        <span className="font-medium">End Date:</span>
                        <span>{formatDateSafe(project.end_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#0c272d]">Information</h3>
                <div className="space-y-2">
                  {project.created_by && (
                    <div className="flex items-center space-x-2 text-sm text-[#0c272d]/70">
                      <User className="w-4 h-4 text-[#14a67e]" />
                      <span className="font-medium">Created by:</span>
                      <span>User #{project.created_by}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-[#0c272d]/70">
                    <Calendar className="w-4 h-4 text-[#14a67e]" />
                    <span className="font-medium">Created:</span>
                    <span>{formatDateSafe(project.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-[#0c272d]/70">
                    <Calendar className="w-4 h-4 text-[#14a67e]" />
                    <span className="font-medium">Updated:</span>
                    <span>Project ID: {project.proyect_id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Members Section */}
            {showMembers && (
              <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h4 className="text-base font-bold text-blue-900">Project Members</h4>
                  {membersLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  )}
                </div>
                
                {membersLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                  </div>
                ) : members.length > 0 ? (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div
                        key={member.UserID}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{member.Name}</p>
                            <p className="text-sm text-gray-600">{member.Mail}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {member.RoleName || 'Member'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                    <p className="text-blue-700 font-medium">No members assigned</p>
                    <p className="text-blue-600 text-sm">This project doesn't have any members assigned yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Delete Confirmation - GitHub Style */}
            {showDeleteConfirm && (
              <div className="bg-gradient-to-r from-red-50 to-red-50/50 border-2 border-red-300 rounded-xl p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-base font-bold text-red-900 mb-2">
                        You are about to delete a project
                      </h4>
                      <p className="text-sm text-red-800 mb-1">
                        This action <span className="font-semibold">cannot be undone</span>. This will permanently delete the project and all of its data.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-red-900">
                        Please type the following to confirm:
                      </label>
                      <div className="bg-red-100/50 border border-red-300 rounded-lg px-3 py-2 mb-3">
                        <code className="text-sm font-mono text-red-900">
                          {expectedDeleteText}
                        </code>
                      </div>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type here to confirm..."
                        className="w-full px-4 py-3 bg-white border-2 border-red-300 rounded-lg text-[#0c272d] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                        disabled={deleting}
                        autoFocus
                      />
                      {deleteConfirmText && !isDeleteConfirmValid && (
                        <p className="text-xs text-red-600 flex items-center space-x-1 mt-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>The text doesn&apos;t match. Please try again.</span>
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        onClick={handleDelete}
                        disabled={deleting || !isDeleteConfirmValid}
                        className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {deleting && (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        )}
                        <span>{deleting ? 'Deleting...' : 'I understand, delete this project'}</span>
                      </button>
                      <button
                        onClick={handleDeleteCancel}
                        disabled={deleting}
                        className="px-6 py-2.5 text-[#0c272d] hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={`flex items-center px-8 py-6 border-t border-[#9fdbc2]/20 bg-white/50 ${isStudent ? 'justify-end' : 'justify-between'}`}>
            {!isStudent && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting || showDeleteConfirm}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Project</span>
              </button>
            )}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleViewMembers}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all duration-300 flex items-center space-x-2 font-medium"
              >
                <Users className="w-4 h-4" />
                <span>View Members</span>
              </button>
              <button
                onClick={handleViewTasks}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2 font-medium"
              >
                <CheckSquare className="w-4 h-4" />
                <span>View Tasks</span>
              </button>
              {!isStudent && (
                <button
                  onClick={handleEdit}
                  className="bg-[#14a67e] text-white px-6 py-3 rounded-xl hover:bg-[#14a67e]/90 transition-all duration-300 flex items-center space-x-2 font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Project</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <ProjectModal
          isOpen={showEditModal}
          onClose={handleEditClose}
          onSubmit={async () => {
            setShowEditModal(false);
            if (onUpdate) onUpdate();
          }}
          project={project}
          mode="edit"
        />
      )}
    </>
  );
};

export default ProjectDetailsModal;

