
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(leads);
}

export async function POST(req: Request) {
    const body = await req.json();
    const lead = await prisma.lead.upsert({
        where: { ownerId_email: { ownerId: body.ownerId, email: body.email } },
        update: { ...body },
        create: { ...body },
    });
    return NextResponse.json(lead, { status: 201 });
}
