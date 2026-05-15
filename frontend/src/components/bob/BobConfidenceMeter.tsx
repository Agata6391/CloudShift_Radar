interface BobConfidenceMeterProps {
  confidence: string;
  score?: number;
}

function confidenceToScore(confidence: string): number {
  const normalized = confidence.toLowerCase();
  if (normalized.includes("high") && normalized.includes("medium")) return 76;
  if (normalized.includes("high")) return 88;
  if (normalized.includes("medium")) return 58;
  if (normalized.includes("low")) return 32;
  return 50;
}

export function BobConfidenceMeter({ confidence, score }: BobConfidenceMeterProps) {
  const meterScore = score ?? confidenceToScore(confidence);

  return (
    <div className="confidence-meter" aria-label={`Bob confidence ${confidence}`}>
      <div className="confidence-row">
        <span>Bob confidence</span>
        <strong>{confidence}</strong>
      </div>
      <div className="confidence-track">
        <span style={{ width: `${meterScore}%` }} />
      </div>
    </div>
  );
}
