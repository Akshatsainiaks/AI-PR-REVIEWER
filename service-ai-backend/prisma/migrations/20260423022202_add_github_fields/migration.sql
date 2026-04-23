-- AlterTable
ALTER TABLE "PrJob" ALTER COLUMN "status" SET DEFAULT 'analyzing';

-- AlterTable
ALTER TABLE "StepLog" ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "githubUsername" TEXT,
ALTER COLUMN "role" SET DEFAULT 2;

-- AddForeignKey
ALTER TABLE "PrJob" ADD CONSTRAINT "PrJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StepLog" ADD CONSTRAINT "StepLog_prId_fkey" FOREIGN KEY ("prId") REFERENCES "PrJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
