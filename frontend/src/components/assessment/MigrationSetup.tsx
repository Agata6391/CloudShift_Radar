import type { MigrationContext } from "@cloudshift-radar/shared";
import { Card } from "../ui/Card";

interface MigrationSetupProps {
  context: MigrationContext;
  onChange: (context: MigrationContext) => void;
}

const currentProviders = ["AWS", "GCP", "Azure", "Unknown"];
const targetProviders = ["AWS", "GCP", "Azure", "Other"];
const applicationTypes = ["Backend API", "Frontend", "Full-stack", "Worker", "Unknown"];

export function MigrationSetup({ context, onChange }: MigrationSetupProps) {
  const updateField = (field: keyof MigrationContext, value: string) => {
    onChange({
      ...context,
      [field]: value
    });
  };

  return (
    <div className="assessment-grid">
      <Card className="form-card">
        <div className="section-heading">
          <span>Step 1</span>
          <h2>Prepare Bob's migration context</h2>
        </div>
        <label>
          Project name
          <input
            value={context.projectName}
            onChange={(event) => updateField("projectName", event.target.value)}
            placeholder="Legacy Cloud API"
          />
        </label>
        <label>
          Current cloud provider
          <select value={context.currentProvider} onChange={(event) => updateField("currentProvider", event.target.value)}>
            {currentProviders.map((provider) => (
              <option key={provider}>{provider}</option>
            ))}
          </select>
        </label>
        <label>
          Target cloud provider
          <select value={context.targetProvider} onChange={(event) => updateField("targetProvider", event.target.value)}>
            {targetProviders.map((provider) => (
              <option key={provider}>{provider}</option>
            ))}
          </select>
        </label>
        <label>
          Application type
          <select value={context.applicationType} onChange={(event) => updateField("applicationType", event.target.value)}>
            {applicationTypes.map((applicationType) => (
              <option key={applicationType}>{applicationType}</option>
            ))}
          </select>
        </label>
      </Card>

      <Card className="bob-side-panel">
        <span className="bob-side-kicker">Bob context model</span>
        <h3>Bob will use this context to evaluate provider-specific risks, target-cloud compatibility, and migration readiness.</h3>
        <div className="signal-grid compact">
          <span>Provider delta</span>
          <span>Runtime class</span>
          <span>Architecture risk</span>
          <span>Feature survival</span>
        </div>
      </Card>
    </div>
  );
}
