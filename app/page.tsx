'use client';

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import UserProfile from '@/components/UserProfile';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import PeerConnectSection from '@/components/PeerConnectSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import FAQSection from '@/components/FAQSection';
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
      <FAQSection />
      <Footer />
    </div>
  );
}
