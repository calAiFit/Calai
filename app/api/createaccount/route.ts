"use server";

import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const schemaUserProfile = z.object({
  name: z.string().min(1),
  socialMediaURL: z.string().url(),
  avatarImage: z.string().optional(),
});

export const createProfile = async (formData: FormData) => {
  const user = await currentUser();
  if (!user) return { message: "Unauthorized" };

  const rawData = {
    name: formData.get("name"),
    socialMediaURL: formData.get("socialMediaURL"),
    avatarImage: formData.get("avatarImage"),
  };

  const validated = schemaUserProfile.safeParse(rawData);
  if (!validated.success) {
    return {
      ZodError: validated.error.flatten().fieldErrors,
    };
  }

  await prisma.profile.create({
    data: {
      name: validated.data.name,
      avatarUrl: validated.data.avatarImage ?? "",

      userId: user.id,
    },
  });

  return { message: "Profile created successfully" };
};
