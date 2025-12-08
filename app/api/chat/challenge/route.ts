import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Initialize Groq AI
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    console.log('Challenge API route called');
    const { message, history, topic } = await request.json();
    console.log('Message received:', message);
    console.log('Topic:', topic);

    if (!message) {
      console.error('No message provided');
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('API key not found in environment');
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    console.log('API key found, initializing Groq for challenge mode...');

    // System prompt untuk Challenge Me mode
    const challengeSystemPrompt = topic
      ? `Kamu adalah seorang debater profesional yang akan menjadi OPOSISI dari user terkait isu: "${topic}".

PERAN KAMU:
- Kamu HARUS mengambil posisi BERLAWANAN dengan pendapat user
- Berikan argumen yang kuat, logis, dan berdasarkan fakta untuk menantang pendapat user
- Ajukan pertanyaan kritis yang membuat user berpikir lebih dalam
- Gunakan data, statistik, atau contoh nyata untuk memperkuat argumenmu
- Bersikap sopan tapi tegas dalam berdebat
- Tunjukkan kelemahan dalam argumen user dengan cara yang konstruktif
- Jika user mengubah pendapat, tantang posisi barunya

TUJUAN:
- Melatih kemampuan berpikir kritis user
- Membantu user melihat perspektif berbeda
- Mengasah kemampuan berargumentasi user

GAYA KOMUNIKASI:
- Gunakan bahasa Indonesia yang formal tapi tidak kaku
- Berikan fakta dan logika yang kuat
- Jangan ragu untuk menantang asumsi user
- Akhiri dengan pertanyaan yang memancing pemikiran lebih dalam

Ingat: Tujuanmu adalah menjadi oposisi yang baik untuk melatih kemampuan debat user, bukan untuk menang atau mengalahkan user.`
      : `Halo! Selamat datang di mode Challenge Me!

Di mode ini, saya akan menjadi oposisi dari pendapat kamu. Tujuannya adalah melatih kemampuan berpikir kritis dan berargumentasi kamu.

Silakan beritahu saya isu atau topik apa yang ingin kita diskusikan hari ini?

Contoh topik:
- "AI akan menggantikan semua pekerjaan manusia"
- "Media sosial lebih banyak dampak negatifnya"
- "Pendidikan online lebih efektif dari tatap muka"
- Atau topik apapun yang ingin kamu bahas!

Setelah kamu memberikan topik, saya akan mengambil posisi berlawanan dan kita bisa mulai berdiskusi. 🎯`;

    // Build conversation history - filter welcome messages
    const chatHistory = (history || [])
      .filter((msg: any) => {
        const content = msg.content || '';
        // Filter welcome message untuk challenge mode
        return !content.includes('Selamat datang di mode Challenge Me');
      })
      .slice(-10) // Only keep last 10 messages for context
      .map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

    // Build messages array with system prompt
    const messages = [
      {
        role: 'system' as const,
        content: challengeSystemPrompt,
      },
      ...chatHistory,
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile', // Fast and good quality for debate
      temperature: 0.8, // Slightly higher for more dynamic responses
      max_tokens: 1200,
      top_p: 1,
    });

    const text = completion.choices[0]?.message?.content || 'Maaf, tidak ada respons.';

    console.log('Challenge mode response generated successfully');
    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error('Error in challenge chat API:', error);
    console.error('Error details:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
