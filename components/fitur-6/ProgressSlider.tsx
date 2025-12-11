'use client';

import { useState, useEffect } from 'react';
import { updateProjectProgress } from '@/lib/supabase/projects';
import { TrendingUp, Save, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProgressSliderProps {
  projectId: string;
  currentProgress: number;
  onUpdate: (newProgress: number) => void;
  isInitiator: boolean;
}

export default function ProgressSlider({
  projectId,
  currentProgress,
  onUpdate,
  isInitiator,
}: ProgressSliderProps) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [progress, setProgress] = useState(currentProgress);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await updateProjectProgress(projectId, progress);
      setIsEditing(false);
      onUpdate(progress); // Pass the new progress value
      // Force a re-render by updating the currentProgress state in the parent
      setProgress(progress);
    } catch (err: any) {
      console.error('Error updating progress:', err);
      setError(err.message || t('projects.alerts.updateProgressFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProgress(currentProgress);
    setIsEditing(false);
    setError(null);
  };

  const getProgressColor = (value: number) => {
    if (value < 30) return 'bg-red-500';
    if (value < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getSliderGradient = (value: number) => {
    let color1, color2;
    if (value < 30) {
      color1 = '#ef4444'; // red-500
      color2 = '#dc2626'; // red-600
    } else if (value < 70) {
      color1 = '#eab308'; // yellow-500
      color2 = '#ca8a04'; // yellow-600
    } else {
      color1 = '#22c55e'; // green-500
      color2 = '#16a34a'; // green-600
    }
    return `linear-gradient(to right, ${color1} 0%, ${color1} ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`;
  };

  return (
    <div className="space-y-3" style={{ fontFamily: "'Fredoka', sans-serif" }}>
      {/* Progress Bar Display */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-black" />
            <span className="text-sm font-bold text-black">{t('projects.progress.title')}</span>
          </div>
          <span className="text-2xl font-bold text-black">{currentProgress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden border-2 border-black">
          <div
            className={`h-full transition-all duration-500 ${getProgressColor(currentProgress)}`}
            style={{ width: `${currentProgress}%` }}
          />
        </div>
      </div>

      {/* Edit Mode for Initiator */}
      {isInitiator && (
        <div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              {t('projects.progress.updateButton')}
            </button>
          ) : (
            <div className="bg-white border-2 border-black rounded-lg p-4 space-y-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {error && (
                <div className="bg-red-100 border-2 border-black text-red-600 px-3 py-2 rounded-lg text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {error}
                </div>
              )}

              {/* Slider with Dynamic Color */}
              <div>
                <label className="block text-sm font-bold text-black mb-2">
                  {t('projects.progress.setProgress')} {progress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(parseInt(e.target.value))}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer slider-custom border-2 border-black"
                  style={{
                    background: getSliderGradient(progress)
                  }}
                  disabled={saving}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving || progress === currentProgress}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? t('projects.buttons.saving') : t('projects.buttons.saveProgress')}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 border-2 border-black text-black rounded-lg font-bold hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 bg-gray-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .slider-custom::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #3b82f6;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider-custom::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #3b82f6;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider-custom:disabled::-webkit-slider-thumb {
          cursor: not-allowed;
          opacity: 0.5;
        }

        .slider-custom:disabled::-moz-range-thumb {
          cursor: not-allowed;
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}
