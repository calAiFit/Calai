"use client";

import { motion } from "framer-motion";
import { AuroraBackground } from "@/components/ui/aurora-background";
import BMICalculator from "../src/app/components/BMICalculator";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Aurora Background Hero Section */}
      <AuroraBackground className="h-[70vh] min-h-[500px]">
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col gap-4 items-center justify-center px-4"
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
            <button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-8 py-4 text-lg font-semibold transition-colors shadow-lg hover:shadow-xl">
              Get Started Today
            </button>
          </Link>
        </motion.div>
      </AuroraBackground>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for Your Fitness Journey
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of users who have transformed their health with our
            comprehensive fitness platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* BMI Calculator Preview */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <BMICalculator />
          </div>

          {/* Features List */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Why Choose NutriCal?
            </h3>
            <div className="space-y-6">
              {[
                {
                  icon: "📊",
                  title: "Accurate BMI calculations",
                  description:
                    "Get precise BMI analysis and personalized recommendations",
                },
                {
                  icon: "🏋️",
                  title: "Custom workout plans",
                  description:
                    "Tailored workout programs to reach your fitness goals",
                },
                {
                  icon: "🍎",
                  title: "Calorie tracking",
                  description:
                    "Monitor your daily calorie intake and nutrition",
                },
                {
                  icon: "🛍️",
                  title: "Fitness equipment shop",
                  description: "Quality gear for your fitness journey",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Start Your Journey?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join our community and take the first step towards a healthier you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <button className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-full font-semibold transition-colors">
                Create Free Account
              </button>
            </Link>
            <Link href="/calorie">
              <button className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 rounded-full font-semibold transition-colors">
                Try BMI Calculator
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
