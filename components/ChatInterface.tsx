'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickQuestion {
  icon: string;
  questionKey: string;
  categoryKey: string;
}

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
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInitialForm, setShowInitialForm] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [selectedMode, setSelectedMode] = useState<'campus' | 'general' | 'challenge' | ''>('');
  const [directAnswer, setDirectAnswer] = useState<string>('');
  const [isAnswerLoading, setIsAnswerLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [challengeTopic, setChallengeTopic] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const answerSectionRef = useRef<HTMLDivElement>(null);

  const quickQuestions: QuickQuestion[] = [
    { icon: '/KRSICON.png', questionKey: 'chat.question.krs', categoryKey: 'chat.category.krs' },
    { icon: '/GEDUNGICON.png', questionKey: 'chat.question.library', categoryKey: 'chat.category.gedung' },
    { icon: '/DOSENICON.png', questionKey: 'chat.question.lecturer', categoryKey: 'chat.category.dosen' },
    { icon: '/BEASISWAICON.png', questionKey: 'chat.question.scholarship', categoryKey: 'chat.category.beasiswa' },
    { icon: '/JADWALICON.png', questionKey: 'chat.question.schedule', categoryKey: 'chat.category.akademik' },
    { icon: '/ORGANISASIICON.png', questionKey: 'chat.question.organization', categoryKey: 'chat.category.ukm' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAnswer = () => {
    answerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll ke jawaban ketika directAnswer sudah muncul
  useEffect(() => {
    if (directAnswer && !isAnswerLoading) {
      // Delay sedikit untuk memastikan render selesai
      setTimeout(() => {
        scrollToAnswer();
      }, 100);
    }
  }, [directAnswer, isAnswerLoading]);

  // Load user avatar and username
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;

      try {
        // Get username from user metadata
        if (user.user_metadata?.username) {
          setUsername(user.user_metadata.username);
        } else if (user.email) {
          setUsername(user.email.split('@')[0]);
        }

        // Load avatar from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();

        if (!error && data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
      }
    };

    if (user) {
      loadUserProfile();
    }
  }, [user]);

  // Auto-fetch university from profile when campus mode is selected
  useEffect(() => {
    console.log('ChatInterface: useEffect triggered', { loading, user: user?.id, selectedMode, hasInitialized });

    // Wait for auth to finish loading
    if (loading) {
      console.log('ChatInterface: Waiting for auth to load...');
      return;
    }

    // Only fetch if campus mode is selected
    if (selectedMode !== 'campus') {
      console.log('ChatInterface: Not in campus mode, skipping profile fetch');
      return;
    }

    // Prevent double execution
    if (hasInitialized) {
      console.log('ChatInterface: Already initialized, skipping...');
      return;
    }

    const fetchUniversityFromProfile = async () => {
      console.log('ChatInterface: Starting university fetch for user:', user?.id);
      setHasInitialized(true);

      // Check if user is logged in
      if (!user) {
        console.log('ChatInterface: User not logged in, no auto-fill');
        setIsLoadingProfile(false);
        return;
      }

      setIsLoadingProfile(true);

      try {
        console.log('ChatInterface: Fetching user_data for user:', user.id);

        // Fetch universitas from user_data table
        const { data, error } = await supabase
          .from('user_data')
          .select('universitas')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.log('ChatInterface: Error fetching profile:', error.message);
          setIsLoadingProfile(false);
          return;
        }

        if (!data || !data.universitas) {
          console.log('ChatInterface: No university found in profile');
          setIsLoadingProfile(false);
          return;
        }

        console.log('ChatInterface: University found in profile:', data.universitas);

        // Set the university from profile
        setSelectedUniversity(data.universitas);
        setIsLoadingProfile(false);

        console.log('ChatInterface: Successfully auto-filled university:', data.universitas);
      } catch (error: any) {
        console.error('ChatInterface: Unexpected error:', error);
        setIsLoadingProfile(false);
      }
    };

    fetchUniversityFromProfile();
  }, [user, loading, selectedMode, hasInitialized]);

  const handleStartChat = () => {
    // Validasi mode dipilih
    if (!selectedMode) {
      alert(t('chat.alertSelectMode'));
      return;
    }

    // Hanya cek universitas untuk mode kampus
    if (selectedMode === 'campus' && !selectedUniversity) {
      alert(t('chat.alertSelectUniversity'));
      return;
    }

    // Check if university is UNS - only UNS is available for now
    if (selectedMode === 'campus' && selectedUniversity !== 'Universitas Sebelas Maret (UNS)') {
      alert(t('chat.alertComingSoon'));
      return;
    }

    // Untuk challenge mode, langsung ke chat interface
    if (selectedMode === 'challenge') {
      setShowInitialForm(false);

      const welcomeMessage: Message = {
        role: 'assistant',
        content: t('chat.welcomeChallenge'),
        timestamp: new Date(),
      };

      setMessages([welcomeMessage]);
      return;
    }

    const questionToAsk = selectedMode === 'campus' ? selectedQuestion : customQuestion;
    if (!questionToAsk.trim()) {
      alert(t('chat.alertSelectQuestion'));
      return;
    }

    // Format message berbeda untuk mode
    const fullMessage = selectedMode === 'general'
      ? questionToAsk
      : `[Universitas: ${selectedUniversity}]\n${questionToAsk}`;

    setShowInitialForm(false);

    // Welcome message berbeda untuk setiap mode
    const welcomeContent = selectedMode === 'general'
      ? t('chat.welcomeGeneral')
      : `${t('chat.welcomeCampus')} ${selectedUniversity}. ${t('chat.welcomeCampusEnd')}`;

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
    const useChallengeMode = selectedMode === 'challenge';

    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Update challenge topic dari pesan pertama user
    if (useChallengeMode && !challengeTopic && messageText.trim()) {
      setChallengeTopic(messageText);
    }

    try {
      // Pilih API endpoint berdasarkan mode
      const apiEndpoint = useChallengeMode
        ? '/api/chat/challenge'
        : useGeneralMode
        ? '/api/chat/general'
        : '/api/chat/campus';

      // Siapkan body request sesuai mode
      const requestBody = useChallengeMode
        ? {
            message: messageText,
            history: messages,
            topic: challengeTopic || messageText,
          }
        : useGeneralMode
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

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Invalid response type:', contentType);
        const textResponse = await response.text();
        console.error('Response body:', textResponse);
        throw new Error('Server mengembalikan response yang tidak valid. Silakan coba lagi.');
      }

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
        content: t('chat.error'),
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
      // Check if university is UNS - only UNS is available for now
      if (selectedUniversity !== 'Universitas Sebelas Maret (UNS)') {
        setDirectAnswer(t('chat.comingSoon'));
        return;
      }

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

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Invalid response type:', contentType);
          const textResponse = await response.text();
          console.error('Response body:', textResponse);
          throw new Error('Server mengembalikan response yang tidak valid');
        }

        const data = await response.json();

        if (!response.ok) {
          console.error('API Error:', data);
          throw new Error(data.error || 'Failed to get response');
        }
        
        setDirectAnswer(data.response);
      } catch (error: any) {
        console.error('Error:', error);
        setDirectAnswer(t('chat.error'));
      } finally {
        setIsAnswerLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full" style={{ backgroundColor: '#fef9ed' }}>
      {showInitialForm ? (
        // Initial Form - University Selection and Questions
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#fef9ed' }}>
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 py-4 sm:py-6 px-3 sm:px-4">
            {/* Welcome Section */}
            <div className="text-center pt-35 mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-5xl font-bold text-black mb-2 px-4" style={{ fontFamily: "'Organic Relief', sans-serif" }}>
                {t('chat.welcome')}
              </h1>
              <p className="text-black text-xs sm:text-3xl mb-4 sm:mb-6 px-4 pt-10" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                {t('chat.subtitle')}
              </p>
            </div>

            {/* Mode Selection */}
            <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-black font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                {t('chat.selectMode')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <button
                  onClick={() => setSelectedMode('campus')}
                  className={`group p-4 sm:p-6 rounded-3xl transition-all text-left border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                    selectedMode === 'campus'
                      ? 'bg-[#ff5757]/20'
                      : 'bg-white hover:bg-[#ff5757]'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <Image src="/AKADEMIKICON.png" alt="Akademik Icon" width={48} height={48} className="object-contain w-8 h-8 sm:w-12 sm:h-12" />
                    <h4 className={`text-base sm:text-xl font-bold transition-colors ${selectedMode === 'campus' ? 'text-black' : 'text-black group-hover:text-white'}`}>{t('chat.campusMode')}</h4>
                  </div>
                  <p className={`text-xs sm:text-sm transition-colors ${selectedMode === 'campus' ? 'text-gray-700' : 'text-gray-700 group-hover:text-white'}`}>
                    {t('chat.campusModeDesc')}
                  </p>
                </button>

                <button
                  onClick={() => setSelectedMode('general')}
                  className={`group p-4 sm:p-6 rounded-3xl transition-all text-left border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                    selectedMode === 'general'
                      ? 'bg-[#ff5757]/20'
                      : 'bg-white hover:bg-[#ff5757]'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <Image src="/GENERALICON.png" alt="General Icon" width={64} height={64} className="object-contain w-8 h-8 sm:w-12 sm:h-12" />
                    <h4 className={`text-base sm:text-xl font-bold transition-colors ${selectedMode === 'general' ? 'text-black' : 'text-black group-hover:text-white'}`}>{t('chat.generalMode')}</h4>
                  </div>
                  <p className={`text-xs sm:text-sm transition-colors ${selectedMode === 'general' ? 'text-gray-700' : 'text-gray-700 group-hover:text-white'}`}>
                    {t('chat.generalModeDesc')}
                  </p>
                </button>

                <button
                  onClick={() => setSelectedMode('challenge')}
                  className={`group p-4 sm:p-6 rounded-3xl transition-all text-left border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                    selectedMode === 'challenge'
                      ? 'bg-[#ff5757]/20'
                      : 'bg-white hover:bg-[#ff5757]'
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <span className="text-3xl sm:text-4xl">🎯</span>
                    <h4 className={`text-base sm:text-xl font-bold transition-colors ${selectedMode === 'challenge' ? 'text-black' : 'text-black group-hover:text-white'}`}>{t('chat.challengeMode')}</h4>
                  </div>
                  <p className={`text-xs sm:text-sm transition-colors ${selectedMode === 'challenge' ? 'text-gray-700' : 'text-gray-700 group-hover:text-white'}`}>
                    {t('chat.challengeModeDesc')}
                  </p>
                </button>
              </div>
            </div>

            {/* University Selection - Hanya tampil jika mode campus */}
            {selectedMode === 'campus' && (
              <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <label className="block text-black font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <Image src="/KAMPUSICON.png" alt="Kampus" width={32} height={32} className="object-contain w-6 h-6 sm:w-8 sm:h-8" />
                  {selectedUniversity && !isLoadingProfile ? t('chat.yourUniversity') : t('chat.selectUniversity')}
                </label>

                {isLoadingProfile ? (
                  // Loading state
                  <div className="w-full bg-gray-100 rounded-3xl px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 flex items-center gap-2 sm:gap-3">
                    <div className="flex gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                      <span
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.4s' }}
                      ></span>
                    </div>
                    <span className="text-gray-600 text-xs sm:text-sm">{t('chat.loadingUniversity')}</span>
                  </div>
                ) : selectedUniversity && user ? (
                  // Auto-filled from profile - Read-only display
                  <div className="w-full bg-[#ff5757]/10 border border-[#ff5757]/30 rounded-3xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#ff5757]/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#ff5757]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-black font-medium text-xs sm:text-sm truncate">{selectedUniversity}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Manual selection dropdown
                  <select
                    value={selectedUniversity}
                    onChange={(e) => setSelectedUniversity(e.target.value)}
                    className="w-full bg-gray-100 text-black rounded-3xl px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-xs sm:text-sm"
                  >
                    <option value="">{t('chat.selectUniversityPlaceholder')}</option>
                    {universities.map((uni, index) => (
                      <option key={index} value={uni}>
                        {uni}
                      </option>
                    ))}
                  </select>
                )}

                {/* Info message for non-logged-in users */}
                {!user && !loading && (
                  <p className="text-gray-600 text-xs mt-2 flex items-center gap-1.5 sm:gap-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{t('chat.loginToAutofill')}</span>
                  </p>
                )}
              </div>
            )}

            {/* Question Selection - Campus Mode */}
            {selectedMode === 'campus' && (
              <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-black font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
                  <Image src="/TANDATANYAICON.png" alt="Pertanyaan" width={12} height={12} className="object-contain w-3 h-3 sm:w-4 sm:h-4" />
                  {t('chat.selectQuestion')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {quickQuestions.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuestionSelect(t(item.questionKey))}
                      className={`group flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-3xl transition-all text-left border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                        selectedQuestion === t(item.questionKey)
                          ? 'bg-[#ff5757]/20'
                          : 'bg-white hover:bg-[#ff5757]'
                      }`}
                    >
                      <Image src={item.icon} alt={t(item.categoryKey)} width={32} height={32} className="object-contain flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs sm:text-sm transition-colors ${
                          selectedQuestion === t(item.questionKey)
                            ? 'text-black font-semibold'
                            : 'text-gray-700 group-hover:text-white'
                        }`}>
                          {t(item.questionKey)}
                        </p>
                        <span className={`text-xs mt-0.5 sm:mt-1 inline-block transition-colors ${
                          selectedQuestion === t(item.questionKey)
                            ? 'text-[#ff5757]'
                            : 'text-[#ff5757] group-hover:text-white'
                        }`}>
                          {t(item.categoryKey)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* General Question Input - Untuk Mode Umum */}
            {selectedMode === 'general' && (
              <div className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <label className="block text-black font-semibold mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <span className="text-lg sm:text-xl">✏️</span>
                  {t('chat.typeQuestion')}
                </label>
                <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3">
                  {t('chat.generalModeNote')}
                </p>
                <textarea
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder={t('chat.generalModePlaceholder')}
                  rows={5}
                  className="w-full bg-gray-100 text-black rounded-3xl px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500 resize-none text-xs sm:text-sm"
                />
              </div>
            )}

            {/* Start Button - For General Mode and Challenge Mode */}
            {(selectedMode === 'general' || selectedMode === 'challenge') && (
              <button
                onClick={handleStartChat}
                disabled={selectedMode === 'general' && !customQuestion.trim()}
                className="w-full bg-[#ff5757] hover:bg-[#ff3333] text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-3xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#ff5757] hover:shadow-lg hover:shadow-[#ff5757]/50 hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <span className="text-lg sm:text-xl">{selectedMode === 'challenge' ? '🎯' : '💬'}</span>
                <span>{t('chat.startChat')}</span>
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
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
              <div ref={answerSectionRef} className="bg-white rounded-3xl p-4 sm:p-6 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-black font-semibold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                  <Image src="/ICONLAMPU.png" alt="Jawaban" width={24} height={24} className="object-contain w-5 h-5 sm:w-6 sm:h-6" />
                  {t('chat.answer')}
                </h3>

                {isAnswerLoading ? (
                  <div className="flex items-center justify-center py-6 sm:py-8">
                    <div className="flex gap-2">
                      <span className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></span>
                      <span
                        className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></span>
                      <span
                        className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.4s' }}
                      ></span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-3xl p-5 border border-gray-300">
                    <p className="text-black leading-relaxed whitespace-pre-wrap">{directAnswer}</p>
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
          <div className="p-4" style={{ backgroundColor: '#fef9ed' }}>
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border border-white/20 overflow-hidden p-1">
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
                      {selectedMode === 'challenge'
                        ? t('chat.challengeMode')
                        : selectedMode === 'general'
                        ? t('chat.aiAssistant')
                        : t('chat.welcome')}
                    </h1>
                    <p className="text-gray-400 text-sm">
                      {selectedMode === 'challenge'
                        ? challengeTopic || t('chat.challengeModeSubtitle')
                        : selectedMode === 'general'
                        ? t('chat.generalMode')
                        : selectedUniversity}
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
                    setChallengeTopic('');
                  }}
                  className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {t('chat.reset')}
                </button>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-2 space-y-6" style={{ backgroundColor: '#fef9ed' }}>
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
                        ? avatarUrl ? '' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                        : 'bg-gray-700 overflow-hidden p-1'
                    }`}>
                      {message.role === 'user' ? (
                        avatarUrl ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <Image
                              src={avatarUrl}
                              alt="User Avatar"
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#ff5757] flex items-center justify-center text-white font-bold text-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {username.charAt(0).toUpperCase() || '?'}
                          </div>
                        )
                      ) : (
                        <Image
                          src="/AICAMPUS.png"
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
                        className={`rounded-3xl px-5 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                          message.role === 'user'
                            ? 'bg-[#ff5757] text-white'
                            : 'bg-white text-black'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                      <p className={`text-xs mt-1 px-2 ${
                        message.role === 'user' ? 'text-[#ff5757]' : 'text-[#ff5757]'
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
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-700 border border-gray-700 overflow-hidden p-1">
                      <Image
                        src="/AICAMPUS.png"
                        alt="AI"
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                    </div>
                    <div className="bg-white text-black rounded-3xl px-5 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <div className="flex gap-2">
                        <span className="w-2 h-2 bg-[#ff5757] rounded-full animate-bounce"></span>
                        <span
                          className="w-2 h-2 bg-[#ff5757] rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></span>
                        <span
                          className="w-2 h-2 bg-[#ff5757] rounded-full animate-bounce"
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
          <div className="p-6" style={{ backgroundColor: '#fef9ed' }}>
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
                    selectedMode === 'challenge'
                      ? t('chat.inputPlaceholderChallenge')
                      : selectedMode === 'general'
                      ? t('chat.inputPlaceholderGeneral')
                      : t('chat.inputPlaceholderCampus')
                  }
                  className="flex-1 bg-gray-800/40 text-white rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 border border-gray-700/50 hover:bg-white/95 hover:text-gray-800 hover:border-white focus:bg-white/95 focus:text-gray-800 focus:border-white transition-all"
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
                  <span className="hidden sm:inline">{t('chat.send')}</span>
                </button>
              </form>

              {/* Helper Text */}
              <p className="text-gray-400 text-xs mt-3 text-center">
                {selectedMode === 'challenge'
                  ? t('chat.challengeModeTip')
                  : selectedMode === 'general'
                  ? t('chat.generalModeTip')
                  : t('chat.campusModeTip')}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Custom Scrollbar Styles - Hidden */}
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .flex-1.overflow-y-auto.bg-transparent::-webkit-scrollbar {
          display: none;
        }

        /* Hide scrollbar for IE, Edge and Firefox */
        .flex-1.overflow-y-auto.bg-transparent {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
}
