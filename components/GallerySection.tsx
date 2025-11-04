'use client';

import { useState, useEffect, useRef } from 'react';

export default function GallerySection() {
  const images = [
    {
      src: '/FOTO2.jpg',
      alt: 'AI Campus Guide',
      title: 'AI Campus Guide',
      description: 'Hampir semua mahasiswa menggunakan AI untuk navigasi kampus yang lebih mudah'
    },
    {
      src: '/FOTO3.jpg',
      alt: 'Event Recommender',
      title: 'Event Recommender',
      description: 'Rekomendasi event yang sesuai dengan minat dan kebutuhan kamu'
    },
    {
      src: '/FOTO4.jpg',
      alt: 'Peer Connect',
      title: 'Peer Connect AI',
      description: 'Menghubungkan kamu dengan orang yang memiliki minat yang sama'
    },
    {
      src: '/FOTO5.png',
      alt: 'Smart Schedule',
      title: 'Smart Schedule Builder',
      description: 'Atur jadwal sesuai keinginan kamu agar lebih efisien dan terorganisir'
    },
  ];

  // Generate floating particles
  const [particles, setParticles] = useState<Array<{ id: number; left: number; top: number; size: number; delay: number; duration: number }>>([]);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setParticles(Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
    })));
  }, []);

  // Intersection Observer for scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section className="py-20 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #0a0a0a, #0d3d2f, #0a0a0a)' }}>
      {/* Paint Splatter Effect - Deep Dark Green Blobs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-900 blob-1 opacity-15"></div>
      <div className="absolute top-40 right-20 w-80 h-80 bg-emerald-900 blob-2 opacity-20"></div>
      <div className="absolute bottom-40 left-1/4 w-72 h-72 bg-emerald-900 blob-3 opacity-18"></div>
      <div className="absolute bottom-20 right-1/3 w-88 h-88 bg-emerald-900 blob-4 opacity-15"></div>
      <div className="absolute top-1/2 right-10 w-64 h-64 bg-emerald-900 blob-5 opacity-20"></div>
      <div className="absolute top-60 left-1/3 w-60 h-60 bg-emerald-900 blob-1 opacity-18"></div>
      <div className="absolute bottom-60 right-1/4 w-68 h-68 bg-emerald-900 blob-2 opacity-20"></div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-emerald-400/30 animate-float-particle"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Decorative Geometric Shapes */}
      <div className="absolute top-20 left-10 w-20 h-20 border-2 border-emerald-500/20 rotate-45 animate-spin-very-slow"></div>
      <div className="absolute top-40 right-16 w-16 h-16 border-2 border-teal-500/20 rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-32 left-20 w-24 h-24 border-2 border-emerald-500/15 animate-spin-very-slow" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-40 right-24 w-12 h-12 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full animate-bounce-slow"></div>
      <div className="absolute top-1/3 left-1/4 w-8 h-8 border-2 border-emerald-400/25 rotate-12"></div>
      <div className="absolute top-2/3 right-1/3 w-14 h-14 border-2 border-teal-400/20 rounded-lg rotate-45 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>

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

      {/* Decorative Vertical Lines on sides */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent hidden md:block" style={{ left: '5%' }}></div>
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent hidden md:block" style={{ left: '10%' }}></div>
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent hidden md:block" style={{ right: '5%' }}></div>
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent hidden md:block" style={{ right: '10%' }}></div>

      {/* Horizontal Lines */}
      <div className="absolute left-0 right-0 top-1/4 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
      <div className="absolute left-0 right-0 top-3/4 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>

      {/* Glowing orbs on sides */}
      <div className="absolute left-8 top-1/4 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl animate-pulse-slow hidden md:block"></div>
      <div className="absolute left-12 top-3/4 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl animate-pulse-slow hidden md:block" style={{ animationDelay: '2s' }}></div>
      <div className="absolute right-8 top-1/3 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl animate-pulse-slow hidden md:block" style={{ animationDelay: '1s' }}></div>
      <div className="absolute right-12 top-2/3 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl animate-pulse-slow hidden md:block" style={{ animationDelay: '3s' }}></div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-emerald-500/20"></div>
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-emerald-500/20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-emerald-500/20"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-emerald-500/20"></div>

      <div className="max-w-7xl mx-auto relative z-10" ref={sectionRef}>
        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {images.map((image, index) => {
            // Determine animation class based on index
            // Index 0,1 = slide from left
            // Index 2,3 = slide from right
            let animationClass = '';
            if (index <= 1) {
              animationClass = isVisible ? 'slide-in-from-left' : 'slide-out-left';
            } else {
              animationClass = isVisible ? 'slide-in-from-right' : 'slide-out-right';
            }

            return (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-400/30 ${animationClass}`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Dark overlay on hover */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>

                {/* Text overlay on hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 transform translate-y-4 group-hover:translate-y-0">
                  <h3
                    className="text-2xl font-bold text-white mb-3 text-center"
                    style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
                  >
                    {image.title}
                  </h3>
                  <p
                    className="text-base text-white/90 text-center leading-relaxed"
                    style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
                  >
                    {image.description}
                  </p>
                </div>
              </div>

              {/* Border effect */}
              <div className="absolute inset-0 border-2 border-emerald-400/0 group-hover:border-emerald-400/60 rounded-2xl transition-all duration-500"></div>

              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-5"></div>
            </div>
            );
          })}
        </div>

        {/* Hover Me text below photos */}
        <div className="text-center mt-8">
          <p
            className="text-sm text-emerald-400/70 animate-pulse"
            style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
          >
            Hover Me
          </p>
        </div>
      </div>

      <style jsx>{`
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

        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          25% {
            transform: translateY(-30px) translateX(20px);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-60px) translateX(-10px);
            opacity: 0.8;
          }
          75% {
            transform: translateY(-30px) translateX(-20px);
            opacity: 0.6;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        @keyframes spin-very-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes slideInFromLeft {
          0% {
            transform: translateX(-100vw);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideInFromRight {
          0% {
            transform: translateX(100vw);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }

        :global(.animate-float-up) {
          animation: float-up 6s ease-in-out infinite;
        }

        :global(.animate-float-particle) {
          animation: float-particle 5s ease-in-out infinite;
        }

        :global(.animate-pulse-slow) {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        :global(.animate-spin-very-slow) {
          animation: spin-very-slow 20s linear infinite;
        }

        :global(.animate-bounce-slow) {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        :global(.slide-in-from-left) {
          animation: slideInFromLeft 0.8s ease-out forwards;
        }

        :global(.slide-in-from-right) {
          animation: slideInFromRight 0.8s ease-out forwards;
        }

        :global(.slide-out-left) {
          transform: translateX(-100vw);
          opacity: 0;
        }

        :global(.slide-out-right) {
          transform: translateX(100vw);
          opacity: 0;
        }

        .blob-1 {
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          filter: blur(60px);
        }
        .blob-2 {
          border-radius: 70% 30% 30% 70% / 70% 70% 30% 30%;
          filter: blur(60px);
        }
        .blob-3 {
          border-radius: 40% 60% 60% 40% / 60% 40% 60% 40%;
          filter: blur(60px);
        }
        .blob-4 {
          border-radius: 60% 40% 40% 60% / 40% 60% 40% 60%;
          filter: blur(60px);
        }
        .blob-5 {
          border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%;
          filter: blur(60px);
        }
      `}</style>
    </section>
  );
}
