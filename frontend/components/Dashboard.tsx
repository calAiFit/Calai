"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import BMICalculator from "../src/app/components/BMICalculator";
import api from "../src/app/lib/api";
import Link from "next/link";
import {
  Calendar,
  TrendingUp,
  Target,
  Activity,
  Award,
  ArrowRight,
} from "lucide-react";

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

export default function Dashboard() {
  const { user } = useUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setDailyGoal(null);
      setRecentWorkouts([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
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
      } else {
        console.error("Error loading user data:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {profile?.name || user?.firstName || "User"}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's your fitness dashboard for today
              </p>
            </div>
            <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">
                Day {Math.ceil(Math.random() * 30)} Streak
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">+2.1%</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Current BMI</p>
              <p className="text-2xl font-bold text-gray-900">
                {profile?.weight && profile?.height
                  ? (profile.weight / (profile.height / 100) ** 2).toFixed(1)
                  : "N/A"}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm text-orange-600 font-medium">-3kg</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Target Weight</p>
              <p className="text-2xl font-bold text-gray-900">
                {profile?.targetWeight || "N/A"} kg
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm text-green-600 font-medium">Today</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Calories Goal</p>
              <p className="text-2xl font-bold text-gray-900">
                {dailyGoal?.calories || "2,000"} kcal
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-xl">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-sm text-blue-600 font-medium">
                This week
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Workouts</p>
              <p className="text-2xl font-bold text-gray-900">
                {recentWorkouts.length || 0}/5
              </p>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* BMI Calculator */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <BMICalculator />
          </motion.div>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/calorie">
                  <button className="w-full p-4 text-left rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <Activity className="w-4 h-4 text-purple-600" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="font-medium text-gray-900">Track Calories</p>
                    <p className="text-sm text-gray-600">Log your meals</p>
                  </button>
                </Link>

                <Link href="/workout">
                  <button className="w-full p-4 text-left rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Target className="w-4 h-4 text-blue-600" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="font-medium text-gray-900">Start Workout</p>
                    <p className="text-sm text-gray-600">Begin training</p>
                  </button>
                </Link>

                <Link href="/profile">
                  <button className="w-full p-4 text-left rounded-xl bg-green-50 hover:bg-green-100 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-green-100 p-2 rounded-lg group-hover:bg-green-200 transition-colors">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="font-medium text-gray-900">View Progress</p>
                    <p className="text-sm text-gray-600">Check stats</p>
                  </button>
                </Link>

                <Link href="/shop">
                  <button className="w-full p-4 text-left rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="bg-orange-100 p-2 rounded-lg group-hover:bg-orange-200 transition-colors">
                        <Award className="w-4 h-4 text-orange-600" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-orange-600" />
                    </div>
                    <p className="font-medium text-gray-900">Shop Gear</p>
                    <p className="text-sm text-gray-600">Browse equipment</p>
                  </button>
                </Link>
              </div>
            </motion.div>

            {/* Recent Workouts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Recent Workouts
                </h3>
                <Link href="/workout">
                  <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                    View All
                  </button>
                </Link>
              </div>

              {recentWorkouts.length > 0 ? (
                <div className="space-y-3">
                  {recentWorkouts.slice(0, 3).map((workout, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Activity className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {workout.exercises.slice(0, 2).join(", ")}
                          </p>
                          <p className="text-xs text-gray-600">
                            {workout.duration} min • {workout.calories} cal
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(workout.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-3">No workouts yet</p>
                  <Link href="/workout">
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Start Your First Workout
                    </button>
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
