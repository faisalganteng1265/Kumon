'use client';

import { useEffect, useState, useRef } from 'react';
import CardNav from './CardNav';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Navigation items for CardNav - matching GallerySection features
  const navItems = [
    {
      label: 'AI Campus Guide',
      bgColor: '#22c55e', // green-500
      textColor: '#ffffff',
      links: [
        {
          label: 'Navigasi Kampus',
          href: '/fitur-1',
          ariaLabel: 'Pergi ke AI Campus Guide'
        }
      ]
    },
    {
      label: 'Event Recommender',
      bgColor: '#14b8a6', // teal-500
      textColor: '#ffffff',
      links: [
        {
          label: 'Rekomendasi Event',
          href: '/fitur-2',
          ariaLabel: 'Pergi ke Event Recommender'
        }
      ]
    },
    {
      label: 'Peer Connect AI',
      bgColor: '#84cc16', // lime-500
      textColor: '#ffffff',
      links: [
        {
          label: 'Hubungkan dengan Teman',
          href: '/fitur-4',
          ariaLabel: 'Pergi ke Peer Connect AI'
        }
      ]
    },
    {
      label: 'Smart Schedule Builder',
      bgColor: '#06b6d4', // cyan-500
      textColor: '#ffffff',
      links: [
        {
          label: 'Atur Jadwal',
          href: '/fitur-3',
          ariaLabel: 'Pergi ke Smart Schedule Builder'
        }
      ]
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Set threshold sekitar 50px dari top untuk transisi lebih cepat
      setIsScrolled(currentScrollY > 50);

      // Navbar always visible - no auto-hide
      setIsVisible(true);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [lastScrollY, isMenuOpen]);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <CardNav
        logo="/AICAMPUS.png"
        logoAlt="AICampus"
        items={navItems}
        baseColor={isScrolled ? 'rgba(17, 24, 39, 0.95)' : 'rgba(0, 0, 0, 0)'} // Transparent when not scrolled, solid when scrolled
        menuColor="#ffffff"
        buttonBgColor="#84cc16" // lime-500
        buttonTextColor="#000000"
        onMenuToggle={setIsMenuOpen}
      />
    </nav>
  );
}
