import { NextRequest, NextResponse } from "next/server";
import prisma, { db } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { authorization } = await req.json();
    
    if (authorization !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const intakeUsers = await prisma.dailyIntakeHistory.findMany({
      where: {
        date: {
          gte: new Date(yesterday.toDateString()),
          lt: new Date(new Date(yesterday).setDate(yesterday.getDate() + 1)),
        },
      },
      select: { userId: true },
      distinct: ['userId'],
    });

    const burnedUsers = await prisma.dailyBurnedCalories.findMany({
      where: {
        date: {
          gte: new Date(yesterday.toDateString()),
          lt: new Date(new Date(yesterday).setDate(yesterday.getDate() + 1)),
        },
      },
      select: { userId: true },
      distinct: ['userId'],
    });

    const allUserIds = new Set([
      ...intakeUsers.map((u: { userId: string }) => u.userId),
      ...burnedUsers.map((u: { userId: string }) => u.userId),
    ]);
    
    const activeUsers = Array.from(allUserIds).map(userId => ({ userId }));

    const resetPromises = activeUsers.map(async (user: { userId: string }) => {
      try {
        await db.resetDailyData(user.userId, yesterday);
      } catch (error) {
        console.error(`Failed to reset data for user ${user.userId}:`, error);
      }
    });

    await Promise.all(resetPromises);

    return NextResponse.json({
      message: "Daily reset completed",
      usersProcessed: activeUsers.length,
      date: yesterday.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error("Daily reset error:", error);
    return NextResponse.json(
      { error: "Failed to process daily reset" },
      { status: 500 }
    );
  }
}


export async function PUT(req: NextRequest) {
  try {
    const { userId, date } = await req.json();
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const resetDate = date ? new Date(date) : new Date();
    await db.resetDailyData(userId, resetDate);

    return NextResponse.json({
      message: "Manual reset completed",
      userId,
      date: resetDate.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error("Manual reset error:", error);
    return NextResponse.json(
      { error: "Failed to process manual reset" },
      { status: 500 }
    );
  }
}
