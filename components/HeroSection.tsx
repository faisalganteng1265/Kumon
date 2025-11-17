'use client';

import { motion } from 'framer-motion';
import Galaxy from './Galaxy';
import { useLanguage } from '@/contexts/LanguageContext';

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black to-gray-900">
      {/* Galaxy Background */}
      <div className="absolute inset-0 z-0">
        <Galaxy
          hueShift={200}
          density={1.2}
          starSpeed={0.5}
          glowIntensity={0.3}
          twinkleIntensity={0.2}
          rotationSpeed={0.05}
          mouseRepulsion={true}
          repulsionStrength={2}
          transparent={true}
          mouseInteraction={true}
        />
      </div>

      {/* Main Content - AICAMPUS Text */}
      <motion.div
        className="relative z-10 text-center px-6"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1
          className="text-[20vw] md:text-[16vw] lg:text-[14vw] font-black text-white leading-none relative z-10 mt-8 md:mt-12 lg:mt-16 flex justify-center"
          style={{ fontFamily: 'Agency FB, sans-serif', letterSpacing: '0.05em' }}
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{
            duration: 0.8,
            ease: "easeOut"
          }}
        >
          {"AICAMPUS".split("").map((letter, index) => (
            <motion.span
              key={index}
              className="inline-block cursor-default"
              whileHover={{
                y: -20,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.h1>

        {/* Logo below with slight overlap */}
        <motion.div
          className="relative -mt-32 md:-mt-40 lg:-mt-48 flex justify-center z-20"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          <img
            src="/AICAMPUS1.png"
            alt="AI Campus Logo"
            className="w-[60vw] md:w-[50vw] lg:w-[35vw] max-w-2xl"
          />
        </motion.div>

      </motion.div>

      {/* Slogan - Bottom Left */}
      <motion.div
        className="absolute bottom-8 left-4 md:left-8 z-20 max-w-xs md:max-w-sm px-2"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <p className="text-white/90 text-sm md:text-base lg:text-lg font-medium tracking-wide mb-1 md:mb-2">
          {t('hero.empowering')}
        </p>
        <p className="text-white/70 text-xs md:text-sm lg:text-base font-light mb-1">
          {t('hero.companion')}
        </p>
        <p className="text-white/60 text-xs md:text-sm font-light mb-1">
          {t('hero.navigate')}
        </p>
        <p className="text-white/50 text-xs md:text-sm font-light">
          {t('hero.learn')}
        </p>
      </motion.div>

      {/* Scroll Down Arrow */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        animate={{
          y: [0, 10, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <svg
          className="w-6 h-6 text-white/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </motion.div>
    </section>
  );
}
