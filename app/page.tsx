'use client';

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import GallerySection from '@/components/GallerySection';
import WhyBetterSection from '@/components/WhyBetterSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';

export default function Home() {
  useEffect(() => {
    // Ensure page starts at top on initial load
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <GallerySection />
      <HowItWorksSection />
      <FAQSection />
      <Footer />
      <Chatbot />
    </div>
  );
}
