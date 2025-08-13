// src/app/api/email/queue/route.ts
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const data = await req.json(); // { leadId?, toEmail, subject, bodyHtml?, bodyText?, campaignId?, senderId? }
    const log = await prisma.emailLog.create({ data });
    return NextResponse.json(log, { status: 201 });
}
