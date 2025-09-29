import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { z } from "zod";

const intakeHistorySchema = z.object({
  foodName: z.string().min(1),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fats: z.number().min(0),
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

    const intakeHistory = await db.getIntakeHistory(userId, date);

    return NextResponse.json({ intakeHistory });
  } catch (error) {
    console.error("GET /api/intake-history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch intake history" },
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
    const validatedData = intakeHistorySchema.parse(body);

    const intakeRecord = await db.addIntakeHistory(userId, validatedData);

    return NextResponse.json({ intakeRecord });
  } catch (error) {
    console.error("POST /api/intake-history error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add intake record" },
      { status: 500 }
    );
  }
}
