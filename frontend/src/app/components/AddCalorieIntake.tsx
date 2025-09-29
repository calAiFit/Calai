"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import axios from "axios";

interface AddCalorieIntakeProps {
  onIntakeAdded: () => void;
}

export default function AddCalorieIntake({ onIntakeAdded }: AddCalorieIntakeProps) {
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fats, setFats] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!foodName.trim() || !calories) {
      setError("Food name and calories are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post("/api/intake-history", {
        foodName: foodName.trim(),
        calories: parseInt(calories),
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fats: parseInt(fats) || 0,
      });

      // Clear form
      setFoodName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFats("");
      
      // Notify parent component
      onIntakeAdded();
    } catch (error) {
      console.error("Error adding calorie intake:", error);
      setError("Failed to add calorie intake. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Add Calorie Intake
        </h2>
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-green-600"
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
        </div>
      </div>

      <p className="text-gray-600 mb-6">
        Manually add your food intake to track your daily calorie consumption.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Food Name *
          </label>
          <Input
            value={foodName}
            onChange={(e) => setFoodName(e.target.value)}
            className="w-full"
            placeholder="e.g., Apple, Chicken Breast, Rice"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calories *
            </label>
            <div className="relative">
              <Input
                value={calories}
                onChange={(e) => {
                  const input = e.target.value;
                  if (!/^\d*$/.test(input)) return;
                  setCalories(input);
                }}
                className="w-full pr-10"
                placeholder="250"
                required
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                kcal
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Protein (optional)
            </label>
            <div className="relative">
              <Input
                value={protein}
                onChange={(e) => {
                  const input = e.target.value;
                  if (!/^\d*$/.test(input)) return;
                  setProtein(input);
                }}
                className="w-full pr-10"
                placeholder="20"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                g
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carbs (optional)
            </label>
            <div className="relative">
              <Input
                value={carbs}
                onChange={(e) => {
                  const input = e.target.value;
                  if (!/^\d*$/.test(input)) return;
                  setCarbs(input);
                }}
                className="w-full pr-10"
                placeholder="30"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                g
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fats (optional)
            </label>
            <div className="relative">
              <Input
                value={fats}
                onChange={(e) => {
                  const input = e.target.value;
                  if (!/^\d*$/.test(input)) return;
                  setFats(input);
                }}
                className="w-full pr-10"
                placeholder="10"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                g
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !foodName.trim() || !calories}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Adding..." : "Add to Daily Intake"}
        </button>
      </form>
    </div>
  );
}

