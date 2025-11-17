'use client';

import { motion } from 'framer-motion';
import CardSwap, { Card } from './CardSwap';
import { useState, useRef, useEffect } from 'react';
import ElectricBorder from './ElectricBorder';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

interface StatItemProps {
  end: number;
  label: string;
  suffix?: string;
  icon: string;
}

function StatItem({ end, label, suffix = '', icon }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Reset and start animation every time it becomes visible
          setCount(0);
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setCount(Math.min(Math.round(increment * currentStep), end));
      } else {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible, end]);

  return (
    <div ref={ref} className="group hover:-translate-y-1 transition-all duration-300">
      <ElectricBorder
        color="#10b981"
        speed={1}
        chaos={0.8}
        thickness={2}
        className="h-full"
        style={{ borderRadius: '1rem' }}
      >
        <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 h-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="relative z-10 text-center space-y-2 sm:space-y-3 md:space-y-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto bg-emerald-500/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-emerald-500/20">
              <img src={icon} alt={label} className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 object-contain" />
            </div>
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
              {count}{suffix}
            </div>
            <div className="text-sm sm:text-base md:text-lg text-emerald-200/90 font-medium" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>{label}</div>
          </div>
        </div>
      </ElectricBorder>
    </div>
  );
}

export default function FeaturesSection() {
  const { t } = useLanguage();
  const swapFunctionRef = useRef<(() => void) | null>(null);
  const pauseFunctionRef = useRef<(() => void) | null>(null);
  const resumeFunctionRef = useRef<(() => void) | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);

  // State for title animation
  const [isTitleVisible, setIsTitleVisible] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for title animation
  useEffect(() => {
    const currentRef = titleRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Trigger animation when entering viewport
          setIsTitleVisible(true);
        } else {
          // Reset when leaving viewport
          setIsTitleVisible(false);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const handleSwapTrigger = (swapFn: () => void) => {
    swapFunctionRef.current = swapFn;
  };

  const handlePauseResume = (pauseFn: () => void, resumeFn: () => void) => {
    pauseFunctionRef.current = pauseFn;
    resumeFunctionRef.current = resumeFn;
  };

  const handleCardClick = (cardIndex: number) => {
    if (activeCardIndex === cardIndex) {
      // Klik lagi - deactivate dan resume auto swap
      setActiveCardIndex(null);
      if (resumeFunctionRef.current) {
        resumeFunctionRef.current();
      }
    } else {
      // Activate card dan pause auto swap
      setActiveCardIndex(cardIndex);
      if (pauseFunctionRef.current) {
        pauseFunctionRef.current();
      }
    }
  };

  return (
    <section id="features" className="pt-20 pb-32 px-6 bg-gradient-to-b from-gray-900 via-gray-800 to-black relative overflow-hidden">
      {/* Paint Splatter Effect - Deep Dark Green Blobs (Same Color for Overlap) */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-900 blob-1 opacity-20"></div>
      <div className="absolute top-10 right-16 w-64 h-64 bg-emerald-900 blob-2 opacity-15"></div>
      <div className="absolute bottom-32 left-1/4 w-80 h-80 bg-emerald-900 blob-3 opacity-20"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-emerald-900 blob-4 opacity-18"></div>
      <div className="absolute top-1/2 left-1/3 w-68 h-68 bg-emerald-900 blob-5 opacity-15"></div>
      <div className="absolute top-40 right-1/3 w-60 h-60 bg-emerald-900 blob-1 opacity-18"></div>
      <div className="absolute bottom-40 left-1/2 w-64 h-64 bg-emerald-900 blob-2 opacity-20"></div>
      <div className="absolute top-60 left-20 w-56 h-56 bg-emerald-900 blob-3 opacity-15"></div>
      <div className="absolute bottom-60 right-1/4 w-68 h-68 bg-emerald-900 blob-4 opacity-18"></div>
      <div className="absolute top-1/3 right-10 w-60 h-60 bg-emerald-900 blob-5 opacity-20"></div>

      {/* AI Theme - Floating Binary Code */}
      <motion.div
        className="absolute top-20 left-1/4 text-emerald-500/10 text-xs font-mono"
        animate={{ y: [0, -30, 0], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >01010011</motion.div>
      <motion.div
        className="absolute top-40 right-1/3 text-emerald-500/10 text-xs font-mono"
        animate={{ y: [0, -30, 0], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >11001010</motion.div>
      <motion.div
        className="absolute bottom-40 left-1/3 text-emerald-500/10 text-xs font-mono"
        animate={{ y: [0, -30, 0], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >10101100</motion.div>
      <motion.div
        className="absolute bottom-20 right-1/4 text-emerald-500/10 text-xs font-mono"
        animate={{ y: [0, -30, 0], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      >01110010</motion.div>
      <motion.div
        className="absolute top-1/2 left-1/5 text-teal-500/10 text-sm font-mono"
        animate={{ y: [0, -30, 0], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      >AI</motion.div>
      <motion.div
        className="absolute top-1/3 right-1/5 text-teal-500/10 text-sm font-mono"
        animate={{ y: [0, -30, 0], opacity: [0.1, 0.15, 0.1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
      >&lt;/&gt;</motion.div>

      {/* AI Theme - Circuit Board Lines */}
      <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 10 10 L 30 10 L 30 30 M 50 10 L 70 10 L 70 30 M 10 50 L 30 50 L 30 70 M 50 50 L 70 50 L 70 70"
                  stroke="rgba(16, 185, 129, 0.4)"
                  strokeWidth="0.5"
                  fill="none"/>
            <circle cx="30" cy="30" r="2" fill="rgba(16, 185, 129, 0.6)"/>
            <circle cx="70" cy="30" r="2" fill="rgba(16, 185, 129, 0.6)"/>
            <circle cx="30" cy="70" r="2" fill="rgba(16, 185, 129, 0.6)"/>
            <circle cx="70" cy="70" r="2" fill="rgba(16, 185, 129, 0.6)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit)"/>
      </svg>

      {/* AI Theme - Neural Network Connections */}
      <motion.svg
        className="absolute top-20 left-10 w-64 h-64 opacity-10 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <g>
          {/* Nodes */}
          <circle cx="32" cy="32" r="4" fill="rgba(16, 185, 129, 0.6)"/>
          <circle cx="128" cy="32" r="4" fill="rgba(16, 185, 129, 0.6)"/>
          <circle cx="224" cy="32" r="4" fill="rgba(16, 185, 129, 0.6)"/>
          <circle cx="80" cy="128" r="4" fill="rgba(20, 184, 166, 0.6)"/>
          <circle cx="176" cy="128" r="4" fill="rgba(20, 184, 166, 0.6)"/>
          <circle cx="128" cy="224" r="4" fill="rgba(5, 150, 105, 0.6)"/>

          {/* Connections */}
          <line x1="32" y1="32" x2="80" y2="128" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1"/>
          <line x1="128" y1="32" x2="80" y2="128" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1"/>
          <line x1="128" y1="32" x2="176" y2="128" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1"/>
          <line x1="224" y1="32" x2="176" y2="128" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1"/>
          <line x1="80" y1="128" x2="128" y2="224" stroke="rgba(20, 184, 166, 0.3)" strokeWidth="1"/>
          <line x1="176" y1="128" x2="128" y2="224" stroke="rgba(20, 184, 166, 0.3)" strokeWidth="1"/>
        </g>
      </motion.svg>

      <motion.svg
        className="absolute bottom-20 right-16 w-56 h-56 opacity-10 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <g>
          <circle cx="28" cy="28" r="3" fill="rgba(16, 185, 129, 0.6)"/>
          <circle cx="112" cy="28" r="3" fill="rgba(16, 185, 129, 0.6)"/>
          <circle cx="196" cy="28" r="3" fill="rgba(16, 185, 129, 0.6)"/>
          <circle cx="70" cy="112" r="3" fill="rgba(20, 184, 166, 0.6)"/>
          <circle cx="154" cy="112" r="3" fill="rgba(20, 184, 166, 0.6)"/>
          <circle cx="112" cy="196" r="3" fill="rgba(5, 150, 105, 0.6)"/>

          <line x1="28" y1="28" x2="70" y2="112" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1"/>
          <line x1="112" y1="28" x2="70" y2="112" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1"/>
          <line x1="112" y1="28" x2="154" y2="112" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1"/>
          <line x1="196" y1="28" x2="154" y2="112" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="1"/>
          <line x1="70" y1="112" x2="112" y2="196" stroke="rgba(20, 184, 166, 0.3)" strokeWidth="1"/>
          <line x1="154" y1="112" x2="112" y2="196" stroke="rgba(20, 184, 166, 0.3)" strokeWidth="1"/>
        </g>
      </motion.svg>

      {/* AI Theme - Data Flow Lines */}
      <motion.div
        className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent"
        animate={{ opacity: [0.05, 0.15, 0.05], y: ['-100%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-teal-500/10 to-transparent"
        animate={{ opacity: [0.05, 0.15, 0.05], y: ['-100%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 2 }}
      />

      {/* AI Theme - Glowing Dots Moving Along Paths */}
      <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent">
        <motion.div
          className="w-2 h-2 bg-emerald-400 rounded-full blur-sm"
          animate={{ x: ['-100%', 'calc(100vw + 100%)', '-100%'], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear", times: [0, 0.1, 0.9, 1] }}
        />
      </div>
      <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/10 to-transparent">
        <motion.div
          className="w-2 h-2 bg-teal-400 rounded-full blur-sm"
          animate={{ x: ['-100%', 'calc(100vw + 100%)', '-100%'], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: 3, times: [0, 0.1, 0.9, 1] }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 px-4">
        <div ref={titleRef} className="text-start mb-16">
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-4 text-emerald-400 font-bold transition-all duration-1000 ease-out ${
              isTitleVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-32'
            }`}
            style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif', letterSpacing: '-0.02em' }}
          >
            {t('features.title')}
          </h2>
          <p
            className={`text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl transition-all duration-1000 ease-out ${
              isTitleVisible
                ? 'opacity-100 translate-x-0 delay-300'
                : 'opacity-0 -translate-x-32 delay-0'
            }`}
            style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}
          >
            {t('features.subtitle')}
          </p>
        </div>

        {/* Decorative Line with Dot */}
        <div className="absolute left-0 top-110 right-1/2 z-0">

          {/* Line with Dot */}
          <div className="flex items-center">
            <div className="flex-1 h-0.5 bg-emerald-500" style={{ marginLeft: '-100vw' }}></div>
            <div className="relative">
              {/* Main dot */}
              <div className="w-8 h-4 rounded-full bg-emerald-500 relative z-10"></div>

              {/* Spotlight effect pointing to stats section */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none overflow-visible" style={{ width: '1px', height: '1px' }}>
                {/* Triangular spotlight beam - cone shape pointing downward to stats */}
                <div className="absolute spotlight-beam" style={{
                  width: '0',
                  height: '0',
                  borderLeft: '600px solid transparent',
                  borderRight: '600px solid transparent',
                  borderTop: '450px solid rgba(16, 185, 129, 0.12)',
                  filter: 'blur(80px)',
                  left: '50%',
                  top: '0px',
                  transform: 'translateX(-50%)',
                }}></div>

                {/* Second layer for depth */}
                <div className="absolute spotlight-beam" style={{
                  width: '0',
                  height: '0',
                  borderLeft: '500px solid transparent',
                  borderRight: '500px solid transparent',
                  borderTop: '400px solid rgba(16, 185, 129, 0.18)',
                  filter: 'blur(50px)',
                  left: '50%',
                  top: '0px',
                  transform: 'translateX(-50%)',
                  animationDelay: '0.5s',
                }}></div>

                {/* Inner cone - brightest */}
                <div className="absolute spotlight-beam" style={{
                  width: '0',
                  height: '0',
                  borderLeft: '350px solid transparent',
                  borderRight: '350px solid transparent',
                  borderTop: '350px solid rgba(16, 185, 129, 0.22)',
                  filter: 'blur(35px)',
                  left: '50%',
                  top: '0px',
                  transform: 'translateX(-50%)',
                  animationDelay: '1s',
                }}></div>

                {/* Pulsing glow from circles - light source */}
                <div className="absolute w-32 h-32 bg-emerald-500/30 rounded-full blur-3xl animate-pulse" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}></div>
                <div className="absolute w-20 h-20 bg-emerald-400/40 rounded-full blur-xl animate-pulse" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', animationDelay: '0.5s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* CardSwap Implementation */}
        <div className="flex justify-center md:justify-end items-center min-h-[400px] sm:min-h-[500px] md:min-h-[600px] pl-0 md:pl-150 pt-10">
          <div className="scale-[0.65] sm:scale-75 md:scale-90 lg:scale-100 origin-center">
            <CardSwap
              width={450}
              height={350}
              cardDistance={50}
              verticalDistance={60}
              delay={4000}
              pauseOnHover={false}
              skewAmount={4}
              easing="elastic"
              onSwapTrigger={handleSwapTrigger}
              onPauseResume={handlePauseResume}
            >
            {/* Feature 1: AI Campus Guide - Modern Dark Design */}
            <Card className={`relative overflow-hidden ${activeCardIndex === 0 ? 'card-active' : ''}`}>
              {/* Dark Background */}
              <div className="absolute inset-0 bg-black"></div>

              {/* Animated Gradient Orbs */}
              <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-500/40 via-pink-500/30 to-blue-500/40 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-teal-500/30 to-emerald-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>

              {/* Dark Card Content with Border */}
              <div className="relative p-8 flex flex-col justify-between h-full bg-gray-950/80 backdrop-blur-md border border-gray-800/50 rounded-3xl shadow-2xl">
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 rounded-2xl"></div>

                {/* Next Button - More Premium */}
                <button
                  className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 hover:from-white/40 hover:to-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl hover:shadow-emerald-400/50 transition-all hover:scale-110 z-20 border border-white/40 cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(0);
                  }}
                >
                  <svg className="w-6 h-6 text-white group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="relative z-10">
                  {/* Icon Container - Premium Style */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-white/25 to-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl">
                      <Image src="/GEMINIICON.png" alt="AI Campus Guide" width={50} height={50} className="object-contain drop-shadow-lg w-8 h-8 sm:w-12 sm:h-12" />
                    </div>
                  </div>

                  {/* Title with Gradient */}
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-lg" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                    {t('features.aiCampusGuide')}
                  </h3>

                  <p className="text-white/95 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base font-medium drop-shadow" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                    {t('features.aiCampusGuideDesc')}
                  </p>
                </div>

                {/* Tags with Better Design */}
                <div className="flex flex-wrap gap-2 relative z-10">
                  <span className="px-4 py-2 bg-gradient-to-r from-white/25 to-white/10 text-white rounded-full text-xs font-semibold border border-white/30 backdrop-blur-md shadow-lg hover:shadow-emerald-400/50 transition-all hover:scale-105" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>KRS</span>
                  <span className="px-4 py-2 bg-gradient-to-r from-white/25 to-white/10 text-white rounded-full text-xs font-semibold border border-white/30 backdrop-blur-md shadow-lg hover:shadow-emerald-400/50 transition-all hover:scale-105" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>Info Gedung</span>
                  <span className="px-4 py-2 bg-gradient-to-r from-white/25 to-white/10 text-white rounded-full text-xs font-semibold border border-white/30 backdrop-blur-md shadow-lg hover:shadow-emerald-400/50 transition-all hover:scale-105" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>Beasiswa</span>
                  <span className="px-4 py-2 bg-gradient-to-r from-white/25 to-white/10 text-white rounded-full text-xs font-semibold border border-white/30 backdrop-blur-md shadow-lg hover:shadow-emerald-400/50 transition-all hover:scale-105" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>Info Dosen</span>
                </div>
              </div>
            </Card>

            {/* Feature 2: Event Recommender - Modern Dark Design */}
            <Card className={`relative overflow-hidden ${activeCardIndex === 1 ? 'card-active' : ''}`}>
              {/* Dark Background */}
              <div className="absolute inset-0 bg-black"></div>

              {/* Animated Gradient Orbs */}
              <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-orange-500/40 via-yellow-500/30 to-red-500/40 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-tl from-emerald-500/30 to-teal-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>

              {/* Dark Card Content with Border */}
              <div className="relative p-8 flex flex-col justify-between h-full bg-gray-950/80 backdrop-blur-md border border-gray-800/50 rounded-3xl shadow-2xl">
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 rounded-2xl"></div>

                {/* Next Button */}
                <button
                  className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 hover:from-white/40 hover:to-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl hover:shadow-emerald-400/50 transition-all hover:scale-110 z-20 border border-white/40 cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(1);
                  }}
                >
                  <svg className="w-6 h-6 text-white group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-white/25 to-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl">
                      <Image src="/ICONLAMPU.png" alt="Event Recommender" width={50} height={50} className="object-contain drop-shadow-lg w-8 h-8 sm:w-12 sm:h-12" />
                    </div>
                  </div>

                  {/* Title with Gradient */}
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-lg" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                    {t('features.eventRecommender')}
                  </h3>

                  <p className="text-white/95 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base font-medium drop-shadow" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                    {t('features.eventRecommenderDesc')}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 relative z-10">
                  <span className="px-4 py-2 bg-gradient-to-r from-white/25 to-white/10 text-white rounded-full text-xs font-semibold border border-white/30 backdrop-blur-md shadow-lg hover:shadow-emerald-400/50 transition-all hover:scale-105" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>Seminar</span>
                  <span className="px-4 py-2 bg-gradient-to-r from-white/25 to-white/10 text-white rounded-full text-xs font-semibold border border-white/30 backdrop-blur-md shadow-lg hover:shadow-emerald-400/50 transition-all hover:scale-105" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>Lomba</span>
                  <span className="px-4 py-2 bg-gradient-to-r from-white/25 to-white/10 text-white rounded-full text-xs font-semibold border border-white/30 backdrop-blur-md shadow-lg hover:shadow-emerald-400/50 transition-all hover:scale-105" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>UKM</span>
                  <span className="px-4 py-2 bg-gradient-to-r from-white/25 to-white/10 text-white rounded-full text-xs font-semibold border border-white/30 backdrop-blur-md shadow-lg hover:shadow-emerald-400/50 transition-all hover:scale-105" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>Volunteering</span>
                </div>
              </div>
            </Card>

            {/* Feature 3: Smart Schedule Builder - Modern Dark Design */}
            <Card className={`relative overflow-hidden ${activeCardIndex === 2 ? 'card-active' : ''}`}>
              {/* Dark Background */}
              <div className="absolute inset-0 bg-black"></div>

              {/* Animated Gradient Orbs */}
              <div className="absolute -top-20 right-1/3 w-96 h-96 bg-gradient-to-br from-cyan-500/40 via-blue-500/30 to-indigo-500/40 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-10 -left-20 w-80 h-80 bg-gradient-to-tr from-teal-500/30 to-emerald-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>

              {/* Dark Card Content with Border */}
              <div className="relative p-8 flex flex-col justify-between h-full bg-gray-950/80 backdrop-blur-md border border-gray-800/50 rounded-3xl shadow-2xl">
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 rounded-2xl"></div>

                {/* Next Button */}
                <button
                  className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 hover:from-white/40 hover:to-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl hover:shadow-emerald-400/50 transition-all hover:scale-110 z-20 border border-white/40 cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(2);
                  }}
                >
                  <svg className="w-6 h-6 text-white group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-white/25 to-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl">
                      <Image src="/JADWALICON.png" alt="Smart Schedule" width={50} height={50} className="object-contain drop-shadow-lg w-8 h-8 sm:w-12 sm:h-12" />
                    </div>
                  </div>

                  {/* Title with Gradient */}
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-lg" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                    {t('features.smartSchedule')}
                  </h3>

                  <p className="text-white/95 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base font-medium drop-shadow" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                    {t('features.smartScheduleDesc')}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 relative z-10">
                  <span className="px-4 py-2 bg-gradient-to-r from-white/25 to-white/10 text-white rounded-full text-xs font-semibold border border-white/30 backdrop-blur-md shadow-lg hover:shadow-emerald-400/50 transition-all hover:scale-105" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>Auto Arrange</span>
                  <span className="px-4 py-2 bg-gradient-to-r from-white/25 to-white/10 text-white rounded-full text-xs font-semibold border border-white/30 backdrop-blur-md shadow-lg hover:shadow-emerald-400/50 transition-all hover:scale-105" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>Conflict Free</span>
                  <span className="px-4 py-2 bg-gradient-to-r from-white/25 to-white/10 text-white rounded-full text-xs font-semibold border border-white/30 backdrop-blur-md shadow-lg hover:shadow-emerald-400/50 transition-all hover:scale-105" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>Work-Life Balance</span>
                </div>
              </div>
            </Card>

            {/* Feature 4: Peer Connect AI - Modern Dark Design */}
            <Card className={`relative overflow-hidden ${activeCardIndex === 3 ? 'card-active' : ''}`}>
              {/* Dark Background */}
              <div className="absolute inset-0 bg-black"></div>

              {/* Animated Gradient Orbs */}
              <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-br from-green-500/40 via-emerald-500/30 to-teal-500/40 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 right-10 w-80 h-80 bg-gradient-to-tl from-lime-500/30 to-green-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>

              {/* Dark Card Content with Border */}
              <div className="relative p-8 flex flex-col justify-between h-full bg-gray-950/80 backdrop-blur-md border border-gray-800/50 rounded-3xl shadow-2xl">
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 rounded-2xl"></div>

                {/* Next Button */}
                <button
                  className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 hover:from-white/40 hover:to-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl hover:shadow-emerald-400/50 transition-all hover:scale-110 z-20 border border-white/40 cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(3);
                  }}
                >
                  <svg className="w-6 h-6 text-white group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-white/25 to-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl">
                      <Image src="/SOSIALICON.png" alt="Peer Connect" width={50} height={50} className="object-contain drop-shadow-lg w-8 h-8 sm:w-12 sm:h-12" />
                    </div>
                  </div>

                  {/* Title with Gradient */}
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-lg" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                    {t('features.peerConnect')}
                  </h3>

                  <p className="text-white/95 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base font-medium drop-shadow" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                    {t('features.peerConnectDesc')}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 relative z-10">
                  <span className="px-4 py-2 bg-gradient-to-r from-white/25 to-white/10 text-white rounded-full text-xs font-semibold border border-white/30 backdrop-blur-md shadow-lg hover:shadow-emerald-400/50 transition-all hover:scale-105" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>Find Friends</span>
                  <span className="px-4 py-2 bg-gradient-to-r from-white/25 to-white/10 text-white rounded-full text-xs font-semibold border border-white/30 backdrop-blur-md shadow-lg hover:shadow-emerald-400/50 transition-all hover:scale-105" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>Mentorship</span>
                  <span className="px-4 py-2 bg-gradient-to-r from-white/25 to-white/10 text-white rounded-full text-xs font-semibold border border-white/30 backdrop-blur-md shadow-lg hover:shadow-emerald-400/50 transition-all hover:scale-105" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>Study Group</span>
                </div>
              </div>
            </Card>

            {/* Feature 5: Smart Task Manager - Modern Dark Design */}
            <Card className={`relative overflow-hidden ${activeCardIndex === 4 ? 'card-active' : ''}`}>
              {/* Dark Background */}
              <div className="absolute inset-0 bg-black"></div>

              {/* Animated Gradient Orbs */}
              <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-500/40 via-pink-500/30 to-blue-500/40 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-teal-500/30 to-emerald-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>

              {/* Dark Card Content with Border */}
              <div className="relative p-8 flex flex-col justify-between h-full bg-gray-950/80 backdrop-blur-md border border-gray-800/50 rounded-3xl shadow-2xl">
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 rounded-2xl"></div>

                {/* Next Button */}
                <button
                  className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 hover:from-white/40 hover:to-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl hover:shadow-emerald-400/50 transition-all hover:scale-110 z-20 border border-white/40 cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(4);
                  }}
                >
                  <svg className="w-6 h-6 text-white group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-white/25 to-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl">
                      <Image src="/TASKICON.png" alt="Smart Task Manager" width={50} height={50} className="object-contain drop-shadow-lg w-8 h-8 sm:w-12 sm:h-12" />
                    </div>
                  </div>

                  {/* Title with Gradient */}
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-lg" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                    {t('features.taskManager')}
                  </h3>

                  <p className="text-white/95 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base font-medium drop-shadow" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                    {t('features.taskManagerDesc')}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 relative z-10">
                  <span className="px-4 py-2 bg-gradient-to-r from-white/25 to-white/10 text-white rounded-full text-xs font-semibold border border-white/30 backdrop-blur-md shadow-lg hover:shadow-emerald-400/50 transition-all hover:scale-105" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>Auto Priority</span>
                  <span className="px-4 py-2 bg-gradient-to-r from-white/25 to-white/10 text-white rounded-full text-xs font-semibold border border-white/30 backdrop-blur-md shadow-lg hover:shadow-emerald-400/50 transition-all hover:scale-105" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>Deadline Alert</span>
                  <span className="px-4 py-2 bg-gradient-to-r from-white/25 to-white/10 text-white rounded-full text-xs font-semibold border border-white/30 backdrop-blur-md shadow-lg hover:shadow-emerald-400/50 transition-all hover:scale-105" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>Progress Track</span>
                </div>
              </div>
            </Card>

            {/* Feature 6: Project Collaboration - Modern Dark Design */}
            <Card className={`relative overflow-hidden ${activeCardIndex === 5 ? 'card-active' : ''}`}>
              {/* Dark Background */}
              <div className="absolute inset-0 bg-black"></div>

              {/* Animated Gradient Orbs */}
              <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-orange-500/40 via-yellow-500/30 to-red-500/40 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-tl from-emerald-500/30 to-teal-500/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>

              {/* Dark Card Content with Border */}
              <div className="relative p-8 flex flex-col justify-between h-full bg-gray-950/80 backdrop-blur-md border border-gray-800/50 rounded-3xl shadow-2xl">
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 rounded-2xl"></div>

                {/* Next Button */}
                <button
                  className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 hover:from-white/40 hover:to-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl hover:shadow-emerald-400/50 transition-all hover:scale-110 z-20 border border-white/40 cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(5);
                  }}
                >
                  <svg className="w-6 h-6 text-white group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="relative z-10">
                  {/* Icon Container */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-white/25 to-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl">
                      <Image src="/PROJEKICON.png" alt="Project Collaboration" width={50} height={50} className="object-contain drop-shadow-lg w-8 h-8 sm:w-12 sm:h-12" />
                    </div>
                  </div>

                  {/* Title with Gradient */}
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-lg" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                    {t('features.projectCollab')}
                  </h3>

                  <p className="text-white/95 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base font-medium drop-shadow" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                    {t('features.projectCollabDesc')}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 relative z-10">
                  <span className="px-4 py-2 bg-gradient-to-r from-white/25 to-white/10 text-white rounded-full text-xs font-semibold border border-white/30 backdrop-blur-md shadow-lg hover:shadow-emerald-400/50 transition-all hover:scale-105" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>Team Work</span>
                  <span className="px-4 py-2 bg-gradient-to-r from-white/25 to-white/10 text-white rounded-full text-xs font-semibold border border-white/30 backdrop-blur-md shadow-lg hover:shadow-emerald-400/50 transition-all hover:scale-105" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>Real-time</span>
                  <span className="px-4 py-2 bg-gradient-to-r from-white/25 to-white/10 text-white rounded-full text-xs font-semibold border border-white/30 backdrop-blur-md shadow-lg hover:shadow-emerald-400/50 transition-all hover:scale-105" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>File Share</span>
                </div>
              </div>
            </Card>
          </CardSwap>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 pt-30 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <StatItem end={1000} label={t('stats.activeStudents')} suffix="+" icon="/AKADEMIKICON.png" />
          <StatItem end={50} label={t('stats.eventsPerMonth')} suffix="+" icon="/JADWALICON.png" />
          <StatItem end={95} label={t('stats.userSatisfaction')} suffix="%" icon="/BINTANGICON.png" />
          <StatItem end={24} label={t('stats.aiSupport')} suffix="/7" icon="/GEMINIICON.png" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes spotlight-sweep {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }

        .spotlight-beam {
          animation: spotlight-sweep 3s ease-in-out infinite;
        }

        .blob-1 {
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          filter: blur(40px);
        }
        .blob-2 {
          border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%;
          filter: blur(40px);
        }
        .blob-3 {
          border-radius: 40% 60% 60% 40% / 60% 40% 60% 40%;
          filter: blur(40px);
        }
        .blob-4 {
          border-radius: 60% 40% 40% 60% / 40% 60% 40% 60%;
          filter: blur(40px);
        }
        .blob-5 {
          border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
          filter: blur(40px);
        }

        /* CardSwap active card positioning - centered on mobile */
        @media (max-width: 1023px) {
          .card-swap-container .card-active {
            transform: translate(-50%, -50%) translateX(0) !important;
            z-index: 9999 !important;
          }
        }

        /* CardSwap active card positioning - right side on desktop */
        @media (min-width: 1024px) {
          .card-swap-container .card-active {
            transform: translate(-50%, -50%) translateX(100px) !important;
            z-index: 9999 !important;
          }
        }
      `}</style>
    </section>
  );
}
