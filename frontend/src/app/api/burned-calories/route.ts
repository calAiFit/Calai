import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { z } from "zod";

const burnedCaloriesSchema = z.object({
  calories: z.number().min(0).max(5000),
  activity: z.string().min(1).max(100),
  duration: z.number().min(0).max(1440).optional(), // max 24 hours in minutes
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

    const burnedCalories = await db.getBurnedCalories(userId, date);
    const totalBurned = await db.getTotalBurnedCalories(userId, date);

    return NextResponse.json({ 
      burnedCalories, 
      totalBurned 
    });
  } catch (error) {
    console.error("GET /api/burned-calories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch burned calories" },
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
    const validatedData = burnedCaloriesSchema.parse(body);

    const burnedCaloriesRecord = await db.addBurnedCalories(userId, validatedData);
    
    // Update daily summary
    await db.updateDailySummary(userId);

    return NextResponse.json({ burnedCaloriesRecord });
  } catch (error) {
    console.error("POST /api/burned-calories error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add burned calories" },
      { status: 500 }
    );
  }
}
