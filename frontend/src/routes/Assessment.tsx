import { useEffect, useMemo, useRef, useState } from "react";
import type { MigrationContext, ValidationResult } from "@cloudshift-radar/shared";
import { getHealth, validateZip } from "../api/client";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import type { Route } from "../utils/navigation";

export interface ProjectInputPayload {
  context: MigrationContext;
  file: File;
}

interface AssessmentProps {
  onNavigate: (route: Route) => void;
  onStartAnalysis: (payload: ProjectInputPayload) => void;
}

type ValidationState = "incomplete" | "ready" | "validating" | "success" | "warning" | "error" | "invalid";
type HealthCheckState = "checking" | "configured" | "not-configured" | "error";

const cloudOptions = ["AWS", "GCP", "Azure", "Other"];
const applicationTypes = ["Frontend", "Backend", "Full-stack", "Custom"];
const validationSteps = [
  "Reading ZIP file",
  "Checking project structure",
  "Detecting dependency files",
  "Scanning environment files",
  "Preparing analysis context"
];

export function Assessment({ onNavigate, onStartAnalysis }: AssessmentProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [projectName, setProjectName] = useState("");
  const [currentProvider, setCurrentProvider] = useState("");
  const [targetProvider, setTargetProvider] = useState("");
  const [applicationType, setApplicationType] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationState, setValidationState] = useState<ValidationState>("incomplete");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [healthCheckState, setHealthCheckState] = useState<HealthCheckState>("checking");
  const [validationProgress, setValidationProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setHealthCheckState("checking");
    getHealth()
      .then((health) => {
        setHealthCheckState(health.bobConfigured ? "configured" : "not-configured");
      })
      .catch(() => {
        setHealthCheckState("error");
      });
  }, []);

  const formComplete = useMemo(() => {
    const hasApplicationType = applicationType === "Custom" ? customDescription.trim().length > 0 : applicationType.length > 0;
    return (
      projectName.trim().length > 0 &&
      Boolean(selectedFile) &&
      currentProvider.length > 0 &&
      targetProvider.length > 0 &&
      currentProvider !== targetProvider &&
      hasApplicationType
    );
  }, [applicationType, currentProvider, customDescription, projectName, selectedFile, targetProvider]);

  useEffect(() => {
    if (!formComplete && validationState !== "validating") {
      setValidationState("incomplete");
    }

    if (formComplete && validationState === "incomplete") {
      setValidationState("ready");
    }
  }, [formComplete, validationState]);

  const context: MigrationContext = {
    projectName: projectName.trim(),
    currentProvider,
    targetProvider,
    applicationType: applicationType === "Custom" ? customDescription.trim() : applicationType
  };

  const validateProject = async () => {
    if (!selectedFile) return;
    setValidationState("validating");
    setValidationResult(null);
    setValidationProgress(0);

    // Simulate progressive validation steps
    const progressInterval = setInterval(() => {
      setValidationProgress((prev) => Math.min(prev + 15, 90));
    }, 300);

    try {
      const result = await validateZip(selectedFile);
      clearInterval(progressInterval);
      setValidationProgress(100);
      setValidationResult(result);
      setRetryCount(0); // Reset retry count on success
      
      if (result.valid) {
        // Check if there are warnings
        setValidationState(result.warnings.length > 0 ? "warning" : "success");
      } else {
        // Check if validation state is 'invalid' with validationErrors
        if (result.validationState === "invalid") {
          setValidationState("invalid");
        } else {
          setValidationState("error");
        }
      }
    } catch (error) {
      clearInterval(progressInterval);
      setValidationProgress(0);
      setValidationState("error");
      
      // Provide detailed error information
      const errorMessage = error instanceof Error ? error.message : "Validation failed";
      const isNetworkError = error instanceof TypeError && errorMessage.includes("fetch");
      
      setValidationResult({
        validationState: "invalid",
        valid: false,
        canProceed: false,
        errors: [{
          code: isNetworkError ? "NETWORK_ERROR" : "VALIDATION_FAILED",
          message: isNetworkError
            ? "Unable to connect to the server. Please check your connection and try again."
            : errorMessage,
          severity: "error",
          details: isNetworkError ? "The validation service may be unavailable." : undefined
        }],
        warnings: [],
        validatedAt: new Date().toISOString()
      });
    }
  };

  const handlePrimaryAction = () => {
    if (validationState === "success" || validationState === "warning") {
      if (selectedFile) {
        onStartAnalysis({ context, file: selectedFile });
      }
      return;
    }

    if ((validationState === "error" || validationState === "invalid") && selectedFile && !selectedFile.name.toLowerCase().endsWith(".zip")) {
      setSelectedFile(null);
      setValidationState("incomplete");
      setValidationResult(null);
      fileInputRef.current?.click();
      return;
    }

    if (validationState === "error" || validationState === "invalid") {
      setRetryCount((prev) => prev + 1);
    }

    validateProject();
  };

  const ctaLabel = (() => {
    if (validationState === "validating") return "Validating...";
    if (validationState === "success") return "✓ Start Analysis";
    if (validationState === "warning") return "⚠ Start Analysis (with warnings)";
    if ((validationState === "error" || validationState === "invalid") && selectedFile && !selectedFile.name.toLowerCase().endsWith(".zip")) {
      return "Upload Another File";
    }
    if (validationState === "error" || validationState === "invalid") {
      return retryCount > 0 ? `Retry Validation (Attempt ${retryCount + 1})` : "Retry Validation";
    }
    return "Upload & Validate Repository";
  })();

  const showSpinner = validationState === "validating";
  const canStartAnalysis = (validationState === "success" || validationState === "warning") && healthCheckState === "configured";

  return (
    <div className="page assessment-page">
      <section className="page-intro">
        <span className="eyebrow">Project Input</span>
        <h1 className="internal-page-title">Set up your migration scan</h1>
        <p>Upload your project and define the source and destination environment.</p>
      </section>

      {healthCheckState === "checking" ? (
        <Card className="info-card">
          <h3>⏳ Checking system status...</h3>
          <p>Verifying Bob Shell configuration and backend connectivity.</p>
        </Card>
      ) : null}

      {healthCheckState === "error" ? (
        <Card className="error-card">
          <h3>⚠️ Unable to connect to backend</h3>
          <p>The backend service is not responding. Please ensure the server is running and try refreshing the page.</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </Card>
      ) : null}

      {healthCheckState === "not-configured" ? (
        <Card className="error-card">
          <h3>⚙️ Bob Shell configuration required</h3>
          <p>Bob Shell is required for this assessment. Configure BOBSHELL_API_KEY in your environment before running a real scan.</p>
          <p style={{ marginTop: "0.5rem", fontSize: "0.9em", opacity: 0.8 }}>
            The system will use demo fallback data if Bob is unavailable during analysis.
          </p>
        </Card>
      ) : null}

      <div className="project-input-layout">
        <Card className="form-card">
          <div className="section-heading">
            <span>Project details</span>
            <h2>Migration package</h2>
          </div>

          <label>
            Project name
            <input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="Enter project name" />
          </label>

          <label>
            Project files
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,application/zip"
              onChange={(event) => {
                setSelectedFile(event.target.files?.[0] || null);
                setValidationState("incomplete");
              }}
            />
          </label>
          <div className={selectedFile ? "drop-zone uploaded" : "drop-zone"} onClick={() => fileInputRef.current?.click()}>
            <strong>{selectedFile ? selectedFile.name : "Drag and drop your project package here, or browse files."}</strong>
            <span>{selectedFile ? "Uploaded" : "Empty"}</span>
          </div>

          <div className="form-grid">
            <label>
              Current cloud/service
              <select value={currentProvider} onChange={(event) => setCurrentProvider(event.target.value)}>
                <option value="">Select source</option>
                {cloudOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              Destination cloud/service
              <select value={targetProvider} onChange={(event) => setTargetProvider(event.target.value)}>
                <option value="">Select destination</option>
                {cloudOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>

          {currentProvider && targetProvider && currentProvider === targetProvider ? (
            <p className="field-warning">Current cloud/service and destination cloud/service cannot be the same.</p>
          ) : null}

          <div className="app-type-options">
            {applicationTypes.map((option) => (
              <label key={option} className="radio-card">
                <input
                  type="radio"
                  name="applicationType"
                  checked={applicationType === option}
                  onChange={() => setApplicationType(option)}
                />
                {option}
              </label>
            ))}
          </div>

          {applicationType === "Custom" ? (
            <label>
              Custom description
              <input
                value={customDescription}
                onChange={(event) => setCustomDescription(event.target.value)}
                placeholder="Describe your application type"
              />
            </label>
          ) : null}

          <div className="progressive-action">
            <Button disabled={!formComplete || validationState === "validating"} onClick={handlePrimaryAction}>
              {showSpinner && <span className="spinner">⏳</span>}
              {ctaLabel}
            </Button>
          </div>
        </Card>

        <Card className="validation-card">
          <div className="section-heading">
            <span>Inline validation feedback</span>
            <h2>Project package status</h2>
          </div>

          {validationState === "incomplete" ? (
            <p>Complete the required fields to validate your project.</p>
          ) : null}
          {validationState === "ready" ? (
            <p>Validate your project package before starting the migration analysis.</p>
          ) : null}
          {validationState === "validating" ? (
            <>
              <p>Validating project package...</p>
              <div className="validation-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${validationProgress}%` }} />
                </div>
                <span className="progress-label">{validationProgress}%</span>
              </div>
              <ul className="clean-list">
                {validationSteps.map((step, idx) => {
                  const stepProgress = ((idx + 1) / validationSteps.length) * 100;
                  const isComplete = validationProgress >= stepProgress;
                  const isCurrent = validationProgress >= (idx / validationSteps.length) * 100 &&
                                   validationProgress < stepProgress;
                  return (
                    <li key={step} style={{
                      opacity: isComplete ? 1 : isCurrent ? 0.8 : 0.5,
                      fontWeight: isCurrent ? 'bold' : 'normal'
                    }}>
                      {isComplete ? '✓' : isCurrent ? '⏳' : '○'} {step}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
          {validationState === "success" && validationResult ? (
            <>
              <p><strong>Project validated successfully.</strong> CloudShift Radar found the required files to start the analysis.</p>
              {validationResult.metadata ? (
                <ul className="clean-list">
                  <li>{validationResult.metadata.totalFiles} files detected</li>
                  <li>Languages: {validationResult.metadata.detectedLanguages.join(", ") || "Unknown"}</li>
                  {validationResult.metadata.hasPackageJson && <li>Package.json found</li>}
                  {validationResult.metadata.hasDockerfile && <li>Dockerfile found</li>}
                  {validationResult.metadata.hasTerraform && <li>Terraform files found</li>}
                </ul>
              ) : (
                <ul className="clean-list">
                  <li>Repository structure validated</li>
                </ul>
              )}
              <p>Estimated analysis time: 2-4 minutes</p>
            </>
          ) : null}
          {validationState === "warning" && validationResult ? (
            <>
              <p><strong>Project validated with warnings.</strong> CloudShift Radar can continue, but some information may be incomplete.</p>
              <ul className="clean-list">
                {validationResult.warnings.map((warning, idx) => (
                  <li key={idx}>{warning.message}</li>
                ))}
              </ul>
              <p>The migration report may have lower confidence for some aspects.</p>
            </>
          ) : null}
          {validationState === "error" && validationResult ? (
            <>
              <p><strong>⚠️ Project validation failed.</strong> CloudShift Radar could not process this package.</p>
              <ul className="clean-list">
                {validationResult.errors.map((error, idx) => (
                  <li key={idx}>
                    <strong>{error.code}:</strong> {error.message}
                    {error.details && (
                      <div style={{ marginLeft: '1rem', fontSize: '0.9em', color: '#666', marginTop: '0.25rem' }}>
                        {error.details}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {retryCount > 0 && (
                <p style={{ marginTop: '1rem', fontSize: '0.9em', opacity: 0.8 }}>
                  Retry attempts: {retryCount}
                </p>
              )}
              <p style={{ marginTop: '1rem' }}>
                Click "Retry Validation" to try again, or upload a different file.
              </p>
            </>
          ) : null}
          {validationState === "invalid" && validationResult ? (
            <>
              <p><strong>❌ Validation errors detected.</strong> The following issues were found:</p>
              <ul className="clean-list">
                {validationResult.errors.map((error, idx) => (
                  <li key={`error-${idx}`}>
                    <strong>{error.code}:</strong> {error.message}
                    {error.details && (
                      <div style={{ marginLeft: '1rem', fontSize: '0.9em', color: '#666', marginTop: '0.25rem' }}>
                        {error.details}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              {retryCount > 0 && (
                <p style={{ marginTop: '1rem', fontSize: '0.9em', opacity: 0.8 }}>
                  Retry attempts: {retryCount}
                </p>
              )}
              {validationResult.validationState === "invalid" && (
                <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
                  Please fix these issues and upload a corrected file, or try a different repository.
                </p>
              )}
            </>
          ) : null}
          <Button variant="ghost" onClick={() => onNavigate("/login")}>Back to login</Button>
        </Card>
      </div>
    </div>
  );
}
