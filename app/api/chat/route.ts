// app/api/chat/route.ts
//
// Server-side proxy for the AI chat. Uses YOUR Gemini API key (from env var),
// so visitors never see or enter a key. Includes basic per-IP rate limiting
// so one visitor can't burn through your whole day's free quota.
//
// SETUP:
// 1. Get a free key at https://aistudio.google.com/app/apikey
// 2. In Vercel: Project Settings → Environment Variables → add
//      GEMINI_API_KEY = your_key_here
// 3. Redeploy.
//
// Gemini's free tier (gemini-2.0-flash) is generous (per-minute and per-day
// request limits, no cost) — fine for a low-to-moderate traffic site. If you
// outgrow it, you'll see 429 errors and can upgrade to a paid Gemini tier
// without changing any of this code.

import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { TAXBOT_SYSTEM_PROMPT } from '@/lib/prompts';

// --- Simple in-memory rate limiter ---------------------------------------
// NOTE: this resets on cold start / redeploy and isn't shared across
// serverless instances. It's a basic abuse guard, not a precise limiter.
// Good enough for an MVP; swap for Upstash/Redis later if traffic grows.
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 8;   // per IP per minute
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Bohat zyada messages bhej diye — thodi der ruk kar try karein.' },
      { status: 429 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Server not configured: GEMINI_API_KEY missing.' },
      { status: 500 }
    );
  }

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: TAXBOT_SYSTEM_PROMPT,
    });

    // Convert our {role, content} history into Gemini's chat format.
    // Gemini uses 'user' / 'model' roles (not 'assistant').
    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    const text = result.response.text();

    return NextResponse.json({ content: text });
  } catch (err) {
    console.error('Gemini chat error:', err);
    return NextResponse.json(
      { error: 'AI se connection nahi hua — thodi der baad try karein.' },
      { status: 500 }
    );
  }
}