'use client';

import { useState, useEffect } from 'react';
import { Atom } from 'react-loading-indicators';
import StaggeredMenu from './StaggeredMenu';
import PixelBlast from './PixelBlast';

interface Event {
  id: number;
  title: string;
  category: string;
  organizer: string;
  date: string;
  location: string;
  description: string;
  tags: string[];
  registrationLink: string;
  quota: number;
  fee: string;
  relevanceScore?: number;
  recommendationReason?: string;
}

interface RecommendationResponse {
  recommendations: Event[];
  summary: string;
  totalEvents?: number;
  matchedEvents?: number;
}

const interestOptions = [
  { value: 'teknologi', label: 'Teknologi & IT', icon: '/ICONKOMPUTER.png' },
  { value: 'bisnis', label: 'Bisnis & Entrepreneurship', icon: '/ICONBISNIS.png' },
  { value: 'seni', label: 'Seni & Kreatif', icon: '/SENIICON.png' },
  { value: 'sosial', label: 'Sosial & Volunteering', icon: '/SOSIALICON.png' },
  { value: 'akademik', label: 'Akademik & Penelitian', icon: '/AKADEMIKICON.png' },
  { value: 'olahraga', label: 'Olahraga & Kesehatan', icon: '/OLAHRAGAICON.png' },
  { value: 'leadership', label: 'Leadership & Organisasi', icon: '/ORGANISASIICON.png' },
  { value: 'lingkungan', label: 'Lingkungan & Sustainability', icon: '/LINGKUNGANICON.png' },
];

const categoryColors: { [key: string]: string } = {
  'Seminar': 'bg-blue-500',
  'Lomba': 'bg-purple-500',
  'UKM': 'bg-green-500',
  'Volunteering': 'bg-orange-500',
};

export default function EventRecommender() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<Event[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [allEvents, setAllEvents] = useState<Event[]>([]);

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const getRecommendations = async () => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      // If no interests selected, get all events
      if (selectedInterests.length === 0) {
        const response = await fetch('/api/events', {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Failed to get all events');
        }

        const data = await response.json();
        setAllEvents(data.events);
        setRecommendations(data.events);
        setSummary(`Menampilkan semua ${data.events.length} event yang tersedia. Pilih minat untuk filter yang lebih spesifik.`);
      } else {
        // Get filtered recommendations based on interests
        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            interests: selectedInterests,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get recommendations');
        }

        const data: RecommendationResponse = await response.json();
        setRecommendations(data.recommendations);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load all events on component mount
  const loadAllEvents = async () => {
    try {
      const response = await fetch('/api/events', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to get all events');
      }

      const data = await response.json();
      setAllEvents(data.events);
    } catch (error) {
      console.error('Error loading all events:', error);
    }
  };

  // Load all events when component mounts
  useEffect(() => {
    loadAllEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
          { label: 'AI Campus Chatbot', ariaLabel: 'Go to feature 1', link: '/fitur-1' },
          { label: 'Event Recommender', ariaLabel: 'Go to feature 2', link: '/fitur-2', color: '#22c55e' },
          { label: 'Smart Schedule', ariaLabel: 'Go to feature 3', link: '/fitur-3' },
          { label: 'Peer Connect', ariaLabel: 'Go to feature 4', link: '/fitur-4' }
        ]}
        displaySocials={false}
        displayItemNumbering={true}
        logoUrl="/AICAMPUS.png"
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
                <img
                  src="/ICONLAMPU.png"
                  alt="Event Recommender Icon"
                  className="w-20 h-20 object-contain relative z-10"
                  style={{
                    filter: 'drop-shadow(0 0 15px rgba(34, 197, 94, 1)) drop-shadow(0 0 30px rgba(34, 197, 94, 0.8)) drop-shadow(0 0 45px rgba(34, 197, 94, 0.6)) drop-shadow(0 0 60px rgba(34, 197, 94, 0.4))'
                  }}
                />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-3" style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.8), 0 0 40px rgba(34, 197, 94, 0.5), 0 0 60px rgba(34, 197, 94, 0.3)' }}>
              EVENT RECOMMENDER
            </h1>
            <p className="text-gray-300 text-lg" style={{ textShadow: '0 0 10px rgba(0, 0, 0, 0.8)' }}>
              Temukan event kampus yang sesuai dengan minatmu!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Sidebar Layout */}
      <div className="max-w-full mx-auto px-20 pb-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* LEFT SIDEBAR - Filter */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-800 border border-gray-600 rounded-2xl p-6 border border-gray-700/50 shadow-md sticky top-6">
              <h3 className="text-white font-semibold mb-4 text-lg flex items-center gap-2">
                <img src="/LISTICON.png" alt="Filter Icon" className="w-5 h-5 object-contain" />
                <span>Filter Minat</span>
              </h3>

              <div className="space-y-3 mb-6">
                {interestOptions.map((interest) => (
                  <button
                    key={interest.value}
                    onClick={() => toggleInterest(interest.value)}
                    className={`w-full flex items-center gap-2 p-3 rounded-xl transition-all border ${
                      selectedInterests.includes(interest.value)
                        ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/50'
                        : 'bg-gray-700/30 text-gray-200 border-gray-600/50 hover:bg-green-500/80 hover:text-white hover:border-green-500'
                    }`}
                  >
                    <img src={interest.icon} alt={interest.label} className="w-6 h-6 object-contain" />
                    <span className="text-xs font-medium">{interest.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={getRecommendations}
                disabled={isLoading}
                className="w-full bg-gray-700/30 border border-gray-600/50 hover:bg-white/95 hover:border-white text-gray-200 hover:text-gray-800 font-bold py-3 rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Mencari...</span>
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    <span className="text-sm">Cari Event</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT CONTENT - Results */}
          <div className="lg:col-span-4">
            {isLoading && (
              <div className="text-center py-12">
                <div className="flex justify-center mb-6">
                  <Atom color="#22c55e" size="medium" text="" textColor="#22c55e" />
                </div>
                <p
                  className="text-white text-xl font-semibold"
                  style={{
                    textShadow: '0 0 20px rgba(34, 197, 94, 0.9), 0 0 40px rgba(34, 197, 94, 0.6), 0 0 60px rgba(34, 197, 94, 0.4), 0 0 2px rgba(0, 0, 0, 0.8)'
                  }}
                >
                  AI sedang menganalisis event yang cocok untukmu...
                </p>
              </div>
            )}

            {!isLoading && hasSearched && recommendations.length === 0 && (
              <div className="text-center py-12 bg-neutral-800 rounded-2xl border border-gray-600 shadow-md">
                <div className="text-6xl mb-4">😕</div>
                <h3 className="text-2xl font-bold text-white mb-2">Tidak Ada Event yang Cocok</h3>
                <p className="text-gray-400">Coba pilih minat yang berbeda atau tunggu event baru!</p>
              </div>
            )}

            {!isLoading && recommendations.length > 0 && (
              <>
                {/* Summary */}
                {summary && (
                  <div className="bg-neutral-800 border border-gray-600 rounded-2xl p-6 mb-8 shadow-md">
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 blur-xl bg-white/40 rounded-full"></div>
                        <img
                          src="/GEMINIICON.png"
                          alt="AI Icon"
                          className="w-12 h-12 object-contain relative z-10"
                          style={{
                            filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 1)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 30px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.4))'
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold mb-2" style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6)' }}>REKOMENDASI AI:</h3>
                        <p className="text-gray-300">{summary}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Event Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recommendations.map((event, index) => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="bg-neutral-800 rounded-2xl p-6 border border-gray-600 hover:border-white transition-all hover:shadow-lg shadow-md cursor-pointer flex flex-col h-full"
                    >
                      {/* Header: Number & Organizer */}
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl font-bold text-white">#{index + 1}</span>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-xs text-gray-500">Penyelenggara</p>
                          <p className="text-xs font-bold text-white">{event.organizer}</p>
                        </div>
                      </div>

                      {/* Badge & Match */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`${categoryColors[event.category] || 'bg-gray-500'} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                          {event.category}
                        </span>
                        {event.relevanceScore && (
                          <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                            {event.relevanceScore}% Match
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-white mb-3 line-clamp-1">{event.title}</h3>

                      {/* Event Image */}
                      <div className="w-full h-40 bg-gray-700 rounded-lg overflow-hidden mb-4 flex-grow">
                        <img
                          src="/FOTO3.jpg"
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Kuota Progress Bar */}
                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-400">Kuota Peserta</span>
                          <span className="text-xs text-white font-bold">
                            {Math.floor(event.quota * 0.5)} / {event.quota} orang
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#00d9ff] h-full rounded-full transition-all"
                            style={{ width: `${(Math.floor(event.quota * 0.5) / event.quota) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </>
            )}

            {!hasSearched && allEvents.length > 0 && (
              <>
                {/* Default display - show all events */}
                <div className="bg-neutral-800 border border-gray-600 rounded-2xl p-6 mb-8 shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 blur-xl bg-white/40 rounded-full"></div>
                      <img
                        src="/GEMINIICON.png"
                        alt="AI Icon"
                        className="w-12 h-12 object-contain relative z-10"
                        style={{
                          filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 1)) drop-shadow(0 0 20px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 30px rgba(255, 255, 255, 0.6)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.4))'
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-2" style={{ textShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6)' }}>SEMUA EVENT TERSEDIA:</h3>
                      <p className="text-gray-300">Menampilkan {allEvents.length} event yang tersedia. Pilih minat dan klik "Cari Event" untuk filter yang lebih spesifik.</p>
                    </div>
                  </div>
                </div>

                {/* Event Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {allEvents.map((event, index) => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="bg-neutral-800 rounded-2xl p-6 border border-gray-600 hover:border-white transition-all hover:shadow-lg shadow-md cursor-pointer flex flex-col h-full"
                    >
                      {/* Header: Number & Organizer */}
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-3xl font-bold text-white">#{index + 1}</span>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="text-xs text-gray-500">Penyelenggara</p>
                          <p className="text-xs font-bold text-white">{event.organizer}</p>
                        </div>
                      </div>

                      {/* Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`${categoryColors[event.category] || 'bg-gray-500'} text-white px-3 py-1 rounded-full text-xs font-medium`}>
                          {event.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-white mb-3 line-clamp-1">{event.title}</h3>

                      {/* Event Image */}
                      <div className="w-full h-40 bg-gray-700 rounded-lg overflow-hidden mb-4 flex-grow">
                        <img
                          src="/FOTO3.jpg"
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Kuota Progress Bar */}
                      <div className="mt-auto">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-400">Kuota Peserta</span>
                          <span className="text-xs text-white font-bold">
                            {Math.floor(event.quota * 0.5)} / {event.quota} orang
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#00d9ff] h-full rounded-full transition-all"
                            style={{ width: `${(Math.floor(event.quota * 0.5) / event.quota) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </>
            )}

            {!hasSearched && allEvents.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔄</div>
                <h3 className="text-2xl font-bold text-white mb-2">Memuat Event...</h3>
                <p className="text-gray-400">Sedang mengambil data event yang tersedia</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Popup */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-neutral-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-600 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedEvent(null)}
              className="float-right text-gray-400 hover:text-white text-2xl font-bold"
            >
              ×
            </button>

            {/* Event Title & Organizer */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-3">
                <span className={`${categoryColors[selectedEvent.category] || 'bg-gray-500'} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                  {selectedEvent.category}
                </span>
                {selectedEvent.relevanceScore && (
                  <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                    {selectedEvent.relevanceScore}% Match
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">{selectedEvent.title}</h2>
              <p className="text-gray-400 text-sm mb-2">📅 {formatDate(selectedEvent.date)} • 📍 {selectedEvent.location}</p>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-white">Penyelenggara:</span> {selectedEvent.organizer}
              </p>
            </div>

            {/* Recommendation Reason */}
            {selectedEvent.recommendationReason && (
              <div className="bg-neutral-700 border border-gray-600 rounded-xl p-4 mb-6">
                <p className="text-gray-300 text-sm">
                  <span className="font-semibold text-white">💡 Kenapa cocok untuk kamu: </span>
                  {selectedEvent.recommendationReason}
                </p>
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Deskripsi Event</h3>
              <p className="text-gray-300">{selectedEvent.description}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedEvent.tags.map((tag, i) => (
                <span
                  key={i}
                  className="bg-white/10 text-white border border-white/20 px-3 py-1 rounded-full text-xs font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Kuota Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-400">Kuota Peserta</span>
                <span className="text-sm text-white font-bold">
                  {Math.floor(selectedEvent.quota * 0.5)} / {selectedEvent.quota} orang
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#00d9ff] h-full rounded-full transition-all"
                  style={{ width: `${(Math.floor(selectedEvent.quota * 0.5) / selectedEvent.quota) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Fee */}
            <div className="mb-6 pb-6 border-b border-gray-700">
              <span className="text-gray-400">Biaya Pendaftaran: </span>
              <span className="font-bold text-white text-xl">{selectedEvent.fee}</span>
            </div>

            {/* Daftar Sekarang Button */}
            <a
              href={selectedEvent.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#00d9ff] hover:bg-[#00b8d9] text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <span>Daftar Sekarang</span>
              <span>→</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
