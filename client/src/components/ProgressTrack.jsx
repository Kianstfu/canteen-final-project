// Ang 4-step na progress bar ng order (Placed → Preparing → On the way → Delivered).
// stepIndex: ilang step na ang tapos (-1 = wala pa).
const LABELS = ['Placed', 'Preparing', 'On the way', 'Delivered'];

export default function ProgressTrack({ stepIndex, className = 'progress-track my-3' }) {
  const fillPercent = stepIndex >= 0 ? (stepIndex / (LABELS.length - 1)) * 100 : 0;
  return (
    <div className={className}>
      <div className="fill" style={{ width: `${fillPercent}%` }}></div>
      {LABELS.map((label, i) => (
        <div key={label} className={`p-step ${i <= stepIndex ? 'done' : ''}`}>
          <div className="dot">{i + 1}</div>
          <div className="label">{label}</div>
        </div>
      ))}
    </div>
  );
}
