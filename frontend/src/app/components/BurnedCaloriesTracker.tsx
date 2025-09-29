"use client";

import { useState } from "react";
import axios from "axios";

interface BurnedCaloriesTrackerProps {
  onCaloriesAdded?: () => void;
}

interface BurnedCaloriesRecord {
  id: string;
  activity: string;
  calories: number;
  duration?: number;
  createdAt: string;
}

export default function BurnedCaloriesTracker({ onCaloriesAdded }: BurnedCaloriesTrackerProps) {
  const [activity, setActivity] = useState("");
  const [calories, setCalories] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [burnedRecords] = useState<BurnedCaloriesRecord[]>([]);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim() || !calories) return;

    setLoading(true);
    setError(null);

    try {
      await axios.post("/api/burned-calories", {
        activity: activity.trim(),
        calories: parseInt(calories),
        duration: duration ? parseInt(duration) : undefined,
      });

      // Reset form
      setActivity("");
      setCalories("");
      setDuration("");
      setShowForm(false);

      // Notify parent component
      if (onCaloriesAdded) {
        onCaloriesAdded();
      }
    } catch (err: unknown) {
      let errorMessage = "Failed to add burned calories";
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        errorMessage = axiosError.response?.data?.error || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const quickActivities = [
    { name: "Walking (30 min)", calories: 150 },
    { name: "Running (30 min)", calories: 300 },
    { name: "Cycling (30 min)", calories: 250 },
    { name: "Swimming (30 min)", calories: 350 },
    { name: "Weight Training", calories: 200 },
    { name: "Yoga", calories: 100 },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Burned Calories
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors"
        >
          {showForm ? "Cancel" : "Add Activity"}
        </button>
      </div>

      {/* Quick activities */}
      {!showForm && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">Quick add:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActivities.map((activity, index) => (
              <button
                key={index}
                onClick={() => {
                  setActivity(activity.name);
                  setCalories(activity.calories.toString());
                  setShowForm(true);
                }}
                className="p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-700 transition-colors"
              >
                <div className="font-medium">{activity.name}</div>
                <div className="text-orange-600">{activity.calories} cal</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add activity form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activity
            </label>
            <input
              type="text"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              placeholder="e.g., Running, Walking, Swimming..."
              className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calories Burned
              </label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="300"
                min="0"
                max="5000"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                min="0"
                max="1440"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Adding..." : "Add Activity"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setActivity("");
                setCalories("");
                setDuration("");
                setError(null);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Today's activities */}
      {burnedRecords.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Today&apos;s Activities</h4>
          <div className="space-y-2">
            {burnedRecords.map((record) => (
              <div key={record.id} className="flex justify-between items-center p-2 bg-orange-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{record.activity}</div>
                  {record.duration && (
                    <div className="text-xs text-gray-500">{record.duration} minutes</div>
                  )}
                </div>
                <div className="text-orange-600 font-semibold">
                  -{record.calories} cal
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
