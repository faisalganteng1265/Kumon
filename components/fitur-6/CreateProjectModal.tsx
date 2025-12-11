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
    max_collaborators: '',
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
    if (!formData.max_collaborators || formData.max_collaborators === '') {
      setError('Max collaborators harus diisi');
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
        max_collaborators: parseInt(formData.max_collaborators.toString()),
        roles: validRoles,
      };

      await createProject(userId, input);

      // Reset form
      setFormData({
        title: '',
        description: '',
        deadline: '',
        max_collaborators: '',
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <style jsx>{`
        .modal-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .modal-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 16px;
        }
        .modal-scrollbar::-webkit-scrollbar-thumb {
          background: #9ca3af;
          border-radius: 16px;
        }
        .modal-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
      <div className="modal-scrollbar bg-white border-2 border-black rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="sticky top-0 bg-white text-black p-6 rounded-t-2xl flex justify-between items-center border-b-2 border-black">
          <h2 className="text-2xl font-bold">Buat Project Baru</h2>
          <button
            onClick={onClose}
            className="text-black hover:bg-gray-100 rounded-xl p-2 transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border-2 border-black text-red-600 px-4 py-3 rounded-xl font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-black font-bold mb-2">
              Judul Project
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-100 border-2 border-black text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
              placeholder="Contoh: Website E-Commerce untuk UMKM"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-black font-bold mb-2">
              Deskripsi Project
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-100 border-2 border-black text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[120px] placeholder-gray-500"
              placeholder="Jelaskan project Anda secara detail..."
              required
            />
          </div>

          {/* Deadline & Max Collaborators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-black font-bold mb-2">
                Deadline (Opsional)
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 border-2 border-black text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-black font-bold mb-2">
                Max Collaborators
              </label>
              <input
                type="number"
                value={formData.max_collaborators}
                onChange={(e) => setFormData({ ...formData, max_collaborators: e.target.value === '' ? '' : (parseInt(e.target.value) || '').toString() })}
                className="w-full px-4 py-3 bg-gray-100 border-2 border-black text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                min="1"
                max="100"
                placeholder="Masukkan jumlah maksimal"
              />
            </div>
          </div>

          {/* Roles Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-black font-bold">
                Role yang Dibutuhkan
              </label>
              <button
                type="button"
                onClick={addRole}
                className="flex items-center px-3 py-2 bg-red-500 text-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 text-sm font-bold cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1" />
                Tambah Role
              </button>
            </div>

            <div className="space-y-4">
              {roles.map((role, index) => (
                <div key={index} className="border-2 border-black rounded-xl p-4 bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-bold text-black">Role #{index + 1}</span>
                    {roles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRole(index)}
                        className="text-red-500 hover:text-red-600 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-black text-sm font-bold mb-1">Nama Role</label>
                      <input
                        type="text"
                        value={role.role_name}
                        onChange={(e) => updateRole(index, 'role_name', e.target.value)}
                        className="w-full px-3 py-2 bg-white border-2 border-black text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
                        placeholder="Contoh: Frontend Developer, UI/UX Designer"
                      />
                    </div>

                    <div>
                      <label className="block text-black text-sm font-bold mb-1">Deskripsi (Opsional)</label>
                      <input
                        type="text"
                        value={role.description}
                        onChange={(e) => updateRole(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 bg-white border-2 border-black text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
                        placeholder="Jelaskan requirement role ini"
                      />
                    </div>

                    <div>
                      <label className="block text-black text-sm font-bold mb-1">Jumlah Dibutuhkan</label>
                      <input
                        type="number"
                        value={role.required_count}
                        onChange={(e) => updateRole(index, 'required_count', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 bg-white border-2 border-black text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
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
          <div className="flex gap-3 pt-4 border-t-2 border-black">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-black rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 cursor-pointer"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:cursor-not-allowed cursor-pointer"
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
