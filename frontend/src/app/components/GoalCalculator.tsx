"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import api from "../lib/api";

type Gender = "male" | "female";
type Goal = "gain" | "lose";

const activityLevels = {
  sedentary: { value: 1.2, label: "Sedentary (little or no exercise)" },
  light: { value: 1.375, label: "Light exercise (1-3 days/week)" },
  moderate: { value: 1.55, label: "Moderate exercise (3-5 days/week)" },
  active: { value: 1.725, label: "Heavy exercise (6-7 days/week)" },
  veryActive: { value: 1.9, label: "Very heavy exercise (twice/day)" },
} as const;

interface GoalCalculatorProps {
  onGoalCalculated?: (goal: number) => void;
}

export const GoalCalculator = ({ onGoalCalculated }: GoalCalculatorProps) => {
  const { user } = useUser();
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [currentWeight, setCurrentWeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [activity, setActivity] = useState<keyof typeof activityLevels>("moderate");
  const [dailyChange, setDailyChange] = useState(500);
  const [goal, setGoal] = useState<Goal>("lose");
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const [result, setResult] = useState<{
    bmr: number;
    tdee: number;
    kgChange: number;
    totalCaloriesNeeded: number;
    dailyCaloriesToEat: number;
    estimatedDays: number;
    estimatedWeeks: string;
  } | null>(null);

  // Load user profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const response = await api.get("/profile");
        if (response.data.profile) {
          const profile = response.data.profile;
          setAge(profile.age?.toString() || "");
          setHeight(profile.height?.toString() || "");
          setCurrentWeight(profile.weight?.toString() || "");
          setTargetWeight(profile.targetWeight?.toString() || "");
          setGender(profile.gender === "female" ? "female" : "male");
          setActivity(profile.activityLevel as keyof typeof activityLevels || "moderate");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [user]);

  function calculateBMR(
    weight: number,
    height: number,
    age: number,
    gender: Gender
  ) {
    return gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  }

  function calculateTDEE(bmr: number, activityFactor: number) {
    return bmr * activityFactor;
  }

  const handleCalculate = async () => {
    if (!age || !height || !currentWeight || !targetWeight) {
      alert("Please fill in all required fields");
      return;
    }

    const ageNum = parseFloat(age);
    const heightNum = parseFloat(height);
    const currentWeightNum = parseFloat(currentWeight);
    const targetWeightNum = parseFloat(targetWeight);

    if (ageNum < 1 || ageNum > 120) {
      alert("Please enter a valid age");
      return;
    }

    if (heightNum < 50 || heightNum > 300) {
      alert("Please enter a valid height");
      return;
    }

    if (currentWeightNum < 20 || currentWeightNum > 500) {
      alert("Please enter a valid current weight");
      return;
    }

    if (targetWeightNum < 20 || targetWeightNum > 500) {
      alert("Please enter a valid target weight");
      return;
    }

    setCalculating(true);

    const bmr = calculateBMR(currentWeightNum, heightNum, ageNum, gender);
    const tdee = calculateTDEE(bmr, activityLevels[activity].value);

    const kgChange =
      goal === "gain"
        ? targetWeightNum - currentWeightNum
        : currentWeightNum - targetWeightNum;

    const totalCaloriesNeeded = Math.abs(kgChange) * 7700;
    const daysNeeded = Math.ceil(totalCaloriesNeeded / Math.abs(dailyChange));

    const calculatedResult = {
      bmr,
      tdee,
      kgChange,
      totalCaloriesNeeded,
      dailyCaloriesToEat:
        tdee + (goal === "gain" ? dailyChange : -Math.abs(dailyChange)),
      estimatedDays: daysNeeded,
      estimatedWeeks: (daysNeeded / 7).toFixed(1),
    };

    setResult(calculatedResult);


    if (user && onGoalCalculated) {
      try {
        await api.post("/daily-goals", {
          calories: Math.round(calculatedResult.dailyCaloriesToEat),
          protein: Math.round(calculatedResult.dailyCaloriesToEat * 0.3 / 4),
          carbs: Math.round(calculatedResult.dailyCaloriesToEat * 0.45 / 4),
          fats: Math.round(calculatedResult.dailyCaloriesToEat * 0.25 / 9),
        });
        onGoalCalculated(calculatedResult.dailyCaloriesToEat);
      } catch (error) {
        console.error("Error saving daily goals:", error);
      }
    }

    setCalculating(false);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600">Loading profile data...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Goal Calculator
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
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
      </div>

      <p className="text-gray-600 mb-6">
        Calculate your personalized calorie goals based on your weight change objectives.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

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
                  if (input.length > 3 || (input.length > 0 && input[0] === "0")) return;
                  setAge(input);
                }}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
                placeholder="Age"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                years
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
                  if (input.length > 3 || (input.length > 0 && input[0] === "0")) return;
                  setHeight(input);
                }}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
                placeholder="Height"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                cm
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Weight
            </label>
            <div className="relative">
              <Input
                value={currentWeight}
                onChange={(e) => {
                  const input = e.target.value;
                  if (!/^\d*\.?\d*$/.test(input)) return;
                  setCurrentWeight(input);
                }}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
                placeholder="Current Weight"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                kg
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Weight
            </label>
            <div className="relative">
              <Input
                value={targetWeight}
                onChange={(e) => {
                  const input = e.target.value;
                  if (!/^\d*\.?\d*$/.test(input)) return;
                  setTargetWeight(input);
                }}
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
                placeholder="Target Weight"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                kg
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as Goal)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="lose">Lose Weight</option>
              <option value="gain">Gain Weight</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activity Level
          </label>
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as keyof typeof activityLevels)}
            className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {Object.entries(activityLevels).map(([key, level]) => (
              <option key={key} value={key}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Daily {goal === "gain" ? "Surplus" : "Deficit"} (kcal)
          </label>
          <div className="relative">
            <Input
              type="number"
              value={dailyChange}
              onChange={(e) => setDailyChange(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
              placeholder="500"
              min="100"
              max="1000"
              step="50"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              kcal
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Recommended: 300-500 kcal for healthy weight change
          </p>
        </div>

        <Button
          onClick={handleCalculate}
          disabled={calculating || !age || !height || !currentWeight || !targetWeight}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {calculating ? "Calculating..." : "Calculate Goal"}
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Goal Plan</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">BMR:</span>
                <span className="font-semibold">{result.bmr.toFixed(0)} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">TDEE:</span>
                <span className="font-semibold">{result.tdee.toFixed(0)} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Target:</span>
                <span className="font-semibold text-purple-600">{result.dailyCaloriesToEat.toFixed(0)} kcal</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Weight Change:</span>
                <span className="font-semibold">{Math.abs(result.kgChange).toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Time:</span>
                <span className="font-semibold">{result.estimatedWeeks} weeks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Days:</span>
                <span className="font-semibold">{result.estimatedDays} days</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
