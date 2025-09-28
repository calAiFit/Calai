"use client";

import { User, Ruler, Scale, Target as TargetIcon } from "lucide-react";
import StatCard from "./StatCard";
import InfoCard from "./InfoCard";
import WeightProgress from "./WeightProgress";
import WeightLogger from "./WeightLogger";

interface ProfileData {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  height?: number;
  weight?: number;
  targetWeight?: number;
  activityLevel?: string;
  avatarUrl: string;
  userId: string;
}

interface ProfileDisplayProps {
  profile: ProfileData | null;
}

export default function ProfileDisplay({ profile }: ProfileDisplayProps) {
  const calculateBMI = () => {
    if (!profile?.weight || !profile?.height) return null;
    return (profile.weight / (profile.height / 100) ** 2).toFixed(1);
  };

  const getBMIDescription = (bmi: string | null) => {
    if (!bmi) return "Enter height & weight to calculate BMI";
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return "Underweight";
    if (bmiValue < 25) return "Normal weight";
    if (bmiValue < 30) return "Overweight";
    return "Obese";
  };

  const getActivityDescription = (level?: string) => {
    switch (level) {
      case "sedentary":
        return "Little or no exercise";
      case "light":
        return "Light exercise 1-3 days/week";
      case "moderate":
        return "Moderate exercise 3-5 days/week";
      case "active":
        return "Heavy exercise 6-7 days/week";
      case "veryActive":
        return "Very heavy exercise twice/day";
      default:
        return "Not set";
    }
  };

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          icon={<User className="w-5 h-5 text-indigo-500" />}
          label="Age"
          value={profile?.age || "N/A"}
        />
        <StatCard
          icon={<Ruler className="w-5 h-5 text-blue-500" />}
          label="Height"
          value={profile?.height ? `${profile.height} cm` : "N/A"}
        />
        <StatCard
          icon={<Scale className="w-5 h-5 text-green-500" />}
          label="Weight"
          value={profile?.weight ? `${profile.weight} kg` : "N/A"}
        />
        <StatCard
          icon={<TargetIcon className="w-5 h-5 text-pink-500" />}
          label="Target"
          value={profile?.targetWeight ? `${profile.targetWeight} kg` : "N/A"}
        />
      </div>


      <div className="grid md:grid-cols-2 gap-6">
        <InfoCard
          title="BMI"
          value={calculateBMI() || "N/A"}
          description={getBMIDescription(calculateBMI())}
          highlight
        />
        <InfoCard
          title="Activity Level"
          value={
            profile?.activityLevel?.replace(/([A-Z])/g, " $1").trim() ||
            "Not set"
          }
          description={getActivityDescription(profile?.activityLevel)}
        />
      </div>


      {profile?.weight && profile?.targetWeight && (
        <WeightProgress
          currentWeight={profile.weight}
          targetWeight={profile.targetWeight}
        />
      )}

      {/* Weight Logger */}
      {profile?.id && (
        <WeightLogger profileId={profile.id} />
      )}
    </div>
  );
}
