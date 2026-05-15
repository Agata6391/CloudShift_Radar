import { BobAnalysisPanel } from "./BobAnalysisPanel";

interface ScanProgressProps {
  activeIndex: number;
}

export const progressSteps = [
  "Upload received",
  "Repository safely extracted",
  "Reading repository structure",
  "Extracting technical signals",
  "Detecting cloud dependencies",
  "Finding hardcoded infrastructure",
  "Auditing environment variables",
  "Preparing scan context for Bob",
  "Bob analyzing architecture risk",
  "Bob classifying migration blockers",
  "Bob identifying human-review items",
  "Bob generating readiness verdict",
  "Preparing executive dashboard"
];

const bobMessages = [
  "Bob is reviewing repository context",
  "Bob is checking cloud dependency coupling",
  "Bob is evaluating feature survival",
  "Bob is marking uncertainty for human review",
  "Bob is generating the readiness verdict"
];

export function ScanProgress({ activeIndex }: ScanProgressProps) {
  const bobIndex = Math.min(Math.max(activeIndex - 7, 0), bobMessages.length - 1);

  return (
    <div className="progress-layout">
      <section className="progress-card">
        <div className="section-heading">
          <span>Step 3</span>
          <h2>Bob is analyzing migration readiness</h2>
        </div>
        <div className="progress-list">
          {progressSteps.map((step, index) => (
            <div
              className={`progress-step ${index < activeIndex ? "done" : ""} ${index === activeIndex ? "active" : ""}`}
              key={step}
            >
              <span>{index < activeIndex ? "OK" : index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>
      <BobAnalysisPanel activeMessage={bobMessages[bobIndex]} />
    </div>
  );
}
