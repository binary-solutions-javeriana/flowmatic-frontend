'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Calendar, User, Edit2, Trash2, AlertCircle, CheckSquare } from 'lucide-react';
import type { Project } from '@/lib/types/project-types';
import { getProjectStateColor } from '@/lib/projects/utils';
import { useDeleteProject } from '@/lib/projects';
import ProjectModal from './ProjectModal';

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
  const { deleteProject, loading: deleting } = useDeleteProject();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);

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
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors}`}>
                    {project.state}
                  </span>
                </div>
                {project.type && (
                  <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium">
                    {project.type}
                  </span>
                )}
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

            {/* Description */}
            {project.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#0c272d]">Description</h3>
                <p className="text-[#0c272d]/70 leading-relaxed">
                  {project.description}
                </p>
              </div>
            )}

            {/* Project Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dates */}
              {(project.start_date || project.end_date) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-[#0c272d]">Timeline</h3>
                  <div className="space-y-2">
                    {project.start_date && (
                      <div className="flex items-center space-x-2 text-sm text-[#0c272d]/70">
                        <Calendar className="w-4 h-4 text-[#14a67e]" />
                        <span className="font-medium">Start:</span>
                        <span>{new Date(project.start_date).toISOString().split('T')[0]}</span>
                      </div>
                    )}
                    {project.end_date && (
                      <div className="flex items-center space-x-2 text-sm text-[#0c272d]/70">
                        <Calendar className="w-4 h-4 text-[#14a67e]" />
                        <span className="font-medium">End:</span>
                        <span>{new Date(project.end_date).toISOString().split('T')[0]}</span>
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
                    <span>{new Date(project.created_at).toISOString().split('T')[0]}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-[#0c272d]/70">
                    <Calendar className="w-4 h-4 text-[#14a67e]" />
                    <span className="font-medium">Updated:</span>
                    <span>{new Date(project.updated_at).toISOString().split('T')[0]}</span>
                  </div>
                </div>
              </div>
            </div>

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
          <div className="flex items-center justify-between px-8 py-6 border-t border-[#9fdbc2]/20 bg-white/50">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting || showDeleteConfirm}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 font-medium disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Project</span>
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-3 text-[#0c272d] hover:bg-[#9fdbc2]/10 rounded-xl transition-all duration-200 font-medium"
              >
                Close
              </button>
              <button
                onClick={handleViewTasks}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2 font-medium"
              >
                <CheckSquare className="w-4 h-4" />
                <span>View Tasks</span>
              </button>
              <button
                onClick={handleEdit}
                className="bg-[#14a67e] text-white px-6 py-3 rounded-xl hover:bg-[#14a67e]/90 transition-all duration-300 flex items-center space-x-2 font-medium"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Project</span>
              </button>
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

