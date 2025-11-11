'use client';

import { useState, useEffect } from 'react';
import { updateProjectProgress } from '@/lib/supabase/projects';
import { TrendingUp, Save, X } from 'lucide-react';

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
      setError(err.message || 'Failed to update progress');
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
    return `linear-gradient(to right, ${color1} 0%, ${color1} ${value}%, #1f2937 ${value}%, #1f2937 100%)`;
  };

  return (
    <div className="space-y-3">
      {/* Progress Bar Display */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-white" />
            <span className="text-sm font-semibold text-white">Project Progress</span>
          </div>
          <span className="text-2xl font-bold text-white">{currentProgress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Update Progress
            </button>
          ) : (
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
              {error && (
                <div className="bg-red-900/30 border border-red-600 text-red-400 px-3 py-2 rounded text-sm">
                  {error}
                </div>
              )}

              {/* Slider with Dynamic Color */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Set Progress: {progress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(parseInt(e.target.value))}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer slider-custom"
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
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Progress'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg font-semibold hover:bg-gray-800 transition-all disabled:opacity-50"
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
