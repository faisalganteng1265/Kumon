'use client';

import { useEffect, useState, useRef } from 'react';
import localFont from 'next/font/local';
import Image from 'next/image';

const organicRelief = localFont({
  src: '../public/fonts/Organic Relief.ttf',
  display: 'swap',
});

export default function PoweredBySection() {
  const [isVisible, setIsVisible] = useState(false);
  const [visibleBoxes, setVisibleBoxes] = useState<boolean[]>([false, false, false, false]);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);

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

    const section = document.getElementById('powered-by-section');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  useEffect(() => {
    const observers = boxRefs.current.map((box, index) => {
      if (!box) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleBoxes((prev) => {
                const newState = [...prev];
                newState[index] = true;
                return newState;
              });
            } else {
              setVisibleBoxes((prev) => {
                const newState = [...prev];
                newState[index] = false;
                return newState;
              });
            }
          });
        },
        { threshold: 0.3 }
      );

      observer.observe(box);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  return (
    <section
      id="powered-by-section"
      className="py-20 sm:py-24 md:py-32 px-4 sm:px-6 md:px-8 relative overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #d2f5f9, #fef9ed)',
      }}
    >
      <div className="max-w-7xl mx-auto text-center">
        <h2
          className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold transition-all duration-1000 ease-out ${
            isVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 -translate-y-20 scale-95'
          } ${organicRelief.className}`}
          style={{ color: '#000000' }}
        >
          POWERED BY
        </h2>

        {/* Horizontal Boxes with shadow effect */}
        <div className="mt-32 flex justify-center items-center gap-8 flex-wrap">
          {/* Box 1 */}
          <div
            ref={(el) => { boxRefs.current[0] = el; }}
            className={`relative inline-block transition-all duration-700 ${
              visibleBoxes[0]
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '0ms' }}
          >
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
          <div
            ref={(el) => { boxRefs.current[1] = el; }}
            className={`relative inline-block transition-all duration-700 ${
              visibleBoxes[1]
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
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
          <div
            ref={(el) => { boxRefs.current[2] = el; }}
            className={`relative inline-block transition-all duration-700 ${
              visibleBoxes[2]
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
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
          <div
            ref={(el) => { boxRefs.current[3] = el; }}
            className={`relative inline-block transition-all duration-700 ${
              visibleBoxes[3]
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
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
