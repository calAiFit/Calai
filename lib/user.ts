"use server";

import { z } from "zod";
import { PrismaClient, Prisma } from "@prisma/client";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const schemaUser = z.object({
  email: z.string().email().min(1),
  password: z.string().min(6),
  name: z.string().min(1),
});

export const createUser = async (formData: FormData) => {
  try {
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
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
    const hashedPassword = await bcrypt.hash(validated.data.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        userId,
        email: validated.data.email,
        password: hashedPassword,
      },
    });

    return { message: "User created successfully", user };
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Email already exists" };
    }
    return { error: "Failed to create user" };
  }
};
