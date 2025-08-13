// src/app/api/cron/send-due-emails/route.ts
import prisma from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) return new NextResponse("Unauthorized", { status: 401 });

    const now = new Date();
    const due = await prisma.leadCampaignEnrollment.findMany({
        where: { active: true, nextSendAt: { lte: now } },
        include: { campaign: { include: { steps: true } }, lead: true },
    });

    // For each due enrollment, pick next step → create EmailLog(status=QUEUED) and bump nextSendAt
    // (Keep simple here; you’ll plug in a provider in step 4.)
    // ...

    return NextResponse.json({ queued: due.length });
}
