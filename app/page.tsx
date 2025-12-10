'use client';

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import UserProfile from '@/components/UserProfile';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import PeerConnectSection from '@/components/PeerConnectSection';
import HowToUseSection from '@/components/HowToUseSection';
import PoweredBySection from '@/components/PoweredBySection';
import FAQSection from '@/components/FAQSection';
import MarqueeSection from '@/components/MarqueeSection';
import Footer from '@/components/Footer';

export default function Home() {
  useEffect(() => {
    // Ensure page starts at top on initial load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navbar />
      <UserProfile />
      <HeroSection />
      <FeaturesSection />
      <PeerConnectSection />
      <HowToUseSection />
      <PoweredBySection />
      <FAQSection />
      <MarqueeSection />
    </div>
  );
}
