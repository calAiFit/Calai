import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { z } from "zod";

const workoutSchema = z.object({
  duration: z.number().min(1).max(1440), // max 24 hours in minutes
  calories: z.number().min(0).max(10000),
  exercises: z.array(z.string()).min(1),
  date: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const workouts = await db.getWorkouts(userId, limit);

    return NextResponse.json({ workouts });
  } catch (error) {
    console.error("GET /api/workouts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch workouts" },
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
    const validatedData = workoutSchema.parse(body);

    const workout = await db.addWorkout(userId, validatedData);

    return NextResponse.json({ workout });
  } catch (error) {
    console.error("POST /api/workouts error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add workout" },
      { status: 500 }
    );
  }
}
