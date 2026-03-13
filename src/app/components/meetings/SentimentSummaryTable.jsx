'use client';
import { Smile, Meh, Frown } from 'lucide-react';

export default function SentimentSummaryTable({ summary }) {

  const {
    average_compound,
    average_positive,
    average_neutral,
    average_negative,
    overall_sentiment,
  } = summary;

  const sentimentColorMap = {
    Positive: 'text-green-600',
    Neutral: 'text-yellow-500',
    Negative: 'text-red-500',
  };

  const sentimentIconMap = {
    Positive: <Smile className="w-5 h-5 text-green-500" />,
    Neutral: <Meh className="w-5 h-5 text-yellow-400" />,
    Negative: <Frown className="w-5 h-5 text-red-500" />,
  };

  return (
    <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">

      <div className="grid grid-cols-2 gap-y-4 text-sm">

        <div className="font-medium text-gray-700">Overall Sentiment:</div>
        <div className={`flex items-center gap-2 font-semibold ${sentimentColorMap[overall_sentiment]}`}>
          {sentimentIconMap[overall_sentiment]} {overall_sentiment}
        </div>

        <div className="font-medium text-gray-700">Average Compound Score:</div>
        <div className="text-blue-600 font-medium">
          {average_compound?.toFixed(3) ?? "0.000"}
        </div>

        <div className="font-medium text-gray-700">Average Positive:</div>
        <div className="text-green-600 font-medium">
          {average_positive?.toFixed(3) ?? "0.000"}
        </div>

        <div className="font-medium text-gray-700">Average Neutral:</div>
        <div className="text-yellow-500 font-medium">
          {average_neutral?.toFixed(3) ?? "0.000"}
        </div>

        <div className="font-medium text-gray-700">Average Negative:</div>
        <div className="text-red-500 font-medium">
          {average_negative?.toFixed(3) ?? "0.000"}
        </div>

      </div>

    </div>
  );
}