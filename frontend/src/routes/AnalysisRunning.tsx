import { useEffect, useMemo, useState } from "react";
import type { ScanResult } from "@cloudshift-radar/shared";
import { submitZipScan } from "../api/client";
import { BobAnalysisPanel } from "../components/assessment/BobAnalysisPanel";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import type { ProjectInputPayload } from "./Assessment";
import type { Route } from "../utils/navigation";

interface AnalysisRunningProps {
  pendingScan: ProjectInputPayload | null;
  onComplete: (result: ScanResult) => void;
  onNavigate: (route: Route) => void;
}

const scanSteps = [
  "Queued",
  "Uploading files",
  "Validating package",
  "Scanning structure",
  "Detecting cloud dependencies",
  "Running Bob analysis",
  "Generating report"
];

const detectedItems = [
  "AWS SDK references",
  "Environment variables",
  "Storage service dependency",
  "Authentication configuration"
];

export function AnalysisRunning({ pendingScan, onComplete, onNavigate }: AnalysisRunningProps) {
  const [progress, setProgress] = useState(8);
  const [error, setError] = useState("");

  const currentStep = useMemo(() => {
    const index = Math.min(scanSteps.length - 1, Math.floor((progress / 100) * scanSteps.length));
    return scanSteps[index];
  }, [progress]);

  useEffect(() => {
    if (!pendingScan) {
      setError("No validated project package is available. Return to Project Input and upload a ZIP file.");
      return;
    }

    let cancelled = false;
    const interval = window.setInterval(() => {
      setProgress((current) => Math.min(current + 7, 92));
    }, 550);

    submitZipScan(pendingScan.context, pendingScan.file)
      .then((result) => {
        if (cancelled) return;
        setProgress(100);
        window.setTimeout(() => onComplete(result), 550);
      })
      .catch((scanError) => {
        if (cancelled) return;
        const message = scanError instanceof Error ? scanError.message : "Bob analysis failed.";
        setError(
          message.includes("BOBSHELL_API_KEY")
            ? "Bob Shell is required for this assessment. Configure BOBSHELL_API_KEY before running a real scan."
            : message
        );
      })
      .finally(() => window.clearInterval(interval));

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [onComplete, pendingScan]);

  const visibleDetectedItems = detectedItems.slice(0, Math.max(1, Math.ceil((progress / 100) * detectedItems.length)));

  return (
    <div className="page analysis-page">
      <section className="page-intro">
        <span className="eyebrow">Analysis Running</span>
        <h1>Analysis in progress</h1>
        <p>CloudShift Radar is scanning your project with Bob.</p>
      </section>

      {pendingScan ? (
        <Card className="wide-card">
          <h2>{pendingScan.context.projectName}</h2>
          <p>{pendingScan.context.currentProvider} &rarr; {pendingScan.context.targetProvider}</p>
        </Card>
      ) : null}

      {error ? (
        <Card className="error-card">
          <h3>Analysis stopped</h3>
          <p>{error}</p>
          <div className="flow-actions">
            <Button onClick={() => onNavigate("/project-input")}>Retry from Project Input</Button>
          </div>
        </Card>
      ) : (
        <div className="analysis-running-grid">
          <Card className="analysis-progress-card">
            <div className="section-heading">
              <span>Progress</span>
              <h2>{progress}% complete</h2>
            </div>
            <div className="analysis-progress-track">
              <span style={{ width: `${progress}%` }} />
            </div>
            <p>Current step: <strong>{currentStep}</strong></p>

            <h3>Detected so far</h3>
            <ul className="clean-list">
              {visibleDetectedItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h3>Scan steps</h3>
            <div className="progress-list">
              {scanSteps.map((step) => (
                <div className={`progress-step ${scanSteps.indexOf(step) <= scanSteps.indexOf(currentStep) ? "done" : ""}`} key={step}>
                  <span>{scanSteps.indexOf(step) + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </Card>

          <BobAnalysisPanel activeMessage="Bob is connecting scanner signals to migration impact" />
        </div>
      )}
    </div>
  );
}
