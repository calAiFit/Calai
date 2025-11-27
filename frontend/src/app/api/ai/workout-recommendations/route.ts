import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface WorkoutRecommendation {
  name: string;
  description: string;
  duration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  caloriesBurn: number;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    restSeconds: number;
  }[];
  muscleGroups: string[];
  equipment: string[];
}

async function generateWorkoutPlan(
  profile: {
    weight?: number | null;
    height?: number | null;
    age?: number | null;
    gender?: string | null;
    activityLevel?: string | null;
    targetWeight?: number | null;
  },
  goal: string,
  duration: number
): Promise<WorkoutRecommendation[]> {
  if (!OPENAI_API_KEY) {
    // Return default workouts if no API key
    return getDefaultWorkouts(goal, duration);
  }

  const bmi =
    profile.weight && profile.height
      ? profile.weight / Math.pow(profile.height / 100, 2)
      : null;

  const prompt = `Generate a personalized workout plan based on:
- Age: ${profile.age || "Unknown"}
- Gender: ${profile.gender || "Unknown"}
- Weight: ${profile.weight ? `${profile.weight} kg` : "Unknown"}
- Height: ${profile.height ? `${profile.height} cm` : "Unknown"}
- BMI: ${bmi ? bmi.toFixed(1) : "Unknown"}
- Activity Level: ${profile.activityLevel || "moderate"}
- Goal: ${goal}
- Available Time: ${duration} minutes

Create 3 workout options as a JSON array. Each workout should have:
- name: string (workout name)
- description: string (brief description)
- duration: number (in minutes)
- difficulty: "beginner" | "intermediate" | "advanced"
- caloriesBurn: number (estimated calories)
- exercises: array of { name, sets, reps (as string like "12" or "30 seconds"), restSeconds }
- muscleGroups: string array
- equipment: string array (or ["bodyweight"] if none needed)

Return ONLY valid JSON array, no markdown or explanation.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a certified personal trainer. Generate workout plans as valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API error");
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return getDefaultWorkouts(goal, duration);
  } catch (error) {
    console.error("Error generating workout plan:", error);
    return getDefaultWorkouts(goal, duration);
  }
}

function getDefaultWorkouts(
  goal: string,
  duration: number
): WorkoutRecommendation[] {
  const workouts: Record<string, WorkoutRecommendation[]> = {
    "weight-loss": [
      {
        name: "Fat Burning HIIT",
        description:
          "High-intensity interval training to maximize calorie burn",
        duration: Math.min(duration, 30),
        difficulty: "intermediate",
        caloriesBurn: 300,
        exercises: [
          {
            name: "Jumping Jacks",
            sets: 3,
            reps: "45 seconds",
            restSeconds: 15,
          },
          { name: "Burpees", sets: 3, reps: "10", restSeconds: 30 },
          {
            name: "Mountain Climbers",
            sets: 3,
            reps: "30 seconds",
            restSeconds: 15,
          },
          { name: "High Knees", sets: 3, reps: "45 seconds", restSeconds: 15 },
          { name: "Squat Jumps", sets: 3, reps: "12", restSeconds: 30 },
        ],
        muscleGroups: ["Full Body", "Core", "Legs"],
        equipment: ["bodyweight"],
      },
      {
        name: "Cardio Blast",
        description: "Steady-state cardio combined with bodyweight exercises",
        duration: Math.min(duration, 45),
        difficulty: "beginner",
        caloriesBurn: 250,
        exercises: [
          {
            name: "Marching in Place",
            sets: 1,
            reps: "3 minutes",
            restSeconds: 30,
          },
          { name: "Bodyweight Squats", sets: 3, reps: "15", restSeconds: 30 },
          { name: "Lunges", sets: 3, reps: "12 each leg", restSeconds: 30 },
          { name: "Push-ups (Modified)", sets: 3, reps: "10", restSeconds: 30 },
          { name: "Plank", sets: 3, reps: "30 seconds", restSeconds: 30 },
        ],
        muscleGroups: ["Legs", "Core", "Chest"],
        equipment: ["bodyweight"],
      },
    ],
    "muscle-gain": [
      {
        name: "Strength Builder",
        description: "Compound movements for maximum muscle growth",
        duration: Math.min(duration, 45),
        difficulty: "intermediate",
        caloriesBurn: 200,
        exercises: [
          { name: "Push-ups", sets: 4, reps: "12", restSeconds: 60 },
          { name: "Dips", sets: 3, reps: "10", restSeconds: 60 },
          { name: "Pull-ups/Rows", sets: 4, reps: "8", restSeconds: 90 },
          { name: "Squats", sets: 4, reps: "12", restSeconds: 60 },
          { name: "Lunges", sets: 3, reps: "10 each leg", restSeconds: 60 },
        ],
        muscleGroups: ["Chest", "Back", "Legs", "Arms"],
        equipment: ["bodyweight", "pull-up bar"],
      },
      {
        name: "Upper Body Focus",
        description: "Targeted upper body workout for strength and definition",
        duration: Math.min(duration, 40),
        difficulty: "intermediate",
        caloriesBurn: 180,
        exercises: [
          { name: "Diamond Push-ups", sets: 3, reps: "10", restSeconds: 60 },
          { name: "Pike Push-ups", sets: 3, reps: "8", restSeconds: 60 },
          { name: "Inverted Rows", sets: 4, reps: "12", restSeconds: 60 },
          { name: "Tricep Dips", sets: 3, reps: "12", restSeconds: 45 },
          { name: "Plank to Push-up", sets: 3, reps: "8", restSeconds: 45 },
        ],
        muscleGroups: ["Chest", "Shoulders", "Triceps", "Back"],
        equipment: ["bodyweight"],
      },
    ],
    "general-fitness": [
      {
        name: "Total Body Conditioning",
        description: "Balanced workout for overall fitness improvement",
        duration: Math.min(duration, 35),
        difficulty: "beginner",
        caloriesBurn: 220,
        exercises: [
          { name: "Warm-up Jog", sets: 1, reps: "2 minutes", restSeconds: 0 },
          { name: "Squats", sets: 3, reps: "15", restSeconds: 30 },
          { name: "Push-ups", sets: 3, reps: "10", restSeconds: 30 },
          { name: "Lunges", sets: 3, reps: "10 each leg", restSeconds: 30 },
          { name: "Plank", sets: 3, reps: "30 seconds", restSeconds: 30 },
          {
            name: "Cool-down Stretch",
            sets: 1,
            reps: "3 minutes",
            restSeconds: 0,
          },
        ],
        muscleGroups: ["Full Body"],
        equipment: ["bodyweight"],
      },
    ],
  };

  return workouts[goal] || workouts["general-fitness"];
}

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const goal = searchParams.get("goal") || "general-fitness";
    const duration = parseInt(searchParams.get("duration") || "30");

    // Get user profile for personalized recommendations
    const profile = await db.getProfileByUserId(userId);

    const recommendations = await generateWorkoutPlan(
      profile || {},
      goal,
      duration
    );

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("GET /api/ai/workout-recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to get workout recommendations" },
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
    const { goal, duration, preferences } = body;

    const profile = await db.getProfileByUserId(userId);

    const recommendations = await generateWorkoutPlan(
      profile || {},
      goal || "general-fitness",
      duration || 30
    );

    // Filter by preferences if provided
    let filteredRecommendations = recommendations;
    if (preferences?.equipment) {
      filteredRecommendations = recommendations.filter((w) =>
        w.equipment.some(
          (e) => preferences.equipment.includes(e) || e === "bodyweight"
        )
      );
    }

    return NextResponse.json({ recommendations: filteredRecommendations });
  } catch (error) {
    console.error("POST /api/ai/workout-recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to get workout recommendations" },
      { status: 500 }
    );
  }
}
