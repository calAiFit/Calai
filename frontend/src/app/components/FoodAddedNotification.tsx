"use client";

import { motion, AnimatePresence } from "framer-motion";

interface FoodAddedNotificationProps {
  isVisible: boolean;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  onClose: () => void;
}

export default function FoodAddedNotification({
  isVisible,
  foodName,
  calories,
  protein,
  carbs,
  fats,
  onClose,
}: FoodAddedNotificationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 right-4 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-sm"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900">Added to Daily Intake!</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-900 mb-2">{foodName}</p>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold text-purple-600">{calories}</div>
                <div className="text-gray-500">kcal</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-600">{protein}g</div>
                <div className="text-gray-500">protein</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">{carbs}g</div>
                <div className="text-gray-500">carbs</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-600">{fats}g</div>
                <div className="text-gray-500">fats</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Progress updated in real-time</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
