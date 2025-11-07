'use client';

import Image from 'next/image';
import { FiX, FiMessageCircle } from 'react-icons/fi';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    avatar: string | null;
    interests: string[];
  } | null;
  onSendMessage: () => void;
}

const interestOptions = [
  { value: 'teknologi', label: 'Teknologi & IT', icon: '/ICONKOMPUTER.png' },
  { value: 'bisnis', label: 'Bisnis & Entrepreneurship', icon: '/ICONBISNIS.png' },
  { value: 'seni', label: 'Seni & Kreatif', icon: '/SENIICON.png' },
  { value: 'sosial', label: 'Sosial & Volunteering', icon: '/SOSIALICON.png' },
  { value: 'akademik', label: 'Akademik & Penelitian', icon: '/AKADEMIKICON.png' },
  { value: 'olahraga', label: 'Olahraga & Kesehatan', icon: '/OLAHRAGAICON.png' },
  { value: 'leadership', label: 'Leadership & Organisasi', icon: '/ORGANISASIICON.png' },
  { value: 'lingkungan', label: 'Lingkungan & Sustainability', icon: '/LINGKUNGANICON.png' },
];

export default function UserProfileModal({ isOpen, onClose, user, onSendMessage }: UserProfileModalProps) {
  if (!isOpen || !user) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getUserInterestDetails = (interests: string[]) => {
    return interests
      .map(interest => interestOptions.find(opt => opt.value === interest))
      .filter(Boolean);
  };

  const userInterestDetails = getUserInterestDetails(user.interests);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50 relative overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-500 via-lime-500 to-green-500"></div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 bg-gray-800/80 backdrop-blur-sm rounded-full p-2 hover:bg-gray-700"
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-gradient-to-r from-green-500 to-lime-500 opacity-40 rounded-full"></div>
              <div className="relative">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={120}
                    height={120}
                    className="rounded-full object-cover border-4 border-gray-700/50"
                  />
                ) : (
                  <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-lime-500 to-green-500 flex items-center justify-center text-white text-5xl font-bold border-4 border-gray-700/50">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Username */}
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            {user.name}
          </h2>

          {/* Interests Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Interests
            </h3>
            {userInterestDetails.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {userInterestDetails.map((interest) => (
                  <div
                    key={interest?.value}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 hover:border-lime-500/50 transition-all"
                  >
                    <div className="w-10 h-10 bg-gray-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      {interest?.icon && (
                        <Image
                          src={interest.icon}
                          alt={interest.label}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      )}
                    </div>
                    <span className="text-sm text-white font-medium truncate">
                      {interest?.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No interests added yet</p>
              </div>
            )}
          </div>

          {/* Send Message Button */}
          <button
            onClick={() => {
              onSendMessage();
              onClose();
            }}
            className="w-full bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-600 hover:to-lime-600 text-white font-bold py-3.5 px-4 rounded-lg transition-all hover:shadow-lg hover:shadow-green-500/50 hover:scale-105 flex items-center justify-center gap-2"
          >
            <FiMessageCircle className="w-5 h-5" />
            <span>Send Private Message</span>
          </button>
        </div>
      </div>
    </div>
  );
}
