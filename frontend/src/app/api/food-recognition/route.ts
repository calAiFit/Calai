import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { z } from "zod";

const foodRecognitionSchema = z.object({
  imageUrl: z.string(),
  foodName: z.string().min(1),
  confidence: z.number().min(0).max(1),
  calories: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fats: z.number().min(0).optional(),
});

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const recognitions = await db.getFoodRecognitions(userId, limit);

    return NextResponse.json({ recognitions });
  } catch (error) {
    console.error("GET /api/food-recognition error:", error);
    return NextResponse.json(
      { error: "Failed to fetch food recognitions" },
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
    const validatedData = foodRecognitionSchema.parse(body);

    const recognition = await db.addFoodRecognition(userId, validatedData);

    return NextResponse.json({ recognition });
  } catch (error) {
    console.error("POST /api/food-recognition error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add food recognition" },
      { status: 500 }
    );
  }
}
