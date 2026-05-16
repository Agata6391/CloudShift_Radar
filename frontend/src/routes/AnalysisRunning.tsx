import { useEffect, useMemo, useState, useCallback } from "react";
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

type AnalysisState = "running" | "error" | "timeout" | "cancelled";

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
  const [analysisState, setAnalysisState] = useState<AnalysisState>("running");
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const currentStep = useMemo(() => {
    const index = Math.min(scanSteps.length - 1, Math.floor((progress / 100) * scanSteps.length));
    return scanSteps[index];
  }, [progress]);

  const startAnalysis = useCallback(() => {
    if (!pendingScan) {
      setAnalysisState("error");
      setError("No validated project package is available. Return to Project Input and upload a ZIP file.");
      return;
    }

    setAnalysisState("running");
    setError("");
    setProgress(8);
    setElapsedTime(0);

    let cancelled = false;
    const progressInterval = window.setInterval(() => {
      setProgress((current) => Math.min(current + 7, 92));
    }, 550);

    const timeInterval = window.setInterval(() => {
      setElapsedTime((t) => t + 1);
    }, 1000);

    // Timeout after 5 minutes
    const timeoutId = window.setTimeout(() => {
      if (!cancelled && analysisState === "running") {
        setAnalysisState("timeout");
        setError("Analysis is taking longer than expected. The server may be overloaded.");
      }
    }, 300000);

    submitZipScan(pendingScan.context, pendingScan.file)
      .then((result) => {
        if (cancelled) return;
        setProgress(100);
        window.setTimeout(() => onComplete(result), 550);
      })
      .catch((scanError) => {
        if (cancelled) return;
        
        setAnalysisState("error");
        
        // Handle network errors specifically
        if (scanError instanceof TypeError && scanError.message.includes("fetch")) {
          setError("Network error. Unable to connect to the server. Please check your connection and try again.");
          return;
        }
        
        // Handle timeout errors
        if (scanError.message?.includes("timeout") || scanError.message?.includes("timed out")) {
          setAnalysisState("timeout");
          setError("The analysis request timed out. The server may be processing a large repository.");
          return;
        }
        
        // Handle server errors
        if (scanError.message?.includes("500") || scanError.message?.includes("Internal Server Error")) {
          setError("Server error occurred during analysis. This may be a temporary issue. Please try again.");
          return;
        }
        
        // Generic error
        const message = scanError instanceof Error ? scanError.message : "Analysis failed unexpectedly.";
        setError(message);
      })
      .finally(() => {
        window.clearInterval(progressInterval);
        window.clearInterval(timeInterval);
        window.clearTimeout(timeoutId);
      });

    return () => {
      cancelled = true;
      window.clearInterval(progressInterval);
      window.clearInterval(timeInterval);
      window.clearTimeout(timeoutId);
    };
  }, [pendingScan, onComplete, analysisState]);

  useEffect(() => {
    const cleanup = startAnalysis();
    return cleanup;
  }, []); // Only run once on mount

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
    startAnalysis();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const visibleDetectedItems = detectedItems.slice(0, Math.max(1, Math.ceil((progress / 100) * detectedItems.length)));

  return (
    <div className="page analysis-page">
      <section className="page-intro">
        <span className="eyebrow">Analysis Running</span>
        <h1>{analysisState === "running" ? "Analysis in progress" : "Analysis Status"}</h1>
        <p>
          {analysisState === "running"
            ? "CloudShift Radar is scanning your project with Bob."
            : "Review the status below and take action if needed."}
        </p>
      </section>

      {pendingScan ? (
        <Card className="wide-card">
          <h2>{pendingScan.context.projectName}</h2>
          <p>{pendingScan.context.currentProvider} &rarr; {pendingScan.context.targetProvider}</p>
          {analysisState === "running" && (
            <p style={{ marginTop: "0.5rem", fontSize: "0.9em", opacity: 0.8 }}>
              Elapsed time: {formatTime(elapsedTime)} | Expected: 2-4 minutes
            </p>
          )}
        </Card>
      ) : null}

      {analysisState === "error" && error ? (
        <Card className="error-card">
          <h3>⚠️ Analysis Error</h3>
          <p>{error}</p>
          {retryCount > 0 && (
            <p style={{ marginTop: "0.5rem", fontSize: "0.9em", opacity: 0.8 }}>
              Retry attempts: {retryCount}
            </p>
          )}
          <div className="flow-actions" style={{ marginTop: "1rem" }}>
            <Button onClick={handleRetry}>
              {retryCount > 0 ? `Retry Analysis (Attempt ${retryCount + 1})` : "Retry Analysis"}
            </Button>
            <Button variant="secondary" onClick={() => onNavigate("/project-input")}>
              Return to Project Input
            </Button>
          </div>
          <p style={{ marginTop: "1rem", fontSize: "0.9em", fontStyle: "italic" }}>
            If the problem persists, check the server logs or try a different repository.
          </p>
        </Card>
      ) : analysisState === "timeout" ? (
        <Card className="error-card">
          <h3>⏱️ Analysis Timeout</h3>
          <p>{error || "The analysis is taking longer than expected."}</p>
          <p style={{ marginTop: "0.5rem" }}>
            This can happen with very large repositories or when the server is under heavy load.
          </p>
          {retryCount > 0 && (
            <p style={{ marginTop: "0.5rem", fontSize: "0.9em", opacity: 0.8 }}>
              Retry attempts: {retryCount}
            </p>
          )}
          <div className="flow-actions" style={{ marginTop: "1rem" }}>
            <Button onClick={handleRetry}>
              {retryCount > 0 ? `Retry Analysis (Attempt ${retryCount + 1})` : "Retry Analysis"}
            </Button>
            <Button variant="secondary" onClick={() => onNavigate("/project-input")}>
              Return to Project Input
            </Button>
          </div>
          <p style={{ marginTop: "1rem", fontSize: "0.9em", fontStyle: "italic" }}>
            Consider uploading a smaller repository or trying again during off-peak hours.
          </p>
        </Card>
      ) : null}

      {analysisState === "running" ? (
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
                <li key={item}>✓ {item}</li>
              ))}
            </ul>

            <h3>Scan steps</h3>
            <div className="progress-list">
              {scanSteps.map((step, idx) => {
                const stepIndex = scanSteps.indexOf(currentStep);
                const isDone = idx < stepIndex;
                const isCurrent = idx === stepIndex;
                return (
                  <div
                    className={`progress-step ${isDone ? "done" : ""} ${isCurrent ? "active" : ""}`}
                    key={step}
                  >
                    <span>{isDone ? "✓" : idx + 1}</span>
                    <p>{step}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          <BobAnalysisPanel activeMessage="Bob is connecting scanner signals to migration impact" />
        </div>
      ) : null}
    </div>
  );
}
