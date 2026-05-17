export default function ConfidenceBadge({ confidence }) {
  const pct = Math.round((confidence ?? 0) * 100);

  let colorClass, label;
  if (confidence >= 0.75) {
    colorClass = 'bg-green-100 text-green-700';
    label = 'High';
  } else if (confidence >= 0.6) {
    colorClass = 'bg-yellow-100 text-yellow-700';
    label = 'Medium';
  } else {
    colorClass = 'bg-red-100 text-red-700';
    label = 'Low';
  }

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
      {pct}% · {label}
    </span>
  );
}
