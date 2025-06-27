"use client";

import { useUser, SignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { ProfileData } from "../types/profile";
import ProfileForm from "../components/ProfileForm";
import ProfileDisplay from "../components/ProfileDisplay";
import LoadingSpinner from "../components/LoadingSpinner";
import { useProfile } from "@/lib/userProfile";
export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const profilesss = useProfile();
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push("/sign-in");
      return;
    }
    fetchProfile();
  }, [isLoaded, user, router]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("/api/profile");
      if (res.data.profile) setProfile(res.data.profile);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const handleSubmit = async (data: ProfileData) => {
    setError(null);
    setSubmitting(true);

    if (!user) {
      setError("Please sign in to update your profile");
      setSubmitting(false);
      return;
    }

    try {
      const validationErrors: string[] = [];

      if (
        !data.age ||
        isNaN(Number(data.age)) ||
        !data.height ||
        isNaN(Number(data.height)) ||
        !data.weight ||
        isNaN(Number(data.weight)) ||
        !data.targetWeight ||
        isNaN(Number(data.targetWeight))
      ) {
        validationErrors.push("All numeric fields must have valid numbers.");
      }

      if (!data.gender) validationErrors.push("Select a gender.");
      if (!data.activityLevel) validationErrors.push("Select activity level.");

      if (validationErrors.length > 0) {
        setError(validationErrors.join(" "));
        return;
      }

      const payload = {
        age: Number(data.age),
        height: Number(data.height),
        weight: Number(data.weight),
        targetWeight: Number(data.targetWeight),
        gender: data.gender as "male" | "female",
        activityLevel: data.activityLevel as
          | "sedentary"
          | "light"
          | "moderate"
          | "active"
          | "veryActive",
        userId: user?.id || "",
      };

      const res = await axios.post("/api/profile", payload);
      if (res.data.profile) {
        setProfile(res.data.profile);
        router.refresh();
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return <SignIn redirectUrl="/profile" />;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (profile) {
    return <ProfileDisplay profile={profile} user={user} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <ProfileForm
          onSubmit={handleSubmit}
          error={error}
          submitting={submitting}
        />
      </div>
    </div>
  );
}
