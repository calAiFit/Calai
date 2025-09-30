"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import api from "../lib/api";

import  FoodNutritionAnalyzer  from "../components/FoodNutritionAnalyzer";
import AddCalorieIntake from "../components/AddCalorieIntake";
import EnhancedProgressBar from "../components/EnhancedProgressBar";
import BurnedCaloriesTracker from "../components/BurnedCaloriesTracker";
import { GoalCalculator } from "../components/GoalCalculator";
import { Input } from "@/components/ui/input";

interface DailyGoal {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface IntakeRecord {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  createdAt: string;
}

interface BurnedCaloriesRecord {
  id: string;
  activity: string;
  calories: number;
  duration?: number;
  createdAt: string;
}


export default function CaloriePage() {
  const { user, isLoaded } = useUser();
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("sedentary");
  const [calories, setCalories] = useState("");
  const [loading, setLoading] = useState(false);
  const [dailyGoal, setDailyGoal] = useState<DailyGoal | null>(null);
  const [intakeHistory, setIntakeHistory] = useState<IntakeRecord[]>([]);
  const [burnedCalories, setBurnedCalories] = useState<BurnedCaloriesRecord[]>([]);
  const [totalBurned, setTotalBurned] = useState(0);
  const [showGoalCalculator, setShowGoalCalculator] = useState(false);

  const loadUserData = useCallback(async () => {
    if (!user) {
      setDailyGoal(null);
      setIntakeHistory([]);
      setBurnedCalories([]);
      setTotalBurned(0);
      return;
    }

    try {
      const profileRes = await api.get("/profile");
      if (profileRes.data.profile) {
        const profileData = profileRes.data.profile;
        setAge(profileData.age?.toString() || "");
        setWeight(profileData.weight?.toString() || "");
        setHeight(profileData.height?.toString() || "");
        setActivityLevel(profileData.activityLevel || "sedentary");
      }

      const goalsRes = await api.get("/daily-goals");
      if (goalsRes.data.dailyGoal) {
        setDailyGoal(goalsRes.data.dailyGoal);
        setCalories(goalsRes.data.dailyGoal.calories.toString());
      }

      const intakeRes = await api.get("/intake-history");
      if (intakeRes.data.intakeHistory) {
        setIntakeHistory(intakeRes.data.intakeHistory);
      }

      const burnedRes = await api.get("/burned-calories");
      if (burnedRes.data.burnedCalories) {
        setBurnedCalories(burnedRes.data.burnedCalories);
      }
      if (burnedRes.data.totalBurned !== undefined) {
        setTotalBurned(burnedRes.data.totalBurned);
      }


    } catch (error: unknown) {
      const errorObj = error as { response?: { status: number } };
      if (errorObj.response?.status === 401) {

        console.log("User not authenticated, clearing data");
        setDailyGoal(null);
        setIntakeHistory([]);
        setBurnedCalories([]);
        setTotalBurned(0);
        return;
      }
      
      console.error("Error loading user data:", error);

      setDailyGoal(null);
      setIntakeHistory([]);
      setBurnedCalories([]);
      setTotalBurned(0);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user) {
      loadUserData();
    } else if (isLoaded && !user) {
      setDailyGoal(null);
      setIntakeHistory([]);
      setBurnedCalories([]);
      setTotalBurned(0);
      setAge("");
      setWeight("");
      setHeight("");
      setActivityLevel("sedentary");
      setCalories("");
    }
  }, [isLoaded, user, loadUserData]);

  const calculateCalories = async () => {
    if (!age || !weight || !height || !activityLevel) return;

    setLoading(true);

    const ageNum = parseFloat(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    const bmr = 66 + 13.7 * weightNum + 5 * heightNum - 6.8 * ageNum;

    let multiplier = 1.2; 
    switch (activityLevel) {
      case "light":
        multiplier = 1.375;
        break;
      case "moderate":
        multiplier = 1.55;
        break;
      case "active":
        multiplier = 1.725;
        break;
      case "very-active":
        multiplier = 1.9;
        break;
    }

    const totalCalories = Math.round(bmr * multiplier);
    setCalories(totalCalories.toString());

    if (user) {
      try {
        await api.post("/daily-goals", {
          calories: totalCalories,
          protein: Math.round(totalCalories * 0.3 / 4), 
          carbs: Math.round(totalCalories * 0.45 / 4), 
          fats: Math.round(totalCalories * 0.25 / 9), 
        });
        await loadUserData(); 
      } catch (error) {
        console.error("Error saving daily goals:", error);
      }
    }

    setLoading(false);
  };

  const handleGoalCalculated = async (goalCalories: number) => {
    setCalories(goalCalories.toString());
    await loadUserData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Calculating your daily needs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Daily Calorie Calculator
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowGoalCalculator(!showGoalCalculator)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:opacity-90 transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              {showGoalCalculator ? "Hide Goal Calculator" : "Show Goal Calculator"}
            </button>
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
                Calculate your daily needs
              </span>
            </div>
          </div>
        </div>


        {showGoalCalculator && (
          <div className="mb-8">
            <GoalCalculator onGoalCalculated={handleGoalCalculated} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Daily Calculator
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

                <p className="text-gray-600 mb-8">
                  Calculate your daily calorie needs based on your activity level
                  and goals.
                </p>

              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <div className="relative">
                    <Input
                      value={age}
                      onChange={(e) => {
                        const input = e.target.value;
                        if (!/^\d*$/.test(input)) return;
                        if (
                          input.length > 3 ||
                          (input.length > 0 && input[0] === "0")
                        )
                          return;
                        setAge(input);
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
                      placeholder="Enter your age"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      years
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight
                  </label>
                  <div className="relative">
                    <Input
                      value={weight}
                      onChange={(e) => {
                        const input = e.target.value;
                        if (!/^\d*$/.test(input)) return;
                        if (
                          input.length > 3 ||
                          (input.length > 0 && input[0] === "0")
                        )
                          return;
                        setWeight(input);
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
                      placeholder="Enter your weight"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      kg
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height
                  </label>
                  <div className="relative">
                    <Input
                      value={height}
                      onChange={(e) => {
                        const input = e.target.value;
                        if (!/^\d*$/.test(input)) return;
                        if (
                          input.length > 3 ||
                          (input.length > 0 && input[0] === "0")
                        )
                          return;
                        setHeight(input);
                      }}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
                      placeholder="Enter your height"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      cm
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Level
                  </label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="sedentary">
                      Sedentary (little or no exercise)
                    </option>
                    <option value="light">
                      Light exercise (1-3 days/week)
                    </option>
                    <option value="moderate">
                      Moderate exercise (3-5 days/week)
                    </option>
                    <option value="active">
                      Heavy exercise (6-7 days/week)
                    </option>
                    <option value="very-active">
                      Very heavy exercise (twice/day)
                    </option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={calculateCalories}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? "Calculating..." : "Calculate Calories"}
                </button>

                {calories && (
                  <div className="mt-6 p-4 bg-purple-50 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Your Daily Calorie Needs
                    </h3>
                    <div className="text-2xl font-bold text-purple-600">
                      {calories} kcal/day
                    </div>
                  </div>
                )}
              </form>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <AddCalorieIntake onIntakeAdded={loadUserData} />
            <FoodNutritionAnalyzer onIntakeAdded={loadUserData} />
            <BurnedCaloriesTracker onCaloriesAdded={loadUserData} />
          </div>
        </div>


        {user && (dailyGoal || intakeHistory.length > 0 || totalBurned > 0) && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Today&apos;s Progress
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>Consumed</span>
                </div>
                {totalBurned > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Burned</span>
                  </div>
                )}
                {totalBurned > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Net</span>
                  </div>
                )}
              </div>
            </div>
            
            {dailyGoal && (
              <div className="space-y-6 mb-6">
                <EnhancedProgressBar
                  current={intakeHistory.reduce((sum, item) => sum + item.calories, 0)}
                  goal={dailyGoal.calories}
                  label="Calories"
                  color="bg-gradient-to-r from-purple-500 to-purple-600"
                  unit=" kcal"
                  burnedCalories={totalBurned}
                  isNetCalories={true}
                />
                <EnhancedProgressBar
                  current={intakeHistory.reduce((sum, item) => sum + item.protein, 0)}
                  goal={dailyGoal.protein}
                  label="Protein"
                  color="bg-gradient-to-r from-blue-500 to-blue-600"
                  unit="g"
                />
                <EnhancedProgressBar
                  current={intakeHistory.reduce((sum, item) => sum + item.carbs, 0)}
                  goal={dailyGoal.carbs}
                  label="Carbs"
                  color="bg-gradient-to-r from-green-500 to-green-600"
                  unit="g"
                />
                <EnhancedProgressBar
                  current={intakeHistory.reduce((sum, item) => sum + item.fats, 0)}
                  goal={dailyGoal.fats}
                  label="Fats"
                  color="bg-gradient-to-r from-orange-500 to-orange-600"
                  unit="g"
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Food Intake */}
              {intakeHistory.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Food Intake</h3>
                  <div className="space-y-2">
                    {intakeHistory.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{item.foodName}</div>
                          <div className="text-sm text-gray-600">
                            {item.calories} cal • {item.protein}g protein • {item.carbs}g carbs • {item.fats}g fats
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(item.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Burned Calories */}
              {burnedCalories.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Today&apos;s Activities</h3>
                  <div className="space-y-2">
                    {burnedCalories.map((activity, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{activity.activity}</div>
                          {activity.duration && (
                            <div className="text-sm text-gray-600">
                              {activity.duration} minutes
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-orange-600 font-semibold">
                          -{activity.calories} cal
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
