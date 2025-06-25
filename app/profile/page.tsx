"use client";

import { motion } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FaHeart, FaUserCog, FaDumbbell, FaChartLine } from "react-icons/fa";

// Map icon name string to actual icon component
const iconMap: Record<string, React.ElementType> = {
  FaHeart,
  FaUserCog,
  FaDumbbell,
  FaChartLine,
};

interface Stat {
  key: string;
  value: number | string;
  label: string;
  icon: string; // use string instead of component
}

interface Workout {
  date: string;
  duration: number;
  calories: number;
  exercises: string[];
}

interface UserData {
  role: string;
  stats: Stat[];
  workoutHistory: Workout[];
}

export default function Profile() {
  const { user } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/sign-in");
    } else {
      fetchUserData();
    }
  }, [user, router]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/profile");
      setUserData(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"
          />
        </div>
      ) : user?.firstName ? (
        <>
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-16">
            <div className="max-w-4xl mx-auto px-4">
              <div className="flex items-center gap-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center"
                >
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user.firstName}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <FaUserCog className="w-16 h-16 text-white" />
                  )}
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold">{user.firstName}</h1>
                  <p className="text-purple-200">
                    {userData?.role || "Fitness Enthusiast"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {userData?.stats?.map((stat) => {
                const Icon = iconMap[stat.icon];
                return (
                  <motion.div
                    key={stat.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-lg p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">{stat.value}</h3>
                        <p className="text-gray-500">{stat.label}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                        {Icon && <Icon className="w-6 h-6 text-purple-600" />}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Workout History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">Workout History</h2>
              <div className="space-y-4">
                {userData?.workoutHistory?.map((workout, index) => (
                  <motion.div
                    key={workout.date}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">
                        {workout.exercises[0] || "Workout"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(workout.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-600">
                        {workout.duration} min
                      </span>
                      <span className="text-sm text-gray-600">
                        {workout.calories} cal
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FaUserCog className="w-5 h-5 text-purple-600" />
                    <span>Account Settings</span>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FaHeart className="w-5 h-5 text-purple-600" />
                    <span>Health Goals</span>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold text-gray-600">
            Please sign in to view your profile
          </h1>
        </div>
      )}
    </div>
  );
}
