'use client';

import { useEffect, useState } from 'react';

interface BenefitItemProps {
  icon: string;
  title: string;
  description: string;
  delay?: number;
}

function BenefitItem({ icon, title, description, delay = 0 }: BenefitItemProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`text-center space-y-4 transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* Icon */}
      <div className="flex justify-center mb-2">
        <div className="w-20 h-20 flex items-center justify-center">
          <span className="text-6xl">{icon}</span>
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-xl font-extrabold text-white uppercase tracking-tight px-4"
        style={{
          letterSpacing: '0.02em',
          fontWeight: 900,
          fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif'
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="text-base text-gray-300 leading-relaxed max-w-xs mx-auto px-4"
        style={{
          lineHeight: '1.7',
          fontWeight: 400,
          fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif'
        }}
      >
        {description}
      </p>
    </div>
  );
}

export default function WhyBetterSection() {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-900/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-900/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Title */}
        <div className="text-center mb-20">
          <h2
            className="text-5xl md:text-6xl mb-2 text-white"
            style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif', letterSpacing: '0.02em' }}
          >
            Kenapa AI Campus Navigator Lebih Baik?
          </h2>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
          {/* Left Column - Benefits 1, 2, 3 */}
          <div className="space-y-20">
            <BenefitItem
              icon="🎯"
              title="PERSONALISASI SEMPURNA"
              description="Tidak perlu lagi mencari informasi yang tidak relevan. AI kami memberikan jawaban yang disesuaikan dengan jurusan, semester, dan kebutuhanmu."
              delay={100}
            />
            <BenefitItem
              icon="⭐"
              title="REKOMENDASI CERDAS"
              description="Algoritma AI yang canggih menganalisis minat dan tujuanmu untuk memberikan rekomendasi event dan networking yang tepat sasaran."
              delay={200}
            />
            <BenefitItem
              icon="🎓"
              title="RAMAH MAHASISWA BARU"
              description="Interface yang intuitif dan mudah dipahami. Tidak perlu tutorial panjang, langsung bisa digunakan bahkan oleh mahasiswa semester 1."
              delay={300}
            />
          </div>

          {/* Center Column - Main Image */}
          <div className="flex justify-center items-center min-h-[600px]">
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 rounded-full blur-3xl group-hover:blur-4xl transition-all duration-500"></div>

              {/* Main visual element - Student Image */}
              <div className="relative flex flex-col items-center justify-center">
                {/* Student Photo - No border, full image */}
                <div className="relative">
                  <div className="relative w-full max-w-md">
                    <img
                      src="/Foto1.png"
                      alt="Mahasiswa"
                      className="w-full h-auto object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Benefits 4, 5, 6 */}
          <div className="space-y-20">
            <BenefitItem
              icon="🌍"
              title="HEMAT WAKTU & ENERGI"
              description="Tidak perlu lagi bertanya ke banyak orang atau mencari di berbagai sumber. Semua informasi kampus ada dalam satu platform yang mudah diakses."
              delay={400}
            />
            <BenefitItem
              icon="🔒"
              title="AMAN & TERPERCAYA"
              description="Data pribadimu dilindungi dengan enkripsi tingkat enterprise. AI kami dilatih dengan informasi kampus yang akurat dan selalu diperbarui."
              delay={500}
            />
            <BenefitItem
              icon="🚫"
              title="BEBAS INFORMASI SALAH"
              description="AI kami dilatih dengan data resmi kampus dan terus divalidasi. Tidak ada lagi informasi yang membingungkan atau menyesatkan."
              delay={600}
            />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(12deg);
          }
          50% {
            transform: translateY(-20px) rotate(12deg);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
