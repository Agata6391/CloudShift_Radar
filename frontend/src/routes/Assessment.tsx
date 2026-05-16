import { useEffect, useMemo, useRef, useState } from "react";
import type { MigrationContext } from "@cloudshift-radar/shared";
import { getHealth } from "../api/client";
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

type ValidationState = "incomplete" | "ready" | "validating" | "success" | "warning" | "error";

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
  const [bobConfigured, setBobConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    getHealth()
      .then((health) => setBobConfigured(health.bobConfigured))
      .catch(() => setBobConfigured(false));
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

  const validateProject = () => {
    if (!selectedFile) return;
    setValidationState("validating");

    window.setTimeout(() => {
      if (!selectedFile.name.toLowerCase().endsWith(".zip")) {
        setValidationState("error");
        return;
      }

      if (selectedFile.size === 0) {
        setValidationState("error");
        return;
      }

      const lowerName = selectedFile.name.toLowerCase();
      setValidationState(lowerName.includes("env") || lowerName.includes("lock") ? "success" : "warning");
    }, 900);
  };

  const handlePrimaryAction = () => {
    if (validationState === "success" || validationState === "warning") {
      if (selectedFile) {
        onStartAnalysis({ context, file: selectedFile });
      }
      return;
    }

    if (validationState === "error" && selectedFile && !selectedFile.name.toLowerCase().endsWith(".zip")) {
      setSelectedFile(null);
      setValidationState("incomplete");
      fileInputRef.current?.click();
      return;
    }

    validateProject();
  };

  const ctaLabel = (() => {
    if (validationState === "validating") return "Validating...";
    if (validationState === "success") return "Start analysis";
    if (validationState === "warning") return "Start analysis with warnings";
    if (validationState === "error" && selectedFile && !selectedFile.name.toLowerCase().endsWith(".zip")) {
      return "Upload another file";
    }
    if (validationState === "error") return "Validate again";
    return "Validate project";
  })();

  return (
    <div className="page assessment-page">
      <section className="page-intro">
        <span className="eyebrow">Project Input</span>
        <h1>Set up your migration scan</h1>
        <p>Upload your project and define the source and destination environment.</p>
      </section>

      {bobConfigured === false ? (
        <Card className="error-card">
          <h3>Bob Shell configuration required</h3>
          <p>Bob Shell is required for this assessment. Configure BOBSHELL_API_KEY before running a real scan.</p>
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
              <ul className="clean-list">
                {validationSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </>
          ) : null}
          {validationState === "success" ? (
            <>
              <p><strong>Project validated successfully.</strong> CloudShift Radar found the required files to start the analysis.</p>
              <ul className="clean-list">
                <li>Files detected</li>
                <li>Dependency files found</li>
                <li>Environment files found</li>
              </ul>
              <p>Estimated analysis time: 2-4 minutes</p>
            </>
          ) : null}
          {validationState === "warning" ? (
            <>
              <p><strong>Project validated with warnings.</strong> CloudShift Radar can continue, but some information may be incomplete.</p>
              <ul className="clean-list">
                <li>Missing .env.example file</li>
                <li>Missing lock file</li>
              </ul>
              <p>The migration report may have lower confidence for environment variables and dependency resolution.</p>
            </>
          ) : null}
          {validationState === "error" ? (
            <>
              <p><strong>Project validation failed.</strong> CloudShift Radar could not process this package.</p>
              <ul className="clean-list">
                <li>Invalid ZIP file</li>
                <li>No readable project structure detected</li>
                <li>Package may be corrupted</li>
              </ul>
            </>
          ) : null}
          <Button variant="ghost" onClick={() => onNavigate("/login")}>Back to login</Button>
        </Card>
      </div>
    </div>
  );
}
