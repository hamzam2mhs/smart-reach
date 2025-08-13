// src/lib/email.ts
export async function sendEmail(_: {
    to: string; subject: string; html?: string; text?: string;
}) {
    // No-op stub
    return { id: `stub_${Date.now()}` };
}
