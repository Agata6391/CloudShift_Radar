import type { ScanResult, MigrationContext } from "@cloudshift-radar/shared";

/**
 * Generate a fallback demo result when Bob is unavailable
 * This ensures the demo always works, even without Bob configured
 */
export function generateDemoFallbackResult(
  migrationContext: MigrationContext,
  scanId: string
): ScanResult {
  return {
    scanId,
    projectName: migrationContext.projectName,
    currentProvider: migrationContext.currentProvider,
    targetProvider: migrationContext.targetProvider,
    applicationType: migrationContext.applicationType,
    bobVerdict: "Proceed with caution",
    bobSummary: "Demo mode: This is a pre-generated fallback result. The application has moderate migration complexity with several AWS-specific dependencies that require attention.",
    bobConfidence: "Medium (Demo Mode - Bob unavailable)",
    readinessScore: 65,
    recommendedDecision: "Proceed with caution",
    businessRiskLevel: "Medium",
    technicalComplexity: "Medium",
    findings: [
      {
        id: "demo-elasticache-1",
        title: "Redis endpoint points to AWS ElastiCache",
        category: "Cache / Queue",
        provider: "AWS",
        service: "ElastiCache",
        affectedFiles: ["src/config/redis.js", ".env.migration-test"],
        severity: "High",
        confidence: "High",
        resolutionLevel: "L2",
        risk: "Medium",
        affectedFeature: "Session management and caching",
        featureStatus: "Needs changes",
        featureSurvivalState: "Partially working",
        shortSummary: "Application uses AWS ElastiCache for Redis caching",
        technicalIssue: "Direct dependency on AWS ElastiCache Redis endpoint. Connection string hardcoded to cache.amazonaws.com domain.",
        bobNotes: "Demo mode fallback result. Real analysis would provide deeper insights.",
        bobRationale: "ElastiCache is AWS-specific. GCP equivalent is Memorystore for Redis. Connection strings and authentication methods differ.",
        businessImpact: "Session management and caching layer will break during migration if not addressed.",
        migrationImpact: "Requires reconfiguration of Redis connection to point to GCP Memorystore. May need authentication method changes.",
        recommendedAction: "Update Redis connection configuration to use GCP Memorystore endpoint. Test session persistence after migration.",
        requiresHumanReview: false
      },
      {
        id: "demo-s3-1",
        title: "AWS S3 SDK used directly for uploads",
        category: "Storage",
        provider: "AWS",
        service: "S3",
        affectedFiles: ["src/services/storage/s3Storage.js"],
        severity: "High",
        confidence: "High",
        resolutionLevel: "L3",
        risk: "High",
        affectedFeature: "File upload and storage",
        featureStatus: "At risk",
        featureSurvivalState: "High risk",
        shortSummary: "Direct AWS S3 SDK usage for file operations",
        technicalIssue: "Application uses AWS SDK for S3 operations. API calls are AWS-specific and won't work with GCP Cloud Storage.",
        bobNotes: "Demo mode fallback result. Real analysis would identify specific SDK methods used.",
        bobRationale: "S3 and Cloud Storage have different APIs. Direct SDK usage requires code changes, not just configuration.",
        businessImpact: "File uploads and downloads will fail completely after migration.",
        migrationImpact: "Requires code refactoring to use GCP Cloud Storage SDK or abstraction layer. Bucket naming conventions differ.",
        recommendedAction: "Refactor storage service to use GCP Cloud Storage SDK. Consider implementing storage abstraction layer for future portability.",
        requiresHumanReview: true,
        humanReviewReason: "Code refactoring required - needs senior engineer review",
        suggestedReviewer: "Senior Backend Engineer"
      },
      {
        id: "demo-gamelift-1",
        title: "AWS GameLift dependency controls matchmaking",
        category: "Game infrastructure",
        provider: "AWS",
        service: "GameLift",
        affectedFiles: ["src/services/matchmaking/gameliftMatchmaker.js"],
        severity: "Critical",
        confidence: "High",
        resolutionLevel: "L4",
        risk: "Critical",
        affectedFeature: "Player matchmaking",
        featureStatus: "Blocked",
        featureSurvivalState: "Blocked",
        shortSummary: "Core matchmaking depends on AWS GameLift",
        technicalIssue: "GameLift is AWS-specific game server hosting service. No direct GCP equivalent exists.",
        bobNotes: "Demo mode fallback result. Real analysis would explore alternative architectures.",
        bobRationale: "GameLift provides managed game server hosting and matchmaking. GCP has no equivalent service. Requires architectural redesign.",
        businessImpact: "Matchmaking feature will be completely non-functional after migration. This is a core business feature.",
        migrationImpact: "Requires complete redesign of matchmaking architecture. May need custom solution on GCP Compute Engine or third-party service.",
        recommendedAction: "BLOCK migration until matchmaking architecture is redesigned. Evaluate alternatives: custom solution, Agones on GKE, or third-party services.",
        requiresHumanReview: true,
        humanReviewReason: "Critical architectural decision required",
        suggestedReviewer: "Principal Engineer / CTO"
      },
      {
        id: "demo-sendgrid-1",
        title: "SendGrid API key not documented",
        category: "Runtime dependency",
        provider: "External",
        service: "SendGrid",
        affectedFiles: ["src/services/email/sendgridEmail.js"],
        severity: "Medium",
        confidence: "Medium",
        resolutionLevel: "L1",
        risk: "Low",
        affectedFeature: "Email notifications",
        featureStatus: "Ready",
        featureSurvivalState: "Likely working",
        shortSummary: "SendGrid dependency not documented in .env.example",
        technicalIssue: "SENDGRID_API_KEY is required at startup but missing from .env.example file.",
        bobNotes: "Demo mode fallback result. Real analysis would check all environment variables.",
        bobRationale: "SendGrid is cloud-agnostic. Will work on GCP, but missing documentation could cause deployment issues.",
        businessImpact: "Email notifications might fail in new environment if API key is not configured.",
        migrationImpact: "Low impact. Just needs documentation and configuration management.",
        recommendedAction: "Add SENDGRID_API_KEY to .env.example with documentation. Verify API key works in GCP environment.",
        requiresHumanReview: false
      }
    ],
    featureSurvivalMap: [
      {
        feature: "Session management",
        dependency: "AWS ElastiCache",
        expectedState: "Partially working",
        bobRationale: "Redis protocol is standard, but connection configuration needs updates",
        recommendedAction: "Update Redis connection to GCP Memorystore"
      },
      {
        feature: "File storage",
        dependency: "AWS S3",
        expectedState: "High risk",
        bobRationale: "Direct SDK usage requires code changes",
        recommendedAction: "Refactor to use GCP Cloud Storage SDK"
      },
      {
        feature: "Player matchmaking",
        dependency: "AWS GameLift",
        expectedState: "Blocked",
        bobRationale: "No GCP equivalent service exists",
        recommendedAction: "Redesign matchmaking architecture before migration"
      },
      {
        feature: "Email notifications",
        dependency: "SendGrid",
        expectedState: "Likely working",
        bobRationale: "Cloud-agnostic service, just needs configuration",
        recommendedAction: "Document and configure API key"
      }
    ],
    humanReviewQueue: [
      {
        findingId: "demo-s3-1",
        title: "AWS S3 SDK used directly for uploads",
        reason: "Code refactoring required - needs senior engineer review",
        severity: "High",
        confidence: "High",
        affectedFeature: "File upload and storage",
        suggestedReviewer: "Senior Backend Engineer",
        nextAction: "Review storage abstraction options and estimate refactoring effort"
      },
      {
        findingId: "demo-gamelift-1",
        title: "AWS GameLift dependency controls matchmaking",
        reason: "Critical architectural decision required",
        severity: "Critical",
        confidence: "High",
        affectedFeature: "Player matchmaking",
        suggestedReviewer: "Principal Engineer / CTO",
        nextAction: "Evaluate matchmaking alternatives and create migration strategy"
      }
    ],
    actionPlan: {
      fixBeforeMigration: [
        "Redesign matchmaking architecture to remove GameLift dependency",
        "Refactor storage service to use abstraction layer",
        "Update Redis connection configuration for GCP Memorystore"
      ],
      validateBeforeMigration: [
        "Test Redis connection with GCP Memorystore in staging",
        "Verify SendGrid API key works in GCP environment",
        "Load test new matchmaking solution"
      ],
      reviewWithSeniorEngineer: [
        "Storage abstraction layer design",
        "Matchmaking architecture redesign",
        "Migration rollback strategy"
      ],
      documentBeforeMigration: [
        "Add SENDGRID_API_KEY to .env.example",
        "Document new matchmaking architecture",
        "Create GCP Memorystore setup guide"
      ],
      postMigrationChecks: [
        "Verify session persistence works correctly",
        "Test file upload/download functionality",
        "Monitor matchmaking performance",
        "Check email delivery rates"
      ]
    },
    bobReasoningTrace: {
      architectureSummary: "Demo mode: Legacy gaming backend with AWS-specific dependencies. Uses ElastiCache for sessions, S3 for storage, and GameLift for matchmaking.",
      cloudDependencyReasoning: [
        "ElastiCache detected via cache.amazonaws.com domain in connection string",
        "S3 SDK usage found in storage service module",
        "GameLift client initialization found in matchmaking service",
        "SendGrid is cloud-agnostic but needs configuration documentation"
      ],
      riskClassificationRationale: [
        "GameLift marked Critical - no GCP equivalent, blocks migration",
        "S3 marked High - requires code refactoring",
        "ElastiCache marked Medium - configuration changes needed",
        "SendGrid marked Low - just documentation needed"
      ],
      confidenceRationale: [
        "Demo mode: Confidence levels based on typical migration patterns",
        "High confidence for direct SDK usage (clear evidence)",
        "Medium confidence for configuration issues (may have workarounds)"
      ],
      humanReviewRationale: [
        "GameLift requires architectural decision from leadership",
        "S3 refactoring needs senior engineer to estimate effort and design abstraction"
      ],
      recommendedModernizationNotes: [
        "Consider implementing storage abstraction layer for future cloud portability",
        "Evaluate managed matchmaking services or Agones on GKE",
        "Use environment-based configuration for all cloud services"
      ],
      traceTimeline: [
        "Demo mode fallback result generated",
        "Analyzed 4 preliminary findings from scanner",
        "Classified risks based on migration impact",
        "Identified 2 items requiring human review",
        "Generated action plan with 5 categories"
      ]
    },
    reportSummary: {
      migrationReadiness: "Proceed with caution - Critical blockers identified",
      migrationReadyFiles: 5,
      lowMediumRisk: 2,
      highRisk: 2,
      needsHumanReview: 2,
      generatedDate: new Date().toISOString(),
      analysisStatus: "Demo mode - Bob unavailable"
    },
    aiSummary: {
      scanScope: [
        "package.json",
        ".env.example",
        ".env.migration-test",
        "src/config/redis.js",
        "src/services/email/sendgridEmail.js",
        "src/services/storage/s3Storage.js",
        "src/services/matchmaking/gameliftMatchmaker.js",
        "src/legacy/legacyQueueBridge.js",
        "src/routes/billingWebhook.js"
      ],
      mainConclusion: "Demo mode: This application has significant AWS dependencies that require attention before migration to GCP. The GameLift matchmaking service is a critical blocker that needs architectural redesign.",
      suggestedMigrationApproach: [
        "Phase 1: Redesign matchmaking architecture (CRITICAL - blocks migration)",
        "Phase 2: Refactor storage layer to use abstraction",
        "Phase 3: Update Redis configuration for GCP Memorystore",
        "Phase 4: Document and configure external services (SendGrid)",
        "Phase 5: Comprehensive testing in GCP staging environment"
      ],
      technicalLog: [
        "Demo mode fallback result - Bob analysis unavailable",
        "Scanned 9 files for cloud dependencies",
        "Detected 4 AWS-specific dependencies",
        "Identified 1 critical blocker (GameLift)",
        "Generated fallback recommendations based on common migration patterns"
      ]
    },
    createdAt: new Date().toISOString()
  };
}

// Made with Bob
