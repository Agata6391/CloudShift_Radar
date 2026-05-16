import type { ScanResult } from "@cloudshift-radar/shared";
import { BobConfidenceMeter } from "../bob/BobConfidenceMeter";
import { Card } from "../ui/Card";
import { StatusPill } from "../ui/StatusPill";

interface BobOverviewTabProps {
  result: ScanResult;
}

export function BobOverviewTab({ result }: BobOverviewTabProps) {
  const topBlockers = result.findings
    .filter((finding) => finding.severity === "Critical" || finding.severity === "High")
    .slice(0, 3);
  const environmentFiles = new Set(
    result.findings.flatMap((finding) => finding.affectedFiles.filter((file) => file.includes(".env")))
  );
  const configFiles = new Set(
    result.findings.flatMap((finding) => finding.affectedFiles.filter((file) => /\.(json|ya?ml|tf|gradle|xml)$/i.test(file)))
  );

  return (
    <div className="tab-grid">
      <Card className="wide-card">
        <div className="section-heading">
          <span>Overview</span>
          <h2>Migration readiness</h2>
        </div>
        <p>{result.bobSummary}</p>
      </Card>

      <Card>
        <h3>Risk distribution</h3>
        <div className="risk-stack">
          <span><StatusPill tone="low">Low risk</StatusPill> {result.findings.filter((item) => item.severity === "Low").length}</span>
          <span><StatusPill tone="medium">Medium risk</StatusPill> {result.findings.filter((item) => item.severity === "Medium").length}</span>
          <span><StatusPill tone="high">High risk</StatusPill> {result.findings.filter((item) => item.severity === "High").length}</span>
          <span><StatusPill tone="critical">Human review</StatusPill> {result.findings.filter((item) => item.requiresHumanReview).length}</span>
        </div>
      </Card>

      <Card>
        <h3>Scan coverage</h3>
        <div className="risk-stack">
          <span>Files scanned: {new Set(result.findings.flatMap((finding) => finding.affectedFiles)).size}</span>
          <span>Dependency files: {result.findings.filter((finding) => finding.category.toLowerCase().includes("dependency")).length}</span>
          <span>Environment files: {environmentFiles.size}</span>
          <span>Config files: {configFiles.size}</span>
        </div>
      </Card>

      <Card>
        <h3>Main blockers</h3>
        <ul className="clean-list">
          {topBlockers.map((blocker) => (
            <li key={blocker.id}>{blocker.title}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <h3>Recommended next step</h3>
        <p>{result.actionPlan.fixBeforeMigration[0] || "Review high-risk findings, validate human review items, and re-run the scan after remediation."}</p>
      </Card>

      <Card>
        <h3>Bob confidence explanation</h3>
        <BobConfidenceMeter confidence={result.bobConfidence} />
        <p>Bob has high confidence in SDK and endpoint evidence, with lower confidence where ownership or runtime contracts are not visible in the repository.</p>
      </Card>
    </div>
  );
}
