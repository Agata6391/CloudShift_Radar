import type { ScanResult } from "@cloudshift-radar/shared";
import { BobReasoningCard } from "../bob/BobReasoningCard";
import { BobTraceTimeline } from "../bob/BobTraceTimeline";
import { Card } from "../ui/Card";

interface BobReasoningTraceTabProps {
  result: ScanResult;
}

export function BobReasoningTraceTab({ result }: BobReasoningTraceTabProps) {
  const trace = result.bobReasoningTrace;

  return (
    <div className="trace-grid">
      <Card className="wide-card">
        <div className="section-heading">
          <span>Bob session summary</span>
          <h2>Bob Reasoning Trace</h2>
        </div>
        <p>
          Bob reviewed the repository scan context and identified modernization risks across configuration, runtime
          services, storage, queues, and cloud-specific integrations. The analysis found strong coupling to AWS
          services, including S3, ElastiCache, and GameLift. Bob classified storage as a refactor-level risk,
          matchmaking as an architecture-level blocker, and low-confidence critical findings as requiring senior
          human review.
        </p>
      </Card>

      <Card className="wide-card">
        <h3>Repository architecture interpretation</h3>
        <p>{trace.architectureSummary}</p>
      </Card>

      <BobReasoningCard title="Cloud dependency reasoning" items={trace.cloudDependencyReasoning} />
      <BobReasoningCard title="Risk classification rationale" items={trace.riskClassificationRationale} />
      <BobReasoningCard title="Confidence rationale" items={trace.confidenceRationale} />
      <BobReasoningCard title="Human review rationale" items={trace.humanReviewRationale} />
      <BobReasoningCard title="Recommended modernization notes" items={trace.recommendedModernizationNotes} />

      <Card className="wide-card">
        <h3>Trace timeline</h3>
        <BobTraceTimeline items={trace.traceTimeline} />
      </Card>
    </div>
  );
}
