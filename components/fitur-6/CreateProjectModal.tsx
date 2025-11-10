'use client';

import { useState } from 'react';
import { createProject } from '@/lib/supabase/projects';
import type { CreateProjectInput } from '@/types/projects';
import { X, Plus, Trash2 } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

interface RoleInput {
  role_name: string;
  description: string;
  required_count: number;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
  userId,
}: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    max_collaborators: 10,
  });
  const [roles, setRoles] = useState<RoleInput[]>([
    { role_name: '', description: '', required_count: 1 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError('Judul project harus diisi');
      return;
    }
    if (!formData.description.trim()) {
      setError('Deskripsi project harus diisi');
      return;
    }
    const validRoles = roles.filter(r => r.role_name.trim());
    if (validRoles.length === 0) {
      setError('Minimal tambahkan 1 role yang dibutuhkan');
      return;
    }

    try {
      setLoading(true);
      const input: CreateProjectInput = {
        title: formData.title,
        description: formData.description,
        deadline: formData.deadline || undefined,
        max_collaborators: formData.max_collaborators,
        roles: validRoles,
      };

      await createProject(userId, input);

      // Reset form
      setFormData({
        title: '',
        description: '',
        deadline: '',
        max_collaborators: 10,
      });
      setRoles([{ role_name: '', description: '', required_count: 1 }]);

      onSuccess();
    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Gagal membuat project');
    } finally {
      setLoading(false);
    }
  };

  const addRole = () => {
    setRoles([...roles, { role_name: '', description: '', required_count: 1 }]);
  };

  const removeRole = (index: number) => {
    if (roles.length > 1) {
      setRoles(roles.filter((_, i) => i !== index));
    }
  };

  const updateRole = (index: number, field: keyof RoleInput, value: string | number) => {
    const newRoles = [...roles];
    newRoles[index] = { ...newRoles[index], [field]: value };
    setRoles(newRoles);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-2xl font-bold">Buat Project Baru</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Judul Project <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Website E-Commerce untuk UMKM"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Deskripsi Project <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              placeholder="Jelaskan project Anda secara detail..."
              required
            />
          </div>

          {/* Deadline & Max Collaborators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Deadline (Opsional)
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Max Collaborators
              </label>
              <input
                type="number"
                value={formData.max_collaborators}
                onChange={(e) => setFormData({ ...formData, max_collaborators: parseInt(e.target.value) || 10 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="100"
              />
            </div>
          </div>

          {/* Roles Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-gray-700 font-semibold">
                Role yang Dibutuhkan <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addRole}
                className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Tambah Role
              </button>
            </div>

            <div className="space-y-4">
              {roles.map((role, index) => (
                <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-semibold text-gray-600">Role #{index + 1}</span>
                    {roles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRole(index)}
                        className="text-red-500 hover:text-red-700 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">Nama Role</label>
                      <input
                        type="text"
                        value={role.role_name}
                        onChange={(e) => updateRole(index, 'role_name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contoh: Frontend Developer, UI/UX Designer"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-600 text-sm mb-1">Deskripsi (Opsional)</label>
                      <input
                        type="text"
                        value={role.description}
                        onChange={(e) => updateRole(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Jelaskan requirement role ini"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-600 text-sm mb-1">Jumlah Dibutuhkan</label>
                      <input
                        type="number"
                        value={role.required_count}
                        onChange={(e) => updateRole(index, 'required_count', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="20"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Membuat...' : 'Buat Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
