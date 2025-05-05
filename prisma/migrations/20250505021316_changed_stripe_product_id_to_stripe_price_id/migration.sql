/*
  Warnings:

  - You are about to drop the column `stripeProductId` on the `Plan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripePriceId]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Plan_stripeProductId_key";

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "stripeProductId",
ADD COLUMN     "stripePriceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripePriceId_key" ON "Plan"("stripePriceId");
