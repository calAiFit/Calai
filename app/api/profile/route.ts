// app/api/profile/route.ts
"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const schemaUserProfile = z.object({
  age: z.number().optional(),
  gender: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  targetWeight: z.number().optional(),
  activityLevel: z.string().optional(),
});

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      profile: user.profile,
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const rawData = {
      name: formData.get("name"),
      about: formData.get("about"),
      socialMediaURL: formData.get("socialMediaURL"),
      avatarImage: formData.get("avatarImage"),
    };

    const validated = schemaUserProfile.safeParse(rawData);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const avatarImageUrl = (formData.get("avatarImage") as string) ?? "";

    const profile = await prisma.profile.create({
      data: {
        userId,
        ...validated.data,
      },
    });

    return NextResponse.json({
      message: "Profile created successfully",
      profile,
    });
  } catch (error) {
    console.error("Profile POST error:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}
