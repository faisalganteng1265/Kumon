'use client';

import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#fef9ed', minWidth: '1200px' }}>
      {/* Main Content Container */}
      <div className="relative z-10 w-full h-full flex items-center justify-between" style={{ paddingLeft: 'max(4rem, calc((100vw - 1400px) / 2 + 4rem))', paddingRight: 'max(2rem, calc((100vw - 1400px) / 2 + 2rem))' }}>

        {/* Left Side - Text Content */}
        <motion.div
          className="flex-shrink-0"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ position: 'relative', minWidth: '800px' }}
          >
            {/* Pensil Icon on C */}
            <img
              src="/pensil.png"
              alt="Pensil"
              className="absolute"
              style={{
                width: '12rem',
                top: '-5rem',
                left: '-6.875rem',
                zIndex: 20,
                pointerEvents: 'none'
              }}
            />
            {/* Buku Icon on G in LEARNING */}
            <img
              src="/buku.png"
              alt="Buku"
              className="absolute"
              style={{
                width: '10rem',
                top: '20.625rem',
                left: '43.75rem',
                zIndex: 20,
                pointerEvents: 'none'
              }}
            />
            {/* Tumpuk Icon on E in EXPERIENCE */}
            <img
              src="/tumpuk.png"
              alt="Tumpuk"
              className="absolute"
              style={{
                width: '16rem',
                top: '31.25rem',
                left: '-0.625rem',
                zIndex: 20,
                pointerEvents: 'none'
              }}
            />
            <h1
              className="font-black leading-none text-white whitespace-nowrap"
              style={{
                fontFamily: 'Impact, sans-serif',
                letterSpacing: '0.02em',
                fontSize: '10rem'
              }}
            >
              <span className="block text-center" style={{ wordSpacing: '0.15em', color: '#000000' }}>CREATE  A  MORE</span>
              <span className="block text-left" style={{ color: '#F7D050' }}>STRUCTURED</span>
              <span className="block" style={{ position: 'relative', left: '7.5rem', color: 'transparent', WebkitTextStroke: '0.75px black' }}>LEARNING</span>
              <span className="block" style={{ position: 'relative', left: '12.5rem', color: '#77b9c7' }}>EXPERIENCE</span>
            </h1>
          </motion.div>
        </motion.div>

        {/* Right Side - Robot Image */}
        <motion.div
          className="flex-shrink-0"
          style={{ marginLeft: '2rem' }}
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <img
            src="/Robot.png"
            alt="Learning Robot"
            style={{ width: 'min(28rem, 22vw)', maxWidth: '28rem', minWidth: '20rem' }}
          />
        </motion.div>

      </div>

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
