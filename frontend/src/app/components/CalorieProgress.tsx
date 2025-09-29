"use client";

import { motion } from "framer-motion";

interface CalorieProgressProps {
  current: number;
  goal: number;
  label: string;
  color: string;
  unit?: string;
}

export default function CalorieProgress({ 
  current, 
  goal, 
  label, 
  color, 
  unit = "" 
}: CalorieProgressProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const remaining = Math.max(goal - current, 0);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">
          {current}{unit} / {goal}{unit}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-3 rounded-full ${color}`}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>{percentage.toFixed(1)}% complete</span>
        <span>{remaining > 0 ? `${remaining}${unit} remaining` : "Goal reached!"}</span>
      </div>
    </div>
  );
}

