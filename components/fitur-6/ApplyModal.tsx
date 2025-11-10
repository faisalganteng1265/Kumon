'use client';

import { useState } from 'react';
import type { Project } from '@/types/projects';
import { applyToProject } from '@/lib/supabase/projects';
import { X } from 'lucide-react';

interface ApplyModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export default function ApplyModal({
  project,
  isOpen,
  onClose,
  onSuccess,
  userId,
}: ApplyModalProps) {
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter roles that are not yet full
  const availableRoles = project.roles?.filter(
    (role) => role.filled_count < role.required_count
  ) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedRoleId) {
      setError('Pilih role yang ingin Anda apply');
      return;
    }

    try {
      setLoading(true);
      await applyToProject(userId, {
        project_id: project.id,
        role_id: selectedRoleId,
        message: message.trim() || undefined,
      });

      onSuccess();
    } catch (err: any) {
      console.error('Error applying to project:', err);
      if (err.code === '23505') {
        setError('Anda sudah apply untuk role ini');
      } else {
        setError(err.message || 'Gagal mengirim aplikasi');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-2xl font-bold">Apply ke Project</h2>
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

          {/* Project Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-2">{project.title}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
          </div>

          {/* Select Role */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Pilih Role <span className="text-red-500">*</span>
            </label>
            {availableRoles.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
                Semua role sudah terpenuhi
              </div>
            ) : (
              <select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Pilih Role --</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.role_name} ({role.filled_count}/{role.required_count} filled)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Role Info */}
          {selectedRoleId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              {(() => {
                const role = availableRoles.find((r) => r.id === selectedRoleId);
                return (
                  <>
                    <h4 className="font-semibold text-blue-900 mb-1">{role?.role_name}</h4>
                    {role?.description && (
                      <p className="text-blue-700 text-sm">{role.description}</p>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Pesan (Opsional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              placeholder="Jelaskan mengapa Anda cocok untuk role ini..."
            />
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
              disabled={loading || availableRoles.length === 0}
            >
              {loading ? 'Mengirim...' : 'Kirim Aplikasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
