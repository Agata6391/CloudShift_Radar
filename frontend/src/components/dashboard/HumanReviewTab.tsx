import type { ScanResult, Severity } from "@cloudshift-radar/shared";
import { Card } from "../ui/Card";
import { StatusPill } from "../ui/StatusPill";

interface HumanReviewTabProps {
  result: ScanResult;
}

function severityTone(severity: Severity) {
  if (severity === "Critical") return "critical";
  if (severity === "High") return "high";
  if (severity === "Medium") return "medium";
  return "low";
}

export function HumanReviewTab({ result }: HumanReviewTabProps) {
  return (
    <div className="human-review-layout">
      <Card className="wide-card">
        <div className="section-heading">
          <span>Bob escalation decisions</span>
          <h2>Bob does not hide uncertainty.</h2>
        </div>
        <p>When a finding is both severe and low-confidence, Bob escalates it for senior human review.</p>
      </Card>

      {result.humanReviewQueue.map((item) => (
        <Card key={`${item.findingId}-${item.title}`} className="review-card">
          <div className="review-card-header">
            <h3>{item.title}</h3>
            <StatusPill tone={severityTone(item.severity)}>{item.severity}</StatusPill>
          </div>
          <p>{item.reason}</p>
          <dl className="detail-list">
            <div>
              <dt>Confidence</dt>
              <dd>{item.confidence}</dd>
            </div>
            <div>
              <dt>Suggested reviewer</dt>
              <dd>{item.suggestedReviewer}</dd>
            </div>
            <div>
              <dt>Next action</dt>
              <dd>{item.nextAction}</dd>
            </div>
          </dl>
        </Card>
      ))}
    </div>
  );
}
