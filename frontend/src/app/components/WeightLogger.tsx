"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import api from "../lib/api";

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  createdAt: string;
}

interface WeightLoggerProps {
  onWeightAdded?: () => void;
}

export default function WeightLogger({ onWeightAdded }: WeightLoggerProps) {
  const { user } = useUser();
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [newWeight, setNewWeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load user profile to get profileId
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const response = await api.get("/profile");
        if (response.data.profile) {
          setProfileId(response.data.profile.id);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadProfile();
  }, [user]);

  const fetchWeightEntries = useCallback(async () => {
    if (!profileId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/weight?profileId=${profileId}`);
      setWeightEntries(response.data.weightEntries || []);
    } catch (err) {
      console.error("Error fetching weight entries:", err);
      setError("Failed to load weight history");
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    if (profileId) {
      fetchWeightEntries();
    }
  }, [profileId, fetchWeightEntries]);

  const handleDelete = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this weight entry?")) {
      return;
    }

    setDeletingId(entryId);
    setError(null);

    try {
      await api.delete(`/weight?id=${entryId}`);
      setSuccess("Weight entry deleted successfully!");
      
      // Refresh weight entries
      await fetchWeightEntries();
      
      // Notify parent component
      if (onWeightAdded) {
        onWeightAdded();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting weight entry:", err);
      setError("Failed to delete weight entry. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newWeight || isNaN(Number(newWeight))) {
      setError("Please enter a valid weight");
      return;
    }

    if (!profileId) {
      setError("Profile not found. Please try again.");
      return;
    }

    const weight = Number(newWeight);
    if (weight < 20 || weight > 500) {
      setError("Weight must be between 20 and 500 kg");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post("/weight", {
        profileId,
        weight,
      });

      setNewWeight("");
      setSuccess("Weight logged successfully!");
      
      // Refresh weight entries
      await fetchWeightEntries();
      
      // Notify parent component
      if (onWeightAdded) {
        onWeightAdded();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error adding weight entry:", err);
      setError("Failed to log weight. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const chartData = weightEntries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => ({
      date: formatDate(entry.date),
      weight: entry.weight,
      fullDate: formatFullDate(entry.date),
    }));

  const getWeightChange = () => {
    if (weightEntries.length < 2) return null;
    
    const sorted = weightEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];
    
    return {
      change: latest.weight - previous.weight,
      period: `${formatDate(previous.date)} - ${formatDate(latest.date)}`,
    };
  };

  const weightChange = getWeightChange();

  if (!user) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <p>Please sign in to log your weight</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weight Input Form */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Log Weight
          </h3>
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-purple-600"
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

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <Input
                  type="number"
                  step="0.1"
                  min="20"
                  max="500"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="Enter your weight"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 pr-10"
                  disabled={submitting}
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  kg
                </span>
              </div>
            </div>
            <Button
              type="submit"
              disabled={submitting || !newWeight}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </div>
              ) : (
                "Add Weight"
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Weight Statistics */}
      {weightEntries.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Weight Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-600">
                {weightEntries[weightEntries.length - 1]?.weight} kg
              </div>
              <div className="text-sm text-gray-600">Current Weight</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-600">
                {weightEntries.length}
              </div>
              <div className="text-sm text-gray-600">Total Entries</div>
            </div>
            {weightChange && (
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className={`text-2xl font-bold ${weightChange.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {weightChange.change >= 0 ? '+' : ''}{weightChange.change.toFixed(1)} kg
                </div>
                <div className="text-sm text-gray-600">Recent Change</div>
              </div>
            )}
          </div>
        </Card>
      )}


      {weightEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Weight Progress
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                    domain={['dataMin - 2', 'dataMax + 2']}
                  />
                  <Tooltip 
                    labelFormatter={(value, payload) => {
                      if (payload && payload[0]) {
                        return payload[0].payload.fullDate;
                      }
                      return value;
                    }}
                    formatter={(value: number) => [`${value} kg`, "Weight"]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Weight History */}
      {weightEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Weight History
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {weightEntries
                .slice()
                .reverse()
                .map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        {formatFullDate(entry.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">
                        {entry.weight} kg
                      </span>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        disabled={deletingId === entry.id}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        title="Delete entry"
                      >
                        {deletingId === entry.id ? (
                          <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && weightEntries.length === 0 && (
        <Card className="p-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No weight entries yet
            </h3>
            <p className="text-gray-500">
              Start tracking your weight by adding your first entry above.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
