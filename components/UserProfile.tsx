'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useNavbarVisibility } from '@/contexts/NavbarVisibilityContext';
import { useUserProfileHover } from '@/contexts/UserProfileHoverContext';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ProfileModal from './ProfileModal';
import { supabase } from '@/lib/supabase';

export default function UserProfile({ position = 'fixed' }: { position?: 'fixed' | 'inline' }) {
  const { user, signOut } = useAuth();
  const { hideNavbar, showNavbar } = useNavbarVisibility();
  const { setIsUserProfileHovered } = useUserProfileHover();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Get username from user metadata
    if (user?.user_metadata?.username) {
      setUsername(user.user_metadata.username);
    } else if (user?.email) {
      // Fallback to email username part
      setUsername(user.email.split('@')[0]);
    }

    // Load avatar from profiles table
    const loadAvatar = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();

        if (!error && data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      } catch (err) {
        console.error('Error loading avatar:', err);
      }
    };

    if (user) {
      loadAvatar();
    }
  }, [user]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    // Hide navbar when profile modal is open, show when closed
    if (isProfileModalOpen) {
      hideNavbar();
    } else {
      showNavbar();
    }
  }, [isProfileModalOpen, hideNavbar, showNavbar]);

  if (!user) return null;

  const handleLogout = async () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
      setIsLogoutModalOpen(false);

      // Force page reload to clear any cached state
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Force reload anyway to clear state
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  // Get initial from username
  const initial = username.charAt(0).toUpperCase();

  const containerClass = position === 'fixed'
    ? 'fixed top-6 left-20 z-[1005]'
    : 'relative z-[1005]';

  return (
    <div className={containerClass} ref={dropdownRef}>
      <div className="relative">
        {/* Profile Button */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          onMouseEnter={() => {
            console.log('UserProfile hover entered');
            setIsHovered(true);
            setIsUserProfileHovered(true);
          }}
          onMouseLeave={() => {
            console.log('UserProfile hover left');
            setIsHovered(false);
            setIsUserProfileHovered(false);
          }}
          className="flex items-center gap-3 rounded-full transition-all duration-300 relative"
          style={{
            padding: isHovered ? '0.75rem 1rem' : '0.5rem',
            background: isHovered ? '#fef9ed' : 'transparent',
            backdropFilter: isHovered ? 'blur(12px)' : 'none',
            border: isHovered ? '2px solid black' : 'none',
            boxShadow: isHovered ? '4px 4px 0px rgba(0, 0, 0, 1)' : 'none',
            cursor: 'pointer',
          }}
        >
          {/* Avatar */}
          {avatarUrl ? (
            <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg transition-transform border-2 border-[#f7d050] flex-shrink-0">
              <Image
                src={avatarUrl}
                alt="Avatar"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#f7d050] flex items-center justify-center text-gray-900 font-bold text-lg shadow-lg transition-transform flex-shrink-0">
              {initial}
            </div>
          )}

          {/* User Info - Only show on hover */}
          {isHovered && (
            <div className="flex flex-col items-start whitespace-nowrap transition-all duration-300 animate-fade-in-fast" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              <span className="text-gray-900 font-semibold text-sm">{username}</span>
              <span className="text-gray-600 text-xs">{user.email}</span>
            </div>
          )}

          {/* Dropdown Arrow - Only show on hover */}
          {isHovered && (
            <svg
              className={`w-4 h-4 text-gray-900 transition-all duration-300 flex-shrink-0 animate-fade-in-fast ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className={`absolute top-full mt-2 w-64 bg-[#fef9ed] rounded-xl border-2 border-black overflow-hidden animate-fade-in z-[1003] ${position === 'inline' ? 'left-0' : 'left-0'}`} style={{ boxShadow: '6px 6px 0px rgba(0, 0, 0, 1)' }}>
            {/* User Info Section */}
            <div className="p-4 border-b-2 border-gray-300">
              <div className="flex items-center gap-3 mb-3">
                {avatarUrl ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#f7d050]" style={{ boxShadow: '3px 3px 0px rgba(0, 0, 0, 1)' }}>
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#f7d050] flex items-center justify-center text-gray-900 font-bold text-xl" style={{ boxShadow: '3px 3px 0px rgba(0, 0, 0, 1)' }}>
                    {initial}
                  </div>
                )}
                <div className="flex-1" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  <p className="text-gray-900 font-semibold">{username}</p>
                  <p className="text-gray-600 text-xs truncate">{user.email}</p>
                </div>
              </div>
              <div className="bg-white rounded-lg px-3 py-2 border-2 border-black" style={{ boxShadow: '2px 2px 0px rgba(0, 0, 0, 1)', fontFamily: "'Fredoka', sans-serif" }}>
                <p className="text-gray-900 text-xs font-medium">✓ Verified Account</p>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsProfileModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-900 hover:bg-[#f7d050] rounded-lg transition-all"
                style={{ fontFamily: "'Fredoka', sans-serif" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-sm font-medium">My Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  // Navigate to settings page (you can implement this later)
                  alert('Settings page coming soon!');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-900 hover:bg-[#f7d050] rounded-lg transition-all"
                style={{ fontFamily: "'Fredoka', sans-serif" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium">Settings</span>
              </button>

              <div className="border-t-2 border-gray-300 my-2"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                style={{ fontFamily: "'Fredoka', sans-serif" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ zIndex: 99999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsLogoutModalOpen(false);
            }
          }}
        >
          <div className="bg-[#fef9ed] rounded-2xl w-full max-w-md border-2 border-black relative overflow-hidden" style={{ boxShadow: '8px 8px 0px rgba(0, 0, 0, 1)' }}>
            {/* Decorative gradient background */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#f7d050] via-yellow-500 to-[#f7d050]"></div>

            <div className="p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="relative bg-white rounded-full p-4 border-2 border-black" style={{ boxShadow: '4px 4px 0px rgba(0, 0, 0, 1)' }}>
                    <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Title and Description */}
              <div className="text-center mb-8" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Konfirmasi Logout</h2>
                <p className="text-gray-600">
                  Apakah Anda yakin ingin keluar dari akun Anda?
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg transition-all border-2 border-black"
                  style={{ boxShadow: '4px 4px 0px rgba(0, 0, 0, 1)', fontFamily: "'Fredoka', sans-serif" }}
                >
                  Batal
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 bg-[#f7d050] hover:bg-yellow-400 text-gray-900 font-medium py-3 px-4 rounded-lg transition-all border-2 border-black"
                  style={{ boxShadow: '4px 4px 0px rgba(0, 0, 0, 1)', fontFamily: "'Fredoka', sans-serif" }}
                >
                  Ya, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-fast {
          from {
            opacity: 0;
            transform: translateX(-5px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-fade-in-fast {
          animation: fade-in-fast 0.15s ease-out;
        }
      `}</style>
    </div>
  );
}
