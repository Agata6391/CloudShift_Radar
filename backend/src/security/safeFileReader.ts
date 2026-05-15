import { promises as fs } from "node:fs";
import { MAX_EXTRACTED_FILE_BYTES } from "./validateZip";
import { isAllowedScanFile } from "./sanitizePaths";

const TEXT_DECODER = new TextDecoder("utf-8", { fatal: false });

export async function readTextFileSafely(filePath: string, relativePath: string): Promise<string | null> {
  if (!isAllowedScanFile(relativePath)) {
    return null;
  }

  const stat = await fs.stat(filePath);
  if (!stat.isFile() || stat.size > MAX_EXTRACTED_FILE_BYTES) {
    return null;
  }

  const buffer = await fs.readFile(filePath);
  if (buffer.includes(0)) {
    return null;
  }

  return TEXT_DECODER.decode(buffer);
}
