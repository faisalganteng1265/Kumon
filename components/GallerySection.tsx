'use client';

import { useState, useEffect, useRef, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';

// Memoize the image card component to prevent unnecessary re-renders
const ImageCard = memo(({ image, index, isVisible, onClick }: {
  image: any;
  index: number;
  isVisible: boolean;
  onClick?: () => void;
}) => {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-400/20 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${onClick ? 'hover:cursor-pointer' : ''}`}
      style={{
        transitionDelay: `${index * 0.1}s`,
      }}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={image.src}
          alt={image.alt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>

        {/* Text overlay on hover */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
          <h3
            className="text-xl font-bold text-white mb-2 text-center"
            style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
          >
            {image.title}
          </h3>
          <p
            className="text-sm text-white/90 text-center leading-relaxed"
            style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
          >
            {image.description}
          </p>
        </div>
      </div>

      {/* Border effect */}
      <div className="absolute inset-0 border-2 border-emerald-400/0 group-hover:border-emerald-400/40 rounded-2xl transition-all duration-300"></div>
    </div>
  );
});

ImageCard.displayName = 'ImageCard';

// Simplified particles component with fewer animations
const FloatingParticles = memo(() => {
  // Reduced from 12 to 6 particles
  const particles = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      left: 20 + (i * 15),
      top: 20 + (i * 12),
      size: 2 + (i % 2),
    })), []
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-emerald-400/10"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
        />
      ))}
    </div>
  );
});

FloatingParticles.displayName = 'FloatingParticles';

export default function GallerySection() {
  const router = useRouter();
  
  const images = useMemo(() => [
    {
      src: '/FOTO2.jpg',
      alt: 'AI Campus Guide',
      title: 'AI Campus Guide',
      description: 'Hampir semua mahasiswa menggunakan AI untuk navigasi kampus yang lebih mudah'
    },
    {
      src: '/FOTO3.jpg',
      alt: 'Event Recommender',
      title: 'Event Recommender',
      description: 'Rekomendasi event yang sesuai dengan minat dan kebutuhan kamu'
    },
    {
      src: '/FOTO4.jpg',
      alt: 'Peer Connect',
      title: 'Peer Connect AI',
      description: 'Menghubungkan kamu dengan orang yang memiliki minat yang sama'
    },
    {
      src: '/FOTO5.png',
      alt: 'Smart Schedule',
      title: 'Smart Schedule Builder',
      description: 'Atur jadwal sesuai keinginan kamu agar lebih efisien dan terorganisir'
    },
  ], []);

  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleCardClick = (index: number) => {
    switch (index) {
      case 0:
        router.push('/fitur-1');
        break;
      case 1:
        router.push('/fitur-2');
        break;
      case 2:
        router.push('/fitur-4');
        break;
      case 3:
        router.push('/fitur-3');
        break;
      default:
        break;
    }
  };

  // Intersection Observer for scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section className="py-20 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #0a0a0a, #0d3d2f, #0a0a0a)' }}>
      {/* Reduced background effects - only 2 simple blobs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-emerald-900 opacity-8 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-emerald-900 opacity-10 rounded-full filter blur-3xl"></div>

      {/* Simplified particles - no animation */}
      <FloatingParticles />

      {/* Minimal decorative elements - removed animations */}
      <div className="absolute top-20 left-10 w-16 h-16 border-2 border-emerald-500/10 rotate-45"></div>
      <div className="absolute bottom-20 right-16 w-12 h-12 border-2 border-teal-500/10 rounded-full"></div>

      {/* Simple corner decorations only */}
      <div className="absolute top-0 left-0 w-24 h-24 border-l-2 border-t-2 border-emerald-500/15"></div>
      <div className="absolute top-0 right-0 w-24 h-24 border-r-2 border-t-2 border-emerald-500/15"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 border-l-2 border-b-2 border-emerald-500/15"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 border-r-2 border-b-2 border-emerald-500/15"></div>

      <div className="max-w-7xl mx-auto relative z-10" ref={sectionRef}>
        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {images.map((image, index) => (
            <ImageCard
              key={index}
              image={image}
              index={index}
              isVisible={isVisible}
              onClick={() => handleCardClick(index)}
            />
          ))}
        </div>

        {/* Hover Me text below photos - removed animation */}
        <div className="text-center mt-8">
          <p
            className="text-sm text-emerald-400/60"
            style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
          >
            Hover Me
          </p>
        </div>
      </div>

      <style jsx>{`
        /* Removed most animations to improve performance */
      `}</style>
    </section>
  );
}
