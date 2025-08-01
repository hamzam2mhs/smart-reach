import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateLeadEmail } from '@/server/services/AiService';

export const runtime = 'nodejs';

const Body = z.object({
    prompt: z.string().optional(),
    lead: z.object({
        name: z.string(),
        email: z.string().email().optional(),
        type: z.enum(['new', 'returning']),
        query: z.string().optional(),
        lastService: z.string().optional(),
        lastServiceDate: z.string().optional(),
    }),
});

export async function POST(req: NextRequest) {
    try {
        const body = Body.parse(await req.json());
        const text = await generateLeadEmail(body);
        return NextResponse.json({ ok: true, text });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
    }
}
