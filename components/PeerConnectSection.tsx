'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PeerConnectSection() {
  const { t } = useLanguage();
  const [activeFeature, setActiveFeature] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [activeTab, setActiveTab] = useState('group');

  // Animation state for header
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  // Animation state for boxes
  const [visibleBoxes, setVisibleBoxes] = useState<boolean[]>([false, false]);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Rocket image offset
  const [rocketOffsetX, setRocketOffsetX] = useState(0);
  const [rocketOffsetY, setRocketOffsetY] = useState(0);

  // Intersection Observer for header animation
  useEffect(() => {
    const currentRef = headerRef.current;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Trigger animation when entering viewport
          setIsHeaderVisible(true);
        } else {
          // Reset when leaving viewport
          setIsHeaderVisible(false);
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

  // Intersection Observer for boxes animation
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
        { threshold: 0.2 }
      );

      observer.observe(box);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, []);

  const features = [
    {
      id: 'peerconnect',
      key: 'peerconnect',
      image: '/ChatPeerConnect.png',
      tabs: ['group', 'private', 'call']
    },
    {
      id: 'aicampus',
      key: 'aicampus',
      image: '/PrivatePeerConnect.png',
      tabs: ['campus', 'general']
    },
    {
      id: 'smartschedule',
      key: 'smartschedule',
      image: '/ChatPeerConnect.png',
      tabs: ['optimization', 'integration']
    },
    {
      id: 'taskmanager',
      key: 'taskmanager',
      image: '/PrivatePeerConnect.png',
      tabs: ['tasks']
    },
    {
      id: 'collaboration',
      key: 'collaboration',
      image: '/CallPeerConnect.png',
      tabs: ['project']
    },
  ];

  // Auto-rotate features every 4 seconds, but delay 6 seconds after manual click
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastClickTime < 6000) {
        return;
      }

      setActiveFeature((current) => {
        const newIndex = (current + 1) % features.length;
        // Reset tab based on feature
        const feature = features[newIndex];
        if (feature.tabs && feature.tabs.length > 0) {
          setActiveTab(feature.tabs[0]);
        }
        return newIndex;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [lastClickTime, features.length]);

  const handlePrev = () => {
    setLastClickTime(Date.now());
    const newIndex = (activeFeature - 1 + features.length) % features.length;
    setActiveFeature(newIndex);
    // Reset tab based on feature
    const feature = features[newIndex];
    if (feature.tabs && feature.tabs.length > 0) {
      setActiveTab(feature.tabs[0]);
    }
  };

  const handleNext = () => {
    setLastClickTime(Date.now());
    const newIndex = (activeFeature + 1) % features.length;
    setActiveFeature(newIndex);
    // Reset tab based on feature
    const feature = features[newIndex];
    if (feature.tabs && feature.tabs.length > 0) {
      setActiveTab(feature.tabs[0]);
    }
  };

  const handleDotClick = (index: number) => {
    setLastClickTime(Date.now());
    setActiveFeature(index);
    // Reset tab based on feature
    const feature = features[index];
    if (feature.tabs && feature.tabs.length > 0) {
      setActiveTab(feature.tabs[0]);
    }
  };

  const currentFeature = features[activeFeature];

  return (
    <section id="features" className="py-12 sm:py-16 md:py-20 px-4 bg-[#fef9ed]">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div ref={headerRef} className="text-center mb-8 sm:mb-10 md:mb-12 relative">
          {/* Rocket Image with Offset Controls */}
          <div
            className="absolute z-10"
            style={{
              left: `${rocketOffsetX}px`,
              top: `${rocketOffsetY}px`,
              transform: 'translate(-125%, -20%)'
            }}
          >
            <Image
              src="/roket.png"
              alt="Rocket"
              width={200}
              height={200}
              className="w-32 sm:w-40 md:w-48 lg:w-56"
            />
          </div>

          <h2
            className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 transition-all duration-1000 ease-out uppercase ${
              isHeaderVisible
                ? 'opacity-100 scale-100 translate-x-0'
                : 'opacity-0 scale-95 translate-x-10'
            }`}
            style={{ fontFamily: "'Organic Relief', sans-serif" }}
          >
            <span className="text-black">
              {currentFeature.id === 'peerconnect' ? t('peerconnect.title') :
               currentFeature.id === 'aicampus' ? t('aicampus.title') :
               currentFeature.id === 'smartschedule' ? t('smartschedule.title') :
               currentFeature.id === 'taskmanager' ? t('taskmanager.title') : t('collaboration.title')}
            </span>
          </h2>
          <p
            className={`text-black text-sm lg:text-3xl sm:text-base md:text-lg max-w-3xl mx-auto px-2 transition-all duration-1000 ease-out ${
              isHeaderVisible
                ? 'opacity-100 scale-100 translate-x-0 delay-200'
                : 'opacity-0 scale-95 translate-x-10 delay-0'
            }`}
            style={{ fontFamily: "'Fredoka', sans-serif" }}
          >
            {currentFeature.id === 'peerconnect' && t('peerconnect.subtitle')}
            {currentFeature.id === 'aicampus' && t('aicampus.subtitle')}
            {currentFeature.id === 'smartschedule' && t('smartschedule.subtitle')}
            {currentFeature.id === 'taskmanager' && t('taskmanager.subtitle')}
            {currentFeature.id === 'collaboration' && t('collaboration.subtitle')}
          </p>
        </div>

        <div className="relative">
          {/* Left Arrow Button - Positioned Absolutely */}
          <button
            onClick={handlePrev}
            className="absolute -left-20 top-1/2 -translate-y-1/2 z-10 bg-gray-800/90 hover:bg-[#F7D050]/90 border border-gray-700 hover:border-[#F7D050] text-white p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg hidden lg:block"
            aria-label="Previous feature"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow Button - Positioned Absolutely */}
          <button
            onClick={handleNext}
            className="absolute -right-20 top-1/2 -translate-y-1/2 z-10 bg-gray-800/90 hover:bg-[#F7D050]/90 border border-gray-700 hover:border-[#F7D050] text-white p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg hidden lg:block"
            aria-label="Next feature"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="grid lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8 items-stretch">
            {/* Left Side - Feature Description */}
            <div className="order-2 lg:order-1 lg:col-span-2 flex flex-col px-2 sm:px-0">
              {/* Tab Navigation - For PeerConnect */}
              {currentFeature.id === 'peerconnect' && (
                <div
                  className="bg-transparent rounded-xl p-1 mb-4 sm:mb-6 border border-gray-700"
                  style={{ fontFamily: "'Fredoka', sans-serif" }}
                >
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveTab('group')}
                      className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-lg transition-all text-xs sm:text-sm md:text-base ${
                        activeTab === 'group'
                          ? 'bg-[#F7D050] text-white font-semibold'
                          : 'text-black hover:text-gray-700'
                      }`}
                    >
                      {t('peerconnect.groupChat')}
                    </button>
                    <button
                      onClick={() => setActiveTab('private')}
                      className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-lg transition-all text-xs sm:text-sm md:text-base ${
                        activeTab === 'private'
                          ? 'bg-[#F7D050] text-white font-semibold'
                          : 'text-black hover:text-gray-700'
                      }`}
                    >
                      {t('peerconnect.privateChat')}
                    </button>
                    <button
                      onClick={() => setActiveTab('call')}
                      className={`flex-1 py-2 sm:py-3 px-2 sm:px-4 rounded-lg transition-all text-xs sm:text-sm md:text-base ${
                        activeTab === 'call'
                          ? 'bg-[#F7D050] text-white font-semibold'
                          : 'text-black hover:text-gray-700'
                      }`}
                    >
                      {t('peerconnect.videoCall')}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Navigation - For AI Campus */}
              {currentFeature.id === 'aicampus' && (
                <div className="bg-transparent rounded-xl p-1 mb-6 border border-gray-700" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveTab('campus')}
                      className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                        activeTab === 'campus'
                          ? 'bg-[#F7D050] text-white font-semibold'
                          : 'text-black hover:text-gray-700'
                      }`}
                    >
                      {t('aicampus.campusMode')}
                    </button>
                    <button
                      onClick={() => setActiveTab('general')}
                      className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                        activeTab === 'general'
                          ? 'bg-[#F7D050] text-white font-semibold'
                          : 'text-black hover:text-gray-700'
                      }`}
                    >
                      {t('aicampus.generalMode')}
                    </button>
                  </div>
                </div>
              )}

            

              {/* Tab Navigation - For Smart Schedule */}
              {currentFeature.id === 'smartschedule' && (
                <div className="bg-transparent rounded-xl p-1 mb-6 border border-gray-700" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveTab('optimization')}
                      className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                        activeTab === 'optimization'
                          ? 'bg-[#F7D050] text-white font-semibold'
                          : 'text-black hover:text-gray-700'
                      }`}
                    >
                      {t('smartschedule.optimization')}
                    </button>
                    <button
                      onClick={() => setActiveTab('integration')}
                      className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                        activeTab === 'integration'
                          ? 'bg-[#F7D050] text-white font-semibold'
                          : 'text-black hover:text-gray-700'
                      }`}
                    >
                      {t('smartschedule.integration')}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Navigation - For Task Manager */}
              {currentFeature.id === 'taskmanager' && (
                <div className="bg-transparent rounded-xl p-1 mb-6 border border-gray-700" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className="flex-1 py-3 px-4 rounded-lg bg-[#F7D050] text-white font-semibold"
                    >
                      {t('taskmanager.manageTasks')}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Navigation - For Project Collaboration */}
              {currentFeature.id === 'collaboration' && (
                <div className="bg-transparent rounded-xl p-1 mb-6 border border-gray-700" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveTab('project')}
                      className="flex-1 py-3 px-4 rounded-lg bg-[#F7D050] text-white font-semibold"
                    >
                      {t('collaboration.project')}
                    </button>
                  </div>
                </div>
              )}

              {/* Feature Description Box */}
              <div
                ref={(el) => { boxRefs.current[0] = el; }}
                className={`bg-transparent rounded-xl p-4 sm:p-5 md:p-6 border border-gray-700 flex-1 flex flex-col justify-center transition-all duration-700 ${
                  visibleBoxes[0]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-10'
                }`}
                style={{ fontFamily: "'Fredoka', sans-serif", transitionDelay: '0ms' }}
              >
                {currentFeature.id === 'peerconnect' && activeTab === 'group' && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4">{t('peerconnect.groupChat')}</h3>
                  <p className="text-black mb-3 sm:mb-4 text-xs sm:text-sm">
                    {t('peerconnect.groupChatDesc')}
                  </p>
                  <ul className="space-y-1.5 sm:space-y-2 text-black text-xs sm:text-sm">
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2 flex-shrink-0">✓</span>
                      <span>{t('peerconnect.groupFeature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2 flex-shrink-0">✓</span>
                      <span>{t('peerconnect.groupFeature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2 flex-shrink-0">✓</span>
                      <span>{t('peerconnect.groupFeature3')}</span>
                    </li>
                  </ul>
                </div>
              )}

              {currentFeature.id === 'peerconnect' && activeTab === 'private' && (
                <div>
                  <h3 className="text-2xl font-bold text-black mb-4">{t('peerconnect.privateChat')}</h3>
                  <p className="text-black mb-4 text-sm">
                    {t('peerconnect.privateChatDesc')}
                  </p>
                  <ul className="space-y-2 text-black text-sm">
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('peerconnect.privateFeature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('peerconnect.privateFeature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('peerconnect.privateFeature3')}</span>
                    </li>
                  </ul>
                </div>
              )}

              {currentFeature.id === 'peerconnect' && activeTab === 'call' && (
                <div>
                  <h3 className="text-2xl font-bold text-black mb-4">{t('peerconnect.videoCall')}</h3>
                  <p className="text-black mb-4 text-sm">
                    {t('peerconnect.videoCallDesc')}
                  </p>
                  <ul className="space-y-2 text-black text-sm">
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('peerconnect.videoFeature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('peerconnect.videoFeature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('peerconnect.videoFeature3')}</span>
                    </li>
                  </ul>
                </div>
              )}

              {currentFeature.id === 'aicampus' && activeTab === 'campus' && (
                <div>
                  <h3 className="text-2xl font-bold text-black mb-4">{t('aicampus.campusMode')}</h3>
                  <p className="text-black mb-4 text-sm">
                    {t('aicampus.campusModeDesc')}
                  </p>
                  <ul className="space-y-2 text-black text-sm">
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('aicampus.campusFeature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('aicampus.campusFeature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('aicampus.campusFeature3')}</span>
                    </li>
                  </ul>
                </div>
              )}

              {currentFeature.id === 'aicampus' && activeTab === 'general' && (
                <div>
                  <h3 className="text-2xl font-bold text-black mb-4">{t('aicampus.generalMode')}</h3>
                  <p className="text-black mb-4 text-sm">
                    {t('aicampus.generalModeDesc')}
                  </p>
                  <ul className="space-y-2 text-black text-sm">
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('aicampus.generalFeature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('aicampus.generalFeature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('aicampus.generalFeature3')}</span>
                    </li>
                  </ul>
                </div>
              )}

              

              {currentFeature.id === 'smartschedule' && activeTab === 'optimization' && (
                <div>
                  <h3 className="text-2xl font-bold text-black mb-4">{t('smartschedule.optimization')}</h3>
                  <p className="text-black mb-4 text-sm">
                    {t('smartschedule.optimizationDesc')}
                  </p>
                  <ul className="space-y-2 text-black text-sm">
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('smartschedule.optimizationFeature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('smartschedule.optimizationFeature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('smartschedule.optimizationFeature3')}</span>
                    </li>
                  </ul>
                </div>
              )}

              {currentFeature.id === 'smartschedule' && activeTab === 'integration' && (
                <div>
                  <h3 className="text-2xl font-bold text-black mb-4">{t('smartschedule.integration')}</h3>
                  <p className="text-black mb-4 text-sm">
                    {t('smartschedule.integrationDesc')}
                  </p>
                  <ul className="space-y-2 text-black text-sm">
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('smartschedule.integrationFeature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('smartschedule.integrationFeature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('smartschedule.integrationFeature3')}</span>
                    </li>
                  </ul>
                </div>
              )}

              {currentFeature.id === 'taskmanager' && activeTab === 'tasks' && (
                <div>
                  <h3 className="text-2xl font-bold text-black mb-4">{t('taskmanager.manageTasks')}</h3>
                  <p className="text-black mb-4 text-sm">
                    {t('taskmanager.manageTasksDesc')}
                  </p>
                  <ul className="space-y-2 text-black text-sm">
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('taskmanager.feature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('taskmanager.feature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('taskmanager.feature3')}</span>
                    </li>
                  </ul>
                </div>
              )}

              {currentFeature.id === 'collaboration' && activeTab === 'project' && (
                <div>
                  <h3 className="text-2xl font-bold text-black mb-4">{t('collaboration.project')}</h3>
                  <p className="text-black mb-4 text-sm">
                    {t('collaboration.projectDesc')}
                  </p>
                  <ul className="space-y-2 text-black text-sm">
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('collaboration.feature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('collaboration.feature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-[#F7D050] mr-2">✓</span>
                      <span>{t('collaboration.feature3')}</span>
                    </li>
                  </ul>
                </div>
              )}
              </div>
            </div>

            {/* Dot Indicators and Counter - Fixed Below Content */}
            <div className="order-3 lg:order-3 lg:col-span-5 mt-6 sm:mt-8">
              <div className="flex justify-center gap-1.5 sm:gap-2 flex-wrap px-2">
                {features.map((feature, index) => (
                  <button
                    key={feature.id}
                    onClick={() => handleDotClick(index)}
                    className={`rounded-full transition-all duration-300 cursor-pointer ${
                      activeFeature === index
                        ? 'bg-[#F7D050] w-8 sm:w-10 h-2.5 sm:h-3'
                        : 'bg-gray-600 hover:bg-gray-500 w-2.5 sm:w-3 h-2.5 sm:h-3'
                    }`}
                    aria-label={`Go to ${feature.id}`}
                  />
                ))}
              </div>
              <div className="text-center mt-3 sm:mt-4">
                <p className="text-gray-400 text-xs sm:text-sm">
                  {activeFeature + 1} / {features.length}
                </p>
              </div>
            </div>

            {/* Right Side - Image Preview */}
            <div className="order-1 lg:order-2 lg:col-span-3 px-2 sm:px-0">
              <div
                ref={(el) => { boxRefs.current[1] = el; }}
                className={`relative transition-all duration-700 ${
                  visibleBoxes[1]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-10'
                }`}
                style={{ transitionDelay: '100ms' }}
              >
                <div className="absolute inset-0 bg-[#F7D050] rounded-xl sm:rounded-2xl blur-xl sm:blur-2xl opacity-20"></div>
                <div className="relative bg-black rounded-xl sm:rounded-2xl p-1.5 sm:p-1 border border-black overflow-hidden">
                  <Image
                    key={`${activeFeature}-${activeTab}`}
                    src={
                      currentFeature.id === 'peerconnect' && activeTab === 'group'
                        ? '/ChatPeerConnect.png'
                        : currentFeature.id === 'peerconnect' && activeTab === 'private'
                        ? '/PrivatePeerConnect.png'
                        : currentFeature.id === 'peerconnect' && activeTab === 'call'
                        ? '/CallPeerConnect.png'
                        : currentFeature.id === 'aicampus' && activeTab === 'campus'
                        ? '/FITUR1A.png'
                        : currentFeature.id === 'aicampus' && activeTab === 'general'
                        ? '/FITUR1B.png'
                        : currentFeature.id === 'smartschedule' && activeTab === 'optimization'
                        ? '/FITUR3A.png'
                        : currentFeature.id === 'smartschedule' && activeTab === 'integration'
                        ? '/FITUR3B.png'
                        : currentFeature.id === 'taskmanager'
                        ? '/FITUR5.png'
                        : currentFeature.id === 'collaboration'
                        ? '/FITUR6.png'
                        : currentFeature.image
                    }
                    alt={`${currentFeature.id} Interface`}
                    width={2400}
                    height={1500}
                    className="w-full h-auto rounded-xl transition-all duration-500 ease-in-out"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
