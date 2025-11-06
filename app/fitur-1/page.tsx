'use client';

import ChatInterface from '@/components/ChatInterface';
import StaggeredMenu from '@/components/StaggeredMenu';
import Particles from '@/components/Particles';

export default function Fitur1() {
  return (
    <div className="min-h-screen bg-black relative">
      {/* Particles Background */}
      <div className="fixed inset-0 z-0">
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
          { label: 'AI Campus Chatbot', ariaLabel: 'Go to feature 1', link: '/fitur-1', color: '#22c55e' },
          { label: 'Event Recommender', ariaLabel: 'Go to feature 2', link: '/fitur-2' },
          { label: 'Smart Schedule', ariaLabel: 'Go to feature 3', link: '/fitur-3' },
          { label: 'Peer Connect', ariaLabel: 'Go to feature 4', link: '/fitur-4' }
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

      {/* Full Screen Chat Interface */}
      <div className="relative h-screen w-full bg-transparent p-4">
        <div className="h-full max-w-6xl mx-auto">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}
