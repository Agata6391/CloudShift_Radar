import type { ActionPlan } from "@cloudshift-radar/shared";
import { Card } from "../ui/Card";

interface ActionPlanTabProps {
  actionPlan: ActionPlan;
}

const groups: Array<{ key: keyof ActionPlan; title: string }> = [
  { key: "fixBeforeMigration", title: "Fix before migration" },
  { key: "validateBeforeMigration", title: "Validate before migration" },
  { key: "reviewWithSeniorEngineer", title: "Review with senior engineer" },
  { key: "documentBeforeMigration", title: "Document before migration" },
  { key: "postMigrationChecks", title: "Post-migration checks" }
];

export function ActionPlanTab({ actionPlan }: ActionPlanTabProps) {
  return (
    <div className="action-grid">
      {groups.map((group) => (
        <Card key={group.key}>
          <h3>{group.title}</h3>
          <ul className="clean-list">
            {actionPlan[group.key].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
