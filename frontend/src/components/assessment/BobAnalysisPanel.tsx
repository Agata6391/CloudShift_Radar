interface BobAnalysisPanelProps {
  activeMessage: string;
}

const bobStates = [
  "Bob is reviewing repository context",
  "Bob is checking cloud dependency coupling",
  "Bob is evaluating feature survival",
  "Bob is marking uncertainty for human review",
  "Bob is generating the readiness verdict"
];

export function BobAnalysisPanel({ activeMessage }: BobAnalysisPanelProps) {
  return (
    <aside className="bob-analysis-panel">
      <div className="bob-panel-header">
        <span className="bob-orb" />
        <div>
          <strong>Bob modernization analyst</strong>
          <p>{activeMessage}</p>
        </div>
      </div>
      <div className="bob-state-list">
        {bobStates.map((state) => (
          <span key={state} className={state === activeMessage ? "active" : ""}>
            {state}
          </span>
        ))}
      </div>
    </aside>
  );
}
