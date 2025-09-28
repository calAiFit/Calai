"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface Props {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  dailyGoal: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

 export const ProfilePageChart = ({
  calories,
  protein,
  carbs,
  fats,
  dailyGoal,
}: Props) => {
  const data = [
    { name: "Calories", consumed: calories, goal: dailyGoal.calories },
    { name: "Protein", consumed: protein, goal: dailyGoal.protein },
    { name: "Carbs", consumed: carbs, goal: dailyGoal.carbs },
    { name: "Fats", consumed: fats, goal: dailyGoal.fats },
  ];

  return (
    <div className="w-full h-72 bg-white rounded-2xl shadow-sm p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="consumed" fill="#a855f7" radius={[8, 8, 0, 0]} />
          <Bar dataKey="goal" fill="#e5e7eb" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};


