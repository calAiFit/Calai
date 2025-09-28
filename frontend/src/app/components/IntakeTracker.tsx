"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface IntakeRecord {
  id: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  date: string;
  createdAt: string;
}

interface IntakeTrackerProps {
  userId: string;
}

export default function IntakeTracker({ userId }: IntakeTrackerProps) {
  const [intakeHistory, setIntakeHistory] = useState<IntakeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    foodName: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
  });

  useEffect(() => {
    fetchIntakeHistory();
  }, [userId]);

  const fetchIntakeHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/intake-history");
      if (response.ok) {
        const data = await response.json();
        setIntakeHistory(data.intakeHistory || []);
      }
    } catch {
      setError("Failed to fetch intake history");
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
      const response = await fetch("/api/intake-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          foodName: formData.foodName,
          calories: parseInt(formData.calories),
          protein: parseInt(formData.protein),
          carbs: parseInt(formData.carbs),
          fats: parseInt(formData.fats),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIntakeHistory(prev => [data.intakeRecord, ...prev]);
        setFormData({
          foodName: "",
          calories: "",
          protein: "",
          carbs: "",
          fats: "",
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to add intake record");
      }
    } catch {
      setError("Failed to add intake record");
    } finally {
      setSaving(false);
    }
  };

  const calculateTotals = () => {
    return intakeHistory.reduce(
      (totals, record) => ({
        calories: totals.calories + record.calories,
        protein: totals.protein + record.protein,
        carbs: totals.carbs + record.carbs,
        fats: totals.fats + record.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const totals = calculateTotals();

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
      <h2 className="text-xl font-semibold mb-4">Food Intake Tracker</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Food Name</label>
          <Input
            type="text"
            name="foodName"
            value={formData.foodName}
            onChange={handleInputChange}
            placeholder="e.g., Grilled Chicken Breast"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Calories (kcal)</label>
            <Input
              type="number"
              name="calories"
              value={formData.calories}
              onChange={handleInputChange}
              placeholder="200"
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
              placeholder="25"
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
              placeholder="10"
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
              placeholder="5"
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
          {saving ? "Adding..." : "Add Food"}
        </Button>
      </form>


      <div className="mb-6 p-4 bg-purple-50 rounded-lg">
        <h3 className="font-medium mb-2">Today&apos;s Totals</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Calories: {totals.calories} kcal</div>
          <div>Protein: {totals.protein} g</div>
          <div>Carbs: {totals.carbs} g</div>
          <div>Fats: {totals.fats} g</div>
        </div>
      </div>


      <div>
        <h3 className="font-medium mb-3">Recent Intake</h3>
        {intakeHistory.length === 0 ? (
          <p className="text-gray-500 text-sm">No intake records for today</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {intakeHistory.map((record) => (
              <div
                key={record.id}
                className="p-3 bg-gray-50 rounded-lg text-sm"
              >
                <div className="font-medium">{record.foodName}</div>
                <div className="grid grid-cols-4 gap-2 mt-1 text-xs text-gray-600">
                  <span>{record.calories} kcal</span>
                  <span>{record.protein}g protein</span>
                  <span>{record.carbs}g carbs</span>
                  <span>{record.fats}g fats</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(record.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
