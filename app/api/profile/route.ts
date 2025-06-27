import { NextRequest, NextResponse } from "next/server";
import { getAuth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { User } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuth(req);
    const { userId } = auth;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate input types
    if (
      typeof body.age !== "number" ||
      typeof body.height !== "number" ||
      typeof body.weight !== "number" ||
      typeof body.targetWeight !== "number" ||
      !["male", "female"].includes(body.gender) ||
      !["sedentary", "light", "moderate", "active", "veryActive"].includes(
        body.activityLevel
      )
    ) {
      return NextResponse.json(
        { error: "Invalid input. Please check all fields." },
        { status: 400 }
      );
    }

    // Prepare profile data
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const data = {
      name: user?.firstName || "Anonymous",
      age: body.age,
      gender: body.gender,
      height: body.height,
      weight: body.weight,
      targetWeight: body.targetWeight,
      activityLevel: body.activityLevel,
      avatarUrl: user?.imageUrl || "",
    };

    // Create or update profile
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("POST /api/profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile. Please try again." },
      { status: 500 }
    );
  }
}
