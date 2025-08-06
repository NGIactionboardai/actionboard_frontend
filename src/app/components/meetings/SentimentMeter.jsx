// 'use client';
// import GaugeChart from 'react-gauge-chart';

// export default function SentimentMeter({ summary }) {
//   const {
//     average_neutral,
//     average_compound,
//     average_negative,
//     average_positive,
//     overall_sentiment,
//   } = summary;

//   // Normalize compound score to 0–1 for gauge (from -1 to 1)
//   const normalizedCompound = (average_compound + 1) / 2;

//   const getColor = () => {
//     if (normalizedCompound > 0.75) return '#22c55e'; // Green
//     if (normalizedCompound > 0.5) return '#4ade80'; // Light Green
//     if (normalizedCompound > 0.25) return '#facc15'; // Yellow
//     return '#ef4444'; // Red
//   };

//   return (
//     <div className="max-w-xl mx-auto text-center mt-6">
//       <h3 className="text-lg font-semibold mb-2">Meeting Sentiment</h3>
//       <GaugeChart
//         id="sentiment-meter"
//         nrOfLevels={20}
//         percent={normalizedCompound}
//         colors={['#ef4444', '#facc15', '#4ade80', '#22c55e']}
//         arcWidth={0.3}
//         needleColor="#111827"
//         textColor="#111827"
//         formatTextValue={() => overall_sentiment}
//       />
//       <div className="mt-4 space-y-1 text-sm text-gray-700">
//         <div><strong>Average Compound:</strong> {average_compound.toFixed(3)}</div>
//         <div><strong>Positive:</strong> {average_positive.toFixed(3)}</div>
//         <div><strong>Neutral:</strong> {average_neutral.toFixed(3)}</div>
//         <div><strong>Negative:</strong> {average_negative.toFixed(3)}</div>
//       </div>
//     </div>
//   );
// }
