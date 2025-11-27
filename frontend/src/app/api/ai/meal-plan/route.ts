import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface MealPlan {
  meal: "breakfast" | "lunch" | "dinner" | "snack";
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
  preparationTime: number;
  instructions?: string[];
}

interface DailyMealPlan {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  meals: MealPlan[];
}

async function generateMealPlan(
  profile: {
    weight?: number | null;
    height?: number | null;
    age?: number | null;
    gender?: string | null;
    activityLevel?: string | null;
    targetWeight?: number | null;
  },
  dailyGoal: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  } | null,
  preferences: {
    dietType?: string;
    allergies?: string[];
    cuisinePreference?: string;
  }
): Promise<DailyMealPlan> {
  const targetCalories = dailyGoal?.calories || 2000;
  const targetProtein = dailyGoal?.protein || 100;
  const targetCarbs = dailyGoal?.carbs || 250;
  const targetFats = dailyGoal?.fats || 65;

  if (!OPENAI_API_KEY) {
    return getDefaultMealPlan(
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFats
    );
  }

  const prompt = `Create a daily meal plan for someone with these specs:
- Target Calories: ${targetCalories} kcal
- Target Protein: ${targetProtein}g
- Target Carbs: ${targetCarbs}g
- Target Fats: ${targetFats}g
- Diet Type: ${preferences.dietType || "balanced"}
- Allergies/Restrictions: ${preferences.allergies?.join(", ") || "none"}
- Cuisine Preference: ${preferences.cuisinePreference || "varied"}
- Activity Level: ${profile.activityLevel || "moderate"}

Create a meal plan with breakfast, lunch, dinner, and 1-2 snacks. Return as JSON:
{
  "date": "today",
  "totalCalories": number,
  "totalProtein": number,
  "totalCarbs": number,
  "totalFats": number,
  "meals": [
    {
      "meal": "breakfast" | "lunch" | "dinner" | "snack",
      "name": string,
      "description": string,
      "calories": number,
      "protein": number,
      "carbs": number,
      "fats": number,
      "ingredients": string[],
      "preparationTime": number (minutes)
    }
  ]
}

Return ONLY valid JSON, no markdown.`;

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
              "You are a certified nutritionist. Generate meal plans as valid JSON only.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API error");
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return getDefaultMealPlan(
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFats
    );
  } catch (error) {
    console.error("Error generating meal plan:", error);
    return getDefaultMealPlan(
      targetCalories,
      targetProtein,
      targetCarbs,
      targetFats
    );
  }
}

function getDefaultMealPlan(
  targetCalories: number,
  targetProtein: number,
  targetCarbs: number,
  targetFats: number
): DailyMealPlan {
  const breakfastRatio = 0.25;
  const lunchRatio = 0.35;
  const dinnerRatio = 0.3;
  const snackRatio = 0.1;

  return {
    date: new Date().toISOString().split("T")[0],
    totalCalories: targetCalories,
    totalProtein: targetProtein,
    totalCarbs: targetCarbs,
    totalFats: targetFats,
    meals: [
      {
        meal: "breakfast",
        name: "Protein Oatmeal Bowl",
        description: "Hearty oatmeal with protein and fresh berries",
        calories: Math.round(targetCalories * breakfastRatio),
        protein: Math.round(targetProtein * breakfastRatio),
        carbs: Math.round(targetCarbs * breakfastRatio),
        fats: Math.round(targetFats * breakfastRatio),
        ingredients: ["Oats", "Greek Yogurt", "Berries", "Honey", "Almonds"],
        preparationTime: 10,
      },
      {
        meal: "lunch",
        name: "Grilled Chicken Salad",
        description: "Fresh mixed greens with grilled chicken breast",
        calories: Math.round(targetCalories * lunchRatio),
        protein: Math.round(targetProtein * lunchRatio),
        carbs: Math.round(targetCarbs * lunchRatio),
        fats: Math.round(targetFats * lunchRatio),
        ingredients: [
          "Chicken Breast",
          "Mixed Greens",
          "Cherry Tomatoes",
          "Cucumber",
          "Olive Oil",
          "Quinoa",
        ],
        preparationTime: 20,
      },
      {
        meal: "dinner",
        name: "Salmon with Sweet Potato",
        description:
          "Baked salmon fillet with roasted sweet potato and vegetables",
        calories: Math.round(targetCalories * dinnerRatio),
        protein: Math.round(targetProtein * dinnerRatio),
        carbs: Math.round(targetCarbs * dinnerRatio),
        fats: Math.round(targetFats * dinnerRatio),
        ingredients: [
          "Salmon Fillet",
          "Sweet Potato",
          "Broccoli",
          "Olive Oil",
          "Lemon",
          "Herbs",
        ],
        preparationTime: 35,
      },
      {
        meal: "snack",
        name: "Greek Yogurt with Nuts",
        description: "Protein-rich snack to keep you energized",
        calories: Math.round(targetCalories * snackRatio),
        protein: Math.round(targetProtein * snackRatio),
        carbs: Math.round(targetCarbs * snackRatio),
        fats: Math.round(targetFats * snackRatio),
        ingredients: ["Greek Yogurt", "Mixed Nuts", "Honey"],
        preparationTime: 2,
      },
    ],
  };
}

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const dietType = searchParams.get("dietType") || "balanced";
    const allergies =
      searchParams.get("allergies")?.split(",").filter(Boolean) || [];

    const profile = await db.getProfileByUserId(userId);
    const dailyGoal = await db.getDailyGoal(userId, new Date());

    const mealPlan = await generateMealPlan(profile || {}, dailyGoal, {
      dietType,
      allergies,
    });

    return NextResponse.json({ mealPlan });
  } catch (error) {
    console.error("GET /api/ai/meal-plan error:", error);
    return NextResponse.json(
      { error: "Failed to generate meal plan" },
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
    const { dietType, allergies, cuisinePreference } = body;

    const profile = await db.getProfileByUserId(userId);
    const dailyGoal = await db.getDailyGoal(userId, new Date());

    const mealPlan = await generateMealPlan(profile || {}, dailyGoal, {
      dietType,
      allergies,
      cuisinePreference,
    });

    return NextResponse.json({ mealPlan });
  } catch (error) {
    console.error("POST /api/ai/meal-plan error:", error);
    return NextResponse.json(
      { error: "Failed to generate meal plan" },
      { status: 500 }
    );
  }
}
