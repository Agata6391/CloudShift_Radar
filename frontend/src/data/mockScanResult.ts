import type { ScanResult } from "@cloudshift-radar/shared";

export const mockScanResult: ScanResult = {
  scanId: "preview-bob-demo",
  projectName: "Legacy Cloud API Demo",
  currentProvider: "AWS",
  targetProvider: "GCP",
  applicationType: "Backend API",
  bobVerdict: "Prepare First",
  bobSummary:
    "Bob does not recommend production migration yet. Critical AWS dependencies remain coupled to storage, cache, and matchmaking infrastructure. Basic auth and database-backed APIs may survive migration, but uploads, queues, and matchmaking are likely to fail without preparation.",
  bobConfidence: "Medium-High",
  readinessScore: 42,
  recommendedDecision: "Prepare First",
  businessRiskLevel: "High",
  technicalComplexity: "High",
  findings: [
    {
      id: "finding_001",
      title: "Redis endpoint points to AWS ElastiCache",
      category: "Cache / Queue",
      provider: "AWS",
      service: "ElastiCache",
      affectedFiles: ["src/config/redis.js", ".env.migration-test"],
      detectedFiles: ["src/config/redis.js", ".env.migration-test"],
      severity: "High",
      confidence: "High",
      resolutionLevel: "L1",
      risk: "High",
      affectedFeature: "Background jobs",
      featureStatus: "At risk",
      featureSurvivalState: "High risk",
      shortSummary: "Redis is configured against AWS ElastiCache, putting background jobs at risk after migration.",
      technicalIssue: "Provider-specific Redis endpoint points to AWS ElastiCache.",
      bobNotes:
        "Bob sees this as a configuration-level issue if the target environment provides a compatible Redis endpoint.",
      requiresHumanReview: false,
      bobRationale:
        "Bob classified this as a configuration-level migration risk because the dependency can likely be redirected to a target Redis endpoint without code redesign.",
      businessImpact: "Background jobs and cache-backed flows may fail during migration validation.",
      migrationImpact: "Target environment must provide Redis-compatible configuration before cutover.",
      featureImpact: "Background jobs are at risk until Redis is remapped to the destination environment.",
      technicalComplexity: "Low",
      recommendedAction: "Replace provider-specific Redis endpoint with target environment configuration."
    },
    {
      id: "finding_002",
      title: "SendGrid API key required at startup",
      category: "Runtime dependency",
      provider: "External",
      service: "SendGrid",
      affectedFiles: ["src/services/email/sendgridEmail.js"],
      detectedFiles: ["src/services/email/sendgridEmail.js"],
      severity: "Medium",
      confidence: "High",
      resolutionLevel: "L2",
      risk: "Medium",
      affectedFeature: "Email notifications",
      featureStatus: "Needs changes",
      featureSurvivalState: "Partially working",
      shortSummary: "SendGrid startup coupling can block deploys if email secrets are missing.",
      technicalIssue: "SendGrid API key is required during service initialization.",
      bobNotes:
        "Bob recommends making email provider initialization optional or environment-gated before migration validation.",
      requiresHumanReview: false,
      bobRationale:
        "Bob classified this as a minor code change because startup behavior should be made environment-gated before migration validation.",
      businessImpact: "Incomplete email configuration could block deployments or notification flows.",
      migrationImpact: "The application may fail health checks if email secrets are absent in the target runtime.",
      featureImpact: "Email notifications need startup safeguards before migration validation.",
      technicalComplexity: "Medium",
      recommendedAction: "Make email provider initialization optional or environment-gated."
    },
    {
      id: "finding_003",
      title: "AWS S3 SDK used directly for uploads",
      category: "Storage",
      provider: "AWS",
      service: "S3",
      affectedFiles: ["src/services/storage/s3Storage.js"],
      detectedFiles: ["src/services/storage/s3Storage.js"],
      severity: "High",
      confidence: "High",
      resolutionLevel: "L3",
      risk: "High",
      affectedFeature: "File uploads",
      featureStatus: "At risk",
      featureSurvivalState: "High risk",
      shortSummary: "Direct S3 SDK usage puts file uploads at risk during provider migration.",
      technicalIssue: "Upload logic is coupled directly to AWS S3 APIs.",
      bobNotes:
        "Bob classifies storage as refactor-level risk because provider-neutral storage behavior is not isolated.",
      requiresHumanReview: false,
      bobRationale:
        "Bob classified this as refactor-level risk because upload behavior is coupled directly to AWS SDK APIs and should be abstracted before changing providers.",
      businessImpact: "Customer upload workflows are likely to fail if object storage is moved without an abstraction.",
      migrationImpact: "Code paths using S3 client APIs need provider-neutral storage behavior.",
      featureImpact: "File uploads are at risk until storage access is abstracted.",
      technicalComplexity: "High",
      recommendedAction: "Introduce a storage provider abstraction before migration."
    },
    {
      id: "finding_004",
      title: "AWS GameLift dependency controls matchmaking",
      category: "Game infrastructure",
      provider: "AWS",
      service: "GameLift",
      affectedFiles: ["src/services/matchmaking/gameliftMatchmaker.js"],
      detectedFiles: ["src/services/matchmaking/gameliftMatchmaker.js"],
      severity: "Critical",
      confidence: "High",
      resolutionLevel: "L4",
      risk: "Critical",
      affectedFeature: "Matchmaking",
      featureStatus: "Blocked",
      featureSurvivalState: "Blocked",
      shortSummary: "AWS GameLift controls matchmaking, blocking migration without replacement architecture.",
      technicalIssue: "Matchmaking depends on AWS-specific GameLift infrastructure.",
      bobNotes:
        "Bob classifies this as architecture-level risk because a simple config or SDK swap is not enough.",
      requiresHumanReview: false,
      bobRationale:
        "Bob classified this as architecture-level risk because the feature depends on AWS-specific infrastructure that cannot be replaced with a simple config or localized code change.",
      businessImpact: "Matchmaking availability may block a production migration.",
      migrationImpact: "A replacement architecture or isolation layer is required before target-cloud migration.",
      featureImpact: "Matchmaking is blocked until a destination-compatible architecture exists.",
      technicalComplexity: "Very High",
      recommendedAction: "Redesign matchmaking infrastructure or isolate this dependency before migration."
    },
    {
      id: "finding_005",
      title: "Legacy queue bridge has unclear ownership",
      category: "Legacy integration",
      provider: "Unknown",
      service: "Queue bridge",
      affectedFiles: ["src/legacy/legacyQueueBridge.js"],
      detectedFiles: ["src/legacy/legacyQueueBridge.js"],
      severity: "Critical",
      confidence: "Low",
      resolutionLevel: "L5",
      risk: "Needs review",
      affectedFeature: "Background jobs",
      featureStatus: "Needs human review",
      featureSurvivalState: "Unknown",
      shortSummary: "Queue bridge ownership is unclear, so Bob cannot safely estimate migration impact.",
      technicalIssue: "Legacy queue bridge runtime behavior and ownership are ambiguous.",
      bobNotes:
        "Bob escalates this because a critical dependency has low confidence and unclear runtime ownership.",
      requiresHumanReview: true,
      humanReviewReason:
        "Bob escalated this because the queue bridge is severe and low-confidence, with unclear runtime ownership.",
      suggestedReviewer: "Senior Backend Engineer",
      bobRationale:
        "Bob escalated this to human review because the migration impact is potentially critical but the ownership and runtime behavior are ambiguous.",
      businessImpact: "Unknown queue ownership could interrupt order processing or background workflows.",
      migrationImpact: "Migration blast radius cannot be estimated safely without senior review.",
      featureImpact: "Background jobs need human validation before migration planning.",
      technicalComplexity: "Unknown",
      recommendedAction: "Assign senior engineer review before estimating migration impact."
    },
    {
      id: "finding_006",
      title: "Billing webhook fallback behavior is ambiguous",
      category: "External integration",
      provider: "External",
      service: "Billing webhook",
      affectedFiles: ["src/routes/billingWebhook.js"],
      detectedFiles: ["src/routes/billingWebhook.js"],
      severity: "High",
      confidence: "Low",
      resolutionLevel: "L5",
      risk: "Needs review",
      affectedFeature: "Billing webhook",
      featureStatus: "Needs human review",
      featureSurvivalState: "Unknown",
      shortSummary: "Billing webhook fallback behavior is ambiguous and may affect revenue workflows.",
      technicalIssue: "External production webhook fallback behavior is not clear from repository context.",
      bobNotes:
        "Bob escalates this because severe revenue-impacting behavior cannot be verified from the scan context.",
      requiresHumanReview: true,
      humanReviewReason:
        "Bob escalated this because revenue-impacting fallback behavior is severe and unclear from repository context.",
      suggestedReviewer: "Senior Backend Engineer + Product Owner",
      bobRationale:
        "Bob escalated this because fallback routing affects revenue workflows, but the code path does not reveal ownership or target-cloud behavior.",
      businessImpact: "Billing reconciliation could fail silently after migration.",
      migrationImpact: "Webhook fallback behavior must be validated with production owners.",
      featureImpact: "Billing webhook behavior needs manual validation before migration.",
      technicalComplexity: "Unknown",
      recommendedAction: "Assign senior backend and product review to document billing fallback behavior."
    }
  ],
  featureSurvivalMap: [
    {
      feature: "Login",
      dependency: "PostgreSQL / JWT",
      expectedState: "Likely working",
      bobRationale: "Bob found no direct cloud-provider coupling in the basic auth path.",
      recommendedAction: "Validate DB connection and JWT secrets."
    },
    {
      feature: "File uploads",
      dependency: "AWS S3",
      expectedState: "High risk",
      bobRationale: "Bob found direct AWS SDK coupling in upload logic.",
      recommendedAction: "Abstract storage provider."
    },
    {
      feature: "Email notifications",
      dependency: "SendGrid",
      expectedState: "Partially working",
      bobRationale: "Bob found startup risk if email configuration is incomplete.",
      recommendedAction: "Make provider optional or validate env setup."
    },
    {
      feature: "Matchmaking",
      dependency: "AWS GameLift",
      expectedState: "Blocked",
      bobRationale: "Bob found AWS-specific architecture dependency.",
      recommendedAction: "Architecture review required."
    },
    {
      feature: "Background jobs",
      dependency: "Redis / ElastiCache",
      expectedState: "High risk",
      bobRationale: "Bob found provider-specific Redis configuration.",
      recommendedAction: "Move Redis config to target environment."
    },
    {
      feature: "Billing webhook",
      dependency: "External production URL",
      expectedState: "Unknown",
      bobRationale: "Bob found ambiguous fallback behavior.",
      recommendedAction: "Human review required."
    }
  ],
  humanReviewQueue: [
    {
      findingId: "finding_005",
      title: "Legacy queue bridge has unclear ownership",
      reason:
        "Bob does not hide uncertainty. This item is critical with low confidence, so Bob escalated it for senior human review.",
      severity: "Critical",
      confidence: "Low",
      affectedFeature: "Background jobs",
      suggestedReviewer: "Senior Backend Engineer",
      nextAction: "Identify queue owner, runtime contract, and replacement path before migration planning.",
      recommendedValidation: "Confirm queue ownership and runtime contract with the senior backend owner."
    },
    {
      findingId: "finding_006",
      title: "Billing webhook fallback behavior is ambiguous",
      reason:
        "Bob escalated this because revenue-impacting fallback behavior is severe and unclear from repository context.",
      severity: "High",
      confidence: "Low",
      affectedFeature: "Billing webhook",
      suggestedReviewer: "Senior Backend Engineer + Product Owner",
      nextAction: "Document expected billing fallback behavior and validate target-cloud webhook routing.",
      recommendedValidation: "Validate target-cloud webhook routing with product and backend owners."
    },
    {
      findingId: "finding_005",
      title: "Any L5 item",
      reason: "Bob marks L5 as requiring human judgment before an accountable migration estimate can be made.",
      severity: "Critical",
      confidence: "Low",
      affectedFeature: "Migration plan",
      suggestedReviewer: "Migration Architect",
      nextAction: "Hold senior review before committing migration timelines.",
      recommendedValidation: "Review all L5 findings before committing migration timelines."
    }
  ],
  actionPlan: {
    fixBeforeMigration: [
      "Replace provider-specific Redis endpoint with target environment configuration. Bob expects this to be a configuration-level fix.",
      "Introduce a storage abstraction layer for file uploads. Bob classified direct S3 calls as refactor-level risk.",
      "Make SendGrid initialization optional or environment-gated. Bob found startup fragility if email secrets are missing."
    ],
    validateBeforeMigration: [
      "Add smoke tests for auth, storage, Redis, email, and matchmaking. Bob wants feature survival validated before cutover.",
      "Run a target-cloud rehearsal with production-like environment variables."
    ],
    reviewWithSeniorEngineer: [
      "Review GameLift dependency and define replacement architecture. Bob classified matchmaking as architecture-level risk.",
      "Assign senior review to L5 findings. Bob escalated low-confidence severe items."
    ],
    documentBeforeMigration: [
      "Complete .env.example documentation. Bob found runtime variables without documented target values.",
      "Document billing webhook fallback ownership and expected production behavior."
    ],
    postMigrationChecks: [
      "Verify upload persistence and signed URL behavior.",
      "Verify Redis-backed queues drain correctly in the target environment.",
      "Verify matchmaking session creation and rollback path."
    ]
  },
  bobReasoningTrace: {
    architectureSummary:
      "Bob reviewed the repository scan context and identified modernization risks across configuration, runtime services, storage, queues, and cloud-specific integrations.",
    cloudDependencyReasoning: [
      "S3 usage appears in upload logic and is coupled directly to AWS SDK APIs.",
      "ElastiCache appears through Redis endpoint configuration and is likely movable if target Redis configuration is supplied.",
      "GameLift controls matchmaking behavior, making it an architecture-level AWS dependency rather than a simple SDK swap.",
      "SendGrid is external but startup coupling can still block target-cloud deployment."
    ],
    riskClassificationRationale: [
      "Bob classified storage as L3 because direct SDK usage requires a provider abstraction.",
      "Bob classified matchmaking as L4 because the feature depends on cloud-specific orchestration.",
      "Bob classified low-confidence severe integration paths as L5 to prevent false certainty."
    ],
    confidenceRationale: [
      "Bob has high confidence where filenames, SDK references, and service names align.",
      "Bob has lower confidence where queue ownership and billing fallback behavior are not represented clearly in the scan context."
    ],
    humanReviewRationale: [
      "High severity plus low confidence is escalated for human review.",
      "Revenue and queue paths need accountable ownership before migration estimates are trusted."
    ],
    recommendedModernizationNotes: [
      "Introduce storage and matchmaking boundaries before moving providers.",
      "Document environment variables and target-cloud service mappings.",
      "Add smoke tests that prove feature survival in migration rehearsal."
    ],
    traceTimeline: [
      "Bob received migration context and repository scan signals.",
      "Bob mapped file tree evidence to service dependencies.",
      "Bob classified findings by severity, confidence, and resolution level.",
      "Bob escalated severe low-confidence items for senior review.",
      "Bob generated the Prepare First readiness verdict."
    ]
  },
  reportSummary: {
    migrationReadiness: "42%",
    migrationReadyFiles: 1,
    lowMediumRisk: 1,
    highRisk: 5,
    needsHumanReview: 3,
    generatedDate: new Date().toISOString(),
    analysisStatus: "Generated"
  },
  aiSummary: {
    scanScope: [
      "Project structure",
      "Dependency files",
      "Environment variables",
      "Cloud SDK usage",
      "Feature-level migration risks"
    ],
    mainConclusion:
      "Bob does not recommend production migration yet because storage, cache, matchmaking, and ambiguous integrations remain migration risks.",
    suggestedMigrationApproach: [
      "Resolve high-risk findings",
      "Validate human review items",
      "Replace provider-specific services",
      "Re-run scan after changes"
    ],
    technicalLog: [
      "Bob received migration context and repository scan signals.",
      "Bob mapped scanner evidence to feature-level migration risk.",
      "Bob escalated severe low-confidence findings for manual validation."
    ]
  },
  createdAt: new Date().toISOString()
};
