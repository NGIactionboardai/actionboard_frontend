'use client';
import { Smile, Meh, Frown, Info } from 'lucide-react';

export default function SentimentSummaryTable({ summary }) {
  if (
    !summary ||
    typeof summary !== 'object' ||
    summary === null ||
    Object.keys(summary).length === 0
  ) {
    return (
      <div className="max-w-lg mx-auto mt-6 rounded-xl border border-gray-200 bg-yellow-50 shadow-md p-6 text-center">
        <Info className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
        <h2 className="text-lg font-semibold text-yellow-700">
          No Sentiment Summary Available
        </h2>
        <p className="text-sm text-gray-700 mt-2">
          This meeting does not have a sentiment summary yet.
          <br />
          Please re-transcribe the meeting to generate one.
        </p>
      </div>
    );
  }

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
    <div className="max-w-lg mx-auto mt-6 rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white shadow-md p-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Overall Meeting Sentiment Analysis
      </h2>

      <div className="grid grid-cols-2 gap-y-4 text-sm">
        <div className="font-medium text-gray-700">Overall Sentiment:</div>
        <div className={`flex items-center gap-2 font-semibold ${sentimentColorMap[overall_sentiment]}`}>
          {sentimentIconMap[overall_sentiment]} {overall_sentiment}
        </div>

        <div className="font-medium text-gray-700">Average Compound Score:</div>
        <div className="text-blue-600 font-medium">{average_compound.toFixed(3)}</div>

        <div className="font-medium text-gray-700">Average Positive:</div>
        <div className="text-green-600 font-medium">{average_positive.toFixed(3)}</div>

        <div className="font-medium text-gray-700">Average Neutral:</div>
        <div className="text-yellow-500 font-medium">{average_neutral.toFixed(3)}</div>

        <div className="font-medium text-gray-700">Average Negative:</div>
        <div className="text-red-500 font-medium">{average_negative.toFixed(3)}</div>
      </div>
    </div>
  );
}
