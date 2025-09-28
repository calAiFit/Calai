import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { z } from "zod";

const dailyGoalSchema = z.object({
  calories: z.number().min(0).max(10000),
  protein: z.number().min(0).max(1000),
  carbs: z.number().min(0).max(1000),
  fats: z.number().min(0).max(1000),
  date: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    const date = dateParam ? new Date(dateParam) : new Date();

    const dailyGoal = await db.getDailyGoal(userId, date);

    return NextResponse.json({ dailyGoal });
  } catch (error) {
    console.error("GET /api/daily-goals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily goals" },
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
    const validatedData = dailyGoalSchema.parse(body);

    const date = validatedData.date ? new Date(validatedData.date) : new Date();
    const { date: _date, ...goalData } = validatedData;
    

    void _date;

    const dailyGoal = await db.upsertDailyGoal(userId, date, goalData);

    return NextResponse.json({ dailyGoal });
  } catch (error) {
    console.error("POST /api/daily-goals error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create/update daily goals" },
      { status: 500 }
    );
  }
}
