
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { leadId, campaignId, nextSendAt } = await req.json();
    const e = await prisma.leadCampaignEnrollment.upsert({
        where: { leadId_campaignId: { leadId, campaignId } },
        update: { active: true, nextSendAt },
        create: { leadId, campaignId, nextSendAt },
    });
    return NextResponse.json(e, { status: 201 });
}
