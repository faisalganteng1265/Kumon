'use client';

import { useState, useEffect } from 'react';

export default function HowItWorksSection() {
  // Generate floating particles
  const [particles, setParticles] = useState<Array<{ id: number; left: number; top: number; size: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    setParticles(Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 4 + 2,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
    })));
  }, []);

  return (
    <section id="how-it-works" className="py-20 px-6 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
      {/* Paint Splatter Effect */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-900 blob-1 opacity-15"></div>
      <div className="absolute top-40 right-20 w-80 h-80 bg-emerald-900 blob-2 opacity-20"></div>
      <div className="absolute bottom-40 left-1/4 w-72 h-72 bg-emerald-900 blob-3 opacity-18"></div>
      <div className="absolute bottom-20 right-1/3 w-88 h-88 bg-emerald-900 blob-4 opacity-15"></div>
      <div className="absolute top-1/2 right-10 w-64 h-64 bg-emerald-900 blob-5 opacity-20"></div>

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

      {/* Decorative Vertical Lines on sides */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent hidden md:block" style={{ left: '5%' }}></div>
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent hidden md:block" style={{ left: '10%' }}></div>
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent hidden md:block" style={{ right: '5%' }}></div>
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent hidden md:block" style={{ right: '10%' }}></div>

      {/* Horizontal Lines */}
      <div className="absolute left-0 right-0 top-1/4 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
      <div className="absolute left-0 right-0 top-3/4 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>

      {/* Glowing orbs on sides - More vibrant */}
      <div className="absolute left-8 top-1/4 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl animate-pulse-slow hidden md:block"></div>
      <div className="absolute left-12 top-3/4 w-32 h-32 bg-teal-500/20 rounded-full blur-3xl animate-pulse-slow hidden md:block" style={{ animationDelay: '2s' }}></div>
      <div className="absolute right-8 top-1/3 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl animate-pulse-slow hidden md:block" style={{ animationDelay: '1s' }}></div>
      <div className="absolute right-12 top-2/3 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl animate-pulse-slow hidden md:block" style={{ animationDelay: '3s' }}></div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-emerald-500/20"></div>
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-emerald-500/20"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-emerald-500/20"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-emerald-500/20"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Badge */}
        

        {/* Steps - Staircase Layout (Tangga) */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {/* Step 1 - Top (Small Box) */}
          <div className="w-full md:mt-0">
            <div className="group relative">
              <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/30 animate-box-pulse-1">
                {/* Number Badge */}
                <div className="relative mb-4">
                  <div className="w-16 h-16 mx-auto relative">
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    {/* Main circle */}
                    <div className="relative w-full h-full bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 rounded-full flex items-center justify-center border-2 border-emerald-400/30">
                      <span className="text-3xl font-bold text-white drop-shadow-lg">1</span>
                    </div>
                  </div>
                </div>

                {/* Icon */}
                <div className="relative mb-4">
                  <div className="w-14 h-14 mx-auto bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                    <span className="text-4xl">📝</span>
                  </div>
                </div>

                {/* Content - Center aligned */}
                <div className="relative text-center space-y-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Daftar & Setup
                  </h3>
                  <p className="text-emerald-200/80 text-sm leading-relaxed">
                    Buat akun dan atur preferensi minatmu dalam hitungan menit
                  </p>
                </div>
              </div>
            </div>
            {/* "Mudah Digunakan," Text (no box) - Below box, right aligned */}
            <div className="mt-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-right" style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif', letterSpacing: '0.02em' }}>
                MUDAH DIGUNAKAN
              </h2>
            </div>
          </div>

          {/* Step 2 - Middle (Medium Box) */}
          <div className="w-full md:mt-0">
            {/* "Cara Kerja" Text (no box) */}
            <div className="mb-20 flex justify-center">
              <p className="text-3xl md:text-4xl lg:text-5xl font-bold bg-white bg-clip-text text-transparent" style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}>
                CARA
              </p>
              <p className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent" style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}>
                KERJA
              </p>
            </div>
            <div className="group relative">
              <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/30 animate-box-pulse-2">
                {/* Number Badge */}
                <div className="relative mb-4">
                  <div className="w-16 h-16 mx-auto relative">
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    {/* Main circle */}
                    <div className="relative w-full h-full bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 rounded-full flex items-center justify-center border-2 border-emerald-400/30">
                      <span className="text-3xl font-bold text-white drop-shadow-lg">2</span>
                    </div>
                    {/* Rotating ring */}
                    <div className="absolute inset-0 border-2 border-emerald-400/30 rounded-full animate-spin-slow"></div>
                  </div>
                </div>

                {/* Icon */}
                <div className="relative mb-4">
                  <div className="w-14 h-14 mx-auto bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                    <span className="text-4xl">🚀</span>
                  </div>
                </div>

                {/* Content - Center aligned */}
                <div className="relative text-center space-y-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Eksplorasi Fitur
                  </h3>
                  <p className="text-emerald-200/80 text-sm leading-relaxed">
                    Gunakan chatbot, cari event, dan atur jadwalmu dengan AI
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 - Bottom (Small Box) */}
          <div className="w-full md:mt-48">
            {/* "Langsung Efektif" Text (no box) */}
            <div className="mb-6 flex justify-end">
              <p className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent" style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}>
                LANGSUNG EFEKTIF
              </p>
            </div>
            <div className="group relative">
              <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/30 animate-box-pulse-3">
                {/* Number Badge */}
                <div className="relative mb-4">
                  <div className="w-16 h-16 mx-auto relative">
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    {/* Main circle */}
                    <div className="relative w-full h-full bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 rounded-full flex items-center justify-center border-2 border-emerald-400/30">
                      <span className="text-3xl font-bold text-white drop-shadow-lg">3</span>
                    </div>
                  </div>
                </div>

                {/* Icon */}
                <div className="relative mb-4">
                  <div className="w-14 h-14 mx-auto bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                    <span className="text-4xl">🎉</span>
                  </div>
                </div>

                {/* Content - Center aligned */}
                <div className="relative text-center space-y-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Nikmati Hasilnya
                  </h3>
                  <p className="text-emerald-200/80 text-sm leading-relaxed">
                    Kehidupan kampus jadi lebih teratur dan menyenangkan!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Decorative Wave Pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-20">
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path
            d="M0,50 Q360,0 720,50 T1440,50 L1440,100 L0,100 Z"
            fill="url(#wave-gradient-1)"
            opacity="0.4"
          />
          <path
            d="M0,60 Q360,20 720,60 T1440,60 L1440,100 L0,100 Z"
            fill="url(#wave-gradient-2)"
            opacity="0.3"
          />
          <path
            d="M0,70 Q360,40 720,70 T1440,70 L1440,100 L0,100 Z"
            fill="url(#wave-gradient-3)"
            opacity="0.2"
          />
          <defs>
            <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.1)" />
            </linearGradient>
            <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(20, 184, 166, 0.3)" />
              <stop offset="100%" stopColor="rgba(20, 184, 166, 0.1)" />
            </linearGradient>
            <linearGradient id="wave-gradient-3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(5, 150, 105, 0.3)" />
              <stop offset="100%" stopColor="rgba(5, 150, 105, 0.1)" />
            </linearGradient>
          </defs>
        </svg>
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

        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) translateX(10px) rotate(5deg);
          }
          50% {
            transform: translateY(-10px) translateX(-10px) rotate(-5deg);
          }
          75% {
            transform: translateY(-30px) translateX(5px) rotate(3deg);
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

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes box-pulse {
          0%, 100% {
            transform: translateY(0) scale(1);
            box-shadow: 0 0 0 rgba(16, 185, 129, 0);
            border-color: rgba(16, 185, 129, 0.2);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
            box-shadow: 0 35px 70px -12px rgba(16, 185, 129, 0.6), 0 0 60px rgba(16, 185, 129, 0.4);
            border-color: rgba(16, 185, 129, 0.8);
          }
        }

        :global(.animate-spin-slow) {
          animation: spin-slow 8s linear infinite;
        }

        :global(.animate-pulse-slow) {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        :global(.animate-box-pulse-1) {
          animation: box-pulse 3s ease-in-out infinite;
        }

        :global(.animate-box-pulse-2) {
          animation: box-pulse 3s ease-in-out infinite;
          animation-delay: 1s;
        }

        :global(.animate-box-pulse-3) {
          animation: box-pulse 3s ease-in-out infinite;
          animation-delay: 2s;
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

        @keyframes wave-motion-1 {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(-25px) translateY(-5px);
          }
        }

        @keyframes wave-motion-2 {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(25px) translateY(-3px);
          }
        }

        @keyframes wave-motion-3 {
          0%, 100% {
            transform: translateX(0) translateY(0);
          }
          50% {
            transform: translateX(-15px) translateY(-2px);
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

        :global(.animate-float-particle) {
          animation: float-particle 5s ease-in-out infinite;
        }

        :global(.animate-wave-1) {
          animation: wave-motion-1 8s ease-in-out infinite;
        }

        :global(.animate-wave-2) {
          animation: wave-motion-2 7s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        :global(.animate-wave-3) {
          animation: wave-motion-3 9s ease-in-out infinite;
          animation-delay: 1s;
        }

        :global(.animate-spin-very-slow) {
          animation: spin-very-slow 20s linear infinite;
        }

        :global(.animate-bounce-slow) {
          animation: bounce-slow 3s ease-in-out infinite;
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
