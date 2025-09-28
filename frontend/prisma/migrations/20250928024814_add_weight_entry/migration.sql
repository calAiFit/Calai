-- DropForeignKey
ALTER TABLE "public"."DailyBurnedCalories" DROP CONSTRAINT "DailyBurnedCalories_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DailyIntakeHistory" DROP CONSTRAINT "DailyIntakeHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DailySummary" DROP CONSTRAINT "DailySummary_userId_fkey";

-- CreateTable
CREATE TABLE "public"."WeightEntry" (
    "id" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeightEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."WeightEntry" ADD CONSTRAINT "WeightEntry_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "public"."Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
