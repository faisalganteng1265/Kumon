'use client';

export default function GallerySection() {
  const images = [
    { src: '/FOTO2.jpg', alt: 'Gallery Image 1' },
    { src: '/FOTO3.jpg', alt: 'Gallery Image 2' },
    { src: '/FOTO4.jpg', alt: 'Gallery Image 3' },
    { src: '/FOTO5.png', alt: 'Gallery Image 4' },
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-900/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-teal-900/20 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {images.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/20"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>

              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Border effect */}
              <div className="absolute inset-0 border-2 border-emerald-500/0 group-hover:border-emerald-500/40 rounded-2xl transition-all duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
