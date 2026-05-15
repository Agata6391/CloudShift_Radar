import type { ScanResult } from "@cloudshift-radar/shared";
import { BobConfidenceMeter } from "../bob/BobConfidenceMeter";
import { Card } from "../ui/Card";
import { StatusPill } from "../ui/StatusPill";

interface BobOverviewTabProps {
  result: ScanResult;
}

export function BobOverviewTab({ result }: BobOverviewTabProps) {
  const topBlockers = [
    "AWS S3 SDK used directly for uploads",
    "AWS GameLift dependency controls matchmaking",
    "Redis endpoint points to AWS ElastiCache",
    "Legacy queue bridge has unclear ownership",
    "Runtime dependency on SendGrid may block startup"
  ];

  return (
    <div className="tab-grid">
      <Card className="wide-card">
        <div className="section-heading">
          <span>Bob executive summary</span>
          <h2>Bob reviewed the repository scan context and does not recommend production migration yet.</h2>
        </div>
        <p>
          The analysis found critical dependencies still coupled to AWS services, including S3, ElastiCache, and
          GameLift. If migrated today, authentication and basic database-backed APIs may continue working, but
          uploads, background jobs, and matchmaking are likely to fail. Recommended decision: prepare migration first
          and assign senior review to unresolved blockers.
        </p>
      </Card>

      <Card>
        <h3>Bob top migration blockers</h3>
        <ul className="clean-list">
          {topBlockers.map((blocker) => (
            <li key={blocker}>{blocker}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3>Bob risk breakdown</h3>
        <div className="risk-stack">
          <span><StatusPill tone="critical">Critical</StatusPill> {result.findings.filter((item) => item.severity === "Critical").length}</span>
          <span><StatusPill tone="high">High</StatusPill> {result.findings.filter((item) => item.severity === "High").length}</span>
          <span><StatusPill tone="medium">Medium</StatusPill> {result.findings.filter((item) => item.severity === "Medium").length}</span>
        </div>
      </Card>

      <Card>
        <h3>Bob recommended next step</h3>
        <p>Prepare migration first, resolve direct cloud-service coupling, and assign senior review to unresolved L5 items.</p>
      </Card>

      <Card>
        <h3>Bob confidence explanation</h3>
        <BobConfidenceMeter confidence={result.bobConfidence} />
        <p>Bob has high confidence in SDK and endpoint evidence, with lower confidence where ownership or runtime contracts are not visible in the repository.</p>
      </Card>
    </div>
  );
}
