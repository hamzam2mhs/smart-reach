import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';

export async function GET() {
    try {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const completion = await client.chat.completions.create({
            model: 'gpt-3.5-turbo',
            temperature: 0,
            max_tokens: 5,
            messages: [{ role: 'user', content: 'Reply with the single word: pong' }],
        });
        const reply = completion.choices[0]?.message?.content ?? '';
        return NextResponse.json({ ok: true, reply });
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: err?.message ?? 'Unknown error' }, { status: 500 });
    }
}
