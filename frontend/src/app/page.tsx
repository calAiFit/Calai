"use client";

import BMICalculator from "./components/BMICalculator";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import api from "./lib/api";

interface Profile {
  name?: string;
  weight?: number;
  height?: number;
  targetWeight?: number;
}

interface DailyGoal {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface Workout {
  duration: number;
  calories: number;
  exercises: string[];
  date: string;
}

export default function Home() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);

  const loadUserData = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setDailyGoal(null);
      setRecentWorkouts([]);
      return;
    }

    try {
      const profileRes = await api.get("/profile");
      if (profileRes.data.profile) {
        setProfile(profileRes.data.profile);
      }

      const goalsRes = await api.get("/daily-goals");
      if (goalsRes.data.dailyGoal) {
        setDailyGoal(goalsRes.data.dailyGoal);
      }

      const workoutsRes = await api.get("/workouts?limit=3");
      if (workoutsRes.data.workouts) {
        setRecentWorkouts(workoutsRes.data.workouts);
      }
    } catch (error: unknown) {
      const errorObj = error as { response?: { status: number } };
      if (errorObj.response?.status === 401) {
        console.log("User not authenticated, clearing data");
        setProfile(null);
        setDailyGoal(null);
        setRecentWorkouts([]);
        return;
      }
      
      console.error("Error loading user data:", error);

      setProfile(null);
      setDailyGoal(null);
      setRecentWorkouts([]);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user) {
      loadUserData();
    } else if (isLoaded && !user) {
      setProfile(null);
      setDailyGoal(null);
      setRecentWorkouts([]);
    }
  }, [isLoaded, user, loadUserData]);
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome to NutriCal
          </h1>
          <div className="flex items-center gap-2">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-sm text-gray-600">
              Your fitness journey starts here
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-sm">
            <BMICalculator />
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {user ? `Welcome back, ${profile?.name || user.firstName || "User"}!` : "About NutriCal"}
              </h2>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>

            {user && profile ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="text-sm text-purple-600 font-medium">BMI</div>
                    <div className="text-2xl font-bold text-purple-700">
                      {profile.weight && profile.height 
                        ? ((profile.weight / ((profile.height / 100) ** 2)).toFixed(1))
                        : "N/A"
                      }
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="text-sm text-blue-600 font-medium">Target Weight</div>
                    <div className="text-2xl font-bold text-blue-700">
                      {profile.targetWeight || "N/A"} kg
                    </div>
                  </div>
                </div>

                {dailyGoal && (
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="text-sm text-green-600 font-medium">Daily Calorie Goal</div>
                    <div className="text-2xl font-bold text-green-700">
                      {dailyGoal.calories} kcal
                    </div>
                  </div>
                )}

                {recentWorkouts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Workouts</h3>
                    <div className="space-y-2">
                      {recentWorkouts.map((workout, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900">
                              {workout.exercises.join(", ")}
                            </div>
                            <div className="text-sm text-gray-600">
                              {workout.duration} min • {workout.calories} cal
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(workout.date).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-gray-700 mb-8">
                  Your one-stop fitness solution for calculating BMI, planning
                  workouts, tracking calories, and shopping for fitness gear.
                </p>

                <div className="space-y-6">
                  {[
                    {
                      icon: "📊",
                      title: "Accurate BMI calculations",
                      description:
                        "Get precise BMI analysis and personalized recommendations",
                    },
                    {
                      icon: "🏋️",
                      title: "Custom workout plans",
                      description:
                        "Tailored workout programs to reach your fitness goals",
                    },
                    {
                      icon: "🍎",
                      title: "Calorie tracking",
                      description:
                        "Monitor your daily calorie intake and nutrition",
                    },
                    {
                      icon: "🛍️",
                      title: "Fitness equipment shop",
                      description: "Quality gear for your fitness journey",
                    },
                  ].map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-xl bg-gray-50"
                    >
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-2xl text-purple-600">
                          {feature.icon}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
