import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { z } from "zod";

const weightEntrySchema = z.object({
  weight: z.number().min(20).max(500), // kg
  profileId: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const profileId = searchParams.get("profileId");

    if (!profileId) {
      return NextResponse.json(
        { error: "profileId is required" },
        { status: 400 }
      );
    }

    const weightEntries = await db.getWeightEntries(profileId);
    console.log("GET /api/weight - Found entries:", weightEntries.length);
    console.log("GET /api/weight - Entries data:", weightEntries);

    return NextResponse.json({ weightEntries });
  } catch (error) {
    console.error("GET /api/weight error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weight entries" },
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
    console.log("POST /api/weight - Request body:", body);
    
    const validatedData = weightEntrySchema.parse(body);
    console.log("POST /api/weight - Validated data:", validatedData);

    const weightEntry = await db.addWeightEntry(validatedData.profileId, validatedData.weight);
    console.log("POST /api/weight - Created entry:", weightEntry);

    return NextResponse.json({ weightEntry });
  } catch (error) {
    console.error("POST /api/weight error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add weight entry" },
      { status: 500 }
    );
  }
}
