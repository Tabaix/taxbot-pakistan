import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { TAXBOT_SYSTEM_PROMPT } from '../../../lib/prompts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

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
  } catch (error) {
    console.error('Error from Gemini API:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
