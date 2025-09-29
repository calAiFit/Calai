"use client";

import Image from "next/image";
import { UserResource } from "@clerk/types";

interface ProfileHeaderProps {
  profile: {
    name?: string;
    avatarUrl?: string;
  } | null;
  user: UserResource;
  isEditing: boolean;
  onToggleEdit: () => void;
}

export default function ProfileHeader({ profile, user, isEditing, onToggleEdit }: ProfileHeaderProps) {
  return (
    <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl p-8 flex flex-col items-center">
      <div className="relative w-28 h-28 mb-4">
        {profile?.avatarUrl ? (
          <Image
            src={profile.avatarUrl}
            alt="Profile"
            width={112}
            height={112}
            className="rounded-full object-cover border-4 border-purple-500 shadow-lg"
            unoptimized
          />
        ) : (
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {profile?.name?.charAt(0) || user?.firstName?.charAt(0) || "U"}
          </div>
        )}
      </div>
      <h2 className="text-2xl font-bold text-gray-900">
        {profile?.name || user?.firstName || "User"}
      </h2>
      <p className="text-gray-600 mb-6">
        {user?.emailAddresses[0]?.emailAddress}
      </p>
      <button
        onClick={onToggleEdit}
        className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:opacity-90 transition"
      >
        {isEditing ? "Cancel" : "Edit Profile"}
      </button>
    </div>
  );
}
