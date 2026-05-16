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
  const reviewFindings = result.findings.filter((finding) => finding.requiresHumanReview);
  const mediumConfidence = reviewFindings.filter((finding) => finding.confidence === "Medium").length;
  const lowConfidence = reviewFindings.filter((finding) => finding.confidence === "Low").length;

  return (
    <div className="human-review-layout">
      <Card className="wide-card">
        <div className="section-heading">
          <span>Human Review</span>
          <h2>These items require manual validation before migration.</h2>
        </div>
        <p>
          Bob does not hide uncertainty. When a finding is severe, ambiguous, or low-confidence, Bob escalates it for
          manual validation before migration.
        </p>
      </Card>

      <Card>
        <h3>Review summary</h3>
        <div className="risk-stack">
          <span>Total review items: {reviewFindings.length}</span>
          <span>Medium confidence: {mediumConfidence}</span>
          <span>Low confidence: {lowConfidence}</span>
        </div>
      </Card>

      {reviewFindings.map((finding) => {
        const review = result.humanReviewQueue.find((item) => item.findingId === finding.id || item.title === finding.title);

        return (
        <Card key={finding.id} className="review-card">
          <div className="review-card-header">
            <h3>{finding.title}</h3>
            <StatusPill tone={severityTone(finding.severity)}>{finding.confidence} confidence</StatusPill>
          </div>
          <p>
            {finding.humanReviewReason ||
              review?.reason ||
              "Bob escalated this finding because severity and uncertainty require senior human review."}
          </p>
          <dl className="detail-list">
            <div>
              <dt>Affected feature</dt>
              <dd>{finding.affectedFeature}</dd>
            </div>
            <div>
              <dt>Why Bob escalated it</dt>
              <dd>
                {finding.humanReviewReason ||
                  review?.reason ||
                  "The finding requires human judgment before migration estimates are trusted."}
              </dd>
            </div>
            <div>
              <dt>Severity</dt>
              <dd>{finding.severity}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>{finding.confidence}</dd>
            </div>
            <div>
              <dt>Suggested reviewer</dt>
              <dd>{finding.suggestedReviewer || review?.suggestedReviewer || "Senior Engineer"}</dd>
            </div>
            <div>
              <dt>Recommended validation</dt>
              <dd>{review?.nextAction || finding.recommendedAction}</dd>
            </div>
          </dl>
          <ButtonLikeReview />
        </Card>
        );
      })}
    </div>
  );
}

function ButtonLikeReview() {
  return <button className="button button-ghost review-action" type="button">Review item</button>;
}
