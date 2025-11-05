'use client';

import { useState, useRef, useEffect } from 'react';
import TextType from './TextType';

interface FAQItem {
  question: string;
  answer: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Apakah AI Campus Guide bisa menjawab semua pertanyaan tentang kampus?',
    answer: 'Ya! AI Campus Guide kami dirancang untuk menjawab berbagai pertanyaan seputar kehidupan kampus, mulai dari cara mengisi KRS, lokasi gedung, info dosen, prosedur beasiswa, jadwal kuliah, hingga informasi UKM. AI kami terus belajar dan diperbarui untuk memberikan jawaban yang akurat dan relevan.',
  },
  {
    question: 'Bagaimana cara kerja Event Recommender?',
    answer: 'Event Recommender menggunakan AI untuk menganalisis minat, jurusan, dan aktivitas Anda sebelumnya. Berdasarkan data tersebut, sistem akan merekomendasikan event seperti seminar, lomba, kegiatan UKM, dan volunteering yang paling sesuai dengan profil Anda. Semakin sering Anda menggunakan fitur ini, semakin akurat rekomendasinya!',
  },
  {
    question: 'Apakah Smart Schedule Builder bisa mendeteksi jadwal yang bentrok?',
    answer: 'Tentu saja! Smart Schedule Builder dilengkapi dengan sistem deteksi otomatis yang akan memperingatkan Anda jika ada jadwal yang bentrok. AI juga akan memberikan saran alternatif jadwal yang optimal, mempertimbangkan waktu istirahat, dan memastikan work-life balance Anda tetap terjaga.',
  },
  {
    question: 'Bagaimana Peer Connect AI mencocokkan saya dengan teman atau mentor?',
    answer: 'Peer Connect AI menggunakan algoritma machine learning yang menganalisis minat akademik, hobi, tujuan karir, dan preferensi Anda. Sistem akan mencocokkan Anda dengan mahasiswa atau mentor yang memiliki kesamaan atau dapat saling melengkapi. Fitur ini membantu Anda membangun networking yang berkualitas di kampus.',
  },
  {
    question: 'Apakah data pribadi saya aman?',
    answer: 'Keamanan data Anda adalah prioritas utama kami. Semua informasi pribadi dienkripsi dan disimpan dengan standar keamanan tingkat enterprise. Kami tidak akan membagikan data Anda kepada pihak ketiga tanpa izin Anda. Platform kami juga mematuhi regulasi perlindungan data yang berlaku.',
  },
  {
    question: 'Apakah layanan ini berbayar?',
    answer: 'Kami menyediakan paket gratis dengan fitur dasar yang sudah sangat lengkap untuk mendukung kehidupan kampus Anda. Untuk fitur premium seperti mentoring prioritas, analitik mendalam, dan rekomendasi yang lebih personal, tersedia paket berlangganan dengan harga terjangkau khusus untuk mahasiswa.',
  },
];

const quickQuestions = [
  'Bagaimana cara mengisi KRS?',
  'Dimana lokasi perpustakaan?',
  'Apa saja UKM yang tersedia?',
  'Bagaimana cara mendaftar beasiswa?',
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Halo! Saya AI Campus Navigator UNS. Saya siap membantu menjawab pertanyaan seputar kampus. Silakan pilih pertanyaan cepat di bawah atau ketik pertanyaan Anda sendiri!',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Detect when this section becomes visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay animation slightly for smoother effect
          setTimeout(() => setIsVisible(true), 200);
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: messages,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    sendMessage(question);
  };

  return (
    <section ref={sectionRef} id="faq-section" className="py-20 px-0 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      <div className="w-full relative z-10">
        {/* Title */}
        <div className="text-center mb-16 px-8">
          <TextType
            text="FAQs & AI Assistant"
            as="h2"
            className="text-5xl md:text-6xl mb-8 text-white"
            style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif', letterSpacing: '0.02em' }}
            typingSpeed={80}
            loop={false}
            showCursor={true}
            cursorCharacter="|"
            cursorClassName="text-emerald-400"
            startOnVisible={true}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-[60%_40%] gap-0">
          {/* Left Column - FAQ */}
          <div className="px-8 md:px-16">
            <div className="space-y-0">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="group border-t border-gray-700 last:border-b last:border-gray-700 transition-all duration-300"
                >
                  {/* Question Button */}
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-0 py-6 flex items-center justify-between text-left relative z-10 group"
                  >
                    <span
                      className="text-lg md:text-xl font-normal text-white pr-4"
                      style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
                    >
                      {faq.question}
                    </span>

                    {/* Chevron Icon */}
                    <div className={`flex-shrink-0 transition-all duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                      <svg
                        className="w-5 h-5 text-emerald-400 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Answer */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-0 pb-6 relative z-10">
                      <p
                        className="text-gray-300 leading-relaxed text-base"
                        style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
                      >
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Chatbot */}
          <div className="lg:sticky lg:top-24 h-fit px-8 md:px-16">
            <div
              className={`bg-gradient-to-br from-black via-gray-950 to-black backdrop-blur-lg border border-gray-800/50 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col transition-all duration-700 transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{
                height: '600px',
              }}
            >
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-gray-900 to-black p-5 rounded-t-3xl shadow-lg border-b border-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-800/50 rounded-full flex items-center justify-center backdrop-blur-sm border border-gray-700/50">
                      <span className="text-2xl">🤖</span>
                    </div>
                    <div>
                      <h3
                        className="text-xl text-gray-100 font-semibold"
                        style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
                      >
                        AI Campus Navigator
                      </h3>
                      <p className="text-gray-500 text-xs opacity-90">Online • Ready to help</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-custom bg-gradient-to-b from-gray-950 to-black">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gray-800/80 rounded-full flex items-center justify-center mr-2 flex-shrink-0 shadow-lg border border-gray-700/50">
                        <span className="text-gray-300 text-sm">🤖</span>
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-4 py-3 shadow-lg ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-gray-100 rounded-2xl rounded-br-sm border border-gray-700/50'
                          : 'bg-gray-900/90 text-gray-300 border border-gray-800/50 rounded-2xl rounded-bl-sm backdrop-blur-sm'
                      }`}
                      style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
                    >
                      <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-800/80 rounded-full flex items-center justify-center ml-2 flex-shrink-0 shadow-lg border border-gray-700/50">
                        <span className="text-gray-300 text-sm">👤</span>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="w-8 h-8 bg-gray-800/80 rounded-full flex items-center justify-center mr-2 flex-shrink-0 shadow-lg border border-gray-700/50">
                      <span className="text-gray-300 text-sm">🤖</span>
                    </div>
                    <div className="bg-gray-900/90 border border-gray-800/50 rounded-2xl rounded-bl-sm px-4 py-3 backdrop-blur-sm shadow-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              {messages.length === 1 && (
                <div className="px-5 pb-3 bg-gradient-to-b from-transparent to-gray-900/50">
                  <p className="text-gray-500 text-sm mb-2" style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}>
                    Pertanyaan cepat:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuickQuestion(q)}
                        className="px-4 py-2 bg-gray-900/60 hover:bg-gray-800/60 border border-gray-700/50 rounded-full text-sm text-gray-400 hover:text-gray-300 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                        style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-5 border-t border-gray-800/50 bg-gradient-to-b from-gray-900/50 to-black rounded-b-3xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex gap-3"
                >
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ketik pertanyaan Anda..."
                      className="w-full bg-gray-900/80 border border-gray-800/50 rounded-2xl px-5 py-3 pr-12 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-gray-700/50 focus:bg-gray-900/90 transition-all duration-200 backdrop-blur-sm"
                      style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
                      disabled={isLoading}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-900 disabled:to-gray-950 text-gray-100 rounded-2xl px-6 py-3 font-semibold transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-105 hover:shadow-lg flex items-center gap-2 border border-gray-700/50"
                    style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif' }}
                  >
                    <span>Kirim</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-custom::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-custom::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 20px;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgba(55, 65, 81, 0.7), rgba(31, 41, 55, 0.7));
          border-radius: 20px;
        }

        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgba(75, 85, 99, 0.9), rgba(55, 65, 81, 0.9));
        }

        /* Firefox */
        .scrollbar-custom {
          scrollbar-width: thin;
          scrollbar-color: rgba(55, 65, 81, 0.7) rgba(0, 0, 0, 0.3);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

      `}</style>
    </section>
  );
}
