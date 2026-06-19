import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { TAXBOT_SYSTEM_PROMPT } from '../../../lib/prompts';

export async function POST(req: NextRequest) {
  const { messages, userApiKey } = await req.json();

  // Use the user's own key if provided, otherwise fall back to the server's key
  const apiKey = userApiKey || process.env.GEMINI_API_KEY || '';

  if (!apiKey) {
    return NextResponse.json({ error: 'No API key configured. Please add your Gemini API key.' }, { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: TAXBOT_SYSTEM_PROMPT,
    });

    // Convert our message format to Gemini's format
    // Gemini uses 'user' and 'model' (not 'assistant')
    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    const text = result.response.text();

    return NextResponse.json({ content: text });
  } catch (error: any) {
    console.error('Error from Gemini API:', error);
    // Give a helpful message if the key is bad or quota exceeded
    const msg = error?.message || 'Something went wrong';
    if (msg.includes('API_KEY_INVALID') || msg.includes('API key')) {
      return NextResponse.json({ error: 'Invalid API key. Please check your Gemini API key.' }, { status: 401 });
    }
    if (msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json({ error: 'Daily free quota exceeded. Add your own API key to continue.' }, { status: 429 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
