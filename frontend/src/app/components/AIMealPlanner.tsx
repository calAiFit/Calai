"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  RefreshCw,
  Clock,
  Flame,
  ChevronRight,
  Utensils,
  Leaf,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Plus,
} from "lucide-react";

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
}

interface DailyMealPlan {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  meals: MealPlan[];
}

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
};

const mealColors = {
  breakfast: "from-orange-500 to-yellow-500",
  lunch: "from-green-500 to-emerald-500",
  dinner: "from-purple-500 to-indigo-500",
  snack: "from-pink-500 to-rose-500",
};

const dietTypes = [
  { id: "balanced", label: "Balanced" },
  { id: "high-protein", label: "High Protein" },
  { id: "low-carb", label: "Low Carb" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
];

export default function AIMealPlanner() {
  const [mealPlan, setMealPlan] = useState<DailyMealPlan | null>(null);
  const [selectedDiet, setSelectedDiet] = useState("balanced");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<MealPlan | null>(null);

  const fetchMealPlan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/ai/meal-plan?dietType=${selectedDiet}`
      );

      if (!response.ok) throw new Error("Failed to fetch meal plan");

      const data = await response.json();
      setMealPlan(data.mealPlan);
    } catch (err) {
      console.error("Error fetching meal plan:", err);
      setError("Unable to generate meal plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMealPlan();
  }, [selectedDiet]);

  const addMealToIntake = async (meal: MealPlan) => {
    try {
      await fetch("/api/intake-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodName: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fats: meal.fats,
        }),
      });
      alert(`Added "${meal.name}" to your daily intake!`);
    } catch (err) {
      console.error("Error adding to intake:", err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI Meal Planner</h3>
              <p className="text-sm text-white/80">
                Personalized meal suggestions
              </p>
            </div>
          </div>
          <button
            onClick={fetchMealPlan}
            disabled={isLoading}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            title="Generate new plan"
          >
            <RefreshCw
              className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        {/* Diet Type Selection */}
        <div>
          <p className="text-sm text-white/80 mb-2">Diet preference:</p>
          <div className="flex gap-2 flex-wrap">
            {dietTypes.map((diet) => (
              <button
                key={diet.id}
                onClick={() => setSelectedDiet(diet.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedDiet === diet.id
                    ? "bg-white text-green-600"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                {diet.label}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Totals */}
        {mealPlan && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <p className="text-2xl font-bold">{mealPlan.totalCalories}</p>
              <p className="text-xs text-white/80">Calories</p>
            </div>
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <p className="text-2xl font-bold">{mealPlan.totalProtein}g</p>
              <p className="text-xs text-white/80">Protein</p>
            </div>
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <p className="text-2xl font-bold">{mealPlan.totalCarbs}g</p>
              <p className="text-xs text-white/80">Carbs</p>
            </div>
            <div className="bg-white/20 rounded-lg p-2 text-center">
              <p className="text-2xl font-bold">{mealPlan.totalFats}g</p>
              <p className="text-xs text-white/80">Fats</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchMealPlan}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        ) : mealPlan ? (
          <div className="space-y-4">
            {mealPlan.meals.map((meal, index) => {
              const Icon = mealIcons[meal.meal];
              const colorClass = mealColors[meal.meal];

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="flex">
                    {/* Meal Type Indicator */}
                    <div className={`w-2 bg-gradient-to-b ${colorClass}`}></div>

                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-br ${colorClass} text-white`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                              {meal.meal}
                            </p>
                            <h5 className="font-semibold text-gray-900">
                              {meal.name}
                            </h5>
                            <p className="text-sm text-gray-600 mt-1">
                              {meal.description}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => addMealToIntake(meal)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Add to intake"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Nutrition Info */}
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Flame className="w-4 h-4 text-orange-500" />
                          {meal.calories} cal
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-600">
                          P: {meal.protein}g
                        </span>
                        <span className="text-gray-600">C: {meal.carbs}g</span>
                        <span className="text-gray-600">F: {meal.fats}g</span>
                        <span className="text-gray-400">|</span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-3 h-3" />
                          {meal.preparationTime} min
                        </span>
                      </div>

                      {/* Ingredients Preview */}
                      <div className="flex items-center gap-2 mt-3">
                        <Leaf className="w-4 h-4 text-green-500" />
                        <p className="text-sm text-gray-500 truncate">
                          {meal.ingredients.slice(0, 4).join(", ")}
                          {meal.ingredients.length > 4 &&
                            ` +${meal.ingredients.length - 4} more`}
                        </p>
                        <button
                          onClick={() =>
                            setSelectedMeal(
                              selectedMeal?.name === meal.name ? null : meal
                            )
                          }
                          className="text-green-600 hover:text-green-700 ml-auto"
                        >
                          <ChevronRight
                            className={`w-5 h-5 transition-transform ${
                              selectedMeal?.name === meal.name
                                ? "rotate-90"
                                : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* Expanded Ingredients */}
                      {selectedMeal?.name === meal.name && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3 pt-3 border-t border-gray-100"
                        >
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Full Ingredient List:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {meal.ingredients.map((ingredient, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                              >
                                {ingredient}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
