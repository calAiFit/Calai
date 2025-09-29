import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    let analytics;

    switch (type) {
      case "weekly-intake":
        analytics = await db.getWeeklyIntakeSummary(userId);
        break;
      case "monthly-workouts":
        analytics = await db.getMonthlyWorkoutSummary(userId);
        break;
      default:
        // Return comprehensive analytics
        const [weeklyIntake, monthlyWorkouts] = await Promise.all([
          db.getWeeklyIntakeSummary(userId),
          db.getMonthlyWorkoutSummary(userId),
        ]);
        
        analytics = {
          weeklyIntake,
          monthlyWorkouts,
        };
    }

    return NextResponse.json({ analytics });
  } catch (error) {
    console.error("GET /api/analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
