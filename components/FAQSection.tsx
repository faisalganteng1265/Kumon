'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import localFont from 'next/font/local';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';

const organicRelief = localFont({
  src: '../public/fonts/Organic Relief.ttf',
  display: 'swap',
});

const lilitaOne = localFont({
  src: '../public/fonts/LilitaOne-Regular.ttf',
  display: 'swap',
});

interface FAQItem {
  question: string;
  answer: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const getFAQs = (t: (key: string) => string): FAQItem[] => [
  {
    question: t('faq.q1'),
    answer: t('faq.a1'),
  },
  {
    question: t('faq.q2'),
    answer: t('faq.a2'),
  },
  {
    question: t('faq.q3'),
    answer: t('faq.a3'),
  },
  {
    question: t('faq.q4'),
    answer: t('faq.a4'),
  },
  {
    question: t('faq.q5'),
    answer: t('faq.a5'),
  },
  {
    question: t('faq.q6'),
    answer: t('faq.a6'),
  },
  {
    question: t('faq.q7'),
    answer: t('faq.a7'),
  },
  {
    question: t('faq.q8'),
    answer: t('faq.a8'),
  },
  {
    question: t('faq.q9'),
    answer: t('faq.a9'),
  },
  {
    question: t('faq.q10'),
    answer: t('faq.a10'),
  },
];

const quickQuestions = [
  'Apa itu AICAMPUS?',
  'Bagaimana cara menggunakan Event Recommender?',
  'Apa saja fitur utama AICAMPUS?',
  'Bagaimana cara kerja Smart Schedule Builder?',
];

export default function FAQSection() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  
  const faqs = getFAQs(t);

  // Initialize welcome message when language changes
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: t('faq.welcome'),
      },
    ]);
  }, [t]);

  // Detect when this section becomes visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
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
      const response = await fetch('/api/chat/aicampus', {
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
    <section ref={sectionRef} id="about-us" className="py-12 sm:py-16 md:py-20 px-0 relative overflow-hidden" style={{ backgroundColor: '#fef9ed' }}>
      <div className="w-full relative z-10">
        {/* Title */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16 px-4 sm:px-6 md:px-8">
          <h2
            className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 sm:mb-10 md:mb-14 lg:mb-16 text-black transition-all duration-1000 ease-out ${
              isVisible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 -translate-y-20 scale-95'
            } ${organicRelief.className}`}
          >
            {t('faq.title')}
          </h2>
          <p
            className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-white ${lilitaOne.className}`}
            style={{
              WebkitTextStroke: '1px black',
            }}
          >
            {t('faq.subtitle')}
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-[100%] gap-0">
          {/* Left Column - FAQ */}
          <div className="px-4 sm:px-6 md:px-8 lg:px-16 max-w-6xl mx-auto w-full">
            <div className="space-y-0">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  className="mb-8 sm:mb-10 relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                >
                  {/* Shadow Box (Black) */}
                  <div className="absolute top-3 left-3 w-full h-full bg-black rounded-2xl"></div>

                  {/* Main Box (White) */}
                  <div className="relative bg-white border-4 border-black rounded-2xl overflow-hidden">
                    {/* Question Button */}
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full px-6 sm:px-8 py-6 sm:py-7 md:py-8 flex items-center justify-between text-left group"
                    >
                      <span
                        className="text-xl sm:text-2xl md:text-3xl font-bold text-black pr-4 sm:pr-6"
                        style={{ fontFamily: "'Fredoka', sans-serif" }}
                      >
                        {faq.question}
                      </span>

                      {/* Chevron Icon */}
                      <div className={`flex-shrink-0 transition-all duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                        <svg
                          className="w-6 h-6 sm:w-7 sm:h-7 text-black transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>

                    {/* Answer */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-6 sm:px-8 pb-6 sm:pb-7 md:pb-8 border-t-2 border-gray-300">
                        <p
                          className="text-gray-800 leading-relaxed text-base sm:text-lg md:text-xl pt-6"
                          style={{ fontFamily: "'Fredoka', sans-serif" }}
                        >
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
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
