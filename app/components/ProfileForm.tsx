"use client";

import { useState } from "react";
import { ProfileData } from "../types/profile";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ProfileFormProps {
  onSubmit: (data: ProfileData) => void;
  error?: string | null;
  submitting: boolean;
}

export default function ProfileForm({
  onSubmit,
  error,
  submitting,
}: ProfileFormProps) {
  const [form, setForm] = useState<ProfileData>({
    age: "",
    gender: "",
    height: "",
    weight: "",
    targetWeight: "",
    activityLevel: "",
    userId: "",
    id: "",
    avatarUrl: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/\D/g, "");
    setForm((prev) => ({
      ...prev,
      [name]: numericValue,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-red-600 bg-red-100 p-3 mb-4 rounded">{error}</div>
      )}

      {[
        {
          name: "age",
          placeholder: "Age (years)",
        },
        {
          name: "height",
          placeholder: "Height (cm)",
        },
        {
          name: "weight",
          placeholder: "Weight (kg)",
        },
        {
          name: "targetWeight",
          placeholder: "Target Weight (kg)",
        },
      ].map((field) => (
        <Input
          key={field.name}
          name={field.name}
          onChange={handleInputChange}
          value={form[field.name as keyof ProfileData]}
          placeholder={field.placeholder}
          className="w-full border p-2 rounded"
          required
        />
      ))}

      <Select
        name="gender"
        value={form.gender}
        onValueChange={(value) => handleSelectChange("gender", value)}
        required
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select gender" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="male">Male</SelectItem>
          <SelectItem value="female">Female</SelectItem>
        </SelectContent>
      </Select>

      <Select
        name="activityLevel"
        value={form.activityLevel}
        onValueChange={(value) => handleSelectChange("activityLevel", value)}
        required
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Activity Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="sedentary">Sedentary</SelectItem>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="moderate">Moderate</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="veryActive">Very Active</SelectItem>
        </SelectContent>
      </Select>

      <Button
        type="submit"
        disabled={submitting}
        className={`w-full bg-purple-600 text-white py-2 rounded ${
          submitting ? "opacity-50 cursor-not-allowed" : "hover:bg-purple-700"
        }`}
      >
        {submitting ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
