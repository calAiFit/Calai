"use client";

import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

interface WorkoutRecord {
  duration: number;
  calories: number;
  exercises: string[];
  date: string;
}

interface ActivityLevel {
  [key: string]: number;
}

interface METValues {
  [key: string]: ActivityLevel;
}

interface WorkoutCategory {
  name: string;
  icon: string;
  description: string;
  benefits: string[];
}

const CATEGORIES: WorkoutCategory[] = [
  {
    name: "Strength Training",
    icon: "💪",
    description: "Build muscle and increase strength",
    benefits: [
      "Build lean muscle mass",
      "Improve bone density",
      "Enhance metabolism",
    ],
  },
  {
    name: "Cardio",
    icon: "🏃",
    description: "Improve cardiovascular health",
    benefits: [
      "Boost heart health",
      "Increase endurance",
      "Burn calories efficiently",
    ],
  },
  {
    name: "Yoga",
    icon: "🧘",
    description: "Flexibility and mind-body connection",
    benefits: ["Improve flexibility", "Reduce stress", "Enhance balance"],
  },
  {
    name: "HIIT",
    icon: "⚡",
    description: "High Intensity Interval Training",
    benefits: [
      "Maximize calorie burn",
      "Improve cardiovascular fitness",
      "Time-efficient workouts",
    ],
  },
];

export default function WorkoutPage() {
  const { user, isLoaded } = useUser();
  const [, setSelectedCategory] = useState<string>("");
  const [weight, setWeight] = useState("");
  const [duration, setDuration] = useState("");
  const [activityLevel, setActivityLevel] = useState("Light");
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [loading, setLoading] = useState(false);
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);

  const loadUserData = useCallback(async () => {
    if (!user) {
      // Clear data when user is not authenticated
      setWorkouts([]);
      return;
    }

    try {
      // Load profile data
      const profileRes = await axios.get("/api/profile");
      if (profileRes.data.profile) {
        const profileData = profileRes.data.profile;
        setWeight(profileData.weight?.toString() || "");
      }

      // Load workout history
      const workoutsRes = await axios.get("/api/workouts?limit=10");
      if (workoutsRes.data.workouts) {
        setWorkouts(workoutsRes.data.workouts);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      // Clear data on error (e.g., when user signs out)
      setWorkouts([]);
    }
  }, [user]);

  // Load user profile and workout history
  useEffect(() => {
    if (isLoaded && user) {
      loadUserData();
    }
  }, [isLoaded, user, loadUserData]);

  const MET_VALUES: METValues = {
    Light: {
      Walking: 3.0,
      Yoga: 2.5,
      Stretching: 2.0,
      LightGym: 3.5,
    },
    Moderate: {
      Jogging: 7.0,
      Cycling: 5.5,
      Swimming: 6.0,
      Strength: 6.0,
    },
    Heavy: {
      Running: 10.0,
      HIIT: 12.0,
      HeavyCycling: 14.0,
      HeavyStrength: 8.0,
    },
  };

  const calculateCalories = () => {
    if (!weight || !duration || !activityLevel) return;

    setLoading(true);

    const w = parseFloat(weight);
    const d = parseFloat(duration);

    // Get MET value based on activity level
    const activityLevels = MET_VALUES[activityLevel as keyof METValues];
    const met = Object.values(activityLevels)[0];

    if (typeof met !== "number") {
      setLoading(false);
      return;
    }

    const calories = (met * w * (d / 60)).toFixed(1);
    setCaloriesBurned(calories);

    setLoading(false);
  };

  const addWorkout = async () => {
    if (!user || !weight || !duration || !activityLevel || !caloriesBurned) {
      return;
    }

    setLoading(true);

    try {
      const d = parseFloat(duration);
      const activityLevels = MET_VALUES[activityLevel as keyof METValues];
      const exerciseNames = Object.keys(activityLevels);

      await axios.post("/api/workouts", {
        duration: d,
        calories: parseFloat(caloriesBurned),
        exercises: exerciseNames,
      });
      
      await loadUserData(); // Reload workout history
      
      // Clear the form after successful save
      setWeight("");
      setDuration("");
      setCaloriesBurned("");
      
    } catch (error) {
      console.error("Error saving workout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Workout Planner</h1>
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
              Plan your perfect workout
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Workout Categories */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Workout Categories
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

              <div className="space-y-6">
                {CATEGORIES.map((category, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-2xl text-purple-600">
                          {category.icon}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        <p className="text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      {category.benefits.map((benefit, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-gray-600"
                        >
                          <svg
                            className="w-4 h-4 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Workout Calculator */}
          <div className="bg-white rounded-2xl shadow-sm">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Workout Calculator
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Weight (kg)
                  </label>
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
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Duration (minutes)
                  </label>
                  <Input
                    value={duration}
                    onChange={(e) => {
                      const input = e.target.value;

                      if (!/^\d*$/.test(input)) return;

                      if (
                        input.length > 3 ||
                        (input.length > 0 && input[0] === "0")
                      )
                        return;

                      setDuration(input);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
                    placeholder="Enter workout duration"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    min
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Activity Level
                  </label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="w-full h-[45px] px-4 py-3 text-sm rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="Light">Light</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Heavy">Heavy</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={calculateCalories}
                    disabled={loading || !weight || !duration || !activityLevel}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
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
                          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                    Calculate Calories Burned
                  </button>

                  {caloriesBurned && user && (
                    <button
                      onClick={addWorkout}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
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
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      )}
                      Add Today&apos;s Workout
                    </button>
                  )}
                </div>
                {caloriesBurned && (
                  <div className="mt-6 p-4 rounded-xl bg-purple-50 text-purple-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          Calories Burned
                        </h3>
                        <p className="text-sm text-purple-600">
                          Based on your weight and activity level
                        </p>
                      </div>
                      <div className="text-2xl font-bold">
                        {caloriesBurned} kcal
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Workout History Section */}
        {user && workouts.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Recent Workouts
            </h2>
            
            <div className="space-y-4">
              {workouts.map((workout, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      {workout.exercises.join(", ")}
                    </div>
                    <div className="text-sm text-gray-600">
                      {workout.duration} minutes • {workout.calories} calories burned
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
    </div>
  );
}
