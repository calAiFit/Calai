"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EnhancedProgressBarProps {
  current: number;
  goal: number;
  label: string;
  unit: string;
  color: string;
  burnedCalories?: number;
  isNetCalories?: boolean;
  className?: string;
}

export default function EnhancedProgressBar({
  current,
  goal,
  label,
  unit,
  color,
  burnedCalories = 0,
  isNetCalories = false,
  className,
}: EnhancedProgressBarProps) {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const netCalories = isNetCalories ? current - burnedCalories : current;
  const netPercentage = isNetCalories && goal > 0 ? Math.min((netCalories / goal) * 100, 100) : percentage;
  
  const isOverGoal = isNetCalories ? netCalories > goal : current > goal;
  const isUnderGoal = isNetCalories ? netCalories < goal : current < goal;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header with labels and values */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {isNetCalories && burnedCalories > 0 && (
            <span className="text-xs text-gray-500">
              (Net: {netCalories > 0 ? '+' : ''}{netCalories})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-semibold",
            isOverGoal ? "text-red-600" : isUnderGoal ? "text-gray-600" : "text-green-600"
          )}>
            {Math.round(current)}
          </span>
          <span className="text-sm text-gray-400">/</span>
          <span className="text-sm text-gray-500">{goal}</span>
          <span className="text-sm text-gray-400">{unit}</span>
        </div>
      </div>

      {/* Progress bar container */}
      <div className="relative">
        {/* Background bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          {/* Progress fill */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              color,
              isOverGoal && "animate-pulse"
            )}
          />
        </div>

        {/* Net calories indicator (for calories only) */}
        {isNetCalories && burnedCalories > 0 && (
          <div className="relative mt-1">
            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, netPercentage)}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Net Calories</span>
              <span>{Math.round(netCalories)} / {goal}</span>
            </div>
          </div>
        )}

        {/* Percentage indicator */}
        <div className="flex justify-between items-center mt-1">
          <span className={cn(
            "text-xs font-medium",
            isOverGoal ? "text-red-600" : isUnderGoal ? "text-gray-500" : "text-green-600"
          )}>
            {Math.round(percentage)}%
          </span>
          {isOverGoal && (
            <span className="text-xs text-red-500 font-medium">
              Over by {Math.round(current - goal)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
