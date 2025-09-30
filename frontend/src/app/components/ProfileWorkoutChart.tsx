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
  todayCalories: number;
  weeklyCalories: number;
  todayDuration: number;
  weeklyDuration: number;
  weeklyGoal: {
    calories: number;
    duration: number;
  };
}

export const ProfileWorkoutChart = ({
  todayCalories,
  weeklyCalories,
  todayDuration,
  weeklyDuration,
  weeklyGoal,
}: Props) => {
  const data = [
    { 
      name: "Today Calories", 
      burned: todayCalories, 
      goal: weeklyGoal.calories / 7,
      type: "calories"
    },
    { 
      name: "Today Duration", 
      burned: todayDuration, 
      goal: weeklyGoal.duration / 7,
      type: "duration"
    },
    { 
      name: "Week Calories", 
      burned: weeklyCalories, 
      goal: weeklyGoal.calories,
      type: "calories"
    },
    { 
      name: "Week Duration", 
      burned: weeklyDuration, 
      goal: weeklyGoal.duration,
      type: "duration"
    },
  ];

  const formatTooltip = (value: number, name: string, props: { payload?: { type: string } }) => {
    if (props.payload?.type === "duration") {
      return [`${value} min`, name];
    }
    return [`${value} cal`, name];
  };

  return (
    <div className="w-full h-72 bg-white rounded-2xl shadow-sm p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis />
          <Tooltip formatter={formatTooltip} />
          <Bar dataKey="burned" fill="#f59e0b" radius={[8, 8, 0, 0]} />
          <Bar dataKey="goal" fill="#e5e7eb" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
