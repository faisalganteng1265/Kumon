'use client';

import { useEffect, useState, useRef } from 'react';
import CardNav from './CardNav';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Navigation items for CardNav - matching GallerySection features
  const navItems = [
    {
      label: 'AI Campus Guide',
      bgColor: '#10b981', // emerald-500
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
      bgColor: '#3b82f6', // blue-500
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
      bgColor: '#8b5cf6', // violet-500
      textColor: '#ffffff',
      links: [
        {
          label: 'Hubungkan dengan Teman',
          href: '#',
          ariaLabel: 'Pergi ke Peer Connect AI'
        }
      ]
    },
    {
      label: 'Smart Schedule Builder',
      bgColor: '#f59e0b', // amber-500
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
      <CardNav
        logo="/logo.png" // Update dengan path logo Anda
        logoAlt="AI Campus Navigator"
        items={navItems}
        baseColor={isScrolled ? '#1f2937' : 'rgba(31, 41, 55, 0.8)'} // gray-800 with transparency
        menuColor="#ffffff"
        buttonBgColor="#10b981" // emerald-500
        buttonTextColor="#ffffff"
      />
    </nav>
  );
}
