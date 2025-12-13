'use client';

import SmartScheduleBuilder from '@/components/SmartScheduleBuilder';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Fitur3() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative">
      {/* Language Toggle Buttons */}
      <div className="fixed top-4 sm:top-6 md:top-8 right-4 sm:right-8 md:right-80 z-[9999] flex items-center gap-2 pointer-events-auto">
        <button
          onClick={() => setLanguage('id')}
          className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            language === 'id'
              ? 'bg-red-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600'
              : 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100'
          }`}
        >
          ID
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            language === 'en'
              ? 'bg-red-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600'
              : 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100'
          }`}
        >
          EN
        </button>
      </div>

      <SmartScheduleBuilder />
    </div>
  );
}
