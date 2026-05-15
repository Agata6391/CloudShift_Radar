import type { ScanResult, Severity } from "@cloudshift-radar/shared";
import { StatusPill } from "../ui/StatusPill";

interface TechnicalFindingsTabProps {
  result: ScanResult;
}

function severityTone(severity: Severity) {
  if (severity === "Critical") return "critical";
  if (severity === "High") return "high";
  if (severity === "Medium") return "medium";
  return "low";
}

export function TechnicalFindingsTab({ result }: TechnicalFindingsTabProps) {
  return (
    <div className="table-card">
      <div className="section-heading">
        <span>Bob rationale by finding</span>
        <h2>Technical Findings</h2>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Severity</th>
              <th>Finding</th>
              <th>Category</th>
              <th>Provider</th>
              <th>Service</th>
              <th>Affected files</th>
              <th>Confidence</th>
              <th>Resolution level</th>
              <th>Bob rationale</th>
              <th>Human review</th>
              <th>Recommended action</th>
            </tr>
          </thead>
          <tbody>
            {result.findings.map((finding) => (
              <tr key={finding.id}>
                <td><StatusPill tone={severityTone(finding.severity)}>{finding.severity}</StatusPill></td>
                <td><strong>{finding.title}</strong></td>
                <td>{finding.category}</td>
                <td>{finding.provider}</td>
                <td>{finding.service}</td>
                <td>{finding.affectedFiles.join(", ")}</td>
                <td>{finding.confidence}</td>
                <td>{finding.resolutionLevel}</td>
                <td>{finding.bobRationale}</td>
                <td>{finding.requiresHumanReview ? "Yes" : "No"}</td>
                <td>{finding.recommendedAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
