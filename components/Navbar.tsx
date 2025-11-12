'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AuthModal from './AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useNavbarVisibility } from '@/contexts/NavbarVisibilityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserProfileHover } from '@/contexts/UserProfileHoverContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPagesDropdownOpen, setIsPagesDropdownOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isNavbarVisible: isNavbarVisibleFromContext } = useNavbarVisibility();
  const { language, setLanguage, t } = useLanguage();
  const { isUserProfileHovered } = useUserProfileHover();

  // Pages dropdown items (fitur-fitur)
  const pageItems = [
    { label: t('page.aiCampusGuide'), href: '/fitur-1' },
    { label: t('page.eventRecommender'), href: '/fitur-2' },
    { label: t('page.smartScheduleBuilder'), href: '/fitur-3' },
    { label: t('page.peerConnectAI'), href: '/fitur-4' },
    { label: t('page.smartTaskManager'), href: '/fitur-5' },
    { label: t('page.projectCollaboration'), href: '/fitur-6' },
  ];

  // Main navigation items
  const navItems = [
    { label: t('nav.features'), href: '/#features' },
    { label: t('nav.peerconnect'), href: '/#peerconnect' },
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

  const handleLoginClick = () => {
    if (user) {
      if (confirm('Are you sure you want to logout?')) {
        signOut();
      }
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isVisible && isNavbarVisibleFromContext ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className={`transition-all duration-500 ${
          isScrolled
            ? 'max-w-4xl mt-8 mx-auto lg:px-0 rounded-2xl bg-gray-900/95 backdrop-blur-sm shadow-2xl border border-gray-800'
            : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6'
        }`}>
          <div className={`flex items-center justify-between transition-all duration-500 ${
            isScrolled ? 'h-14 px-6' : 'h-16'
          }`}>

{/* Desktop Navigation - Left Aligned */}
<div className="hidden md:flex flex-1">
  {/* Navigation Items - Will shift right when user profile is hovered (only when navbar is not scrolled) */}
  <div className={`flex items-baseline space-x-4 transition-transform duration-300 ${
    isUserProfileHovered && !isScrolled ? 'translate-x-32' : 'translate-x-0'
  }`}>
    {/* Pages Dropdown */}
    <div className="relative">
      <button
        onClick={() => setIsPagesDropdownOpen(!isPagesDropdownOpen)}
        onBlur={() => setTimeout(() => setIsPagesDropdownOpen(false), 200)}
        className="text-white hover:text-lime-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-1"
      >
        {t('nav.pages')}
        <svg className={`w-4 h-4 transition-transform duration-200 ${isPagesDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isPagesDropdownOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-800 py-2 z-50">
          {pageItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block px-4 py-2 text-sm text-white hover:text-lime-400 hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
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
        className="text-white hover:text-lime-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
      >
        {item.label}
      </Link>
    ))}
  </div>
</div>

            {/* Language Toggle and Login/Logout Button */}
            <div className="hidden md:flex flex-shrink-0 items-center space-x-3">
              {/* Language Toggle Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setLanguage('id')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    language === 'id'
                      ? 'bg-lime-500 text-black'
                      : 'text-white hover:text-lime-400 hover:bg-gray-800'
                  }`}
                >
                  ID
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    language === 'en'
                      ? 'bg-lime-500 text-black'
                      : 'text-white hover:text-lime-400 hover:bg-gray-800'
                  }`}
                >
                  EN
                </button>
              </div>
              
              {/* Login/Logout Button */}
              <button
                onClick={handleLoginClick}
                className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-6 py-2 rounded-lg transition-colors duration-200"
              >
                {user ? t('nav.logout') : t('nav.login')}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-lime-400 hover:bg-gray-800 focus:outline-none transition-colors duration-200"
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
                      ? 'bg-lime-500 text-black'
                      : 'text-white hover:text-lime-400 hover:bg-gray-800'
                  }`}
                >
                  ID
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                    language === 'en'
                      ? 'bg-lime-500 text-black'
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
                  <div className="pl-4 mt-1 space-y-1">
                    {pageItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block text-gray-300 hover:text-lime-400 hover:bg-gray-800 px-3 py-2 rounded-md text-sm transition-colors duration-200 cursor-pointer"
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
    </>
  );
}
