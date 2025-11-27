"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Target,
  Award,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

interface Insight {
  type: "success" | "warning" | "info" | "tip";
  title: string;
  message: string;
  action?: string;
  priority: number;
}

interface AIInsightsData {
  summary: string;
  insights: Insight[];
  weeklyTrend: "improving" | "stable" | "declining";
  motivationalMessage: string;
  focusAreas: string[];
  achievements: string[];
}

const insightIcons = {
  success: CheckCircle,
  warning: AlertCircle,
  info: Target,
  tip: Lightbulb,
};

const insightColors = {
  success: "bg-green-50 border-green-200 text-green-700",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
  info: "bg-blue-50 border-blue-200 text-blue-700",
  tip: "bg-purple-50 border-purple-200 text-purple-700",
};

const insightIconColors = {
  success: "text-green-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
  tip: "text-purple-500",
};

export default function AIInsightsDashboard() {
  const [insights, setInsights] = useState<AIInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/insights");
      if (!response.ok) throw new Error("Failed to fetch insights");

      const data = await response.json();
      setInsights(data.insights);
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError("Unable to load insights. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "declining":
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "text-green-600 bg-green-50";
      case "declining":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchInsights}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">AI Insights</h3>
              <p className="text-sm text-white/80">Personalized for you</p>
            </div>
          </div>
          <button
            onClick={fetchInsights}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Refresh insights"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <p className="text-white/90">{insights.summary}</p>

        {/* Weekly Trend */}
        <div className="mt-4 flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getTrendColor(
              insights.weeklyTrend
            )}`}
          >
            {getTrendIcon(insights.weeklyTrend)}
            <span className="text-sm font-medium capitalize">
              {insights.weeklyTrend}
            </span>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="p-6 space-y-4">
        {insights.insights.map((insight, index) => {
          const Icon = insightIcons[insight.type];
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border ${insightColors[insight.type]}`}
            >
              <div className="flex items-start gap-3">
                <Icon
                  className={`w-5 h-5 mt-0.5 ${
                    insightIconColors[insight.type]
                  }`}
                />
                <div className="flex-1">
                  <h4 className="font-medium">{insight.title}</h4>
                  <p className="text-sm mt-1 opacity-90">{insight.message}</p>
                  {insight.action && (
                    <button className="mt-2 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                      {insight.action}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Achievements */}
      {insights.achievements.length > 0 && (
        <div className="px-6 pb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-500" />
            Recent Achievements
          </h4>
          <div className="flex flex-wrap gap-2">
            {insights.achievements.map((achievement, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm border border-yellow-200"
              >
                🏆 {achievement}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Focus Areas */}
      {insights.focusAreas.length > 0 && (
        <div className="px-6 pb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" />
            Focus Areas
          </h4>
          <div className="flex flex-wrap gap-2">
            {insights.focusAreas.map((area, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Motivational Message */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 border-t border-purple-100">
        <p className="text-center text-purple-700 font-medium">
          {insights.motivationalMessage}
        </p>
      </div>
    </motion.div>
  );
}
