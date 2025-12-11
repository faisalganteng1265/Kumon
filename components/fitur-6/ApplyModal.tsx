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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white border-4 border-black rounded-2xl max-w-2xl w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" style={{ fontFamily: "'Fredoka', sans-serif" }}>
        {/* Header */}
        <div className="bg-white text-black p-6 rounded-t-2xl border-b-4 border-black flex justify-between items-center">
          <h2 className="text-2xl font-bold">Apply ke Project</h2>
          <button
            onClick={onClose}
            className="text-black hover:bg-gray-200 rounded-full p-2 transition-all border-2 border-black"
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

          {/* Project Info */}
          <div className="bg-blue-100 rounded-xl p-4 border-2 border-black mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-bold text-black mb-2">{project.title}</h3>
            <p className="text-gray-700 text-sm line-clamp-2 font-semibold">{project.description}</p>
          </div>

          {/* Select Role */}
          <div>
            <label className="block text-black font-bold mb-2">
              Pilih Role <span className="text-red-500">*</span>
            </label>
            {availableRoles.length === 0 ? (
              <div className="bg-yellow-100 text-black px-4 py-3 rounded-xl border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                Semua role sudah terpenuhi
              </div>
            ) : (
              <select
  value={selectedRoleId}
  onChange={(e) => setSelectedRoleId(e.target.value)}
  className="w-full px-4 py-3 bg-white text-black border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-semibold cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]]"
  required
>
  <option value="" className="bg-white text-black">-- Pilih Role --</option>
  {availableRoles.map((role) => (
    <option
      key={role.id}
      value={role.id}
      className="bg-white text-black"
    >
      {role.role_name} ({role.filled_count}/{role.required_count} filled)
    </option>
  ))}
</select>

            )}
          </div>

          {/* Selected Role Info */}
          {selectedRoleId && (
            <div className="bg-blue-100 border-2 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {(() => {
                const role = availableRoles.find((r) => r.id === selectedRoleId);
                return (
                  <>
                    <h4 className="font-bold text-black mb-1">{role?.role_name}</h4>
                    {role?.description && (
                      <p className="text-gray-700 text-sm font-semibold">{role.description}</p>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-black font-bold mb-2">
              Pesan (Opsional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[120px] text-black font-semibold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              placeholder="Jelaskan mengapa Anda cocok untuk role ini..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-black text-black rounded-xl font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]]"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-xl font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
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
