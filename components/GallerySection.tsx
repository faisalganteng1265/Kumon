'use client';

export default function GallerySection() {
  const images = [
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
  ];

  return (
    <section className="py-20 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #0a0a0a, #0d3d2f, #0a0a0a)' }}>
      {/* Decorative background elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-400/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/8 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-400/30"
            >
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Dark overlay on hover */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>

                {/* Text overlay on hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 transform translate-y-4 group-hover:translate-y-0">
                  <h3
                    className="text-2xl font-bold text-white mb-3 text-center"
                    style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
                  >
                    {image.title}
                  </h3>
                  <p
                    className="text-base text-white/90 text-center leading-relaxed"
                    style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
                  >
                    {image.description}
                  </p>
                </div>
              </div>

              {/* Border effect */}
              <div className="absolute inset-0 border-2 border-emerald-400/0 group-hover:border-emerald-400/60 rounded-2xl transition-all duration-500"></div>

              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-5"></div>
            </div>
          ))}
        </div>

        {/* Hover Me text below photos */}
        <div className="text-center mt-8">
          <p
            className="text-sm text-emerald-400/70 animate-pulse"
            style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
          >
            Hover Me
          </p>
        </div>
      </div>
    </section>
  );
}
