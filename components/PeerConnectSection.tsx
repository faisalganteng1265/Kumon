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
      id: 'eventreminder',
      key: 'eventreminder',
      image: '/CallPeerConnect.png',
      tabs: ['recommendations']
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
    <section id="features" className="py-20 px-4 bg-gradient-to-b from-black via-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div ref={headerRef} className="text-center mb-12">
          <h2
            className={`text-5xl md:text-6xl font-bold mb-4 transition-all duration-1000 ease-out ${
              isHeaderVisible
                ? 'opacity-100 scale-100 translate-x-0'
                : 'opacity-0 scale-95 translate-x-10'
            }`}
          >
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
              {currentFeature.id === 'peerconnect' ? t('peerconnect.title') :
               currentFeature.id === 'aicampus' ? t('aicampus.title') :
               currentFeature.id === 'eventreminder' ? t('eventreminder.title') :
               currentFeature.id === 'smartschedule' ? t('smartschedule.title') :
               currentFeature.id === 'taskmanager' ? t('taskmanager.title') : t('collaboration.title')}
            </span>
          </h2>
          <p
            className={`text-gray-300 text-lg max-w-3xl mx-auto transition-all duration-1000 ease-out ${
              isHeaderVisible
                ? 'opacity-100 scale-100 translate-x-0 delay-200'
                : 'opacity-0 scale-95 translate-x-10 delay-0'
            }`}
          >
            {currentFeature.id === 'peerconnect' && t('peerconnect.subtitle')}
            {currentFeature.id === 'aicampus' && t('aicampus.subtitle')}
            {currentFeature.id === 'eventreminder' && t('eventreminder.subtitle')}
            {currentFeature.id === 'smartschedule' && t('smartschedule.subtitle')}
            {currentFeature.id === 'taskmanager' && t('taskmanager.subtitle')}
            {currentFeature.id === 'collaboration' && t('collaboration.subtitle')}
          </p>
        </div>

        <div className="relative">
          {/* Left Arrow Button - Positioned Absolutely */}
          <button
            onClick={handlePrev}
            className="absolute -left-20 top-1/2 -translate-y-1/2 z-10 bg-gray-800/90 hover:bg-emerald-500/90 border border-gray-700 hover:border-emerald-500 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg hidden lg:block"
            aria-label="Previous feature"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Right Arrow Button - Positioned Absolutely */}
          <button
            onClick={handleNext}
            className="absolute -right-20 top-1/2 -translate-y-1/2 z-10 bg-gray-800/90 hover:bg-emerald-500/90 border border-gray-700 hover:border-emerald-500 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg hidden lg:block"
            aria-label="Next feature"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="grid lg:grid-cols-5 gap-8 items-stretch">
            {/* Left Side - Feature Description */}
            <div className="order-2 lg:order-1 lg:col-span-2 flex flex-col">
              {/* Tab Navigation - For PeerConnect */}
              {currentFeature.id === 'peerconnect' && (
                <div className="bg-gray-800/50 rounded-xl p-1 mb-6 border border-gray-700">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveTab('group')}
                      className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                        activeTab === 'group'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {t('peerconnect.groupChat')}
                    </button>
                    <button
                      onClick={() => setActiveTab('private')}
                      className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                        activeTab === 'private'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {t('peerconnect.privateChat')}
                    </button>
                    <button
                      onClick={() => setActiveTab('call')}
                      className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                        activeTab === 'call'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {t('peerconnect.videoCall')}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Navigation - For AI Campus */}
              {currentFeature.id === 'aicampus' && (
                <div className="bg-gray-800/50 rounded-xl p-1 mb-6 border border-gray-700">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveTab('campus')}
                      className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                        activeTab === 'campus'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {t('aicampus.campusMode')}
                    </button>
                    <button
                      onClick={() => setActiveTab('general')}
                      className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                        activeTab === 'general'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {t('aicampus.generalMode')}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Navigation - For Event Reminder */}
              {currentFeature.id === 'eventreminder' && (
                <div className="bg-gray-800/50 rounded-xl p-1 mb-6 border border-gray-700">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveTab('recommendations')}
                      className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold"
                    >
                      {t('eventreminder.recommendations')}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Navigation - For Smart Schedule */}
              {currentFeature.id === 'smartschedule' && (
                <div className="bg-gray-800/50 rounded-xl p-1 mb-6 border border-gray-700">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveTab('optimization')}
                      className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                        activeTab === 'optimization'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {t('smartschedule.optimization')}
                    </button>
                    <button
                      onClick={() => setActiveTab('integration')}
                      className={`flex-1 py-3 px-4 rounded-lg transition-all ${
                        activeTab === 'integration'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {t('smartschedule.integration')}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Navigation - For Task Manager */}
              {currentFeature.id === 'taskmanager' && (
                <div className="bg-gray-800/50 rounded-xl p-1 mb-6 border border-gray-700">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveTab('tasks')}
                      className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold"
                    >
                      {t('taskmanager.manageTasks')}
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Navigation - For Project Collaboration */}
              {currentFeature.id === 'collaboration' && (
                <div className="bg-gray-800/50 rounded-xl p-1 mb-6 border border-gray-700">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveTab('project')}
                      className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold"
                    >
                      {t('collaboration.project')}
                    </button>
                  </div>
                </div>
              )}

              {/* Feature Description Box */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 flex-1 flex flex-col justify-center">
                {currentFeature.id === 'peerconnect' && activeTab === 'group' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t('peerconnect.groupChat')}</h3>
                  <p className="text-gray-300 mb-4 text-sm">
                    {t('peerconnect.groupChatDesc')}
                  </p>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('peerconnect.groupFeature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('peerconnect.groupFeature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('peerconnect.groupFeature3')}</span>
                    </li>
                  </ul>
                </div>
              )}

              {currentFeature.id === 'peerconnect' && activeTab === 'private' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t('peerconnect.privateChat')}</h3>
                  <p className="text-gray-300 mb-4 text-sm">
                    {t('peerconnect.privateChatDesc')}
                  </p>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('peerconnect.privateFeature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('peerconnect.privateFeature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('peerconnect.privateFeature3')}</span>
                    </li>
                  </ul>
                </div>
              )}

              {currentFeature.id === 'peerconnect' && activeTab === 'call' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t('peerconnect.videoCall')}</h3>
                  <p className="text-gray-300 mb-4 text-sm">
                    {t('peerconnect.videoCallDesc')}
                  </p>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('peerconnect.videoFeature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('peerconnect.videoFeature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('peerconnect.videoFeature3')}</span>
                    </li>
                  </ul>
                </div>
              )}

              {currentFeature.id === 'aicampus' && activeTab === 'campus' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t('aicampus.campusMode')}</h3>
                  <p className="text-gray-300 mb-4 text-sm">
                    {t('aicampus.campusModeDesc')}
                  </p>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('aicampus.campusFeature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('aicampus.campusFeature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('aicampus.campusFeature3')}</span>
                    </li>
                  </ul>
                </div>
              )}

              {currentFeature.id === 'aicampus' && activeTab === 'general' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t('aicampus.generalMode')}</h3>
                  <p className="text-gray-300 mb-4 text-sm">
                    {t('aicampus.generalModeDesc')}
                  </p>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('aicampus.generalFeature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('aicampus.generalFeature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('aicampus.generalFeature3')}</span>
                    </li>
                  </ul>
                </div>
              )}

              {currentFeature.id === 'eventreminder' && activeTab === 'recommendations' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t('eventreminder.recommendations')}</h3>
                  <p className="text-gray-300 mb-4 text-sm">
                    {t('eventreminder.recommendationsDesc')}
                  </p>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('eventreminder.feature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('eventreminder.feature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('eventreminder.feature3')}</span>
                    </li>
                  </ul>
                </div>
              )}

              {currentFeature.id === 'smartschedule' && activeTab === 'optimization' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t('smartschedule.optimization')}</h3>
                  <p className="text-gray-300 mb-4 text-sm">
                    {t('smartschedule.optimizationDesc')}
                  </p>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('smartschedule.optimizationFeature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('smartschedule.optimizationFeature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('smartschedule.optimizationFeature3')}</span>
                    </li>
                  </ul>
                </div>
              )}

              {currentFeature.id === 'smartschedule' && activeTab === 'integration' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t('smartschedule.integration')}</h3>
                  <p className="text-gray-300 mb-4 text-sm">
                    {t('smartschedule.integrationDesc')}
                  </p>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('smartschedule.integrationFeature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('smartschedule.integrationFeature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('smartschedule.integrationFeature3')}</span>
                    </li>
                  </ul>
                </div>
              )}

              {currentFeature.id === 'taskmanager' && activeTab === 'tasks' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t('taskmanager.manageTasks')}</h3>
                  <p className="text-gray-300 mb-4 text-sm">
                    {t('taskmanager.manageTasksDesc')}
                  </p>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('taskmanager.feature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('taskmanager.feature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('taskmanager.feature3')}</span>
                    </li>
                  </ul>
                </div>
              )}

              {currentFeature.id === 'collaboration' && activeTab === 'project' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4">{t('collaboration.project')}</h3>
                  <p className="text-gray-300 mb-4 text-sm">
                    {t('collaboration.projectDesc')}
                  </p>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('collaboration.feature1')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('collaboration.feature2')}</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-emerald-400 mr-2">✓</span>
                      <span>{t('collaboration.feature3')}</span>
                    </li>
                  </ul>
                </div>
              )}
              </div>
            </div>

            {/* Dot Indicators and Counter - Fixed Below Content */}
            <div className="order-3 lg:order-3 lg:col-span-5 mt-8">
              <div className="flex justify-center gap-2 flex-wrap">
                {features.map((feature, index) => (
                  <button
                    key={feature.id}
                    onClick={() => handleDotClick(index)}
                    className={`rounded-full transition-all duration-300 cursor-pointer ${
                      activeFeature === index
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 w-10 h-3'
                        : 'bg-gray-600 hover:bg-gray-500 w-3 h-3'
                    }`}
                    aria-label={`Go to ${feature.id}`}
                  />
                ))}
              </div>
              <div className="text-center mt-4">
                <p className="text-gray-400 text-sm">
                  {activeFeature + 1} / {features.length}
                </p>
              </div>
            </div>

            {/* Right Side - Image Preview */}
            <div className="order-1 lg:order-2 lg:col-span-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-2xl opacity-20"></div>
                <div className="relative bg-gray-800/50 rounded-2xl p-2 border border-gray-700 overflow-hidden">
                  <Image
                    key={activeFeature}
                    src={currentFeature.image}
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
