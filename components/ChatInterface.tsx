'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickQuestion {
  icon: string;
  question: string;
  category: string;
}

const quickQuestions: QuickQuestion[] = [
  { icon: '📚', question: 'Bagaimana cara mengisi KRS?', category: 'KRS' },
  { icon: '🏛️', question: 'Di mana lokasi perpustakaan pusat?', category: 'Gedung' },
  { icon: '👨‍🏫', question: 'Bagaimana cara mencari info dosen?', category: 'Dosen' },
  { icon: '💰', question: 'Beasiswa apa saja yang tersedia?', category: 'Beasiswa' },
  { icon: '📅', question: 'Kapan jadwal UTS dan UAS?', category: 'Akademik' },
  { icon: '🎯', question: 'UKM apa saja yang ada?', category: 'UKM' },
];

const universities = [
  'Universitas Sebelas Maret (UNS)',
  'Universitas Gadjah Mada (UGM)',
  'Institut Teknologi Bandung (ITB)',
  'Universitas Indonesia (UI)',
  'Institut Teknologi Sepuluh Nopember (ITS)',
  'Universitas Brawijaya (UB)',
  'Universitas Diponegoro (UNDIP)',
  'Universitas Airlangga (UNAIR)',
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInitialForm, setShowInitialForm] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [selectedMode, setSelectedMode] = useState<'campus' | 'general' | ''>('');
  const [directAnswer, setDirectAnswer] = useState<string>('');
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleStartChat = () => {
    // Validasi mode dipilih
    if (!selectedMode) {
      alert('Silakan pilih mode terlebih dahulu!');
      return;
    }

    // Hanya cek universitas untuk mode kampus
    if (selectedMode === 'campus' && !selectedUniversity) {
      alert('Silakan pilih universitas terlebih dahulu!');
      return;
    }

    const questionToAsk = selectedMode === 'campus' ? selectedQuestion : customQuestion;
    if (!questionToAsk.trim()) {
      alert('Silakan pilih atau ketik pertanyaan!');
      return;
    }

    // Format message berbeda untuk mode
    const fullMessage = selectedMode === 'general'
      ? questionToAsk
      : `[Universitas: ${selectedUniversity}]\n${questionToAsk}`;

    setShowInitialForm(false);

    // Welcome message berbeda untuk setiap mode
    const welcomeContent = selectedMode === 'general'
      ? `Halo! Saya asisten AI yang siap membantu menjawab berbagai pertanyaan Anda.`
      : `Halo! Saya AI Campus Navigator untuk ${selectedUniversity}. Saya siap membantu menjawab pertanyaan Anda.`;

    const welcomeMessage: Message = {
      role: 'assistant',
      content: welcomeContent,
      timestamp: new Date(),
    };

    setMessages([welcomeMessage]);
    handleSubmit(fullMessage, selectedMode === 'general');
  };

  const handleSubmit = async (question?: string, isCustomQuestion?: boolean) => {
    const messageText = question || input;
    if (!messageText.trim() || isLoading) return;

    // Gunakan parameter isCustomQuestion jika diberikan, jika tidak gunakan state selectedMode
    const useGeneralMode = isCustomQuestion !== undefined ? isCustomQuestion : selectedMode === 'general';

    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Pilih API endpoint berdasarkan mode
      const apiEndpoint = useGeneralMode ? '/api/chat/general' : '/api/chat/campus';

      // Siapkan body request sesuai mode
      const requestBody = useGeneralMode
        ? {
            message: messageText,
            history: messages,
          }
        : {
            message: messageText,
            history: messages,
            university: selectedUniversity,
          };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.error || 'Failed to get response');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Maaf, terjadi kesalahan: ${error.message}. Silakan coba lagi.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleQuestionSelect = async (question: string) => {
    // Set pertanyaan yang dipilih
    setSelectedQuestion(question);
    setCustomQuestion('');
    
    // If in campus mode, fetch direct answer
    if (selectedMode === 'campus' && selectedUniversity) {
      setIsAnswerLoading(true);
      setDirectAnswer('');
      
      try {
        const fullMessage = `[Universitas: ${selectedUniversity}]\n${question}`;
        
        // Call the campus API directly
        const response = await fetch('/api/chat/campus', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: fullMessage,
            history: [],
            university: selectedUniversity,
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error('API Error:', data);
          throw new Error(data.error || 'Failed to get response');
        }
        
        setDirectAnswer(data.response);
      } catch (error: any) {
        console.error('Error:', error);
        setDirectAnswer(`Maaf, terjadi kesalahan: ${error.message}. Silakan coba lagi.`);
      } finally {
        setIsAnswerLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {showInitialForm ? (
        // Initial Form - University Selection and Questions
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-4 overflow-hidden">
                <Image
                  src="/GEMINIICON.png"
                  alt="AI Assistant"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2" style={{ textShadow: '0 0 10px rgba(34, 197, 94, 0.8)' }}>
                Selamat Datang!
              </h2>
              <p className="text-gray-400 text-lg">
                Mulai percakapan dengan AI Campus Assistant
              </p>
            </div>

            {/* Mode Selection */}
            <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
              <h3 className="text-white font-semibold mb-4">
                Pilih Mode Chat
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setSelectedMode('campus')}
                  className={`p-6 rounded-xl transition-all text-left border ${
                    selectedMode === 'campus'
                      ? 'bg-green-500/20 border-green-500 ring-2 ring-green-500'
                      : 'bg-gray-900/50 border-gray-700 hover:bg-white/10 hover:border-white/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Image src="/AKADEMIKICON.png" alt="Akademik Icon" width={48} height={48} className="object-contain" />
                    <h4 className="text-xl font-bold text-white">Mode Kampus</h4>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Tanya tentang informasi kampus, KRS, gedung, dosen, beasiswa, dan kehidupan kampus
                  </p>
                </button>

                <button
                  onClick={() => setSelectedMode('general')}
                  className={`p-6 rounded-xl transition-all text-left border ${
                    selectedMode === 'general'
                      ? 'bg-green-500/20 border-green-500 ring-2 ring-green-500'
                      : 'bg-gray-900/50 border-gray-700 hover:bg-white/10 hover:border-white/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Image src="/GENERALICON.png" alt="General Icon" width={64} height={64} className="object-contain" />
                    <h4 className="text-xl font-bold text-white">Mode Umum</h4>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Tanya apapun: teknologi, sains, budaya, tips, resep, dan topik lainnya
                  </p>
                </button>
              </div>
            </div>

            {/* University Selection - Hanya tampil jika mode campus */}
            {selectedMode === 'campus' && (
              <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                <label className="block text-white font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">🏫</span>
                  Pilih Universitas
                </label>
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="w-full bg-gray-900/50 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="">-- Pilih Universitas --</option>
                  {universities.map((uni, index) => (
                    <option key={index} value={uni}>
                      {uni}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Question Selection - Campus Mode */}
            {selectedMode === 'campus' && (
              <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span className="text-2xl">❓</span>
                  Pilih Pertanyaan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickQuestions.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuestionSelect(item.question)}
                      className={`flex items-start gap-3 p-4 rounded-xl transition-all text-left border ${
                        selectedQuestion === item.question
                          ? 'bg-green-500/20 border-green-500 ring-2 ring-green-500'
                          : 'bg-gray-900/50 border-gray-700 hover:bg-white/95 hover:border-white'
                      } group`}
                    >
                      <span className="text-2xl flex-shrink-0">{item.icon}</span>
                      <div className="flex-1">
                        <p className={`text-sm transition-colors ${
                          selectedQuestion === item.question
                            ? 'text-white font-semibold'
                            : 'text-gray-300 group-hover:text-gray-800'
                        }`}>
                          {item.question}
                        </p>
                        <span className={`text-xs mt-1 inline-block ${
                          selectedQuestion === item.question
                            ? 'text-green-300'
                            : 'text-green-400 group-hover:text-green-600'
                        }`}>
                          {item.category}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* General Question Input - Untuk Mode Umum */}
            {selectedMode === 'general' && (
              <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                  <span className="text-xl">✏️</span>
                  Ketik Pertanyaan Apapun
                </label>
                <p className="text-gray-400 text-sm mb-3">
                  Mode umum - Tanyakan apapun yang ingin kamu ketahui
                </p>
                <textarea
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Contoh: Jelaskan tentang AI, Resep makanan sehat, Tips belajar efektif, dll."
                  rows={5}
                  className="w-full bg-gray-900/50 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-500 resize-none"
                />
              </div>
            )}

            {/* Start Button - Only for General Mode */}
            {selectedMode === 'general' && (
              <button
                onClick={handleStartChat}
                disabled={!customQuestion.trim()}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-green-500 disabled:hover:to-green-600 hover:shadow-lg hover:shadow-green-500/50 hover:scale-105 flex items-center justify-center gap-3"
              >
                <span className="text-xl">💬</span>
                <span>Mulai Chat</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </button>
            )}
            
            {/* Direct Answer Display - Only for Campus Mode */}
            {selectedMode === 'campus' && selectedQuestion && selectedUniversity && (
              <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  Jawaban
                </h3>
                
                {isAnswerLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex gap-2">
                      <span className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></span>
                      <span
                        className="w-3 h-3 bg-green-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></span>
                      <span
                        className="w-3 h-3 bg-green-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.4s' }}
                      ></span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-900/50 rounded-xl p-5 border border-gray-700">
                    <p className="text-gray-100 leading-relaxed whitespace-pre-wrap">{directAnswer}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Chat Interface
        <>
          {/* Header */}
          <div className="bg-gray-800/40 backdrop-blur-sm p-4 border-b border-gray-700/50">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/20 overflow-hidden">
                    <Image
                      src="/GEMINIICON.png"
                      alt="AI Assistant"
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-white">
                      {selectedMode === 'general' ? 'AI Assistant' : 'AI Campus Chatbot'}
                    </h1>
                    <p className="text-gray-400 text-sm">
                      {selectedMode === 'general' ? 'Mode Umum' : selectedUniversity}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowInitialForm(true);
                    setMessages([]);
                    setSelectedUniversity('');
                    setSelectedQuestion('');
                    setCustomQuestion('');
                    setSelectedMode('');
                  }}
                  className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-green-500 to-green-600'
                        : 'bg-gray-700 overflow-hidden'
                    }`}>
                      {message.role === 'user' ? (
                        <span className="text-xl">👤</span>
                      ) : (
                        <Image
                          src="/GEMINIICON.png"
                          alt="AI"
                          width={28}
                          height={28}
                          className="object-contain"
                        />
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`rounded-2xl px-5 py-3 shadow-md ${
                          message.role === 'user'
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-800 text-gray-100 border border-gray-700'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                      <p className={`text-xs mt-1 px-2 ${
                        message.role === 'user' ? 'text-green-300' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-700 border border-gray-700 overflow-hidden">
                      <Image
                        src="/GEMINIICON.png"
                        alt="AI"
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                    </div>
                    <div className="bg-gray-800 text-gray-100 rounded-2xl px-5 py-3 border border-gray-700">
                      <div className="flex gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></span>
                        <span
                          className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></span>
                        <span
                          className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                          style={{ animationDelay: '0.4s' }}
                        ></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-800 p-6">
            <div className="max-w-4xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="flex gap-3"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    selectedMode === 'general'
                      ? 'Tanya apapun yang ingin kamu ketahui...'
                      : 'Ketik pertanyaan lanjutan tentang kampus...'
                  }
                  className="flex-1 bg-gray-800/40 text-white rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 border border-gray-700/50 hover:bg-white/95 hover:text-gray-800 hover:border-white focus:bg-white/95 focus:text-gray-800 focus:border-white transition-all"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-gray-700/30 border border-gray-600/50 hover:bg-white/95 hover:border-white text-gray-200 hover:text-gray-800 rounded-full px-8 py-4 font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  <span className="hidden sm:inline">Kirim</span>
                </button>
              </form>

              {/* Helper Text */}
              <p className="text-gray-400 text-xs mt-3 text-center">
                {selectedMode === 'general'
                  ? '💡 Mode Umum: Tanya apapun yang ingin kamu ketahui'
                  : '💡 Tips: Tanya tentang KRS, gedung, dosen, beasiswa, atau kehidupan kampus'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
