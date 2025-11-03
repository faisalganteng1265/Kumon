'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
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

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-8 md:px-16 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Title */}
        <div className="text-center mb-16">
          <h2
            className="text-5xl md:text-6xl mb-8 text-white"
            style={{ fontFamily: '"Agency FB", "Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif', letterSpacing: '0.02em' }}
          >
            FAQs
          </h2>
        </div>

        {/* FAQ Items */}
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
    </section>
  );
}
