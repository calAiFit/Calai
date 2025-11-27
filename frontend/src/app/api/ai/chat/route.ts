import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

async function getUserContext(userId: string) {
  try {
    const profile = await db.getProfileByUserId(userId);
    const dailyGoal = await db.getDailyGoal(userId, new Date());
    const dailySummary = await db.getDailySummary(userId, new Date());
    const recentWorkouts = await db.getWorkouts(userId, 5);
    const intakeHistory = await db.getIntakeHistory(userId, new Date());

    return {
      profile,
      dailyGoal,
      dailySummary,
      recentWorkouts,
      todayIntake: intakeHistory,
    };
  } catch (error) {
    console.error("Error fetching user context:", error);
    return null;
  }
}

function buildSystemPrompt(
  userContext: Awaited<ReturnType<typeof getUserContext>>
) {
  let contextInfo = "";

  if (userContext) {
    const { profile, dailyGoal, dailySummary, recentWorkouts, todayIntake } =
      userContext;

    if (profile) {
      contextInfo += `\n\nUser Profile:
- Name: ${profile.name}
- Age: ${profile.age || "Not set"}
- Gender: ${profile.gender || "Not set"}
- Height: ${profile.height ? `${profile.height} cm` : "Not set"}
- Current Weight: ${profile.weight ? `${profile.weight} kg` : "Not set"}
- Target Weight: ${
        profile.targetWeight ? `${profile.targetWeight} kg` : "Not set"
      }
- Activity Level: ${profile.activityLevel || "Not set"}`;

      if (profile.height && profile.weight) {
        const bmi = profile.weight / Math.pow(profile.height / 100, 2);
        contextInfo += `\n- Current BMI: ${bmi.toFixed(1)}`;
      }
    }

    if (dailyGoal) {
      contextInfo += `\n\nToday's Goals:
- Calories: ${dailyGoal.calories} kcal
- Protein: ${dailyGoal.protein}g
- Carbs: ${dailyGoal.carbs}g
- Fats: ${dailyGoal.fats}g`;
    }

    if (dailySummary) {
      contextInfo += `\n\nToday's Progress:
- Calories Consumed: ${dailySummary.totalConsumed} kcal
- Calories Burned: ${dailySummary.totalBurned} kcal
- Net Calories: ${dailySummary.netCalories} kcal
- Protein: ${dailySummary.protein}g
- Carbs: ${dailySummary.carbs}g
- Fats: ${dailySummary.fats}g`;
    }

    if (todayIntake && todayIntake.length > 0) {
      contextInfo += `\n\nToday's Meals:`;
      todayIntake.slice(0, 5).forEach((meal) => {
        contextInfo += `\n- ${meal.foodName}: ${meal.calories} kcal`;
      });
    }

    if (recentWorkouts && recentWorkouts.length > 0) {
      contextInfo += `\n\nRecent Workouts:`;
      recentWorkouts.slice(0, 3).forEach((workout) => {
        contextInfo += `\n- ${workout.exercises.join(", ")}: ${
          workout.duration
        } min, ${workout.calories} cal burned`;
      });
    }
  }

  return `You are NutriCal AI, a helpful and knowledgeable fitness and nutrition assistant. You provide personalized advice based on the user's profile, goals, and progress.

Your expertise includes:
- Nutrition and diet planning
- Workout recommendations and exercise guidance
- Weight management strategies
- BMI analysis and healthy weight goals
- Meal planning and healthy eating habits
- Motivation and fitness mindset

Guidelines:
1. Be encouraging and supportive
2. Provide specific, actionable advice when possible
3. Use the user's data to personalize recommendations
4. If asked about medical conditions, recommend consulting a healthcare professional
5. Keep responses concise but helpful (2-3 paragraphs max unless detailed info is requested)
6. Use emojis sparingly to make conversations friendly
7. Always consider the user's current progress when giving advice
${contextInfo}

Remember: You're helping users achieve their fitness goals while maintaining a healthy lifestyle.`;
}

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { messages } = body as { messages: Message[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Get user context for personalized responses
    const userContext = await getUserContext(userId);
    const systemPrompt = buildSystemPrompt(userContext);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      return NextResponse.json(
        { error: "Failed to get AI response" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content;

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("POST /api/ai/chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
