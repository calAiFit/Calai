-- CreateTable
CREATE TABLE "public"."DailyBurnedCalories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "calories" INTEGER NOT NULL,
    "activity" TEXT NOT NULL,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyBurnedCalories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DailySummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalConsumed" INTEGER NOT NULL DEFAULT 0,
    "totalBurned" INTEGER NOT NULL DEFAULT 0,
    "netCalories" INTEGER NOT NULL DEFAULT 0,
    "protein" INTEGER NOT NULL DEFAULT 0,
    "carbs" INTEGER NOT NULL DEFAULT 0,
    "fats" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailySummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyBurnedCalories_userId_date_activity_key" ON "public"."DailyBurnedCalories"("userId", "date", "activity");

-- CreateIndex
CREATE UNIQUE INDEX "DailySummary_userId_date_key" ON "public"."DailySummary"("userId", "date");
