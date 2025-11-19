"use server";

import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import crypto from "crypto";

const prisma = new PrismaClient();

const schemaUser = z.object({
  email: z.string().email().min(1),
  name: z.string().min(1),
});

export const createUser = async (formData: FormData) => {
  try {
    const rawData = {
      email: formData.get("email"),
      name: formData.get("name"),
    };

    const validated = schemaUser.safeParse(rawData);
    if (!validated.success) {
      return {
        ZodError: validated.error.flatten().fieldErrors,
      };
    }

    // Generate unique userId
    const userId = crypto.randomUUID();

    // Hash password
    // Create user (no password needed since we use Clerk)
    const user = await prisma.user.create({
      data: {
        userId,
        email: validated.data.email,
      },
    });

    return { message: "User created successfully", user };
  } catch (error: unknown) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Email already exists" };
    }
    console.error("User creation error:", error);
    return { error: "Failed to create user" };
  }
};
