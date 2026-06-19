import { Anthropic } from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { TAXBOT_SYSTEM_PROMPT } from '../../../lib/prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      system: TAXBOT_SYSTEM_PROMPT,
      messages: messages,
    });

    return NextResponse.json({ content: response.content[0].type === 'text' ? response.content[0].text : '' });
  } catch (error) {
    console.error('Error from Anthropic API:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
