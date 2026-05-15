import type { RepositoryScanContext } from "@cloudshift-radar/shared";

export function loadDemoRepositoryScanContext(): RepositoryScanContext {
  return {
    fileTree: [
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
    technicalSignals: [
      {
        id: "elasticache_references",
        label: "ElastiCache references",
        category: "Cache / Queue",
        provider: "AWS",
        service: "ElastiCache",
        files: ["src/config/redis.js", ".env.migration-test"],
        evidence: ["REDIS_URL points to cache.amazonaws.com"]
      },
      {
        id: "sendgrid_references",
        label: "SendGrid references",
        category: "Runtime dependency",
        provider: "External",
        service: "SendGrid",
        files: ["src/services/email/sendgridEmail.js"],
        evidence: ["SENDGRID_API_KEY is required during service initialization"]
      },
      {
        id: "s3_usage",
        label: "S3 usage",
        category: "Storage",
        provider: "AWS",
        service: "S3",
        files: ["src/services/storage/s3Storage.js"],
        evidence: ["Direct AWS SDK S3 client usage detected"]
      },
      {
        id: "gamelift_references",
        label: "GameLift references",
        category: "Game infrastructure",
        provider: "AWS",
        service: "GameLift",
        files: ["src/services/matchmaking/gameliftMatchmaker.js"],
        evidence: ["GameLift matchmaking client controls session placement"]
      }
    ],
    environmentGaps: [
      {
        variable: "SENDGRID_API_KEY",
        usedIn: ["src/services/email/sendgridEmail.js"],
        documented: false,
        description: "SENDGRID_API_KEY is required at startup but missing from .env.example."
      },
      {
        variable: "LEGACY_QUEUE_BRIDGE_URL",
        usedIn: ["src/legacy/legacyQueueBridge.js"],
        documented: false,
        description: "Legacy queue bridge runtime endpoint is not documented."
      }
    ],
    hardcodedInfrastructure: [
      {
        type: "url",
        value: "https://billing.prod.example.com/webhooks/fallback",
        files: ["src/routes/billingWebhook.js"],
        confidence: "Medium"
      },
      {
        type: "region",
        value: "us-east-1",
        files: ["src/services/storage/s3Storage.js", "src/services/matchmaking/gameliftMatchmaker.js"],
        confidence: "Medium"
      }
    ],
    preliminaryFindings: [
      {
        title: "Redis endpoint points to AWS ElastiCache",
        category: "Cache / Queue",
        provider: "AWS",
        service: "ElastiCache",
        affectedFiles: ["src/config/redis.js", ".env.migration-test"],
        scannerEvidence: ["REDIS_URL points to cache.amazonaws.com"]
      },
      {
        title: "AWS S3 SDK used directly for uploads",
        category: "Storage",
        provider: "AWS",
        service: "S3",
        affectedFiles: ["src/services/storage/s3Storage.js"],
        scannerEvidence: ["Direct AWS SDK S3 client usage detected"]
      },
      {
        title: "AWS GameLift dependency controls matchmaking",
        category: "Game infrastructure",
        provider: "AWS",
        service: "GameLift",
        affectedFiles: ["src/services/matchmaking/gameliftMatchmaker.js"],
        scannerEvidence: ["GameLift matchmaking client controls session placement"]
      },
      {
        title: "Legacy queue bridge has unclear ownership",
        category: "Legacy integration",
        provider: "Unknown",
        service: "Queue bridge",
        affectedFiles: ["src/legacy/legacyQueueBridge.js"],
        scannerEvidence: ["LEGACY_QUEUE_BRIDGE_URL is used but not documented"]
      }
    ]
  };
}
