'use client';

import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Main Content Container */}
      <div className="relative z-10 w-full h-full flex items-center justify-between pl-24 pr-6 lg:pl-52 lg:pr-12 xl:pl-72 xl:pr-16">

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
            style={{ position: 'relative' }}
          >
            {/* Pensil Icon on C */}
            <img
              src="/pensil.png"
              alt="Pensil"
              className="absolute w-24 md:w-32 lg:w-40 xl:w-48"
              style={{
                top: '-80px',
                left: '-110px',
                zIndex: 20,
                pointerEvents: 'none'
              }}
            />
            {/* Buku Icon on G in LEARNING */}
            <img
              src="/buku.png"
              alt="Buku"
              className="absolute w-20 md:w-24 lg:w-32 xl:w-40"
              style={{
                top: '330px',
                left: '700px',
                zIndex: 20,
                pointerEvents: 'none'
              }}
            />
            {/* Tumpuk Icon on E in EXPERIENCE */}
            <img
              src="/tumpuk.png"
              alt="Tumpuk"
              className="absolute w-32 md:w-40 lg:w-52 xl:w-64"
              style={{
                top: '500px',
                left: '-10px',
                zIndex: 20,
                pointerEvents: 'none'
              }}
            />
            <h1
              className="text-6xl md:text-7xl lg:text-8xl xl:text-[10rem] font-black leading-none text-white whitespace-nowrap"
              style={{ fontFamily: 'Impact, sans-serif', letterSpacing: '0.02em' }}
            >
              <span className="block text-center" style={{ wordSpacing: '0.15em' }}>CREATE  A  MORE</span>
              <span className="block text-left" style={{ color: '#F7D050' }}>STRUCTURED</span>
              <span className="block" style={{ position: 'relative', left: '120px', color: 'transparent', WebkitTextStroke: '0.75px white' }}>LEARNING</span>
              <span className="block" style={{ position: 'relative', left: '200px', color: '#77b9c7' }}>EXPERIENCE</span>
            </h1>
          </motion.div>
        </motion.div>

        {/* Right Side - Robot Image */}
        <motion.div
          className="flex-shrink-0 ml-8 lg:ml-16 mr-12 lg:mr-24 xl:mr-32"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <img
            src="/Robot.png"
            alt="Learning Robot"
            className="w-64 md:w-80 lg:w-96 xl:w-110"
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
