import { useState } from "react";
import { Button } from "../ui/Button";
import { exportScan } from "../../api/client";

interface ExportMenuProps {
  scanId: string;
  projectName: string;
}

export function ExportMenu({ scanId, projectName }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "json" | "csv" | "markdown") => {
    setIsExporting(true);
    try {
      const blob = await exportScan(scanId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Generate filename
      const sanitizedProjectName = projectName.replace(/[^a-zA-Z0-9-_]/g, "_");
      const timestamp = new Date().toISOString().split("T")[0];
      const extension = format === "markdown" ? "md" : format;
      const filename = `cloudshift-radar-${sanitizedProjectName}-${timestamp}.${extension}`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setIsOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-menu">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="export-button"
      >
        {isExporting ? "Exporting..." : "📥 Export Report"}
      </Button>
      
      {isOpen && (
        <div className="export-dropdown">
          <button
            onClick={() => handleExport("json")}
            disabled={isExporting}
            className="export-option"
          >
            <span className="export-icon">📄</span>
            <div className="export-details">
              <strong>JSON</strong>
              <small>Complete data structure</small>
            </div>
          </button>
          
          <button
            onClick={() => handleExport("csv")}
            disabled={isExporting}
            className="export-option"
          >
            <span className="export-icon">📊</span>
            <div className="export-details">
              <strong>CSV</strong>
              <small>Findings spreadsheet</small>
            </div>
          </button>
          
          <button
            onClick={() => handleExport("markdown")}
            disabled={isExporting}
            className="export-option"
          >
            <span className="export-icon">📝</span>
            <div className="export-details">
              <strong>Markdown</strong>
              <small>Formatted report</small>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

// Made with Bob
