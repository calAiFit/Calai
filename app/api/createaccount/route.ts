"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";

const schemaCreateAccount = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    // Try to parse as JSON first
    let rawData: { email: string; password: string; name: string };
    try {
      rawData = await request.json();
    } catch {
      // If JSON fails, try FormData
      const formData = await request.formData();
      rawData = {
        email: formData.get("email")?.toString() ?? "",
        password: formData.get("password")?.toString() ?? "",
        name: formData.get("name")?.toString() ?? "",
      };
    }

    const validated = schemaCreateAccount.safeParse(rawData);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Create user
    const hashedPassword = await bcrypt.hash(validated.data.password, 10);
    const userId = crypto.randomUUID();
    const user = await prisma.user.create({
      data: {
        userId,
        email: validated.data.email,
        password: hashedPassword,
        name: validated.data.name,
      },
    });

    return NextResponse.json({
      message: "Account created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: unknown) {
    console.error("Error creating account:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
