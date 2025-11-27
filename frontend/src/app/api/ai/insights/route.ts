import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface Insight {
  type: "success" | "warning" | "info" | "tip";
  title: string;
  message: string;
  action?: string;
  priority: number;
}

interface AIInsights {
  summary: string;
  insights: Insight[];
  weeklyTrend: "improving" | "stable" | "declining";
  motivationalMessage: string;
  focusAreas: string[];
  achievements: string[];
}

async function generateInsights(
  profile: {
    weight?: number | null;
    height?: number | null;
    targetWeight?: number | null;
  } | null,
  dailyGoal: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  } | null,
  dailySummary: {
    totalConsumed: number;
    totalBurned: number;
    protein: number;
    carbs: number;
    fats: number;
  } | null,
  weeklyData: Array<{
    date: Date;
    totalConsumed: number;
    totalBurned: number;
    protein: number;
  }>,
  recentWorkouts: Array<{
    duration: number;
    calories: number;
    exercises: string[];
  }>
): Promise<AIInsights> {
  // Calculate basic metrics
  const bmi =
    profile?.weight && profile?.height
      ? profile.weight / Math.pow(profile.height / 100, 2)
      : null;

  const calorieProgress =
    dailyGoal && dailySummary
      ? (dailySummary.totalConsumed / dailyGoal.calories) * 100
      : 0;

  const proteinProgress =
    dailyGoal && dailySummary
      ? (dailySummary.protein / dailyGoal.protein) * 100
      : 0;

  const weeklyAvgCalories =
    weeklyData.length > 0
      ? weeklyData.reduce((sum, d) => sum + d.totalConsumed, 0) /
        weeklyData.length
      : 0;

  const totalWorkoutsThisWeek = recentWorkouts.length;
  const totalCaloriesBurnedThisWeek = recentWorkouts.reduce(
    (sum, w) => sum + w.calories,
    0
  );

  // Determine weekly trend
  let weeklyTrend: "improving" | "stable" | "declining" = "stable";
  if (weeklyData.length >= 3) {
    const firstHalf = weeklyData.slice(0, Math.floor(weeklyData.length / 2));
    const secondHalf = weeklyData.slice(Math.floor(weeklyData.length / 2));
    const firstAvg =
      firstHalf.reduce((sum, d) => sum + d.totalConsumed, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, d) => sum + d.totalConsumed, 0) /
      secondHalf.length;

    if (dailyGoal) {
      const firstDiff = Math.abs(firstAvg - dailyGoal.calories);
      const secondDiff = Math.abs(secondAvg - dailyGoal.calories);
      weeklyTrend =
        secondDiff < firstDiff
          ? "improving"
          : secondDiff > firstDiff
          ? "declining"
          : "stable";
    }
  }

  // Generate insights based on data
  const insights: Insight[] = [];
  const achievements: string[] = [];
  const focusAreas: string[] = [];

  // Calorie insights
  if (dailySummary && dailyGoal) {
    if (calorieProgress >= 90 && calorieProgress <= 110) {
      insights.push({
        type: "success",
        title: "On Track! 🎯",
        message: `You're at ${calorieProgress.toFixed(
          0
        )}% of your daily calorie goal. Great job staying consistent!`,
        priority: 1,
      });
      achievements.push("Met daily calorie goal");
    } else if (calorieProgress < 70) {
      insights.push({
        type: "warning",
        title: "Eat More Today",
        message: `You've only consumed ${calorieProgress.toFixed(
          0
        )}% of your daily calories. Make sure to fuel your body properly.`,
        action: "Add a nutritious meal or snack",
        priority: 2,
      });
      focusAreas.push("Increase calorie intake");
    } else if (calorieProgress > 120) {
      insights.push({
        type: "info",
        title: "Over Daily Goal",
        message: `You've consumed ${calorieProgress.toFixed(
          0
        )}% of your daily calories. Consider lighter options for remaining meals.`,
        priority: 2,
      });
      focusAreas.push("Monitor portion sizes");
    }
  }

  // Protein insights
  if (proteinProgress < 50 && dailySummary) {
    insights.push({
      type: "tip",
      title: "Boost Your Protein 💪",
      message:
        "You're behind on protein today. Add lean meats, eggs, or legumes to your next meal.",
      action: "Try Greek yogurt or a protein shake",
      priority: 3,
    });
    focusAreas.push("Increase protein intake");
  } else if (proteinProgress >= 100) {
    achievements.push("Hit protein target");
  }

  // Workout insights
  if (totalWorkoutsThisWeek >= 3) {
    insights.push({
      type: "success",
      title: "Active Week! 🔥",
      message: `You've completed ${totalWorkoutsThisWeek} workouts and burned ${totalCaloriesBurnedThisWeek} calories this week!`,
      priority: 1,
    });
    achievements.push(`${totalWorkoutsThisWeek} workouts completed`);
  } else if (totalWorkoutsThisWeek === 0) {
    insights.push({
      type: "warning",
      title: "Time to Move",
      message:
        "No workouts logged this week. Even a short walk can boost your mood and metabolism!",
      action: "Start with a 15-minute workout",
      priority: 2,
    });
    focusAreas.push("Add physical activity");
  }

  // BMI insights
  if (bmi) {
    if (bmi < 18.5) {
      insights.push({
        type: "info",
        title: "Underweight BMI",
        message: `Your BMI is ${bmi.toFixed(
          1
        )}. Focus on nutrient-dense foods and strength training.`,
        priority: 3,
      });
    } else if (bmi >= 18.5 && bmi < 25) {
      achievements.push("Healthy BMI range");
    } else if (bmi >= 25 && bmi < 30) {
      insights.push({
        type: "tip",
        title: "Weight Management",
        message:
          "Combine regular exercise with mindful eating for best results.",
        priority: 4,
      });
    }
  }

  // Weight goal progress
  if (profile?.weight && profile?.targetWeight) {
    const weightDiff = profile.weight - profile.targetWeight;
    if (Math.abs(weightDiff) <= 2) {
      achievements.push("Near target weight!");
    }
  }

  // Sort insights by priority
  insights.sort((a, b) => a.priority - b.priority);

  // Generate motivational message
  const motivationalMessages = [
    "Every healthy choice you make is a step toward a better you! 💪",
    "Consistency beats perfection. Keep showing up! 🌟",
    "Your body can do amazing things - trust the process! 🚀",
    "Small progress is still progress. You're doing great! ✨",
    "Health is a journey, not a destination. Enjoy the ride! 🎯",
  ];

  const summary = generateSummary(
    calorieProgress,
    proteinProgress,
    totalWorkoutsThisWeek,
    weeklyTrend
  );

  return {
    summary,
    insights: insights.slice(0, 5),
    weeklyTrend,
    motivationalMessage:
      motivationalMessages[
        Math.floor(Math.random() * motivationalMessages.length)
      ],
    focusAreas: focusAreas.slice(0, 3),
    achievements: achievements.slice(0, 5),
  };
}

function generateSummary(
  calorieProgress: number,
  proteinProgress: number,
  workouts: number,
  trend: string
): string {
  if (calorieProgress >= 85 && calorieProgress <= 115 && workouts >= 2) {
    return "Excellent week! You're crushing your goals and staying consistent.";
  } else if (calorieProgress >= 70 || workouts >= 1) {
    return "Good progress this week. A few adjustments could help you reach your full potential.";
  } else {
    return "Let's build some momentum this week. Small steps lead to big changes!";
  }
}

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all required data
    const [profile, dailyGoal, dailySummary, weeklyData, recentWorkouts] =
      await Promise.all([
        db.getProfileByUserId(userId),
        db.getDailyGoal(userId, new Date()),
        db.getDailySummary(userId, new Date()),
        db.getHistoricalData(userId, 7),
        db.getWorkouts(userId, 7),
      ]);

    const insights = await generateInsights(
      profile,
      dailyGoal,
      dailySummary,
      weeklyData,
      recentWorkouts
    );

    return NextResponse.json({ insights });
  } catch (error) {
    console.error("GET /api/ai/insights error:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
