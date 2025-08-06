'use client';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#ef4444', '#3b82f6', '#22c55e']; // red, blue, green

export default function SpeakerPieChart({ data }) {
  if (!data) return null;

  const chartData = [
    { name: 'Negative', value: parseFloat(data['Neg %'].replace('%', '')) },
    { name: 'Neutral', value: parseFloat(data['Neu %'].replace('%', '')) },
    { name: 'Positive', value: parseFloat(data['Pos %'].replace('%', '')) },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value}%`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
