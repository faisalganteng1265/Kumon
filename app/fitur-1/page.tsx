'use client';

import ChatInterface from '@/components/ChatInterface';
import StaggeredMenu from '@/components/StaggeredMenu';
import PixelBlast from '@/components/PixelBlast';

export default function Fitur1() {
  return (
    <div className="min-h-screen bg-black relative">
      {/* PixelBlast Background */}
      <div className="fixed inset-0 z-0">
        <PixelBlast
          variant="square"
          pixelSize={4}
          color="#22c55e"
          patternScale={2}
          patternDensity={0.8}
          enableRipples={true}
          rippleIntensityScale={2}
          rippleSpeed={0.4}
          speed={0.3}
          transparent={false}
          edgeFade={0.3}
        />
      </div>

      {/* Staggered Menu Navigation */}
      <StaggeredMenu
        position="right"
        colors={['#0a0a0a', '#1a1a1a', '#2a2a2a']}
        items={[
          { label: 'HOME', ariaLabel: 'Go to home page', link: '/' },
          { label: 'Event Recomend', ariaLabel: 'Go to feature 2', link: '/fitur-2' },
          { label: 'Smart Schedule', ariaLabel: 'Go to feature 3', link: '/fitur-3' }
        ]}
        displaySocials={false}
        displayItemNumbering={true}
        logoUrl="/logo.png"
        menuButtonColor="#fff"
        openMenuButtonColor="#fff"
        accentColor="#ffffff"
        changeMenuColorOnOpen={true}
        isFixed={true}
      />

      {/* Header */}
      <div className="py-8 px-3 relative z-10">
        <div className="max-w-full mx-auto">
          <div className="text-center mb-6">
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 blur-2xl bg-green-500/60 rounded-full"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-full p-6 border border-white/20">
                  <span className="text-7xl">💬</span>
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-3" style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.5), 0 0 60px rgba(34, 197, 94, 0.3)' }}>
              AI CAMPUS CHATBOT
            </h1>
            <p className="text-gray-300 text-lg" style={{ textShadow: '0 0 10px rgba(0, 0, 0, 0.8)' }}>
              Asisten virtual cerdas untuk membantu menjawab semua pertanyaan seputar kampus
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-3 pb-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="group bg-gray-800/40 rounded-2xl p-5 border border-gray-700/50 hover:bg-white/95 hover:border-white transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📚</div>
            <p className="text-white text-base font-semibold mb-1 group-hover:text-gray-800">Info KRS</p>
            <p className="text-gray-400 text-sm group-hover:text-gray-600">Panduan lengkap</p>
          </div>
          <div className="group bg-gray-800/40 rounded-2xl p-5 border border-gray-700/50 hover:bg-white/95 hover:border-white transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">🏛️</div>
            <p className="text-white text-base font-semibold mb-1 group-hover:text-gray-800">Lokasi Gedung</p>
            <p className="text-gray-400 text-sm group-hover:text-gray-600">Navigasi kampus</p>
          </div>
          <div className="group bg-gray-800/40 rounded-2xl p-5 border border-gray-700/50 hover:bg-white/95 hover:border-white transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">👨‍🏫</div>
            <p className="text-white text-base font-semibold mb-1 group-hover:text-gray-800">Info Dosen</p>
            <p className="text-gray-400 text-sm group-hover:text-gray-600">Data lengkap</p>
          </div>
          <div className="group bg-gray-800/40 rounded-2xl p-5 border border-gray-700/50 hover:bg-white/95 hover:border-white transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💰</div>
            <p className="text-white text-base font-semibold mb-1 group-hover:text-gray-800">Beasiswa</p>
            <p className="text-gray-400 text-sm group-hover:text-gray-600">Prosedur & info</p>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="relative py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-400px)] min-h-[600px]">
            {/* Left Side - Info Panel */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50 h-full">
                <h2 className="text-2xl font-bold text-white mb-4" style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6)' }}>
                  Fitur Chatbot
                </h2>
                
                <div className="space-y-4">
                  <div className="bg-gray-700/40 rounded-xl p-4 border-l-4 border-green-500">
                    <h3 className="text-lg font-semibold text-white mb-2">🎯 Jawaban Cepat</h3>
                    <p className="text-gray-300 text-sm">Dapatkan informasi seputar kampus secara instan dengan AI yang terlatih khusus</p>
                  </div>
                  
                  <div className="bg-gray-700/40 rounded-xl p-4 border-l-4 border-green-500">
                    <h3 className="text-lg font-semibold text-white mb-2">💡 Saran Cerdas</h3>
                    <p className="text-gray-300 text-sm">Rekomendasi personal untuk kegiatan akademik dan non-akademik</p>
                  </div>
                  
                  <div className="bg-gray-700/40 rounded-xl p-4 border-l-4 border-green-500">
                    <h3 className="text-lg font-semibold text-white mb-2">📚 Bantuan 24/7</h3>
                    <p className="text-gray-300 text-sm">Asisten virtual selalu tersedia kapanpun Anda membutuhkan bantuan</p>
                  </div>
                  
                  <div className="bg-gray-700/40 rounded-xl p-4 border-l-4 border-green-500">
                    <h3 className="text-lg font-semibold text-white mb-2">🔒 Privasi Terjamin</h3>
                    <p className="text-gray-300 text-sm">Semua percakapan Anda aman dan tersimpan secara privat</p>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-400 text-sm">Status Server</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">Online</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Response Time</span>
                    <span className="text-white text-sm font-medium">{"<"} 2 detik</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Chat Interface */}
            <div className="lg:col-span-2">
              <ChatInterface />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-black/50 backdrop-blur-md border-t border-green-500/20 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <span className="absolute w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></span>
                <span className="relative w-3 h-3 bg-green-400 rounded-full block"></span>
              </div>
              <span className="text-gray-300 group-hover:text-white transition-colors font-medium">Online 24/7</span>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <span className="text-2xl group-hover:scale-110 transition-transform">⚡</span>
              <span className="text-gray-300 group-hover:text-white transition-colors font-medium">Respons Instan</span>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <span className="text-2xl group-hover:scale-110 transition-transform">🎯</span>
              <span className="text-gray-300 group-hover:text-white transition-colors font-medium">Akurat & Terpercaya</span>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <span className="text-2xl group-hover:scale-110 transition-transform">🔒</span>
              <span className="text-gray-300 group-hover:text-white transition-colors font-medium">Aman & Privat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
