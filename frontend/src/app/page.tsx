"use client";

import { useUser } from "@clerk/nextjs";
import LandingPage from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }
  return user ? <Dashboard /> : <LandingPage />;
}
