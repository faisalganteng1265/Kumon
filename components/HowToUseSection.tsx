'use client';

import { useEffect, useState } from 'react';
import localFont from 'next/font/local';
import Image from 'next/image';

const organicRelief = localFont({
  src: '../public/fonts/Organic Relief.ttf',
  display: 'swap',
});

const lilitaOne = localFont({
  src: '../public/fonts/LilitaOne-Regular.ttf',
  display: 'swap',
});

export default function HowToUseSection() {
  const [isVisible, setIsVisible] = useState(false);

  // Offset values for each cloud (you can adjust these)
  const clouds = [
    { x: 1300, y: 300 },     // Cloud 1
    { x: 200, y: 200 },   // Cloud 2
    { x: 300, y: 700 },  // Cloud 3
    { x: 1200, y: 740 },   // Cloud 4
    { x: 1600, y: 10 },   // Cloud 5
  ];

  // Offset values for numbers (you can adjust these)
  const numberOffsetX = -100; // pixels horizontal offset for numbers
  const numberOffsetY = 0; // pixels vertical offset for numbers

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        });
      },
      {
        threshold: 0.5, // Trigger when 50% of the section is visible
      }
    );

    const section = document.getElementById('how-to-use-section');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  return (
    <section
      id="how-to-use-section"
      className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 md:px-8 relative overflow-hidden"
      style={{ backgroundColor: '#d2f5f9' }}
    >
      {/* Top border line */}
      <div className="absolute top-0 left-0 right-0 h-[5px] bg-black" />

      {/* Cloud images with adjustable offset */}
      {clouds.map((cloud, index) => (
        <div
          key={index}
          className="absolute pointer-events-none"
          style={{
            left: `${cloud.x}px`,
            top: `${cloud.y}px`,
          }}
        >
          <Image
            src="/awan1.png"
            alt={`Cloud decoration ${index + 1}`}
            width={400}
            height={300}
            className="opacity-100"
          />
        </div>
      ))}

      <div className="max-w-7xl mx-auto text-center">
        <h2
          className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold transition-all duration-1000 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 -translate-y-20 scale-95'
          } ${organicRelief.className}`}
          style={{ color: '#000000' }}
        >
          HOW TO USE
        </h2>

        {/* Boxes with shadow effect */}
        <div className="mt-32 flex flex-col items-center gap-12">
          {/* Box 1 */}
          <div className="relative inline-block">
            {/* Number 1 with adjustable offset */}
            <span
              className={`absolute text-[80px] font-bold text-black pointer-events-none ${organicRelief.className}`}
              style={{
                left: `${numberOffsetX}px`,
                top: `${numberOffsetY}px`,
              }}
            >
              1
            </span>
            {/* Black shadow box */}
            <div className="absolute top-3 left-3 w-[500px] h-32 bg-black rounded-xl" />
            {/* White main box */}
            <div className="relative w-[500px] h-32 bg-white rounded-xl border-4 border-black flex items-center justify-center">
              <span
                className={`text-5xl font-bold text-white ${lilitaOne.className}`}
                style={{
                  WebkitTextStroke: '1px black',
                }}
              >
                Sign Up or Sign In
              </span>
            </div>
          </div>

          {/* Box 2 */}
          <div className="relative inline-block">
            {/* Number 2 with adjustable offset */}
            <span
              className={`absolute text-[80px] font-bold text-black pointer-events-none ${organicRelief.className}`}
              style={{
                left: `${numberOffsetX}px`,
                top: `${numberOffsetY}px`,
              }}
            >
              2
            </span>
            {/* Black shadow box */}
            <div className="absolute top-3 left-3 w-[500px] h-32 bg-black rounded-xl" />
            {/* White main box */}
            <div className="relative w-[500px] h-32 bg-white rounded-xl border-4 border-black flex items-center justify-center">
              <span
                className={`text-5xl font-bold text-white ${lilitaOne.className}`}
                style={{
                  WebkitTextStroke: '1px black',
                }}
              >
                Build Your Preferences
              </span>
            </div>
          </div>

          {/* Box 3 */}
          <div className="relative inline-block">
            {/* Number 3 with adjustable offset */}
            <span
              className={`absolute text-[80px] font-bold text-black pointer-events-none ${organicRelief.className}`}
              style={{
                left: `${numberOffsetX}px`,
                top: `${numberOffsetY}px`,
              }}
            >
              3
            </span>
            {/* Black shadow box */}
            <div className="absolute top-3 left-3 w-[500px] h-32 bg-black rounded-xl" />
            {/* White main box */}
            <div className="relative w-[500px] h-32 bg-white rounded-xl border-4 border-black flex items-center justify-center">
              <span
                className={`text-5xl font-bold text-white ${lilitaOne.className}`}
                style={{
                  WebkitTextStroke: '1px black',
                }}
              >
                Try Features
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
