import { openai } from '@/lib/openai';

type Lead = {
    name: string;
    email?: string;
    type: 'new' | 'returning';
    query?: string;            // for new leads
    lastService?: string;      // for returning
    lastServiceDate?: string;  // ISO date if available
};

export async function generateLeadEmail(input: { prompt?: string; lead: Lead }) {
    const { prompt, lead } = input;

    const system = `You are SmartReach, an assistant that writes short, friendly, professional emails.
- Keep it concise (120-180 words) with a clear subject and one CTA.
- Tone depends on lead.type: "new" = welcoming/intro; "returning" = appreciative/check-in.
- If returning and lastService/lastServiceDate are present, reference them naturally.
- Plain text only (no HTML). Do not invent facts.`;

    const messages = [
        { role: 'system', content: system },
        {
            role: 'user',
            content:
                `Write an email.\n\nUser Prompt: ${prompt ?? 'Create a helpful outreach email.'}\n\nLead JSON:\n` +
                JSON.stringify(lead, null, 2),
        },
    ] as const;

    const res = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        messages: messages as any,
    });

    return res.choices[0]?.message?.content ?? '';
}
