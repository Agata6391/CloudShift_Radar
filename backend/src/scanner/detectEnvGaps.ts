import path from "node:path";
import type { EnvironmentGap } from "@cloudshift-radar/shared";

interface FileContent {
  path: string;
  content: string;
}

const ENV_USAGE_PATTERNS = [
  /process\.env\.([A-Z0-9_]+)/g,
  /process\.env\[['"]([A-Z0-9_]+)['"]\]/g,
  /env\(['"]([A-Z0-9_]+)['"]\)/g,
  /\bos\.environ\[['"]([A-Z0-9_]+)['"]\]/g,
  /\$\{([A-Z0-9_]+)\}/g
];

function parseDocumentedEnv(files: FileContent[]): Set<string> {
  const documented = new Set<string>();

  for (const file of files) {
    const basename = path.basename(file.path);
    if (basename !== ".env.example" && basename !== "README.md") {
      continue;
    }

    const matches = file.content.matchAll(/\b([A-Z][A-Z0-9_]{2,})\b/g);
    for (const match of matches) {
      documented.add(match[1]);
    }
  }

  return documented;
}

export function detectEnvGaps(files: FileContent[]): EnvironmentGap[] {
  const documented = parseDocumentedEnv(files);
  const usageMap = new Map<string, Set<string>>();

  for (const file of files) {
    if (path.basename(file.path) === ".env") {
      continue;
    }

    for (const pattern of ENV_USAGE_PATTERNS) {
      for (const match of file.content.matchAll(pattern)) {
        const variable = match[1];
        if (!usageMap.has(variable)) {
          usageMap.set(variable, new Set());
        }
        usageMap.get(variable)?.add(file.path);
      }
    }
  }

  return [...usageMap.entries()]
    .filter(([variable]) => !documented.has(variable))
    .map(([variable, usedIn]) => ({
      variable,
      usedIn: [...usedIn].sort(),
      documented: false,
      description: `${variable} is used by application code but is not documented in .env.example or README.md.`
    }))
    .sort((a, b) => a.variable.localeCompare(b.variable));
}
