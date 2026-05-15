import type { TechnicalSignal } from "@cloudshift-radar/shared";

interface FileContent {
  path: string;
  content: string;
}

interface SignalPattern {
  id: string;
  label: string;
  category: string;
  provider: string;
  service: string;
  patterns: RegExp[];
}

const SIGNAL_PATTERNS: SignalPattern[] = [
  {
    id: "aws_references",
    label: "AWS references",
    category: "Cloud provider",
    provider: "AWS",
    service: "AWS",
    patterns: [/\bAWS\b/i, /amazonaws\.com/i, /aws-sdk/i, /@aws-sdk\//i]
  },
  {
    id: "gcp_references",
    label: "GCP references",
    category: "Cloud provider",
    provider: "GCP",
    service: "Google Cloud",
    patterns: [/\bGCP\b/i, /googleapis\.com/i, /@google-cloud\//i, /google-cloud/i]
  },
  {
    id: "azure_references",
    label: "Azure references",
    category: "Cloud provider",
    provider: "Azure",
    service: "Azure",
    patterns: [/\bAzure\b/i, /blob\.core\.windows\.net/i, /@azure\//i]
  },
  {
    id: "s3_usage",
    label: "S3 usage",
    category: "Storage",
    provider: "AWS",
    service: "S3",
    patterns: [/\bS3Client\b/i, /\bS3\b/i, /s3:\/\/|s3\./i, /AWS_S3|S3_BUCKET/i]
  },
  {
    id: "gcs_usage",
    label: "Google Cloud Storage usage",
    category: "Storage",
    provider: "GCP",
    service: "Cloud Storage",
    patterns: [/Storage\(/i, /GCS_BUCKET/i, /storage\.googleapis\.com/i]
  },
  {
    id: "azure_blob_usage",
    label: "Azure Blob usage",
    category: "Storage",
    provider: "Azure",
    service: "Blob Storage",
    patterns: [/BlobServiceClient/i, /AZURE_STORAGE/i, /blob\.core\.windows\.net/i]
  },
  {
    id: "redis_usage",
    label: "Redis usage",
    category: "Cache / Queue",
    provider: "Unknown",
    service: "Redis",
    patterns: [/\bredis\b/i, /REDIS_URL/i, /ioredis/i]
  },
  {
    id: "elasticache_references",
    label: "ElastiCache references",
    category: "Cache / Queue",
    provider: "AWS",
    service: "ElastiCache",
    patterns: [/elasticache/i, /cache\.amazonaws\.com/i]
  },
  {
    id: "postgresql_references",
    label: "PostgreSQL references",
    category: "Database",
    provider: "Unknown",
    service: "PostgreSQL",
    patterns: [/postgresql/i, /\bpostgres\b/i, /PGHOST|DATABASE_URL/i]
  },
  {
    id: "mongodb_references",
    label: "MongoDB references",
    category: "Database",
    provider: "Unknown",
    service: "MongoDB",
    patterns: [/mongodb/i, /mongoose/i, /MONGO_URI/i]
  },
  {
    id: "documentdb_references",
    label: "DocumentDB references",
    category: "Database",
    provider: "AWS",
    service: "DocumentDB",
    patterns: [/documentdb/i, /docdb/i]
  },
  {
    id: "dynamodb_references",
    label: "DynamoDB references",
    category: "Database",
    provider: "AWS",
    service: "DynamoDB",
    patterns: [/DynamoDB/i, /@aws-sdk\/client-dynamodb/i]
  },
  {
    id: "sqs_references",
    label: "SQS references",
    category: "Queue",
    provider: "AWS",
    service: "SQS",
    patterns: [/SQSClient/i, /\bSQS\b/i, /QUEUE_URL/i]
  },
  {
    id: "pubsub_references",
    label: "Pub/Sub references",
    category: "Queue",
    provider: "GCP",
    service: "Pub/Sub",
    patterns: [/PubSub/i, /pubsub/i]
  },
  {
    id: "sendgrid_references",
    label: "SendGrid references",
    category: "Runtime dependency",
    provider: "External",
    service: "SendGrid",
    patterns: [/sendgrid/i, /SENDGRID_API_KEY/i]
  },
  {
    id: "ses_references",
    label: "SES references",
    category: "Email",
    provider: "AWS",
    service: "SES",
    patterns: [/SESClient/i, /SimpleEmailService/i, /AWS_SES/i]
  },
  {
    id: "gamelift_references",
    label: "GameLift references",
    category: "Game infrastructure",
    provider: "AWS",
    service: "GameLift",
    patterns: [/gamelift/i, /GameLift/i]
  },
  {
    id: "agones_references",
    label: "Agones references",
    category: "Game infrastructure",
    provider: "GCP",
    service: "Agones",
    patterns: [/agones/i]
  },
  {
    id: "ci_cd_cloud_assumptions",
    label: "CI/CD cloud assumptions",
    category: "CI/CD",
    provider: "Unknown",
    service: "Pipeline",
    patterns: [/aws-actions/i, /gcloud auth/i, /azure\/login/i, /kubectl set image/i, /docker push/i]
  }
];

function collectEvidence(content: string, pattern: RegExp): string[] {
  const lines = content.split(/\r?\n/);
  const evidence: string[] = [];

  lines.forEach((line, index) => {
    if (pattern.test(line)) {
      evidence.push(`Line ${index + 1}: ${line.trim().slice(0, 140)}`);
    }
  });

  return evidence.slice(0, 3);
}

export function detectCloudSignals(files: FileContent[]): TechnicalSignal[] {
  const signals: TechnicalSignal[] = [];

  for (const signalPattern of SIGNAL_PATTERNS) {
    const matchedFiles = new Set<string>();
    const evidence = new Set<string>();

    for (const file of files) {
      for (const pattern of signalPattern.patterns) {
        if (pattern.test(file.content)) {
          matchedFiles.add(file.path);
          collectEvidence(file.content, pattern).forEach((item) => evidence.add(`${file.path} ${item}`));
        }
      }
    }

    if (matchedFiles.size > 0) {
      signals.push({
        id: signalPattern.id,
        label: signalPattern.label,
        category: signalPattern.category,
        provider: signalPattern.provider,
        service: signalPattern.service,
        files: [...matchedFiles].sort(),
        evidence: [...evidence].slice(0, 8)
      });
    }
  }

  return signals;
}
