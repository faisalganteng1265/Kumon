'use client';

import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useRef, useState } from 'react';

export default function FeaturesSection() {
  const { t } = useLanguage();
  const [visibleCards, setVisibleCards] = useState<boolean[]>([false, false, false, false]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = cardRefs.current.map((card, index) => {
      if (!card) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleCards((prev) => {
                const newState = [...prev];
                newState[index] = true;
                return newState;
              });
            } else {
              setVisibleCards((prev) => {
                const newState = [...prev];
                newState[index] = false;
                return newState;
              });
            }
          });
        },
        { threshold: 0.2 }
      );

      observer.observe(card);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  return (
    <section id="features" className="pt-25 pb-22 px-6 bg-[#d2f5f9] relative overflow-hidden">

      {/* Wavy Top Border */}
      <div
        className="absolute overflow-hidden leading-none"
        style={{
          top: 'var(--kertas1-offset-y, -100px)',
          left: '0',
          width: '100%',
          minWidth: '100%',
          height: 'auto',
          zIndex: 10
        }}
      >
        <Image
          src="/Kertas1.png"
          alt="Paper Edge Top"
          width={1920}
          height={120}
          className="w-full h-auto object-cover"
          style={{ minWidth: '100%', display: 'block' }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 px-4">
        {/* Feature Cards - 4 in a row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-16 md:py-40">

          {/* Feature Card 1 - AI Campus Guide */}
          <div
            ref={(el) => { cardRefs.current[0] = el; }}
            className={`relative transition-all duration-700 ${
              visibleCards[0]
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '0ms' }}
          >
            {/* Black shadow box */}
            <div className="absolute top-2 left-2 w-full h-full bg-black rounded-3xl"></div>
            {/* Main card */}
            <div className="relative bg-white rounded-3xl p-6 h-[250px] flex flex-col border-2 border-gray-900">
              <div className="absolute top-4 left-4 w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                <Image src="/SOSIALICON.png" alt="AI Campus Guide" width={32} height={32} className="object-contain" />
              </div>
              <div className="mt-16 flex flex-col items-center justify-center text-center">
                <h3 className="text-6xl font-bold text-gray-900 mb-2" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                  {t('features.aiCampusGuide')}
                </h3>
                <p className="text-sm text-gray-800" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                  {t('features.aiCampusGuideDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Feature Card 2 - Event Recommender */}
          <div
            ref={(el) => { cardRefs.current[1] = el; }}
            className={`relative transition-all duration-700 ${
              visibleCards[1]
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            {/* Black shadow box */}
            <div className="absolute top-2 left-2 w-full h-full bg-black rounded-3xl"></div>
            {/* Main card */}
            <div className="relative bg-white rounded-3xl p-6 h-[250px] flex flex-col border-2 border-gray-900">
              <div className="absolute top-4 left-4 w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                <Image src="/JADWALICON.png" alt="Event Recommender" width={32} height={32} className="object-contain" />
              </div>
              <div className="mt-16 flex flex-col items-center justify-center text-center">
                <h3 className="text-6xl font-bold text-gray-900 mb-2" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                  {t('features.eventRecommender')}
                </h3>
                <p className="text-sm text-gray-800" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                  {t('features.eventRecommenderDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Feature Card 3 - Smart Schedule */}
          <div
            ref={(el) => { cardRefs.current[2] = el; }}
            className={`relative transition-all duration-700 ${
              visibleCards[2]
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Black shadow box */}
            <div className="absolute top-2 left-2 w-full h-full bg-black rounded-3xl"></div>
            {/* Main card */}
            <div className="relative bg-white rounded-3xl p-6 h-[250px] flex flex-col border-2 border-gray-900">
              <div className="absolute top-4 left-4 w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                <Image src="/ICONLAMPU.png" alt="Smart Schedule" width={32} height={32} className="object-contain" />
              </div>
              <div className="mt-16 flex flex-col items-center justify-center text-center">
                <h3 className="text-6xl font-bold text-gray-900 mb-2" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                  {t('features.smartSchedule')}
                </h3>
                <p className="text-sm text-gray-800" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                  {t('features.smartScheduleDesc')}
                </p>
              </div>
            </div>
          </div>

          {/* Feature Card 4 - Peer Connect */}
          <div
            ref={(el) => { cardRefs.current[3] = el; }}
            className={`relative transition-all duration-700 ${
              visibleCards[3]
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            {/* Black shadow box */}
            <div className="absolute top-2 left-2 w-full h-full bg-black rounded-3xl"></div>
            {/* Main card */}
            <div className="relative bg-white rounded-3xl p-6 h-[250px] flex flex-col border-2 border-gray-900">
              <div className="absolute top-4 left-4 w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                <Image src="/GEMINIICON.png" alt="Peer Connect" width={32} height={32} className="object-contain" />
              </div>
              <div className="mt-16 flex flex-col items-center justify-center text-center">
                <h3 className="text-6xl font-bold text-gray-900 mb-2" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                  {t('features.peerConnect')}
                </h3>
                <p className="text-sm text-gray-800" style={{ fontFamily: '"Inter", "Helvetica Neue", "Arial", sans-serif' }}>
                  {t('features.peerConnectDesc')}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Wavy Bottom Border */}
      <div
        className="absolute overflow-hidden leading-none"
        style={{
          bottom: 'var(--kertas-offset-y, -150px)',
          left: '0',
          width: '100%',
          minWidth: '100%',
          height: 'auto',
          zIndex: 10
        }}
      >
        <Image
          src="/Kertas.png"
          alt="Paper Edge"
          width={1920}
          height={120}
          className="w-full h-auto object-cover"
          style={{ minWidth: '100%', display: 'block' }}
        />
      </div>

    </section>
  );
}
