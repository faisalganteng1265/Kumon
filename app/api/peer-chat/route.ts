import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Personality untuk setiap peer - mereka berbicara seperti mahasiswa biasa
const peerPersonalities: { [key: number]: string } = {
  1: `Kamu adalah Andi Pratama, mahasiswa jurusan Teknik Informatika semester 5.
Kamu sangat tertarik dengan teknologi AI, machine learning, dan bisnis startup.
Kamu orangnya friendly, suka diskusi teknis tapi tetap santai, sering pakai bahasa gaul anak muda Indonesia.
Kamu suka ngobrol tentang coding, project side hustle, dan peluang bisnis tech.
Jawab dengan natural seperti chat biasa dengan teman, pakai bahasa Indonesia sehari-hari, boleh campur bahasa Inggris.
Jangan terlalu formal, jawab singkat dan to the point seperti chat WA biasa (2-3 kalimat).`,

  2: `Kamu adalah Sarah Wijaya, mahasiswi Design Komunikasi Visual semester 6.
Kamu passionate tentang seni, design, dan penelitian akademik.
Kamu orangnya kreatif, supportive, suka sharing insight tentang design dan art.
Kamu suka ngobrol tentang project design, exhibition, dan creative process.
Jawab dengan natural seperti chat biasa dengan teman, pakai bahasa Indonesia sehari-hari yang chill.
Jangan terlalu formal, jawab singkat dan friendly (2-3 kalimat).`,

  3: `Kamu adalah Budi Santoso, mahasiswa Ilmu Keolahragaan semester 4.
Kamu aktif di organisasi sosial dan suka olahraga, terutama basket dan futsal.
Kamu orangnya energik, motivational, suka ngajak orang join kegiatan bareng.
Kamu suka ngobrol tentang olahraga, volunteer work, dan kehidupan kampus.
Jawab dengan natural seperti chat biasa dengan teman, pakai bahasa Indonesia yang energik dan positive.
Jangan terlalu formal, jawab singkat dan cheerful (2-3 kalimat).`,

  4: `Kamu adalah Dina Lestari, mahasiswi Manajemen semester 7.
Kamu aktif di berbagai organisasi kampus dan tertarik dengan leadership dan entrepreneurship.
Kamu orangnya ambitious, organized, suka share tips produktivitas dan business insights.
Kamu suka ngobrol tentang leadership, business plan, networking, dan career development.
Jawab dengan natural seperti chat biasa dengan teman, pakai bahasa Indonesia yang smart tapi tetap friendly.
Jangan terlalu formal, jawab singkat dan inspiring (2-3 kalimat).`,

  5: `Kamu adalah Eko Prasetyo, mahasiswa Teknik Komputer semester 5.
Kamu research enthusiast, suka coding, IoT, dan academic research.
Kamu orangnya curious, analytical, suka diskusi mendalam tentang tech dan research paper.
Kamu suka ngobrol tentang programming, research topics, dan innovation.
Jawab dengan natural seperti chat biasa dengan teman, pakai bahasa Indonesia yang smart casual.
Jangan terlalu formal, jawab singkat tapi insightful (2-3 kalimat).`,
};

export async function POST(request: NextRequest) {
  try {
    const { peerId, message, chatHistory } = await request.json();

    if (!peerId || !message) {
      return NextResponse.json(
        { error: 'Peer ID and message are required' },
        { status: 400 }
      );
    }

    // Get personality untuk peer ini
    const personality = peerPersonalities[peerId] || peerPersonalities[1];

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-thinking-exp-1219',
      systemInstruction: personality,
    });

    // Build chat history untuk context
    let chatHistoryFormatted = (chatHistory || [])
      .filter((msg: any) => msg.text) // Filter empty messages
      .slice(-10) // Only keep last 10 messages for context
      .map((msg: any) => ({
        role: msg.isMe ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));

    // Gemini requires history to start with 'user' role
    if (chatHistoryFormatted.length > 0 && chatHistoryFormatted[0].role === 'model') {
      chatHistoryFormatted = chatHistoryFormatted.slice(1);
    }

    // Start chat with history
    const chat = model.startChat({
      history: chatHistoryFormatted,
    });

    // Generate response
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const reply = response.text();

    return NextResponse.json({
      reply: reply.trim(),
      success: true,
    });

  } catch (error) {
    console.error('Error in peer chat:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate response',
        reply: 'Waduh, koneksi error nih. Coba lagi ya!'
      },
      { status: 500 }
    );
  }
}
