'use client';

import { useState } from 'react';
import SmartTaskManager from '@/components/SmartTaskManager';
import StaggeredMenu from '@/components/StaggeredMenu';
import Particles from '@/components/Particles';

export default function Fitur5Page() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 overflow-hidden">
      <Particles />

      {/* Staggered Menu Navigation */}
      <StaggeredMenu
        position="right"
        colors={['#0a0a0a', '#1a1a1a', '#2a2a2a']}
        items={[
          { label: 'HOME', ariaLabel: 'Go to home page', link: '/' },
          { label: 'AI Campus Chatbot', ariaLabel: 'Go to feature 1', link: '/fitur-1' },
          { label: 'Event Recomend', ariaLabel: 'Go to feature 2', link: '/fitur-2' },
          { label: 'Smart Schedule', ariaLabel: 'Go to feature 3', link: '/fitur-3' },
          { label: 'Peer Connect', ariaLabel: 'Go to feature 4', link: '/fitur-4' },
          { label: 'Smart Task Manager', ariaLabel: 'Go to feature 5', link: '/fitur-5', color: '#06b6d4' },
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

      <SmartTaskManager />
    </div>
  );
}
