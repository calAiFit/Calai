"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Clock,
  Flame,
  ChevronDown,
  ChevronUp,
  Play,
  Sparkles,
  RefreshCw,
  Target,
  Zap,
} from "lucide-react";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
}

interface WorkoutRecommendation {
  name: string;
  description: string;
  duration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  caloriesBurn: number;
  exercises: Exercise[];
  muscleGroups: string[];
  equipment: string[];
}

const difficultyColors = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
};

const goals = [
  { id: "weight-loss", label: "Weight Loss", icon: Flame },
  { id: "muscle-gain", label: "Build Muscle", icon: Dumbbell },
  { id: "general-fitness", label: "General Fitness", icon: Target },
];

const durations = [15, 30, 45, 60];

export default function AIWorkoutRecommendations() {
  const [recommendations, setRecommendations] = useState<
    WorkoutRecommendation[]
  >([]);
  const [selectedGoal, setSelectedGoal] = useState("general-fitness");
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedWorkout, setExpandedWorkout] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/ai/workout-recommendations?goal=${selectedGoal}&duration=${selectedDuration}`
      );

      if (!response.ok) throw new Error("Failed to fetch recommendations");

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      console.error("Error fetching workout recommendations:", err);
      setError("Unable to load recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [selectedGoal, selectedDuration]);

  const handleStartWorkout = async (workout: WorkoutRecommendation) => {
    // Log the workout to the backend
    try {
      await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: workout.duration,
          calories: workout.caloriesBurn,
          exercises: workout.exercises.map((e) => e.name),
        }),
      });
      alert(`Started "${workout.name}" workout! Good luck! 💪`);
    } catch (err) {
      console.error("Error logging workout:", err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 p-2 rounded-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">AI Workout Planner</h3>
            <p className="text-sm text-white/80">
              Personalized workouts just for you
            </p>
          </div>
        </div>

        {/* Goal Selection */}
        <div className="mb-4">
          <p className="text-sm text-white/80 mb-2">Select your goal:</p>
          <div className="flex gap-2 flex-wrap">
            {goals.map((goal) => {
              const Icon = goal.icon;
              return (
                <button
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedGoal === goal.id
                      ? "bg-white text-blue-600"
                      : "bg-white/20 text-white hover:bg-white/30"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {goal.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration Selection */}
        <div>
          <p className="text-sm text-white/80 mb-2">Available time:</p>
          <div className="flex gap-2">
            {durations.map((duration) => (
              <button
                key={duration}
                onClick={() => setSelectedDuration(duration)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedDuration === duration
                    ? "bg-white text-blue-600"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <Clock className="w-3 h-3" />
                {duration}min
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchRecommendations}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-700">
                Recommended Workouts
              </h4>
              <button
                onClick={fetchRecommendations}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Get new recommendations"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {recommendations.map((workout, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                {/* Workout Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setExpandedWorkout(expandedWorkout === index ? null : index)
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-gray-900">
                          {workout.name}
                        </h5>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            difficultyColors[workout.difficulty]
                          }`}
                        >
                          {workout.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {workout.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {workout.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-500" />
                          {workout.caloriesBurn} cal
                        </span>
                        <span className="flex items-center gap-1">
                          <Dumbbell className="w-4 h-4" />
                          {workout.exercises.length} exercises
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartWorkout(workout);
                        }}
                        className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      {expandedWorkout === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Muscle Groups */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {workout.muscleGroups.map((group, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {group}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Expanded Exercises */}
                <AnimatePresence>
                  {expandedWorkout === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 border-t border-gray-100 bg-gray-50">
                        <h6 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-500" />
                          Exercise List
                        </h6>
                        <div className="space-y-2">
                          {workout.exercises.map((exercise, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                                  {i + 1}
                                </span>
                                <span className="font-medium text-gray-900">
                                  {exercise.name}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                {exercise.sets} × {exercise.reps}
                                <span className="text-gray-400 ml-2">
                                  ({exercise.restSeconds}s rest)
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Equipment */}
                        {workout.equipment.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm text-gray-500 mb-2">
                              Equipment needed:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {workout.equipment.map((item, i) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                                >
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => handleStartWorkout(workout)}
                          className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Play className="w-5 h-5" />
                          Start This Workout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
