"use client";

import { useUser, SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import api from "../lib/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ProfileHeader from "../components/ProfileHeader";
import ProfileForm from "../components/ProfileForm";
import ProfileDisplay from "../components/ProfileDisplay";
import { ProfilePageChart } from "../components/ProfilePageChart";
import { ProfileWorkoutChart } from "../components/ProfileWorkoutChart";
import EnhancedProgressBar from "../components/EnhancedProgressBar";
import { motion } from "framer-motion";

interface ProfileData {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  targetWeight?: number;
  activityLevel?: string;
  avatarUrl: string;
  userId: string;
}

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface WorkoutData {
  todayCalories: number;
  weeklyCalories: number;
  todayDuration: number;
  weeklyDuration: number;
}

interface WeeklyGoals {
  calories: number;
  duration: number;
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [dailyGoals, setDailyGoals] = useState<DailyGoals>({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 65,
  });
  const [workoutData, setWorkoutData] = useState<WorkoutData>({
    todayCalories: 0,
    weeklyCalories: 0,
    todayDuration: 0,
    weeklyDuration: 0,
  });
  const [totalBurned, setTotalBurned] = useState(0);
  const [weeklyGoals] = useState<WeeklyGoals>({
    calories: 2100, // 300 cal/day * 7 days
    duration: 420, // 60 min/day * 7 days
  });
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    targetWeight: "",
    activityLevel: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/profile");
      if (res.data.profile) {
        const profileData = res.data.profile;
        setProfile(profileData);
        setFormData({
          name: profileData.name || user?.firstName || "",
          age: profileData.age?.toString() || "",
          gender: profileData.gender || "",
          height: profileData.height?.toString() || "",
          weight: profileData.weight?.toString() || "",
          targetWeight: profileData.targetWeight?.toString() || "",
          activityLevel: profileData.activityLevel || "",
        });
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { status: number } };
      console.error("Error fetching profile:", err);
      
      if (errorObj.response?.status === 401) {
        router.push("/sign-in");
        return;
      }
      
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  const fetchNutritionData = useCallback(async () => {
    try {
      // Fetch daily goals
      const goalsRes = await api.get("/daily-goals");
      if (goalsRes.data.dailyGoal) {
        setDailyGoals(goalsRes.data.dailyGoal);
      }

      // Fetch today's nutrition data
      const nutritionRes = await api.get("/intake-history");
      if (nutritionRes.data.intakeHistory && Array.isArray(nutritionRes.data.intakeHistory)) {
        // Sum up all intake records for today
        const todayNutrition = nutritionRes.data.intakeHistory.reduce((acc: NutritionData, record: { calories?: number; protein?: number; carbs?: number; fats?: number }) => ({
          calories: acc.calories + (record.calories || 0),
          protein: acc.protein + (record.protein || 0),
          carbs: acc.carbs + (record.carbs || 0),
          fats: acc.fats + (record.fats || 0),
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
        
        setNutritionData(todayNutrition);
      }
    } catch (err) {
      console.error("Error fetching nutrition data:", err);
    }
  }, []);

  const fetchWorkoutData = useCallback(async () => {
    try {
      // Fetch recent workouts (last 7 days)
      const workoutsRes = await api.get("/workouts?limit=50");
      if (workoutsRes.data.workouts && Array.isArray(workoutsRes.data.workouts)) {
        const workouts = workoutsRes.data.workouts;
        const today = new Date();
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // Calculate today's workout data
        const todayWorkouts = workouts.filter((workout: { date: string; calories?: number; duration?: number }) => {
          const workoutDate = new Date(workout.date);
          return workoutDate.toDateString() === today.toDateString();
        });
        
        const todayCalories = todayWorkouts.reduce((sum: number, workout: { calories?: number; duration?: number }) => sum + (workout.calories || 0), 0);
        const todayDuration = todayWorkouts.reduce((sum: number, workout: { calories?: number; duration?: number }) => sum + (workout.duration || 0), 0);
        
        // Calculate weekly workout data
        const weeklyWorkouts = workouts.filter((workout: { date: string; calories?: number; duration?: number }) => {
          const workoutDate = new Date(workout.date);
          return workoutDate >= oneWeekAgo;
        });
        
        const weeklyCalories = weeklyWorkouts.reduce((sum: number, workout: { calories?: number; duration?: number }) => sum + (workout.calories || 0), 0);
        const weeklyDuration = weeklyWorkouts.reduce((sum: number, workout: { calories?: number; duration?: number }) => sum + (workout.duration || 0), 0);
        
        setWorkoutData({
          todayCalories,
          weeklyCalories,
          todayDuration,
          weeklyDuration,
        });
      }

      // Fetch burned calories for today
      const burnedRes = await api.get("/burned-calories");
      if (burnedRes.data.totalBurned) {
        setTotalBurned(burnedRes.data.totalBurned);
      }
    } catch (err) {
      console.error("Error fetching workout data:", err);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push("/sign-in");
      return;
    }
    fetchProfile();
    fetchNutritionData();
    fetchWorkoutData();
  }, [isLoaded, user, router, fetchProfile, fetchNutritionData, fetchWorkoutData]);


  // Refresh workout data when called (for external updates)
  const refreshWorkoutData = useCallback(() => {
    fetchWorkoutData();
  }, [fetchWorkoutData]);

  // Refresh all data
  const refreshAllData = useCallback(() => {
    fetchNutritionData();
    fetchWorkoutData();
  }, [fetchNutritionData, fetchWorkoutData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setError(null);
    setSubmitting(true);

    try {
      const validationErrors: string[] = [];
      if (!formData.name.trim()) validationErrors.push("Name is required.");
      if (!formData.age || isNaN(Number(formData.age)))
        validationErrors.push("Valid age is required.");
      if (!formData.height || isNaN(Number(formData.height)))
        validationErrors.push("Valid height is required.");
      if (!formData.weight || isNaN(Number(formData.weight)))
        validationErrors.push("Valid weight is required.");
      if (!formData.targetWeight || isNaN(Number(formData.targetWeight)))
        validationErrors.push("Valid target weight is required.");
      if (!formData.gender) validationErrors.push("Gender is required.");
      if (!formData.activityLevel)
        validationErrors.push("Activity level is required.");

      if (validationErrors.length > 0) {
        setError(validationErrors.join(" "));
        setSubmitting(false);
        return;
      }

      const payload = {
        name: formData.name,
        age: Number(formData.age),
        height: Number(formData.height),
        weight: Number(formData.weight),
        targetWeight: Number(formData.targetWeight),
        gender: formData.gender as "male" | "female",
        activityLevel: formData.activityLevel as
          | "sedentary"
          | "light"
          | "moderate"
          | "active"
          | "veryActive",
      };

      const res = await api.post("/profile", payload);
      if (res.data.profile) {
        setProfile(res.data.profile);
        setIsEditing(false);
        await fetchProfile();
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };


  if (!user) return <SignIn redirectUrl="/profile" />;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-1"
        >
          <ProfileHeader
            profile={profile}
            user={user}
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing(!isEditing)}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2 space-y-8"
        >
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {isEditing ? (
            <ProfileForm
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSave}
              onCancel={() => setIsEditing(false)}
              submitting={submitting}
            />
          ) : (
            <ProfileDisplay profile={profile} />
          )}

          {/* Nutrition Progress Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Today&apos;s Nutrition Progress
              </h3>
              <button
                onClick={refreshAllData}
                className="px-3 py-1 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh All
              </button>
            </div>
            <ProfilePageChart
              calories={nutritionData.calories}
              protein={nutritionData.protein}
              carbs={nutritionData.carbs}
              fats={nutritionData.fats}
              dailyGoal={dailyGoals}
            />
          </motion.div>

          {/* Nutrition Progress Bars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-8"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Daily Nutrition Progress
            </h3>
            <div className="space-y-4">
              <EnhancedProgressBar
                current={nutritionData.calories}
                goal={dailyGoals.calories}
                label="Calories"
                color="bg-gradient-to-r from-purple-500 to-purple-600"
                unit=" kcal"
                burnedCalories={totalBurned}
                isNetCalories={true}
              />
              <EnhancedProgressBar
                current={nutritionData.protein}
                goal={dailyGoals.protein}
                label="Protein"
                color="bg-gradient-to-r from-blue-500 to-blue-600"
                unit="g"
              />
              <EnhancedProgressBar
                current={nutritionData.carbs}
                goal={dailyGoals.carbs}
                label="Carbs"
                color="bg-gradient-to-r from-green-500 to-green-600"
                unit="g"
              />
              <EnhancedProgressBar
                current={nutritionData.fats}
                goal={dailyGoals.fats}
                label="Fats"
                color="bg-gradient-to-r from-orange-500 to-orange-600"
                unit="g"
              />
            </div>
          </motion.div>

          {/* Workout Progress Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Workout Progress
              </h3>
              <button
                onClick={refreshWorkoutData}
                className="px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            <ProfileWorkoutChart
              todayCalories={workoutData.todayCalories}
              weeklyCalories={workoutData.weeklyCalories}
              todayDuration={workoutData.todayDuration}
              weeklyDuration={workoutData.weeklyDuration}
              weeklyGoal={weeklyGoals}
            />
          </motion.div>

          {/* Workout Progress Bars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-8"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Weekly Workout Progress
            </h3>
            <div className="space-y-4">
              <EnhancedProgressBar
                current={workoutData.weeklyCalories}
                goal={weeklyGoals.calories}
                label="Calories Burned"
                color="bg-gradient-to-r from-orange-500 to-orange-600"
                unit=" kcal"
              />
              <EnhancedProgressBar
                current={workoutData.weeklyDuration}
                goal={weeklyGoals.duration}
                label="Workout Duration"
                color="bg-gradient-to-r from-red-500 to-red-600"
                unit=" min"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
