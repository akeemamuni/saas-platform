/*
  Warnings:

  - The values [CANCELED,INCOMPLETE,TRIALING] on the enum `SubscriptionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `stripeProductId` on the `Plan` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `trialEndsAt` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionStatus_new" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED');
ALTER TABLE "Subscription" ALTER COLUMN "status" TYPE "SubscriptionStatus_new" USING ("status"::text::"SubscriptionStatus_new");
ALTER TYPE "SubscriptionStatus" RENAME TO "SubscriptionStatus_old";
ALTER TYPE "SubscriptionStatus_new" RENAME TO "SubscriptionStatus";
DROP TYPE "SubscriptionStatus_old";
COMMIT;

-- DropIndex
DROP INDEX "Subscription_stripeSubId_key";

-- AlterTable
ALTER TABLE "Plan" DROP COLUMN "stripeProductId";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "stripeSubId",
DROP COLUMN "trialEndsAt";
