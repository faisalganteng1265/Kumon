import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    console.log('General API route called');
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

    console.log('API key found, initializing Gemini for general mode...');

    // System prompt untuk mode umum (general)
    const generalSystemPrompt = `Kamu adalah asisten AI yang cerdas dan membantu.
Jawab pertanyaan dengan informatif, akurat, dan ramah.
Gunakan bahasa Indonesia yang baik dan mudah dipahami.
Kamu bisa menjawab berbagai topik: teknologi, sains, budaya, kehidupan sehari-hari, dan lainnya.`;

    // Get the Gemini model with system instruction
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-thinking-exp-1219',
      systemInstruction: generalSystemPrompt,
    });

    // Build conversation history - filter welcome messages
    let chatHistory = (history || [])
      .filter((msg: any) => {
        const content = msg.content || '';
        // Filter welcome message untuk mode umum
        return !content.includes('Halo! Saya asisten AI yang siap membantu');
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

    console.log('General mode response generated successfully');
    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error('Error in general chat API:', error);
    console.error('Error details:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
