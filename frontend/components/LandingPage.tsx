"use client";

import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";
import BMICalculator from "../src/app/components/BMICalculator";
import Link from "next/link";
import { Button } from "./ui/button";

export default function LandingPage() {
  return (
    <AuroraBackground>
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20">
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col gap-4 items-center justify-center text-center"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-600 rounded-xl">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold text-purple-600">NutriCal</span>
          </div>

          <div className="text-3xl md:text-6xl font-bold dark:text-white text-center mb-2">
            Your Fitness Journey
          </div>
          <div className="text-xl md:text-3xl font-bold dark:text-white text-center text-purple-600">
            Starts Here
          </div>
          <div className="font-light text-base md:text-xl dark:text-neutral-200 text-gray-600 py-4 text-center max-w-2xl">
            Transform your health with personalized BMI calculations, custom
            workout plans, calorie tracking, and premium fitness equipment.
          </div>
          <Link href="/sign-up">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-4 text-lg font-semibold transition-colors shadow-lg hover:shadow-xl">
              Get Started Today
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold dark:text-white mb-4">
            Everything You Need for Your Fitness Journey
          </h2>
          <p className="text-lg dark:text-neutral-200 text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools and features to help you achieve your health and
            fitness goals
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* BMI Calculator Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-100 dark:border-purple-800"
          >
            <BMICalculator />
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {[
              {
                icon: "📊",
                title: "Accurate BMI Calculations",
                description:
                  "Get precise BMI analysis with personalized health recommendations",
              },
              {
                icon: "🏋️",
                title: "Custom Workout Plans",
                description:
                  "Tailored workout programs designed to reach your specific fitness goals",
              },
              {
                icon: "🍎",
                title: "Calorie Tracking",
                description:
                  "Monitor your daily calorie intake and nutrition with ease",
              },
              {
                icon: "🛍️",
                title: "Fitness Equipment Shop",
                description:
                  "Quality gear and equipment for your fitness journey",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-purple-100 dark:border-purple-800"
              >
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-purple-100 dark:border-purple-800"
        >
          <h3 className="text-2xl md:text-3xl font-bold dark:text-white mb-4">
            Ready to Transform Your Health?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto">
            Join thousands of users who have already started their fitness
            journey with NutriCal. Sign up today and get personalized
            recommendations!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-3 text-lg font-semibold transition-colors shadow-lg hover:shadow-xl">
                Start Your Journey
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-full px-8 py-3 text-lg font-semibold transition-colors"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </AuroraBackground>
  );
}
