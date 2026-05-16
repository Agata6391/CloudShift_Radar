import type { ScanResult } from "@cloudshift-radar/shared";
import { BobTraceTimeline } from "../bob/BobTraceTimeline";
import { Card } from "../ui/Card";

interface AISummaryTabProps {
  result: ScanResult;
}

export function AISummaryTab({ result }: AISummaryTabProps) {
  const trace = result.bobReasoningTrace;
  const scanScope = result.aiSummary?.scanScope || [
    "Project structure",
    "Dependency files",
    "Environment variables",
    "Cloud SDK usage",
    "Feature-level migration risks"
  ];
  const suggestedSteps = result.aiSummary?.suggestedMigrationApproach || [
    "Resolve high-risk findings",
    "Validate human review items",
    "Replace provider-specific services",
    "Re-run scan after changes"
  ];
  const technicalLog = result.aiSummary?.technicalLog || trace.traceTimeline;

  return (
    <div className="trace-grid">
      <Card className="wide-card">
        <div className="section-heading">
          <span>AI Summary</span>
          <h2>Final Bob-generated interpretation of the migration scan.</h2>
        </div>
        <p>{result.bobSummary}</p>
      </Card>

      <Card>
        <h3>Bob scanned</h3>
        <ul className="clean-list">
          {scanScope.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3>Main conclusion</h3>
        <p>{result.aiSummary?.mainConclusion || trace.architectureSummary}</p>
      </Card>

      <Card>
        <h3>Suggested migration approach</h3>
        <ul className="clean-list">
          {suggestedSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3>Technical log</h3>
        <details className="impact-details">
          <summary>View technical log</summary>
          <BobTraceTimeline items={technicalLog} />
        </details>
      </Card>
    </div>
  );
}
