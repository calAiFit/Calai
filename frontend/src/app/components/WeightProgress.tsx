"use client";

import { motion } from "framer-motion";

interface WeightProgressProps {
  currentWeight: number;
  targetWeight: number;
}

export default function WeightProgress({ currentWeight, targetWeight }: WeightProgressProps) {
  const progressPercentage = Math.min(
    100,
    Math.max(
      0,
      ((currentWeight - targetWeight) / Math.abs(currentWeight - targetWeight + 0.1)) * 50 + 50
    )
  );

  const weightDifference = Math.abs(currentWeight - targetWeight);
  const isLosing = currentWeight > targetWeight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl p-8"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Weight Progress</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Current: {currentWeight}kg</span>
          <span>Target: {targetWeight}kg</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1 }}
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
          />
        </div>
        <div className="text-sm text-gray-600 text-center">
          {isLosing
            ? `${weightDifference.toFixed(1)}kg to lose`
            : `${weightDifference.toFixed(1)}kg to gain`}
        </div>
      </div>
    </motion.div>
  );
}
