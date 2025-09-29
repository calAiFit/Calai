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
    const dateParam = searchParams.get("date");
    const date = dateParam ? new Date(dateParam) : new Date();

    // Get or create daily summary
    let dailySummary = await db.getDailySummary(userId, date);
    if (!dailySummary) {
      dailySummary = await db.updateDailySummary(userId, date);
    }

    // Get burned calories for the day
    const burnedCalories = await db.getBurnedCalories(userId, date);
    const totalBurned = await db.getTotalBurnedCalories(userId, date);

    return NextResponse.json({ 
      dailySummary,
      burnedCalories,
      totalBurned
    });
  } catch (error) {
    console.error("GET /api/daily-summary error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily summary" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "reset") {
      const { date } = body;
      const resetDate = date ? new Date(date) : new Date();
      
      await db.resetDailyData(userId, resetDate);
      
      return NextResponse.json({ 
        message: "Daily data reset successfully",
        date: resetDate.toISOString().split('T')[0]
      });
    }

    if (action === "update") {
      const { date } = body;
      const updateDate = date ? new Date(date) : new Date();
      
      const dailySummary = await db.updateDailySummary(userId, updateDate);
      
      return NextResponse.json({ dailySummary });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST /api/daily-summary error:", error);
    return NextResponse.json(
      { error: "Failed to process daily summary action" },
      { status: 500 }
    );
  }
}
