'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Edit2, Trash2, Mail, UserCheck, UserX, Search, X } from 'lucide-react';
import type { UserResponse, CreateUserRequest, UserRole } from '@/lib/types/tenant-admin-types';
import { tenantAdminService } from '@/lib/tenant-admin-service';

interface UserManagementProps {
  tenantAdminId: number;
}

const UserManagement: React.FC<UserManagementProps> = ({ tenantAdminId }) => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [formData, setFormData] = useState<CreateUserRequest>({
    name: '',
    mail: '',
    rol: 'ESTUDIANTE',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tenantAdminService.getUsers(tenantAdminId);
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [tenantAdminId]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({ name: '', mail: '', rol: 'ESTUDIANTE', password: '' });
    setShowModal(true);
  };

  const handleEdit = (user: UserResponse) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      mail: user.mail,
      rol: user.rol,
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      await tenantAdminService.deleteUser(tenantAdminId, userId);
      await loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingUser) {
        // When editing, don't include password
        const updateData: CreateUserRequest = {
          name: formData.name,
          mail: formData.mail,
          rol: formData.rol
        };
        await tenantAdminService.updateUser(tenantAdminId, editingUser.userId, updateData);
      } else {
        // When creating, include password (required)
        await tenantAdminService.createUser(tenantAdminId, formData);
      }
      setShowModal(false);
      await loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.mail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#9fdbc2]/20 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14a67e]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#9fdbc2]/20 dark:bg-gray-800 dark:border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#14a67e]/5 dark:from-gray-700/50 to-[#9fdbc2]/5 dark:to-gray-600/50 p-6 border-b border-[#9fdbc2]/20 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#14a67e]/10 rounded-xl">
              <Users className="w-6 h-6 text-[#14a67e]" />
            </div>
            <div>
            <h2 className="text-2xl font-bold text-[#0c272d] dark:text-gray-100">User Management</h2>
            <p className="text-sm text-[#0c272d]/60 dark:text-gray-400">{users.length} total users</p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center space-x-2 px-4 py-2 bg-[#14a67e] text-white rounded-xl hover:bg-[#0f8263] transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add User</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#0c272d]/40 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-[#9fdbc2]/30 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14a67e]/50 focus:border-transparent transition-all text-[#0c272d] dark:text-gray-100"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="m-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#9fdbc2]/5 dark:bg-gray-700/50 border-b border-[#9fdbc2]/20 dark:border-gray-600">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#0c272d]/70 dark:text-gray-300 uppercase tracking-wider">User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#0c272d]/70 dark:text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#0c272d]/70 dark:text-gray-300 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[#0c272d]/70 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-[#0c272d]/70 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#9fdbc2]/10 dark:divide-gray-700">
            {filteredUsers.map((user) => (
              <tr key={user.userId} className="hover:bg-[#9fdbc2]/5 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#14a67e] to-[#9fdbc2] rounded-full flex items-center justify-center text-white font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-[#0c272d] dark:text-gray-100">{user.name}</p>
                      <p className="text-xs text-[#0c272d]/50 dark:text-gray-400">ID: {user.userId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2 text-[#0c272d]/70 dark:text-gray-300">
                    <Mail className="w-4 h-4" />
                    <span>{user.mail}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.rol === 'PROFESOR' 
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  }`}>
                    {user.rol}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {user.isActive ? (
                      <>
                        <UserCheck className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">Active</span>
                      </>
                    ) : (
                      <>
                        <UserX className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">Inactive</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 text-[#14a67e] hover:bg-[#14a67e]/10 dark:hover:bg-[#14a67e]/20 rounded-lg transition-all hover:scale-110 active:scale-95"
                      title="Edit user"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.userId)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all hover:scale-110 active:scale-95"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center text-[#0c272d]/50 dark:text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium dark:text-gray-300">No users found</p>
            <p className="text-sm dark:text-gray-400">Try adjusting your search or add a new user</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#0c272d] dark:text-gray-100">
                {editingUser ? 'Edit User' : 'Create New User'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#0c272d] dark:text-gray-100 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-[#9fdbc2]/30 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14a67e]/50 bg-white dark:bg-gray-700 text-[#0c272d] dark:text-gray-100"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0c272d] dark:text-gray-100 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.mail}
                  onChange={(e) => setFormData({ ...formData, mail: e.target.value })}
                  className="w-full px-4 py-2 border border-[#9fdbc2]/30 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14a67e]/50 bg-white dark:bg-gray-700 text-[#0c272d] dark:text-gray-100"
                  placeholder="john.doe@example.com"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-semibold text-[#0c272d] dark:text-gray-100 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-[#9fdbc2]/30 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14a67e]/50 bg-white dark:bg-gray-700 text-[#0c272d] dark:text-gray-100"
                    placeholder="Enter password"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-[#0c272d] dark:text-gray-100 mb-2">
                  Role
                </label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value as UserRole })}
                  className="w-full px-4 py-2 border border-[#9fdbc2]/30 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#14a67e]/50 bg-white dark:bg-gray-700 text-[#0c272d] dark:text-gray-100"
                >
                  <option value="ESTUDIANTE">ESTUDIANTE</option>
                  <option value="PROFESOR">PROFESOR</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[#14a67e] text-white rounded-xl hover:bg-[#0f8263] transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {submitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-[#0c272d] rounded-xl hover:bg-gray-200 transition-all duration-300 hover:scale-105 active:scale-95 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

