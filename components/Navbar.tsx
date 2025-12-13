'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthModal from './AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useNavbarVisibility } from '@/contexts/NavbarVisibilityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserProfileHover } from '@/contexts/UserProfileHoverContext';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function LogoutConfirmModal({ isOpen, onClose, onConfirm }: LogoutConfirmModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={handleOverlayClick}
    >
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50 relative overflow-hidden animate-in zoom-in duration-200">
        {/* Subtle gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700"></div>

        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-gray-600/30 rounded-full"></div>
              <div className="relative bg-gray-800/80 backdrop-blur-md rounded-full p-4 border border-gray-700/50">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
            </div>
          </div>

          {/* Title and message */}
          <h3 className="text-2xl font-bold text-white mb-2 text-center">Logout Confirmation</h3>
          <p className="text-gray-400 text-sm mb-8 text-center">
            Are you sure you want to logout from your account?
          </p>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-3 px-4 rounded-lg transition-all hover:shadow-lg hover:shadow-gray-900/50 border border-gray-700/50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all hover:shadow-lg hover:shadow-gray-700/50 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPagesDropdownOpen, setIsPagesDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isNavbarVisible: isNavbarVisibleFromContext } = useNavbarVisibility();
  const { language, setLanguage, t } = useLanguage();
  const { isUserProfileHovered } = useUserProfileHover();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Pages dropdown items (fitur-fitur)
  const pageItems = [
    { label: t('page.aiCampusGuide'), href: '/fitur-1' },
    { label: t('page.smartScheduleBuilder'), href: '/fitur-3' },
    { label: t('page.peerConnectAI'), href: '/fitur-4' },
    { label: t('page.smartTaskManager'), href: '/fitur-5' },
    { label: t('page.projectCollaboration'), href: '/fitur-6' },
  ];

  // Main navigation items
  const navItems = [
    { label: t('nav.features'), href: '/#features' },
    { label: t('nav.aboutUs'), href: '/#about-us' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);
      setIsVisible(true);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsPagesDropdownOpen(false);
      }
    };

    if (isPagesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPagesDropdownOpen]);

  const handleLoginClick = () => {
    if (user) {
      setIsLogoutModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleLogoutConfirm = () => {
    signOut();
    setIsLogoutModalOpen(false);
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isVisible && isNavbarVisibleFromContext ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className={`transition-all duration-500 ${
          isScrolled
            ? 'max-w-4xl md:mt-8 mx-auto px-4 relative'
            : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6'
        }`}>
          {/* Shadow Box (Black) - only visible when scrolled */}
          {isScrolled && (
            <div className="absolute top-2 left-6 right-2 h-full bg-black rounded-2xl hidden md:block"></div>
          )}

          {/* Main Navbar Box */}
          <div className={`transition-all duration-500 ${
            isScrolled
              ? 'relative bg-white/95 backdrop-blur-sm md:rounded-2xl border-2 border-black'
              : ''
          }`}>
          <div className={`flex items-center transition-all duration-500 ${
            isScrolled ? 'h-14 px-6' : 'h-16'
          }`}>

{/* Left: Logo & BRAINWAVE */}
<div className="hidden md:flex flex-1 items-center">
  <div className="flex items-center gap-3">
    <Image
      src="/logo1.png"
      alt="Brainwave Logo"
      width={40}
      height={40}
      className="object-contain"
    />
    <div style={{ fontFamily: 'Fredoka, sans-serif' }}>
      <span className="text-black text-2xl font-bold transition-colors duration-200">BRAINWAVE</span>
    </div>
  </div>
</div>

{/* Center: Navigation Menu */}
<div className="hidden md:flex items-center justify-center">
  <div className="flex items-baseline space-x-4">
    {/* Pages Dropdown */}
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsPagesDropdownOpen(!isPagesDropdownOpen)}
        className="text-black hover:text-lime-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-1"
      >
        {t('nav.pages')}
        <svg className={`w-4 h-4 transition-transform duration-200 ${isPagesDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isPagesDropdownOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-56 rounded-lg shadow-lg border border-black py-2 z-50"
          style={{ backgroundColor: '#f7d050' }}
        >
          {pageItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block px-4 py-2 text-sm text-black hover:text-white hover:bg-black/20 transition-colors duration-200 cursor-pointer"
              onClick={() => setIsPagesDropdownOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>

    {/* Other Navigation Items */}
    {navItems.map((item) => (
      <Link
        key={item.label}
        href={item.href}
        className="text-black hover:text-lime-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
      >
        {item.label}
      </Link>
    ))}
  </div>
</div>

{/* Right: Language & Login */}
            <div className="hidden md:flex flex-1 items-center justify-end space-x-3">
              {/* Language Toggle Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setLanguage('id')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    language === 'id'
                      ? 'bg-black text-white'
                      : 'text-black hover:text-lime-600 hover:bg-gray-200'
                  }`}
                >
                  ID
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    language === 'en'
                      ? 'bg-black text-white'
                      : 'text-black hover:text-lime-600 hover:bg-gray-200'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Login/Logout Button */}
              <button
                onClick={handleLoginClick}
                className="bg-black hover:bg-gray-800 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200"
              >
                {user ? t('nav.logout') : t('nav.login')}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-black hover:text-lime-600 hover:bg-gray-200 focus:outline-none transition-colors duration-200"
              >
                <span className="sr-only">Open main menu</span>
                {!isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {/* Language Toggle for Mobile */}
              <div className="flex items-center space-x-2 px-3 py-2">
                <button
                  onClick={() => setLanguage('id')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    language === 'id'
                      ? 'bg-black text-white'
                      : 'text-white hover:text-lime-400 hover:bg-gray-800'
                  }`}
                >
                  ID
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    language === 'en'
                      ? 'bg-black text-white'
                      : 'text-white hover:text-lime-400 hover:bg-gray-800'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Pages Dropdown for Mobile */}
              <div>
                <button
                  onClick={() => setIsPagesDropdownOpen(!isPagesDropdownOpen)}
                  className="w-full text-left text-white hover:text-lime-400 hover:bg-gray-800 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 flex items-center justify-between"
                >
                  {t('nav.pages')}
                  <svg className={`w-4 h-4 transition-transform duration-200 ${isPagesDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isPagesDropdownOpen && (
                  <div className="pl-4 mt-1 space-y-1 rounded-md p-2" style={{ backgroundColor: '#f7d050' }}>
                    {pageItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block text-black hover:text-white hover:bg-black/20 px-3 py-2 rounded-md text-sm transition-colors duration-200 cursor-pointer"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsPagesDropdownOpen(false);
                        }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Other Navigation Items */}
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-white hover:text-lime-400 hover:bg-gray-800 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* Login/Logout Button */}
              <button
                onClick={() => {
                  handleLoginClick();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left bg-lime-500 hover:bg-lime-600 text-black font-semibold px-3 py-2 rounded-md text-base transition-colors duration-200"
              >
                {user ? t('nav.logout') : t('nav.login')}
              </button>
            </div>
          </div>
        )}
      </nav>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}
