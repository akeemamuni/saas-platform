/*
  Warnings:

  - A unique constraint covering the columns `[stripeProductId]` on the table `Plan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Plan" ADD COLUMN     "stripeProductId" TEXT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "stripeSubId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripeProductId_key" ON "Plan"("stripeProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubId_key" ON "Subscription"("stripeSubId");
