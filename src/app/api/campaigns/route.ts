
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json(await prisma.campaign.findMany({ include: { steps: true } }));
}

export async function POST(req: Request) {
    const body = await req.json();
    const campaign = await prisma.campaign.create({ data: body });
    return NextResponse.json(campaign, { status: 201 });
}
