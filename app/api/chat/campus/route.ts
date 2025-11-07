import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    console.log('Campus API route called');
    const { message, history, university } = await request.json();
    console.log('Message received:', message);
    console.log('University:', university);

    if (!message) {
      console.error('No message provided');
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('API key not found in environment');
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    console.log('API key found, initializing Gemini for campus mode...');

    // System prompt untuk mode kampus
    const campusSystemPrompt = `Kamu adalah AI Campus Navigator untuk ${university || 'universitas'}.

INFORMASI KAMPUS UNS:

📚 KRS (Kartu Rencana Studi) di UNS:
- KRS dibuka setiap awal semester (biasanya 2 minggu sebelum perkuliahan dimulai)
- Akses melalui SIMASTER (Sistem Informasi Akademik UNS) di simaster.uns.ac.id
- Batas maksimal SKS: 24 SKS per semester (untuk mahasiswa dengan IPK >= 3.00)
- Batas minimal SKS: 12 SKS per semester
- KRS bisa direvisi dalam masa KRS dan masa revisi KRS (biasanya 2 minggu pertama kuliah)
- Wajib konsultasi dengan Dosen Pembimbing Akademik (DPA) sebelum finalisasi KRS

📍 Lokasi Gedung Utama di UNS:
- Rektorat: Gedung pusat administrasi kampus
- Perpustakaan Pusat: Buka Senin-Jumat 08.00-20.00, Sabtu 08.00-16.00
- Student Center: Pusat kegiatan mahasiswa
- Gedung Fakultas: Tersebar di 9 fakultas (FKIP, FEB, Hukum, FMIPA, FT, Pertanian, dll)

💰 Beasiswa di UNS:
- Beasiswa PPA (Peningkatan Prestasi Akademik)
- Beasiswa BBM (Bantuan Biaya Mahasiswa)
- Beasiswa Bidikmisi/KIP Kuliah
- Beasiswa prestasi dari fakultas masing-masing
- Info beasiswa cek di website kemahasiswaan UNS

🎯 UKM (Unit Kegiatan Mahasiswa) Populer:
- UKM Olahraga: Basket, Futsal, Voli, Badminton
- UKM Seni: Paduan Suara, Tari, Teater
- UKM Akademik: LPM, BEM, Himpunan Mahasiswa
- UKM Kerohanian: IMM, PMII, HMI

📅 Kalender Akademik:
- Semester Ganjil: September - Januari
- Semester Genap: Februari - Juni
- UTS: Minggu ke-8 perkuliahan
- UAS: Minggu ke-16 perkuliahan

🏫 Fasilitas Kampus:
- Wifi kampus tersedia di seluruh area (UNS-Wifi)
- Kantin tersebar di setiap fakultas
- Asrama mahasiswa (untuk yang memenuhi syarat)
- Klinik kesehatan kampus
- Masjid Nurul Iman

Tugasmu:
- Jawab pertanyaan tentang ${university || 'kampus'} dengan informasi di atas
- Berikan panduan step-by-step jika diperlukan
- Jika ditanya hal spesifik yang tidak ada di data, sarankan untuk cek ke website resmi atau hubungi fakultas
- Gunakan bahasa Indonesia yang ramah, santai tapi profesional
- Selalu helpful dan informatif

Jika ada pertanyaan di luar konteks kampus, arahkan kembali ke topik kampus dengan sopan.`;

    // Get the Gemini model with system instruction
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-thinking-exp-1219',
      systemInstruction: campusSystemPrompt,
    });

    // Build conversation history - filter welcome messages
    let chatHistory = (history || [])
      .filter((msg: any) => {
        const content = msg.content || '';
        // Filter welcome message untuk mode kampus
        return !content.includes('Halo! Saya AI Campus Navigator');
      })
      .slice(-10) // Only keep last 10 messages for context
      .map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

    // Gemini requires history to start with 'user' role
    // Remove all leading 'model' messages
    while (chatHistory.length > 0 && chatHistory[0].role === 'model') {
      chatHistory = chatHistory.slice(1);
    }

    // Also ensure alternating pattern - remove consecutive same roles
    chatHistory = chatHistory.filter((msg, idx) => {
      if (idx === 0) return true;
      return msg.role !== chatHistory[idx - 1].role;
    });

    // Start chat with history
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    // Send message
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    console.log('Campus mode response generated successfully');
    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error('Error in campus chat API:', error);
    console.error('Error details:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
