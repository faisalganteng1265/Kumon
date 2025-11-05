'use client';

import CardSwap, { Card } from './CardSwap';
import { useState, useRef, useEffect } from 'react';
import ElectricBorder from './ElectricBorder';

interface StatItemProps {
  end: number;
  label: string;
  suffix?: string;
  icon: string;
}

function StatItem({ end, label, suffix = '', icon }: StatItemProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [rainDrops, setRainDrops] = useState<Array<{ id: number; x: number }>>([]);
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

  // Rain drop effect on box - synchronized with background rain
  useEffect(() => {
    // Seeded random function to ensure consistent values between server and client
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    let dropCounter = 0;
    const addRainDrop = () => {
      const id = Date.now();
      // Use deterministic position based on counter
      const x = (seededRandom(dropCounter) * 100);
      dropCounter++;
      setRainDrops((prev) => [...prev, { id, x }]);

      setTimeout(() => {
        setRainDrops((prev) => prev.filter((drop) => drop.id !== id));
      }, 1000);
    };

    // More frequent drops to match background rain (every 0.5-1.5 seconds)
    // Use deterministic interval
    const interval = setInterval(addRainDrop, 1000); // Fixed interval instead of random
    return () => clearInterval(interval);
  }, []);

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
        <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 h-full overflow-hidden">
          {/* Rain drops hitting the box */}
          {rainDrops.map((drop) => (
            <div key={drop.id} className="absolute top-0" style={{ left: `${drop.x}%` }}>
              {/* Water drop */}
              <div className="w-1 h-3 bg-emerald-400 rounded-full animate-drop-fall" />

              {/* Ripple effect on impact */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2">
                <div className="w-4 h-4 border-2 border-emerald-400/60 rounded-full animate-ripple" />
                <div className="w-4 h-4 border-2 border-emerald-400/40 rounded-full animate-ripple" style={{ animationDelay: '0.1s' }} />
                <div className="w-4 h-4 border-2 border-emerald-400/20 rounded-full animate-ripple" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          ))}

          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="relative z-10 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-emerald-500/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-emerald-500/20">
              <span className="text-4xl">{icon}</span>
            </div>
            <div className="text-5xl md:text-6xl font-bold text-white" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
              {count}{suffix}
            </div>
            <div className="text-lg text-emerald-200/90 font-medium" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>{label}</div>
          </div>
        </div>
      </ElectricBorder>
    </div>
  );
}

export default function FeaturesSection() {
  const swapFunctionRef = useRef<(() => void) | null>(null);
  const pauseFunctionRef = useRef<(() => void) | null>(null);
  const resumeFunctionRef = useRef<(() => void) | null>(null);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);

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
    <section id="features" className="pt-20 pb-32 px-6 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
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
      <div className="absolute top-20 left-1/4 text-emerald-500/10 text-xs font-mono animate-float-up" style={{ animationDelay: '0s' }}>01010011</div>
      <div className="absolute top-40 right-1/3 text-emerald-500/10 text-xs font-mono animate-float-up" style={{ animationDelay: '1s' }}>11001010</div>
      <div className="absolute bottom-40 left-1/3 text-emerald-500/10 text-xs font-mono animate-float-up" style={{ animationDelay: '2s' }}>10101100</div>
      <div className="absolute bottom-20 right-1/4 text-emerald-500/10 text-xs font-mono animate-float-up" style={{ animationDelay: '3s' }}>01110010</div>
      <div className="absolute top-1/2 left-1/5 text-teal-500/10 text-sm font-mono animate-float-up" style={{ animationDelay: '1.5s' }}>AI</div>
      <div className="absolute top-1/3 right-1/5 text-teal-500/10 text-sm font-mono animate-float-up" style={{ animationDelay: '2.5s' }}>&lt;/&gt;</div>

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
      <svg className="absolute top-20 left-10 w-64 h-64 opacity-10 pointer-events-none animate-pulse-slow" xmlns="http://www.w3.org/2000/svg">
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
      </svg>

      <svg className="absolute bottom-20 right-16 w-56 h-56 opacity-10 pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} xmlns="http://www.w3.org/2000/svg">
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
      </svg>

      {/* AI Theme - Data Flow Lines */}
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent animate-data-flow"></div>
      <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-teal-500/10 to-transparent animate-data-flow" style={{ animationDelay: '2s' }}></div>

      {/* AI Theme - Glowing Dots Moving Along Paths */}
      <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent">
        <div className="w-2 h-2 bg-emerald-400 rounded-full blur-sm animate-move-right"></div>
      </div>
      <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-teal-500/10 to-transparent">
        <div className="w-2 h-2 bg-teal-400 rounded-full blur-sm animate-move-right" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-start mb-16">
          <h2 className="text-5xl md:text-6xl mb-4 text-emerald-400 font-bold" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif', letterSpacing: '-0.02em' }}>
            Fitur Unggulan Kami
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
            Temukan berbagai fitur inovatif yang dirancang khusus untuk meningkatkan pengalaman kampus Anda
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
        <div className="flex justify-end items-center min-h-[600px] pl-150 pt-10">
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
                  <div className="relative w-20 h-20 mb-6 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-white/25 to-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl">
                      <span className="text-5xl drop-shadow-lg">💬</span>
                    </div>
                  </div>

                  {/* Title with Gradient */}
                  <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-lg" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                    AI Campus Guide Chatbot
                  </h3>

                  <p className="text-white/95 mb-6 leading-relaxed text-base font-medium drop-shadow" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                    Tanya apa saja tentang kampus! Dari cara mengisi KRS, lokasi gedung, info dosen, hingga prosedur beasiswa. AI siap membantu 24/7.
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
                  <div className="relative w-20 h-20 mb-6 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-white/25 to-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl">
                      <span className="text-5xl drop-shadow-lg">🎯</span>
                    </div>
                  </div>

                  {/* Title with Gradient */}
                  <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-lg" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                    Event Recommender
                  </h3>

                  <p className="text-white/95 mb-6 leading-relaxed text-base font-medium drop-shadow" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                    Dapatkan rekomendasi kegiatan yang sesuai dengan minatmu! Seminar, lomba, UKM, volunteering - semua disesuaikan untukmu.
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
                  <div className="relative w-20 h-20 mb-6 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-white/25 to-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl">
                      <span className="text-5xl drop-shadow-lg">📅</span>
                    </div>
                  </div>

                  {/* Title with Gradient */}
                  <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-lg" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                    Smart Schedule Builder
                  </h3>

                  <p className="text-white/95 mb-6 leading-relaxed text-base font-medium drop-shadow" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                    AI bantu atur jadwal kuliah dan kegiatanmu agar seimbang. Tidak ada lagi bentrok jadwal atau overload kegiatan!
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
                  <div className="relative w-20 h-20 mb-6 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                    <div className="relative w-full h-full bg-gradient-to-br from-white/25 to-white/5 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/30 shadow-2xl">
                      <span className="text-5xl drop-shadow-lg">🤝</span>
                    </div>
                  </div>

                  {/* Title with Gradient */}
                  <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent drop-shadow-lg" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                    Peer Connect AI
                  </h3>

                  <p className="text-white/95 mb-6 leading-relaxed text-base font-medium drop-shadow" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                    Temukan teman atau mentor dengan minat yang sama! AI mencocokkan kamu dengan orang-orang yang tepat untuk berkembang bersama.
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
          </CardSwap>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto relative z-10 mt-20 px-6">
        <div className="grid md:grid-cols-4 gap-6">
          <StatItem end={1000} label="Mahasiswa Aktif" suffix="+" icon="👥" />
          <StatItem end={50} label="Event per Bulan" suffix="+" icon="📅" />
          <StatItem end={95} label="Kepuasan Pengguna" suffix="%" icon="⭐" />
          <StatItem end={24} label="AI Support" suffix="/7" icon="🤖" />
        </div>
      </div>

      <style jsx>{`
        @keyframes rain-fall {
          0% {
            transform: translateY(-100%);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0.3;
          }
        }

        @keyframes float-up {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.1;
          }
          50% {
            transform: translateY(-30px);
            opacity: 0.15;
          }
        }

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0.1;
          }
          25% {
            transform: translateY(-20px) translateX(10px) rotate(5deg);
            opacity: 0.15;
          }
          50% {
            transform: translateY(-30px) translateX(-5px) rotate(-3deg);
            opacity: 0.12;
          }
          75% {
            transform: translateY(-15px) translateX(-10px) rotate(3deg);
            opacity: 0.14;
          }
        }

        @keyframes data-flow {
          0% {
            opacity: 0.05;
            transform: translateY(-100%);
          }
          50% {
            opacity: 0.15;
          }
          100% {
            opacity: 0.05;
            transform: translateY(100%);
          }
        }

        @keyframes move-right {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateX(calc(100vw + 100%));
            opacity: 0;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.05;
          }
          50% {
            opacity: 0.15;
          }
        }

        :global(.animate-float-up) {
          animation: float-up 6s ease-in-out infinite;
        }

        :global(.animate-float-slow) {
          animation: float-slow 8s ease-in-out infinite;
        }

        :global(.animate-data-flow) {
          animation: data-flow 4s linear infinite;
        }

        :global(.animate-move-right) {
          animation: move-right 8s linear infinite;
        }

        :global(.animate-pulse-slow) {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        @keyframes drop-fall {
          0% {
            transform: translateY(-20px);
            opacity: 1;
          }
          100% {
            transform: translateY(0);
            opacity: 0;
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }

        @keyframes spotlight-sweep {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }

        :global(.animate-drop-fall) {
          animation: drop-fall 0.3s ease-out forwards;
        }

        :global(.animate-ripple) {
          animation: ripple 0.6s ease-out forwards;
        }

        :global(.spotlight-beam) {
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
      `}</style>
    </section>
  );
}
