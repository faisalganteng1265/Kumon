import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    console.log('AICAMPUS API route called');
    const { message, history } = await request.json();
    console.log('Message received:', message);

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

    console.log('API key found, initializing Gemini for AICAMPUS mode...');

    // System prompt untuk mode AICAMPUS
    const aicampusSystemPrompt = `Kamu adalah AI Assistant untuk aplikasi web AICAMPUS.

INFORMASI TENTANG AICAMPUS:

🎯 Tentang AICAMPUS:
AICAMPUS adalah platform asisten virtual berbasis AI yang dirancang khusus untuk membantu mahasiswa dalam kehidupan kampus. Platform ini mengintegrasikan berbagai fitur cerdas untuk mendukung aktivitas akademik dan non-akademik mahasiswa.

🌟 Fitur Utama AICAMPUS:

1. AI Campus Navigator:
- Chatbot cerdas untuk menjawab pertanyaan seputar kampus
- Informasi tentang KRS, gedung, dosen, beasiswa, UKM
- Panduan step-by-step untuk prosedur akademik

2. Event Recommender:
- Rekomendasi event personal berdasarkan minat dan jurusan
- Filter event: seminar, lomba, workshop, volunteering
- Notifikasi event yang sesuai dengan profil

3. Smart Schedule Builder:
- Pembuat jadwal kuliah otomatis dengan AI
- Deteksi bentrok jadwal
- Optimasi waktu belajar dan istirahat
- Integrasi dengan kalender akademik

4. Peer Connect AI:
- Sistem pencocokan mentor dan teman belajar
- Berdasarkan minat, jurusan, dan tujuan karir
- Networking yang berkualitas di kampus

💡 Cara Menggunakan AICAMPUS:

1. Buka website AICAMPUS di browser
2. Pilih fitur yang diinginkan dari menu navigasi
3. Ikuti panduan interaktif untuk setiap fitur
4. Gunakan chatbot untuk bantuan instan

🔧 Teknologi yang Digunakan:
- AI/ML untuk personalisasi konten
- Natural Language Processing untuk chatbot
- Algoritma matching untuk Peer Connect
- Analitik prediktif untuk rekomendasi

📱 Keunggulan AICAMPUS:
- User-friendly interface dengan desain modern
- Responsif di berbagai perangkat
- Update konten real-time
- Keamanan data terjamin

💰 Harga dan Paket:
- Paket Gratis: Akses ke semua fitur dasar
- Paket Premium: Fitur tambahan dengan harga terjangkau untuk mahasiswa

📞 Bantuan dan Dukungan:
- FAQ interaktif dengan chatbot
- Email support: support@aicampus.id
- Tutorial video untuk setiap fitur

Tugasmu:
- Jawab pertanyaan tentang aplikasi AICAMPUS dengan informasi di atas
- Berikan panduan step-by-step cara menggunakan fitur-fitur AICAMPUS
- Jelaskan keunggulan dan manfaat AICAMPUS untuk mahasiswa
- Gunakan bahasa Indonesia yang ramah, santai tapi profesional
- Selalu helpful dan informatif

Jika ada pertanyaan di luar konteks AICAMPUS, berikan pesan:
"Maaf, saya hanya chatbot AICAMPUS yang bisa menyediakan jawaban seputar aplikasi AICAMPUS. Saya dapat membantu Anda dengan informasi tentang fitur-fitur AICAMPUS, cara penggunaan, keunggulan, dan panduan lainnya terkait aplikasi ini."`;

    // Get the Gemini model with system instruction
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-thinking-exp-1219',
      systemInstruction: aicampusSystemPrompt,
    });

    // Build conversation history - filter welcome messages
    let chatHistory = (history || [])
      .filter((msg: any) => {
        const content = msg.content || '';
        // Filter welcome message untuk mode AICAMPUS
        return !content.includes('Halo! Saya AI Assistant untuk aplikasi web AICAMPUS');
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

    console.log('AICAMPUS mode response generated successfully');
    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error('Error in AICAMPUS chat API:', error);
    console.error('Error details:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}