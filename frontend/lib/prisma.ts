import { PrismaClient } from "@prisma/client";


const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  errorFormat: "pretty",
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


export const db = {
  async getProfileByUserId(userId: string) {
    return prisma.profile.findUnique({
      where: { userId },
    });
  },

  async upsertProfile(userId: string, data: {
    name: string;
    age?: number;
    gender?: string;
    height?: number;
    weight?: number;
    targetWeight?: number;
    activityLevel?: string;
    avatarUrl: string;
  }) {
    return prisma.profile.upsert({
      where: { userId },
      update: data,
      create: { 
        userId, 
        name: data.name,
        avatarUrl: data.avatarUrl,
        ...(data.age && { age: data.age }),
        ...(data.gender && { gender: data.gender }),
        ...(data.height && { height: data.height }),
        ...(data.weight && { weight: data.weight }),
        ...(data.targetWeight && { targetWeight: data.targetWeight }),
        ...(data.activityLevel && { activityLevel: data.activityLevel }),
      },
    });
  },

  async getDailyGoal(userId: string, date: Date) {
    return prisma.dailyGoal.findUnique({
      where: {
        userId_date: {
          userId,
          date: new Date(date.toDateString()),
        },
      },
    });
  },

  async upsertDailyGoal(userId: string, date: Date, data: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }) {
    return prisma.dailyGoal.upsert({
      where: {
        userId_date: {
          userId,
          date: new Date(date.toDateString()),
        },
      },
      update: data,
      create: { userId, date: new Date(date.toDateString()), ...data },
    });
  },

  async addIntakeHistory(userId: string, data: {
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }) {
    const intakeRecord = await prisma.dailyIntakeHistory.create({
      data: {
        userId,
        date: new Date(),
        ...data,
      },
    });
    

    await this.updateDailySummary(userId);
    
    return intakeRecord;
  },

  async getIntakeHistory(userId: string, date?: Date) {
    const targetDate = date || new Date();
    return prisma.dailyIntakeHistory.findMany({
      where: {
        userId,
        date: {
          gte: new Date(targetDate.toDateString()),
          lt: new Date(new Date(targetDate).setDate(targetDate.getDate() + 1)),
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async addWorkout(userId: string, data: {
    duration: number;
    calories: number;
    exercises: string[];
  }) {
    return prisma.workout.create({
      data: {
        userId,
        date: new Date(),
        ...data,
      },
    });
  },

  async getWorkouts(userId: string, limit = 10) {
    return prisma.workout.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: limit,
    });
  },


  async addFoodRecognition(userId: string, data: {
    imageUrl: string;
    foodName: string;
    confidence: number;
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  }) {
    return prisma.foodRecognition.create({
      data: {
        userId,
        ...data,
      },
    });
  },

  async getFoodRecognitions(userId: string, limit = 10) {
    return prisma.foodRecognition.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },


  async getWeeklyIntakeSummary(userId: string) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return prisma.dailyIntakeHistory.groupBy({
      by: ["date"],
      where: {
        userId,
        date: { gte: weekAgo },
      },
      _sum: {
        calories: true,
        protein: true,
        carbs: true,
        fats: true,
      },
      orderBy: { date: "asc" },
    });
  },

  async getMonthlyWorkoutSummary(userId: string) {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return prisma.workout.findMany({
      where: {
        userId,
        date: { gte: monthAgo },
      },
      orderBy: { date: "desc" },
    });
  },


  async addBurnedCalories(userId: string, data: {
    calories: number;
    activity: string;
    duration?: number;
  }) {
    const today = new Date();
    return prisma.dailyBurnedCalories.upsert({
      where: {
        userId_date_activity: {
          userId,
          date: new Date(today.toDateString()),
          activity: data.activity,
        },
      },
      update: {
        calories: { increment: data.calories },
        duration: data.duration ? { increment: data.duration } : undefined,
      },
      create: {
        userId,
        date: new Date(today.toDateString()),
        ...data,
      },
    });
  },

  async getBurnedCalories(userId: string, date?: Date) {
    const targetDate = date || new Date();
    return prisma.dailyBurnedCalories.findMany({
      where: {
        userId,
        date: {
          gte: new Date(targetDate.toDateString()),
          lt: new Date(new Date(targetDate).setDate(targetDate.getDate() + 1)),
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getTotalBurnedCalories(userId: string, date?: Date) {
    const targetDate = date || new Date();
    const result = await prisma.dailyBurnedCalories.aggregate({
      where: {
        userId,
        date: {
          gte: new Date(targetDate.toDateString()),
          lt: new Date(new Date(targetDate).setDate(targetDate.getDate() + 1)),
        },
      },
      _sum: {
        calories: true,
      },
    });
    return result._sum.calories || 0;
  },


  async getDailySummary(userId: string, date?: Date) {
    const targetDate = date || new Date();
    return prisma.dailySummary.findUnique({
      where: {
        userId_date: {
          userId,
          date: new Date(targetDate.toDateString()),
        },
      },
    });
  },

  async updateDailySummary(userId: string, date?: Date) {
    const targetDate = date || new Date();
    const dateStr = new Date(targetDate.toDateString());
    

    const consumedResult = await prisma.dailyIntakeHistory.aggregate({
      where: {
        userId,
        date: {
          gte: dateStr,
          lt: new Date(new Date(targetDate).setDate(targetDate.getDate() + 1)),
        },
      },
      _sum: {
        calories: true,
        protein: true,
        carbs: true,
        fats: true,
      },
    });


    const burnedResult = await prisma.dailyBurnedCalories.aggregate({
      where: {
        userId,
        date: {
          gte: dateStr,
          lt: new Date(new Date(targetDate).setDate(targetDate.getDate() + 1)),
        },
      },
      _sum: {
        calories: true,
      },
    });

    const totalConsumed = consumedResult._sum.calories || 0;
    const totalBurned = burnedResult._sum.calories || 0;
    const netCalories = totalConsumed - totalBurned;

    return prisma.dailySummary.upsert({
      where: {
        userId_date: {
          userId,
          date: dateStr,
        },
      },
      update: {
        totalConsumed,
        totalBurned,
        netCalories,
        protein: consumedResult._sum.protein || 0,
        carbs: consumedResult._sum.carbs || 0,
        fats: consumedResult._sum.fats || 0,
      },
      create: {
        userId,
        date: dateStr,
        totalConsumed,
        totalBurned,
        netCalories,
        protein: consumedResult._sum.protein || 0,
        carbs: consumedResult._sum.carbs || 0,
        fats: consumedResult._sum.fats || 0,
      },
    });
  },


  async getHistoricalData(userId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return prisma.dailySummary.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: "desc" },
    });
  },


  async resetDailyData(userId: string, date: Date) {

    await this.updateDailySummary(userId, date);
    
  },

  async getWeightEntries(profileId: string) {
    console.log("Fetching weight entries for profileId:", profileId);
    const result = await prisma.weightEntry.findMany({
      where: { profileId },
      orderBy: { date: "asc" },
    });
    console.log("Found weight entries:", result.length);
    return result;
  },

  async addWeightEntry(profileId: string, weight: number) {
    console.log("Adding weight entry to database:", { profileId, weight });
    const result = await prisma.weightEntry.create({
      data: {
        profileId,
        weight,
        date: new Date(),
      },
    });
    console.log("Weight entry created:", result);
    return result;
  },
};

export default prisma;
