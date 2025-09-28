"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import api from "../lib/api";

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  createdAt: string;
}

interface WeightLoggerProps {
  profileId: string;
}

export default function WeightLogger({ profileId }: WeightLoggerProps) {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [newWeight, setNewWeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  

  const isMountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchWeightEntries = useCallback(async () => {
    if (!isMountedRef.current) return;
    setLoading(true);
    try {
      console.log("Fetching weight entries for profileId:", profileId);
      const response = await api.get(`/weight?profileId=${profileId}`);
      console.log("Weight entries response:", response.data);
      console.log("Response status:", response.status);
      console.log("Setting weight entries:", response.data.weightEntries);
      if (isMountedRef.current) {
        const entries = response.data.weightEntries || [];
        console.log("Entries to set:", entries);
        setWeightEntries(entries);
        console.log("Weight entries state updated");
      }
    } catch (err) {
      console.error("Error fetching weight entries:", err);
      if (isMountedRef.current) {
        setError("Failed to load weight history");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [profileId]);

  useEffect(() => {
    if (profileId) {
      fetchWeightEntries();
    }
  }, [profileId, fetchWeightEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight || isNaN(Number(newWeight))) {
      setError("Please enter a valid weight");
      return;
    }

    if (!isMountedRef.current) return;
    setSubmitting(true);
    setError(null);

    try {
      console.log("Submitting weight:", { profileId, weight: Number(newWeight) });
      const response = await api.post("/weight", {
        profileId,
        weight: Number(newWeight),
      });
      console.log("Weight submission response:", response.data);

      if (isMountedRef.current) {
        setNewWeight("");
        await fetchWeightEntries();
      }
    } catch (err) {
      console.error("Error adding weight entry:", err);
      if (isMountedRef.current) {
        setError("Failed to add weight entry");
      }
    } finally {
      if (isMountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const chartData = weightEntries.map((entry) => ({
    date: formatDate(entry.date),
    weight: entry.weight,
    fullDate: new Date(entry.date).toLocaleDateString(),
  }));

  console.log("Current weightEntries state:", weightEntries);
  console.log("Chart data:", chartData);

  return (
    <div className="space-y-6">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Log Weight Progress
        </h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1">
            <input
              type="number"
              step="0.1"
              min="20"
              max="500"
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder="Enter weight (kg)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={submitting}
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !newWeight}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              "Add Weight"
            )}
          </button>
        </form>
      </motion.div>


      {weightEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Weight Progress Chart
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
        </motion.div>
      )}

            
      {weightEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Weight History
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {weightEntries
              .slice()
              .reverse()
              .map((entry) => (
                <div
                  key={entry.id}
                  className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm text-gray-600">
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {entry.weight} kg
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
