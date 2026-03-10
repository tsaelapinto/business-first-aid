-- CreateTable
CREATE TABLE "BusinessCase" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessName" TEXT,
    "ownerName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "industry" TEXT,
    "location" TEXT,
    "q1MainProblem" TEXT NOT NULL,
    "q2Severity" TEXT NOT NULL,
    "q3Changes" TEXT NOT NULL,
    "q4HelpNeeded" TEXT NOT NULL,
    "q5Urgency" TEXT NOT NULL,
    "severityScore" INTEGER NOT NULL,
    "categories" TEXT NOT NULL,
    "laneRecommended" TEXT NOT NULL,
    "diagnosisSummary" TEXT NOT NULL,
    "immediateActions" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "assignedTo" TEXT,
    "internalNotes" TEXT NOT NULL DEFAULT '',
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "BusinessCase_pkey" PRIMARY KEY ("id")
);
