"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn, user } = useUser();

  const navLinks = ["Home", "Workout", "Calorie", "Shop"];
  
  // Add Profile link for authenticated users
  if (isSignedIn) {
    navLinks.push("Profile");
  }

  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors cursor-pointer "
          >
            <svg
              className="w-6 h-6"
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
            NutriCal
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((label) => (
              <Link
                key={label}
                href={`/${
                  label.toLowerCase() === "home" ? "" : label.toLowerCase()
                }`}
                className="text-gray-700 hover:text-purple-600 transition-colors font-medium cursor-pointer"
              >
                {label}
              </Link>
            ))}
            
            {/* Authentication Buttons */}
            <div className="flex items-center space-x-2">
              {isSignedIn ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                  </span>
                  <SignOutButton>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm transition-colors cursor-pointer">
                      Sign Out
                    </button>
                  </SignOutButton>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <SignInButton mode="modal">
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm transition-colors cursor-pointer">
                      Sign In
                    </button>
                  </SignInButton>
                  <Link
                    href="/sign-up"
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md text-sm transition-colors cursor-pointer"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition cursor-pointer"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation with Framer Motion */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="flex flex-col mt-2 space-y-1 pb-4">
                {navLinks.map((label) => (
                  <Link
                    key={label}
                    href={`/${
                      label.toLowerCase() === "home" ? "" : label.toLowerCase()
                    }`}
                    className="block px-4 py-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-gray-50 transition-colors font-medium cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                
                {/* Mobile Authentication */}
                <div className="px-4 py-2 border-t border-gray-200 mt-2">
                  {isSignedIn ? (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
                      </div>
                      <SignOutButton>
                        <button className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm transition-colors cursor-pointer">
                          Sign Out
                        </button>
                      </SignOutButton>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <SignInButton mode="modal">
                        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm transition-colors cursor-pointer">
                          Sign In
                        </button>
                      </SignInButton>
                      <Link
                        href="/sign-up"
                        className="block w-full bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm transition-colors text-center cursor-pointer"
                        onClick={() => setIsOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
