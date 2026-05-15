import type { ScanResult } from "@cloudshift-radar/shared";
import { StatusPill } from "../ui/StatusPill";

interface FeatureSurvivalTabProps {
  result: ScanResult;
}

function stateTone(state: string) {
  if (state === "Blocked") return "critical";
  if (state === "High risk") return "high";
  if (state === "Partially working") return "medium";
  if (state === "Likely working") return "success";
  return "neutral";
}

export function FeatureSurvivalTab({ result }: FeatureSurvivalTabProps) {
  return (
    <div className="table-card">
      <div className="section-heading">
        <span>Bob feature survival map</span>
        <h2>What survives the migration</h2>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Dependency</th>
              <th>Expected state after migration</th>
              <th>Bob rationale</th>
              <th>Recommended action</th>
            </tr>
          </thead>
          <tbody>
            {result.featureSurvivalMap.map((item) => (
              <tr key={item.feature}>
                <td><strong>{item.feature}</strong></td>
                <td>{item.dependency}</td>
                <td><StatusPill tone={stateTone(item.expectedState)}>{item.expectedState}</StatusPill></td>
                <td>{item.bobRationale}</td>
                <td>{item.recommendedAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
