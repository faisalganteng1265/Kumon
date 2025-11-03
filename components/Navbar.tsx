'use client';

import { useEffect, useState, useRef } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Set threshold sekitar 50px dari top untuk transisi lebih cepat
      setIsScrolled(currentScrollY > 50);

      // If at top of page, always show
      if (currentScrollY <= 50) {
        setIsVisible(true);
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
        }
        setLastScrollY(currentScrollY);
        return;
      }

      // Clear existing timer
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }

      // Detect scroll direction
      if (currentScrollY > lastScrollY) {
        // Scrolling down - hide navbar (don't show)
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show navbar, then hide after 3 seconds
        setIsVisible(true);
        hideTimerRef.current = setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [lastScrollY]);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className={`transition-all duration-300 ${
        isScrolled
          ? 'max-w-7xl mx-auto px-6 py-4'
          : 'w-full px-8 py-6'
      }`}>
        <div
          className={`transition-all duration-300 ${
            isScrolled
              ? 'bg-gray-900/95 backdrop-blur-md shadow-lg rounded-2xl px-6 py-3'
              : 'bg-transparent'
          }`}
        >
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className={`transition-all duration-300 ${
                isScrolled ? 'w-10 h-10' : 'w-12 h-12'
              } bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg`}>
                <span className="text-emerald-500 font-bold text-xl">AI</span>
              </div>
              <div className="text-white">
                <div className="font-bold text-lg leading-tight">CAMPUS</div>
                <div className="text-sm font-medium leading-tight">NAVIGATOR</div>
              </div>
            </div>

            {/* Menu Items - Centered */}
            <div className="hidden md:flex gap-8 items-center absolute left-1/2 transform -translate-x-1/2">
              <a
                href="#features"
                className={`font-medium transition-colors ${
                  isScrolled ? 'text-gray-300 hover:text-white' : 'text-white/90 hover:text-white'
                }`}
              >
                Fitur
              </a>
              <a
                href="#how-it-works"
                className={`font-medium transition-colors ${
                  isScrolled ? 'text-gray-300 hover:text-white' : 'text-white/90 hover:text-white'
                }`}
              >
                Cara Kerja
              </a>
              <a
                href="#about"
                className={`font-medium transition-colors ${
                  isScrolled ? 'text-gray-300 hover:text-white' : 'text-white/90 hover:text-white'
                }`}
              >
                Tentang
              </a>
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <button
                className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                  isScrolled
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'border-2 border-emerald-400 text-emerald-400 hover:bg-emerald-400 hover:text-white'
                }`}
              >
                Mulai Sekarang
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
