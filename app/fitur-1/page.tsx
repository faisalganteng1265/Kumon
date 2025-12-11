'use client';

import ChatInterface from '@/components/ChatInterface';
import StaggeredMenu from '@/components/StaggeredMenu';
import Particles from '@/components/Particles';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Fitur1() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: '#fef9ed' }}>
      {/* Particles Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Particles
          particleCount={1500}
          particleSpread={15}
          speed={0.15}
          particleColors={['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#e5e5e5', '#d4d4d4', '#22c55e']}
          moveParticlesOnHover={true}
          particleHoverFactor={2}
          alphaParticles={true}
          particleBaseSize={150}
          sizeRandomness={1.5}
          cameraDistance={25}
          disableRotation={false}
        />
      </div>

      {/* Staggered Menu Navigation */}
      <StaggeredMenu
        position="right"
        colors={['#0a0a0a', '#1a1a1a', '#2a2a2a']}
        items={[
          { label: 'HOME', ariaLabel: 'Go to home page', link: '/' },
          { label: 'AI Campus Chatbot', ariaLabel: 'Go to feature 1', link: '/fitur-1'},
          { label: 'Smart Schedule', ariaLabel: 'Go to feature 3', link: '/fitur-3' },
          { label: 'Peer Connect', ariaLabel: 'Go to feature 4', link: '/fitur-4' },
          { label: 'Smart Task Manager', ariaLabel: 'Go to feature 5', link: '/fitur-5' },
          { label: 'Project Colabollator', ariaLabel: 'Go to feature 6', link: '/fitur-6' }
        ]}
        displaySocials={false}
        displayItemNumbering={true}
        logoUrl="/AICAMPUS.png"
        menuButtonColor="#fff"
        openMenuButtonColor="#fff"
        accentColor="#ffffff"
        changeMenuColorOnOpen={true}
        isFixed={true}
      />

      {/* Language Toggle - Top Left */}
      <div className="fixed top-4 sm:top-6 md:top-8 right-4 sm:right-8 md:right-80 z-[9999] flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setLanguage('id')}
          className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            language === 'id'
              ? 'bg-red-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600'
              : 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100'
          }`}
        >
          ID
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            language === 'en'
              ? 'bg-red-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600'
              : 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100'
          }`}
        >
          EN
        </button>
      </div>

      {/* Full Screen Chat Interface */}
      <div className="relative h-screen w-full p-2 sm:p-4" style={{ backgroundColor: '#fef9ed' }}>
        <div className="h-full w-full">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
