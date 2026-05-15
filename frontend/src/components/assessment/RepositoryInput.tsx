import { useRef } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

interface RepositoryInputProps {
  selectedFile: File | null;
  onFileSelected: (file: File | null) => void;
  onUploadScan: () => void;
  onDemoScan: () => void;
  onPreviewDemo: () => void;
}

export function RepositoryInput({
  selectedFile,
  onFileSelected,
  onUploadScan,
  onDemoScan,
  onPreviewDemo
}: RepositoryInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="repo-input-grid">
      <Card className="upload-card primary-upload">
        <div className="section-heading">
          <span>Step 2</span>
          <h2>Upload repository for Bob analysis</h2>
        </div>
        <p>
          Upload your repository as a ZIP file. No GitHub login required. Bob will analyze the repository context
          after CloudShift Radar extracts the scan signals.
        </p>
        <div className="drop-zone" onClick={() => inputRef.current?.click()} role="button" tabIndex={0}>
          <input
            ref={inputRef}
            type="file"
            accept=".zip,application/zip"
            onChange={(event) => onFileSelected(event.target.files?.[0] || null)}
          />
          <strong>{selectedFile ? selectedFile.name : "Choose repository ZIP"}</strong>
          <span>{selectedFile ? `${Math.round(selectedFile.size / 1024)} KB ready for Bob` : "ZIP upload is the primary MVP input"}</span>
        </div>
        <Button onClick={onUploadScan} disabled={!selectedFile}>
          Start Bob ZIP Assessment
        </Button>
      </Card>

      <Card className="upload-card">
        <Badge tone="green">Included</Badge>
        <h3>Use demo repository</h3>
        <p>Run the backend demo scan context through Bob. This still requires Bob API configuration.</p>
        <Button variant="secondary" onClick={onDemoScan}>
          Run Bob Demo Scan
        </Button>
      </Card>

      <Card className="upload-card disabled-card">
        <Badge tone="amber">Coming Soon</Badge>
        <h3>Connect GitHub repository</h3>
        <p>Private GitHub repository analysis will be added after the ZIP-based MVP.</p>
        <Button variant="ghost" disabled>
          GitHub disabled
        </Button>
      </Card>

      <Card className="upload-card preview-card">
        <Badge tone="cyan">Frontend only</Badge>
        <h3>Preview demo UI</h3>
        <p>Use mock data only for UI development when the backend or Bob credentials are not available.</p>
        <Button variant="ghost" onClick={onPreviewDemo}>
          Preview demo UI
        </Button>
      </Card>
    </div>
  );
}
