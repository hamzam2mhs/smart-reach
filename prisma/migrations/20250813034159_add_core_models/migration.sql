/*
  Warnings:

  - You are about to drop the `Email` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."LeadStatus" AS ENUM ('ACTIVE', 'DO_NOT_CONTACT', 'LOST');

-- CreateEnum
CREATE TYPE "public"."DraftStatus" AS ENUM ('DRAFT', 'APPROVED', 'SENT');

-- CreateEnum
CREATE TYPE "public"."EmailStatus" AS ENUM ('QUEUED', 'SENT', 'DELIVERED', 'OPENED', 'BOUNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."InteractionType" AS ENUM ('EMAIL', 'NOTE', 'CALL', 'MEETING', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."ReminderState" AS ENUM ('PENDING', 'DONE', 'SNOOZED');

-- DropForeignKey
ALTER TABLE "public"."Email" DROP CONSTRAINT "Email_leadId_fkey";

-- AlterTable
ALTER TABLE "public"."Lead" ADD COLUMN     "company" TEXT,
ADD COLUMN     "nextSuggestedAt" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "status" "public"."LeadStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "tags" TEXT[],
ALTER COLUMN "email" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."Email";

-- CreateTable
CREATE TABLE "public"."EmailDraft" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "model" TEXT,
    "prompt" TEXT,
    "tokensUsed" INTEGER,
    "status" "public"."DraftStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailLog" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "provider" TEXT,
    "providerId" TEXT,
    "status" "public"."EmailStatus" NOT NULL DEFAULT 'QUEUED',
    "meta" JSONB,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Interaction" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "public"."InteractionType" NOT NULL,
    "content" TEXT,
    "meta" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reminder" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "state" "public"."ReminderState" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailLog_status_sentAt_idx" ON "public"."EmailLog"("status", "sentAt");

-- CreateIndex
CREATE INDEX "Interaction_type_occurredAt_idx" ON "public"."Interaction"("type", "occurredAt");

-- CreateIndex
CREATE INDEX "Reminder_state_dueAt_idx" ON "public"."Reminder"("state", "dueAt");

-- CreateIndex
CREATE INDEX "Lead_status_nextSuggestedAt_idx" ON "public"."Lead"("status", "nextSuggestedAt");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "public"."Lead"("email");

-- AddForeignKey
ALTER TABLE "public"."EmailDraft" ADD CONSTRAINT "EmailDraft_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailLog" ADD CONSTRAINT "EmailLog_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Interaction" ADD CONSTRAINT "Interaction_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reminder" ADD CONSTRAINT "Reminder_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
