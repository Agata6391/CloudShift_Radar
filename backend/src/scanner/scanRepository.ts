import path from "node:path";
import type { RepositoryScanContext } from "@cloudshift-radar/shared";
import { readTextFileSafely } from "../security/safeFileReader";
import { detectFileTree } from "./detectFileTree";
import { detectCloudSignals } from "./detectCloudSignals";
import { detectEnvGaps } from "./detectEnvGaps";
import { detectHardcodedInfrastructure } from "./detectHardcodedInfra";
import { buildPreliminaryFindings } from "./preliminaryFindings";

interface FileContent {
  path: string;
  content: string;
}

export async function scanRepository(rootDir: string): Promise<RepositoryScanContext> {
  const fileTree = await detectFileTree(rootDir);
  const files: FileContent[] = [];

  for (const relativePath of fileTree) {
    const absolutePath = path.join(rootDir, relativePath);
    const content = await readTextFileSafely(absolutePath, relativePath);
    if (content !== null) {
      files.push({
        path: relativePath,
        content
      });
    }
  }

  const technicalSignals = detectCloudSignals(files);
  const environmentGaps = detectEnvGaps(files);
  const hardcodedInfrastructure = detectHardcodedInfrastructure(files);
  const partialContext = {
    fileTree,
    technicalSignals,
    environmentGaps,
    hardcodedInfrastructure
  };

  return {
    ...partialContext,
    preliminaryFindings: buildPreliminaryFindings(partialContext)
  };
}
