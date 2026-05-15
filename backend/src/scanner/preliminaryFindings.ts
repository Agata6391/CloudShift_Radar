import type {
  HardcodedInfrastructure,
  PreliminaryFinding,
  RepositoryScanContext,
  TechnicalSignal
} from "@cloudshift-radar/shared";

function findingFromSignal(signal: TechnicalSignal): PreliminaryFinding | null {
  if (signal.id === "s3_usage") {
    return {
      title: "Direct S3 usage detected",
      category: "Storage",
      provider: "AWS",
      service: "S3",
      affectedFiles: signal.files,
      scannerEvidence: signal.evidence
    };
  }

  if (signal.id === "elasticache_references") {
    return {
      title: "AWS ElastiCache reference detected",
      category: "Cache / Queue",
      provider: "AWS",
      service: "ElastiCache",
      affectedFiles: signal.files,
      scannerEvidence: signal.evidence
    };
  }

  if (signal.id === "gamelift_references") {
    return {
      title: "AWS GameLift dependency detected",
      category: "Game infrastructure",
      provider: "AWS",
      service: "GameLift",
      affectedFiles: signal.files,
      scannerEvidence: signal.evidence
    };
  }

  if (signal.id === "sendgrid_references") {
    return {
      title: "SendGrid runtime dependency detected",
      category: "Runtime dependency",
      provider: "External",
      service: "SendGrid",
      affectedFiles: signal.files,
      scannerEvidence: signal.evidence
    };
  }

  if (signal.id === "ci_cd_cloud_assumptions") {
    return {
      title: "CI/CD cloud assumption detected",
      category: "CI/CD",
      provider: signal.provider,
      service: signal.service,
      affectedFiles: signal.files,
      scannerEvidence: signal.evidence
    };
  }

  return null;
}

function findingFromInfra(item: HardcodedInfrastructure): PreliminaryFinding | null {
  if (item.type === "url" || item.type === "ip" || item.type === "region" || item.type === "bucket") {
    return {
      title: `Hardcoded ${item.type} detected`,
      category: "Hardcoded infrastructure",
      provider: "Unknown",
      service: item.type,
      affectedFiles: item.files,
      scannerEvidence: [`${item.type}: ${item.value}`]
    };
  }

  return null;
}

export function buildPreliminaryFindings(context: Omit<RepositoryScanContext, "preliminaryFindings">): PreliminaryFinding[] {
  const findings: PreliminaryFinding[] = [];
  const hasDockerCompose = context.fileTree.some((file) => file.endsWith("docker-compose.yml"));

  for (const signal of context.technicalSignals) {
    const finding = findingFromSignal(signal);
    if (finding) {
      findings.push(finding);
    }
  }

  for (const gap of context.environmentGaps) {
    findings.push({
      title: `Environment variable ${gap.variable} is used but not documented`,
      category: "Environment configuration",
      provider: "Unknown",
      service: "Environment",
      affectedFiles: gap.usedIn,
      scannerEvidence: [gap.description]
    });
  }

  for (const infra of context.hardcodedInfrastructure) {
    const finding = findingFromInfra(infra);
    if (finding) {
      findings.push(finding);
    }
  }

  const runtimeServiceSignals = context.technicalSignals.filter((signal) =>
    ["Redis", "PostgreSQL", "MongoDB", "DocumentDB", "DynamoDB"].includes(signal.service)
  );

  if (!hasDockerCompose && runtimeServiceSignals.length > 0) {
    findings.push({
      title: "Docker Compose missing services for detected runtime dependencies",
      category: "Local runtime parity",
      provider: "Unknown",
      service: "Docker Compose",
      affectedFiles: runtimeServiceSignals.flatMap((signal) => signal.files),
      scannerEvidence: runtimeServiceSignals.map(
        (signal) => `${signal.service} was detected, but docker-compose.yml was not found.`
      )
    });
  }

  return findings;
}
