'use client';

import localFont from 'next/font/local';

const impact = localFont({
  src: '../public/fonts/impact.ttf',
  display: 'swap',
});

export default function MarqueeSection() {
  return (
    <section className="relative overflow-hidden py-6 sm:py-8" style={{ backgroundColor: '#fef9ed' }}>
      {/* Top Border */}
      <div className="absolute top-0 left-0 w-full h-1 sm:h-1.5" style={{ backgroundColor: '#a0d0d1' }}></div>

      {/* Marquee Container */}
      <div className="relative">
        <div className="marquee-container">
          <div className="marquee-content">
            {/* Repeat the text multiple times for seamless loop */}
            {[...Array(10)].map((_, index) => (
              <span
                key={index}
                className={`inline-block mx-8 sm:mx-12 md:mx-16 text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold ${impact.className}`}
                style={{ color: '#a0d0d1' }}
              >
                BRAINWAVE
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Border */}
      <div className="absolute bottom-0 left-0 w-full h-1 sm:h-1.5" style={{ backgroundColor: '#a0d0d1' }}></div>

      <style jsx>{`
        .marquee-container {
          display: flex;
          overflow: hidden;
          user-select: none;
        }

        .marquee-content {
          display: flex;
          animation: scroll-right 30s linear infinite;
          white-space: nowrap;
        }

        @keyframes scroll-right {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }

        /* Pause animation on hover */
        .marquee-container:hover .marquee-content {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
