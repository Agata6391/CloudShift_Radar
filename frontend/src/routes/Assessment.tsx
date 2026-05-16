import { useEffect, useState } from "react";
import type { MigrationContext, ScanResult } from "@cloudshift-radar/shared";
import { getHealth, submitDemoScan, submitZipScan } from "../api/client";
import { MigrationSetup } from "../components/assessment/MigrationSetup";
import { RepositoryInput } from "../components/assessment/RepositoryInput";
import { progressSteps, ScanProgress } from "../components/assessment/ScanProgress";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { mockScanResult } from "../data/mockScanResult";
import type { Route } from "../utils/navigation";

interface AssessmentProps {
  onNavigate: (route: Route) => void;
  onScanComplete: (result: ScanResult, preview?: boolean) => void;
}

const initialContext: MigrationContext = {
  projectName: "Legacy Cloud API",
  currentProvider: "AWS",
  targetProvider: "GCP",
  applicationType: "Backend API"
};

export function Assessment({ onNavigate, onScanComplete }: AssessmentProps) {
  const [step, setStep] = useState(1);
  const [context, setContext] = useState<MigrationContext>(initialContext);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progressIndex, setProgressIndex] = useState(0);
  const [error, setError] = useState("");
  const [bobConfigured, setBobConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    getHealth()
      .then((health) => setBobConfigured(health.bobConfigured))
      .catch(() => setBobConfigured(false));
  }, []);

  useEffect(() => {
    if (step !== 3) {
      return;
    }

    const interval = window.setInterval(() => {
      setProgressIndex((current) => Math.min(current + 1, progressSteps.length - 1));
    }, 450);

    return () => window.clearInterval(interval);
  }, [step]);

  const runScan = async (mode: "zip" | "demo") => {
    setError("");
    setStep(3);
    setProgressIndex(0);

    try {
      const result = mode === "zip" && selectedFile ? await submitZipScan(context, selectedFile) : await submitDemoScan(context);
      setProgressIndex(progressSteps.length - 1);
      window.setTimeout(() => onScanComplete(result), 700);
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Bob assessment failed.");
      setStep(2);
    }
  };

  const previewDemo = () => {
    onScanComplete(mockScanResult, true);
  };

  return (
    <div className="page assessment-page">
      <section className="page-intro">
        <span className="eyebrow">Assessment</span>
        <h1>Start a Bob migration assessment</h1>
        <p>Give Bob the migration context, upload a repository ZIP, then review the readiness verdict.</p>
      </section>

      {bobConfigured === false ? (
        <Card className="error-card">
          <h3>Bob Shell configuration required</h3>
          <p>Bob Shell is required for this assessment. Configure BOBSHELL_API_KEY before running a real scan.</p>
        </Card>
      ) : null}

      {error ? (
        <Card className="error-card">
          <h3>Assessment stopped</h3>
          <p>{error}</p>
        </Card>
      ) : null}

      <div className="flow-indicator">
        {[1, 2, 3].map((item) => (
          <button key={item} className={step === item ? "active" : ""} onClick={() => setStep(item)}>
            {item}
          </button>
        ))}
      </div>

      {step === 1 ? (
        <>
          <MigrationSetup context={context} onChange={setContext} />
          <div className="flow-actions">
            <Button onClick={() => setStep(2)}>Continue to repository input</Button>
          </div>
        </>
      ) : null}

      {step === 2 ? (
        <RepositoryInput
          selectedFile={selectedFile}
          onFileSelected={setSelectedFile}
          onUploadScan={() => runScan("zip")}
          onDemoScan={() => runScan("demo")}
          onPreviewDemo={previewDemo}
        />
      ) : null}

      {step === 3 ? <ScanProgress activeIndex={progressIndex} /> : null}

      <div className="flow-actions secondary-flow">
        <Button variant="ghost" onClick={() => onNavigate("/")}>Back to product</Button>
      </div>
    </div>
  );
}
