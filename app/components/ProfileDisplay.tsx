"use client";

import { ProfileData } from "../types/profile";

interface ProfileDisplayProps {
  profile: ProfileData;
  user: any;
}

export default function ProfileDisplay({ profile, user }: ProfileDisplayProps) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4">Welcome, {user.firstName}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Basic Info</h3>
            <p>Age: {profile.age}</p>
            <p>Gender: {profile.gender}</p>
            <p>Height: {profile.height} cm</p>
            <p>Weight: {profile.weight} kg</p>
            <p>Target Weight: {profile.targetWeight} kg</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Fitness Goals</h3>
            <p>Activity Level: {profile.activityLevel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
