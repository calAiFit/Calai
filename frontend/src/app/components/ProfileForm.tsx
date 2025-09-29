"use client";

import InputField from "./InputField";

interface ProfileFormProps {
  formData: {
    name: string;
    age: string;
    gender: string;
    height: string;
    weight: string;
    targetWeight: string;
    activityLevel: string;
  };
  onInputChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting: boolean;
}

export default function ProfileForm({ 
  formData, 
  onInputChange, 
  onSubmit, 
  onCancel, 
  submitting 
}: ProfileFormProps) {
  return (
    <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-xl p-8 space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Edit Profile</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Name"
          value={formData.name}
          onChange={(v) => onInputChange("name", v)}
        />
        <InputField
          label="Age"
          type="number"
          value={formData.age}
          onChange={(v) => onInputChange("age", v)}
        />
        <InputField
          label="Height (cm)"
          type="number"
          value={formData.height}
          onChange={(v) => onInputChange("height", v)}
        />
        <InputField
          label="Weight (kg)"
          type="number"
          value={formData.weight}
          onChange={(v) => onInputChange("weight", v)}
        />
        <InputField
          label="Target Weight (kg)"
          type="number"
          value={formData.targetWeight}
          onChange={(v) => onInputChange("targetWeight", v)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            value={formData.gender}
            onChange={(e) => onInputChange("gender", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Activity Level
        </label>
        <select
          value={formData.activityLevel}
          onChange={(e) => onInputChange("activityLevel", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Select activity level</option>
          <option value="sedentary">Sedentary (little or no exercise)</option>
          <option value="light">Light (1-3 days/week)</option>
          <option value="moderate">Moderate (3-5 days/week)</option>
          <option value="active">Active (6-7 days/week)</option>
          <option value="veryActive">Very Active (twice/day)</option>
        </select>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}