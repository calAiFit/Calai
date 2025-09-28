"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Workout {
  id: string;
  date: string;
  duration: number;
  calories: number;
  exercises: string[];
}

interface WorkoutTrackerProps {
  userId: string;
}

export default function WorkoutTracker({ userId }: WorkoutTrackerProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    duration: "",
    calories: "",
    exercises: "",
  });

  useEffect(() => {
    fetchWorkouts();
  }, [userId]);

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/workouts?limit=10");
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data.workouts || []);
      }
    } catch {
      setError("Failed to fetch workouts");
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
      const exercises = formData.exercises
        .split(",")
        .map(ex => ex.trim())
        .filter(ex => ex.length > 0);

      const response = await fetch("/api/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          duration: parseInt(formData.duration),
          calories: parseInt(formData.calories),
          exercises,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setWorkouts(prev => [data.workout, ...prev]);
        setFormData({
          duration: "",
          calories: "",
          exercises: "",
        });
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to add workout");
      }
    } catch {
      setError("Failed to add workout");
    } finally {
      setSaving(false);
    }
  };

  const calculateWeeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentWorkouts = workouts.filter(
      workout => new Date(workout.date) >= weekAgo
    );

    return recentWorkouts.reduce(
      (stats, workout) => ({
        totalDuration: stats.totalDuration + workout.duration,
        totalCalories: stats.totalCalories + workout.calories,
        totalWorkouts: stats.totalWorkouts + 1,
      }),
      { totalDuration: 0, totalCalories: 0, totalWorkouts: 0 }
    );
  };

  const weeklyStats = calculateWeeklyStats();

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
      <h2 className="text-xl font-semibold mb-4">Workout Tracker</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
            <Input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="60"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Calories Burned</label>
            <Input
              type="number"
              name="calories"
              value={formData.calories}
              onChange={handleInputChange}
              placeholder="300"
              min="0"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Exercises (comma-separated)
          </label>
          <Input
            type="text"
            name="exercises"
            value={formData.exercises}
            onChange={handleInputChange}
            placeholder="e.g., Push-ups, Squats, Running"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {saving ? "Adding..." : "Add Workout"}
        </Button>
      </form>

      {/* Weekly Stats */}
      <div className="mb-6 p-4 bg-purple-50 rounded-lg">
        <h3 className="font-medium mb-2">This WeekThis Week&apos;s Statsapos;s Stats</h3>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <div className="text-gray-600">Workouts</div>
            <div className="font-medium">{weeklyStats.totalWorkouts}</div>
          </div>
          <div>
            <div className="text-gray-600">Duration</div>
            <div className="font-medium">{weeklyStats.totalDuration} min</div>
          </div>
          <div>
            <div className="text-gray-600">Calories</div>
            <div className="font-medium">{weeklyStats.totalCalories} kcal</div>
          </div>
        </div>
      </div>

        {/* Recent Workouts */}
      <div>
        <h3 className="font-medium mb-3">Recent Workouts</h3>
        {workouts.length === 0 ? (
          <p className="text-gray-500 text-sm">No workouts recorded yet</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="p-3 bg-gray-50 rounded-lg text-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">
                    {new Date(workout.date).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {workout.duration} min
                  </div>
                </div>
                <div className="text-xs text-gray-600 mb-1">
                  {workout.calories} calories burned
                </div>
                <div className="text-xs text-gray-500">
                  {workout.exercises.join(", ")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
