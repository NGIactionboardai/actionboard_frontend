'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SentimentDistributionBarChart({ data }) {
  if (!data || data.length === 0) return null;

  const barData = data.map((entry) => ({
    name: entry.Speaker,
    Positive: parseFloat(entry['Pos %'].replace('%', '')),
    Neutral: parseFloat(entry['Neu %'].replace('%', '')),
    Negative: parseFloat(entry['Neg %'].replace('%', '')),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={barData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
        <XAxis dataKey="name" />
        <YAxis unit="%" />
        <Tooltip />
        <Legend />
        <Bar dataKey="Positive" stackId="a" fill="#22c55e" />
        <Bar dataKey="Neutral" stackId="a" fill="#3b82f6" />
        <Bar dataKey="Negative" stackId="a" fill="#ef4444" />
      </BarChart>
    </ResponsiveContainer>
  );
}
