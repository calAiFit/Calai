"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DailyGoal {
  id: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  date: string;
}

interface DailyGoalsProps {
  userId: string;
}

export default function DailyGoals({ userId }: DailyGoalsProps) {
  const [goals, setGoals] = useState<DailyGoal | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  useEffect(() => {
    fetchDailyGoals();
  }, [userId]);

  const fetchDailyGoals = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/daily-goals");
      if (response.ok) {
        const data = await response.json();
        if (data.dailyGoal) {
          setGoals(data.dailyGoal);
          setFormData({
            calories: data.dailyGoal.calories.toString(),
            protein: data.dailyGoal.protein.toString(),
            carbs: data.dailyGoal.carbs.toString(),
            fats: data.dailyGoal.fats.toString(),
          });
        }
      }
    } catch {
      setError("Failed to fetch daily goals");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/daily-goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          calories: parseInt(formData.calories),
          protein: parseInt(formData.protein),
          carbs: parseInt(formData.carbs),
          fats: parseInt(formData.fats),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGoals(data.dailyGoal);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to save goals");
      }
    } catch {
      setError("Failed to save daily goals");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Daily Goals</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Calories (kcal)</label>
            <Input
              type="number"
              name="calories"
              value={formData.calories}
              onChange={handleInputChange}
              placeholder="2000"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Protein (g)</label>
            <Input
              type="number"
              name="protein"
              value={formData.protein}
              onChange={handleInputChange}
              placeholder="150"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Carbs (g)</label>
            <Input
              type="number"
              name="carbs"
              value={formData.carbs}
              onChange={handleInputChange}
              placeholder="250"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fats (g)</label>
            <Input
              type="number"
              name="fats"
              value={formData.fats}
              onChange={handleInputChange}
              placeholder="65"
              min="0"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {saving ? "Saving..." : goals ? "Update Goals" : "Set Goals"}
        </Button>
      </form>

      {goals && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Current Goals</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Calories: {goals.calories} kcal</div>
            <div>Protein: {goals.protein} g</div>
            <div>Carbs: {goals.carbs} g</div>
            <div>Fats: {goals.fats} g</div>
          </div>
        </div>
      )}
    </Card>
  );
}
