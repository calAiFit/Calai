"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface WeeklyIntakeSummary {
  date: string;
  _sum: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

interface MonthlyWorkoutSummary {
  id: string;
  date: string;
  duration: number;
  calories: number;
  exercises: string[];
}

interface AnalyticsData {
  weeklyIntake?: WeeklyIntakeSummary[];
  monthlyWorkouts?: MonthlyWorkoutSummary[];
}

interface AnalyticsDashboardProps {
  userId: string;
}

export default function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/analytics");
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch {
      setError("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  const calculateWeeklyIntakeAverages = () => {
    if (!analytics.weeklyIntake || analytics.weeklyIntake.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fats: 0 };
    }

    const totals = analytics.weeklyIntake.reduce(
      (acc, day) => ({
        calories: acc.calories + (day._sum.calories || 0),
        protein: acc.protein + (day._sum.protein || 0),
        carbs: acc.carbs + (day._sum.carbs || 0),
        fats: acc.fats + (day._sum.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const days = analytics.weeklyIntake.length;
    return {
      calories: Math.round(totals.calories / days),
      protein: Math.round(totals.protein / days),
      carbs: Math.round(totals.carbs / days),
      fats: Math.round(totals.fats / days),
    };
  };

  const calculateMonthlyWorkoutStats = () => {
    if (!analytics.monthlyWorkouts || analytics.monthlyWorkouts.length === 0) {
      return { totalWorkouts: 0, totalDuration: 0, totalCalories: 0 };
    }

    return analytics.monthlyWorkouts.reduce(
      (stats, workout) => ({
        totalWorkouts: stats.totalWorkouts + 1,
        totalDuration: stats.totalDuration + workout.duration,
        totalCalories: stats.totalCalories + workout.calories,
      }),
      { totalWorkouts: 0, totalDuration: 0, totalCalories: 0 }
    );
  };

  const weeklyAverages = calculateWeeklyIntakeAverages();
  const monthlyStats = calculateMonthlyWorkoutStats();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-red-600">{error}</div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Analytics Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Intake Averages */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium mb-3">Weekly Intake Averages</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-gray-600">Calories</div>
                <div className="font-medium text-lg">{weeklyAverages.calories} kcal</div>
              </div>
              <div>
                <div className="text-gray-600">Protein</div>
                <div className="font-medium text-lg">{weeklyAverages.protein} g</div>
              </div>
              <div>
                <div className="text-gray-600">Carbs</div>
                <div className="font-medium text-lg">{weeklyAverages.carbs} g</div>
              </div>
              <div>
                <div className="text-gray-600">Fats</div>
                <div className="font-medium text-lg">{weeklyAverages.fats} g</div>
              </div>
            </div>
          </div>

          {/* Monthly Workout Stats */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium mb-3">Monthly Workout Stats</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div>
                <div className="text-gray-600">Total Workouts</div>
                <div className="font-medium text-lg">{monthlyStats.totalWorkouts}</div>
              </div>
              <div>
                <div className="text-gray-600">Total Duration</div>
                <div className="font-medium text-lg">{monthlyStats.totalDuration} min</div>
              </div>
              <div>
                <div className="text-gray-600">Total Calories Burned</div>
                <div className="font-medium text-lg">{monthlyStats.totalCalories} kcal</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Weekly Intake Chart */}
      {analytics.weeklyIntake && analytics.weeklyIntake.length > 0 && (
        <Card className="p-6">
          <h3 className="font-medium mb-4">Weekly Intake Trend</h3>
          <div className="space-y-2">
            {analytics.weeklyIntake.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="text-sm">
                  {new Date(day.date).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">
                  {day._sum.calories || 0} kcal
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Workouts */}
      {analytics.monthlyWorkouts && analytics.monthlyWorkouts.length > 0 && (
        <Card className="p-6">
          <h3 className="font-medium mb-4">Recent Workouts</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analytics.monthlyWorkouts.slice(0, 5).map((workout) => (
              <div key={workout.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                <div className="flex justify-between items-start mb-1">
                  <div className="font-medium">
                    {new Date(workout.date).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {workout.duration} min
                  </div>
                </div>
                <div className="text-xs text-gray-600">
                  {workout.calories} calories • {workout.exercises.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
