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
      <div className="bg-[#fef9ed] rounded-xl w-full max-w-md border-4 border-black relative overflow-hidden animate-in fade-in zoom-in duration-200" style={{ boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:text-red-500 transition-colors z-10 bg-white rounded-lg p-2 border-2 border-black hover:bg-red-100"
          style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)' }}
        >
          <FiX className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Avatar */}
          <div className="flex justify-center mb-6 mt-2">
            <div className="relative">
              <div className="relative">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name}
                    width={120}
                    height={120}
                    className="rounded-full object-cover border-4 border-black"
                    style={{ boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}
                  />
                ) : (
                  <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-[#84cc16] to-[#4ade80] flex items-center justify-center text-white text-5xl font-bold border-4 border-black" style={{ boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Username */}
          <h2 className="text-2xl font-bold text-black text-center mb-6" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            {user.name}
          </h2>

          {/* Interests Section */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-3" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              INTERESTS
            </h3>
            {userInterestDetails.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {userInterestDetails.map((interest) => (
                  <div
                    key={interest?.value}
                    className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-black hover:bg-yellow-100 transition-all"
                    style={{ boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)' }}
                  >
                    <div className="w-10 h-10 bg-[#fef9ed] rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-black">
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
                    <span className="text-sm text-black font-medium truncate" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                      {interest?.label}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 text-sm" style={{ fontFamily: "'Fredoka', sans-serif" }}>No interests added yet</p>
              </div>
            )}
          </div>

          {/* Send Message Button */}
          <button
            onClick={() => {
              onSendMessage();
              onClose();
            }}
            className="w-full bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold py-3.5 px-4 rounded-lg transition-all hover:translate-x-1 hover:translate-y-1 flex items-center justify-center gap-2 border-2 border-black"
            style={{ boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)', fontFamily: "'Fredoka', sans-serif" }}
          >
            <FiMessageCircle className="w-5 h-5" />
            <span>Send Private Message</span>
          </button>
        </div>
      </div>
    </div>
  );
}
