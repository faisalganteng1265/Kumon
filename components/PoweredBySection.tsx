'use client';

import { useEffect, useState } from 'react';
import localFont from 'next/font/local';
import Image from 'next/image';

const organicRelief = localFont({
  src: '../public/fonts/Organic Relief.ttf',
  display: 'swap',
});

export default function PoweredBySection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 md:px-8 relative overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #d2f5f9, #fef9ed)',
      }}
    >
      <div className="max-w-7xl mx-auto text-center">
        <h2
          className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          } ${organicRelief.className}`}
          style={{ color: '#000000' }}
        >
          POWERED BY
        </h2>

        {/* Horizontal Boxes with shadow effect */}
        <div className="mt-32 flex justify-center items-center gap-8 flex-wrap">
          {/* Box 1 */}
          <div className="relative inline-block">
            {/* Black shadow box */}
            <div className="absolute top-3 left-3 w-64 h-32 bg-black rounded-xl" />
            {/* White main box */}
            <div className="relative w-64 h-32 bg-white rounded-xl border-4 border-black flex items-center justify-center p-4">
              <Image
                src="/supabase.png"
                alt="Supabase"
                width={200}
                height={80}
                className="object-contain"
              />
            </div>
          </div>

          {/* Box 2 */}
          <div className="relative inline-block">
            {/* Black shadow box */}
            <div className="absolute top-3 left-3 w-64 h-32 bg-black rounded-xl" />
            {/* White main box */}
            <div className="relative w-64 h-32 bg-white rounded-xl border-4 border-black flex items-center justify-center p-4">
              <Image
                src="/jitsimeet.png"
                alt="Jitsi Meet"
                width={200}
                height={80}
                className="object-contain"
              />
            </div>
          </div>

          {/* Box 3 */}
          <div className="relative inline-block">
            {/* Black shadow box */}
            <div className="absolute top-3 left-3 w-64 h-32 bg-black rounded-xl" />
            {/* White main box */}
            <div className="relative w-64 h-32 bg-white rounded-xl border-4 border-black flex items-center justify-center p-4">
              <Image
                src="/googlecalendar.png"
                alt="Google Calendar"
                width={200}
                height={80}
                className="object-contain"
              />
            </div>
          </div>

          {/* Box 4 */}
          <div className="relative inline-block">
            {/* Black shadow box */}
            <div className="absolute top-3 left-3 w-64 h-32 bg-black rounded-xl" />
            {/* White main box */}
            <div className="relative w-64 h-32 bg-white rounded-xl border-4 border-black flex items-center justify-center p-4">
              <Image
                src="/groq.png"
                alt="Groq"
                width={200}
                height={80}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
