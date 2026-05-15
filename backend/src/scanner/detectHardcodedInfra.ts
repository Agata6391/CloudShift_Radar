import type { HardcodedInfrastructure } from "@cloudshift-radar/shared";

interface FileContent {
  path: string;
  content: string;
}

const URL_PATTERN = /https?:\/\/[^\s"'`<>]+/gi;
const IP_PATTERN = /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g;
const REGION_PATTERN = /\b(?:us|eu|ap|sa|ca|me|af)-(?:north|south|east|west|central|northeast|southeast|southwest|northwest)-\d\b/g;
const BUCKET_PATTERN = /\b(?:s3:\/\/|S3_BUCKET=|AWS_BUCKET=)([a-z0-9][a-z0-9.-]{2,62})/gi;

function pushMatch(
  map: Map<string, HardcodedInfrastructure>,
  type: HardcodedInfrastructure["type"],
  value: string,
  filePath: string
) {
  const key = `${type}:${value}`;
  const existing = map.get(key);

  if (existing) {
    if (!existing.files.includes(filePath)) {
      existing.files.push(filePath);
    }
    return;
  }

  map.set(key, {
    type,
    value,
    files: [filePath],
    confidence: type === "url" || type === "ip" ? "High" : "Medium"
  });
}

export function detectHardcodedInfrastructure(files: FileContent[]): HardcodedInfrastructure[] {
  const matches = new Map<string, HardcodedInfrastructure>();

  for (const file of files) {
    const urls = file.content.match(URL_PATTERN) || [];
    urls.forEach((value) => pushMatch(matches, "url", value, file.path));

    const ips = file.content.match(IP_PATTERN) || [];
    ips.forEach((value) => pushMatch(matches, "ip", value, file.path));

    const regions = file.content.match(REGION_PATTERN) || [];
    regions.forEach((value) => pushMatch(matches, "region", value, file.path));

    for (const match of file.content.matchAll(BUCKET_PATTERN)) {
      pushMatch(matches, "bucket", match[1] || match[0], file.path);
    }
  }

  return [...matches.values()].map((item) => ({
    ...item,
    files: item.files.sort()
  }));
}
