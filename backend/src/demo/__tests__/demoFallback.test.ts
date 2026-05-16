import { describe, it, expect } from "vitest";
import { generateDemoFallbackResult } from "../demoFallbackResult";
import type { MigrationContext } from "@cloudshift-radar/shared";

describe("Demo Fallback Result", () => {
  const mockMigrationContext: MigrationContext = {
    projectName: "Test Project",
    currentProvider: "AWS",
    targetProvider: "GCP",
    applicationType: "Backend API"
  };

  it("should generate a valid fallback result", () => {
    const result = generateDemoFallbackResult(mockMigrationContext, "test-scan-id");

    expect(result).toBeDefined();
    expect(result.scanId).toBe("test-scan-id");
    expect(result.projectName).toBe("Test Project");
    expect(result.currentProvider).toBe("AWS");
    expect(result.targetProvider).toBe("GCP");
  });

  it("should include all required ScanResult fields", () => {
    const result = generateDemoFallbackResult(mockMigrationContext, "test-scan-id");

    // Core fields
    expect(result.bobVerdict).toBeDefined();
    expect(result.bobSummary).toBeDefined();
    expect(result.bobConfidence).toBeDefined();
    expect(result.readinessScore).toBeGreaterThanOrEqual(0);
    expect(result.readinessScore).toBeLessThanOrEqual(100);
    expect(result.recommendedDecision).toBeDefined();
    expect(result.businessRiskLevel).toBeDefined();
    expect(result.technicalComplexity).toBeDefined();

    // Arrays
    expect(Array.isArray(result.findings)).toBe(true);
    expect(Array.isArray(result.featureSurvivalMap)).toBe(true);
    expect(Array.isArray(result.humanReviewQueue)).toBe(true);

    // Objects
    expect(result.actionPlan).toBeDefined();
    expect(result.bobReasoningTrace).toBeDefined();
    expect(result.reportSummary).toBeDefined();
    expect(result.aiSummary).toBeDefined();

    // Timestamps
    expect(result.createdAt).toBeDefined();
  });

  it("should include demo-specific findings", () => {
    const result = generateDemoFallbackResult(mockMigrationContext, "test-scan-id");

    expect(result.findings.length).toBeGreaterThan(0);
    
    // Check for critical GameLift finding
    const gameliftFinding = result.findings.find(f => f.id === "demo-gamelift-1");
    expect(gameliftFinding).toBeDefined();
    expect(gameliftFinding?.severity).toBe("Critical");
    expect(gameliftFinding?.requiresHumanReview).toBe(true);

    // Check for S3 finding
    const s3Finding = result.findings.find(f => f.id === "demo-s3-1");
    expect(s3Finding).toBeDefined();
    expect(s3Finding?.severity).toBe("High");
  });

  it("should populate human review queue", () => {
    const result = generateDemoFallbackResult(mockMigrationContext, "test-scan-id");

    expect(result.humanReviewQueue.length).toBeGreaterThan(0);
    
    result.humanReviewQueue.forEach(item => {
      expect(item.findingId).toBeDefined();
      expect(item.title).toBeDefined();
      expect(item.reason).toBeDefined();
      expect(item.suggestedReviewer).toBeDefined();
      expect(item.nextAction).toBeDefined();
    });
  });

  it("should include comprehensive action plan", () => {
    const result = generateDemoFallbackResult(mockMigrationContext, "test-scan-id");

    expect(result.actionPlan.fixBeforeMigration.length).toBeGreaterThan(0);
    expect(result.actionPlan.validateBeforeMigration.length).toBeGreaterThan(0);
    expect(result.actionPlan.reviewWithSeniorEngineer.length).toBeGreaterThan(0);
    expect(result.actionPlan.documentBeforeMigration.length).toBeGreaterThan(0);
    expect(result.actionPlan.postMigrationChecks.length).toBeGreaterThan(0);
  });

  it("should indicate demo mode in confidence and summary", () => {
    const result = generateDemoFallbackResult(mockMigrationContext, "test-scan-id");

    expect(result.bobConfidence).toContain("Demo Mode");
    expect(result.bobSummary).toContain("Demo mode");
    expect(result.reportSummary?.analysisStatus).toContain("Demo mode");
  });

  it("should include Bob reasoning trace", () => {
    const result = generateDemoFallbackResult(mockMigrationContext, "test-scan-id");

    expect(result.bobReasoningTrace.architectureSummary).toBeDefined();
    expect(result.bobReasoningTrace.cloudDependencyReasoning.length).toBeGreaterThan(0);
    expect(result.bobReasoningTrace.riskClassificationRationale.length).toBeGreaterThan(0);
    expect(result.bobReasoningTrace.confidenceRationale.length).toBeGreaterThan(0);
    expect(result.bobReasoningTrace.humanReviewRationale.length).toBeGreaterThan(0);
    expect(result.bobReasoningTrace.traceTimeline.length).toBeGreaterThan(0);
  });

  it("should use custom migration context values", () => {
    const customContext: MigrationContext = {
      projectName: "Custom Project Name",
      currentProvider: "Azure",
      targetProvider: "AWS",
      applicationType: "Frontend SPA"
    };

    const result = generateDemoFallbackResult(customContext, "custom-id");

    expect(result.projectName).toBe("Custom Project Name");
    expect(result.currentProvider).toBe("Azure");
    expect(result.targetProvider).toBe("AWS");
    expect(result.applicationType).toBe("Frontend SPA");
  });

  it("should have valid feature survival map", () => {
    const result = generateDemoFallbackResult(mockMigrationContext, "test-scan-id");

    expect(result.featureSurvivalMap.length).toBeGreaterThan(0);
    
    result.featureSurvivalMap.forEach(item => {
      expect(item.feature).toBeDefined();
      expect(item.dependency).toBeDefined();
      expect(item.expectedState).toBeDefined();
      expect(item.bobRationale).toBeDefined();
      expect(item.recommendedAction).toBeDefined();
    });
  });

  it("should include AI summary with technical log", () => {
    const result = generateDemoFallbackResult(mockMigrationContext, "test-scan-id");

    expect(result.aiSummary).toBeDefined();
    expect(result.aiSummary?.scanScope.length).toBeGreaterThan(0);
    expect(result.aiSummary?.mainConclusion).toBeDefined();
    expect(result.aiSummary?.suggestedMigrationApproach.length).toBeGreaterThan(0);
    expect(result.aiSummary?.technicalLog.length).toBeGreaterThan(0);
    expect(result.aiSummary?.technicalLog[0]).toContain("Demo mode");
  });
});

// Made with Bob
