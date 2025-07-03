import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { User } from '@prisma/client';
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user exists in our database
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = crypto.randomUUID();
      const newUser = await prisma.user.create({
        data: {
          userId,
          email,
          password: hashedPassword,
          name: email.split('@')[0],
        },
      });

      return NextResponse.json({
        message: "User created successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      });
    }

    // Check password for existing user
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found in our database" },
        { status: 404 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, existingUser.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Update last login time
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      message: "Sign in successful",
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
      },
    });
  } catch (error: unknown) {
    console.error('Sign-in error:', error);
    return NextResponse.json(
      { error: "An error occurred during sign-in" },
      { status: 500 }
    );
  }
}
