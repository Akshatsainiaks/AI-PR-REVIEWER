/*
  Warnings:

  - You are about to drop the `PRJob` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PRJob";

-- CreateTable
CREATE TABLE "PrJob" (
    "id" TEXT NOT NULL,
    "prUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrJob_pkey" PRIMARY KEY ("id")
);
