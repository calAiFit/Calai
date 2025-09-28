import { NextRequest, NextResponse } from "next/server";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
  age: z.number().min(1).max(120),
  gender: z.enum(["male", "female"]),
  height: z.number().min(50).max(300), // cm
  weight: z.number().min(20).max(500), // kg
  targetWeight: z.number().min(20).max(500), // kg
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "veryActive"]),
});

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    console.log("Profile GET - userId:", userId);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db.getProfileByUserId(userId);
    console.log("Profile GET - profile:", profile);

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    console.log("Profile POST - userId:", userId);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Profile POST - body:", body);
    
    const validatedData = profileSchema.parse(body);
    console.log("Profile POST - validatedData:", validatedData);

    // Prepare profile data
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    console.log("Profile POST - clerk user:", user);
    
    const data = {
      name: user?.firstName || "Anonymous",
      ...validatedData,
      avatarUrl: user?.imageUrl || "",
    };
    console.log("Profile POST - data to save:", data);

    // Create or update profile using database utility
    const profile = await db.upsertProfile(userId, data);
    console.log("Profile POST - saved profile:", profile);

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("POST /api/profile error:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile. Please try again.", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
