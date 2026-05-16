import { createWriteStream, promises as fs } from "node:fs";
import path from "node:path";
import type { Readable } from "node:stream";
import yauzl from "yauzl";
import {
  MAX_EXTRACTED_FILE_BYTES,
  MAX_TOTAL_EXTRACTED_BYTES
} from "../security/validateZip";
import {
  isAllowedScanFile,
  normalizeZipPath,
  safeJoin,
  shouldIgnorePath
} from "../security/sanitizePaths";

export interface ExtractedRepository {
  rootDir: string;
  extractedFiles: string[];
  skippedFiles: string[];
}

function openZip(buffer: Buffer): Promise<yauzl.ZipFile> {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(buffer, { lazyEntries: true, validateEntrySizes: true }, (error, zipFile) => {
      if (error || !zipFile) {
        reject(error || new Error("Unable to read ZIP archive."));
        return;
      }
      resolve(zipFile);
    });
  });
}

function openReadStream(zipFile: yauzl.ZipFile, entry: yauzl.Entry): Promise<Readable> {
  return new Promise((resolve, reject) => {
    zipFile.openReadStream(entry, (error, stream) => {
      if (error || !stream) {
        reject(error || new Error("Unable to read ZIP entry."));
        return;
      }
      resolve(stream);
    });
  });
}

function writeEntry(stream: Readable, targetPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    let written = 0;
    const output = createWriteStream(targetPath, { flags: "wx" });

    stream.on("data", (chunk: Buffer) => {
      written += chunk.length;
      if (written > MAX_EXTRACTED_FILE_BYTES) {
        stream.destroy(new Error("Extracted file exceeds the 1 MB per-file limit."));
      }
    });

    stream.on("error", reject);
    output.on("error", reject);
    output.on("finish", () => resolve(written));
    stream.pipe(output);
  });
}

export async function extractZip(buffer: Buffer, destinationDir: string): Promise<ExtractedRepository> {
  await fs.mkdir(destinationDir, { recursive: true });
  const zipFile = await openZip(buffer);
  const extractedFiles: string[] = [];
  const skippedFiles: string[] = [];
  let totalExtracted = 0;

  return new Promise((resolve, reject) => {
    zipFile.once("error", reject);
    zipFile.readEntry();

    zipFile.on("entry", async (entry) => {
      try {
        const normalizedPath = normalizeZipPath(entry.fileName);
        const isDirectory = entry.fileName.endsWith("/");

        if (!normalizedPath || isDirectory || shouldIgnorePath(normalizedPath) || !isAllowedScanFile(normalizedPath)) {
          skippedFiles.push(entry.fileName);
          zipFile.readEntry();
          return;
        }

        if (entry.uncompressedSize > MAX_EXTRACTED_FILE_BYTES) {
          skippedFiles.push(entry.fileName);
          zipFile.readEntry();
          return;
        }

        const targetPath = safeJoin(destinationDir, normalizedPath);
        await fs.mkdir(path.dirname(targetPath), { recursive: true });
        const stream = await openReadStream(zipFile, entry);
        const written = await writeEntry(stream, targetPath);
        totalExtracted += written;

        if (totalExtracted > MAX_TOTAL_EXTRACTED_BYTES) {
          reject(new Error("Extracted repository exceeds the 15 MB MVP scanning limit."));
          return;
        }

        extractedFiles.push(normalizedPath);
        zipFile.readEntry();
      } catch (error) {
        reject(error);
      }
    });

    zipFile.once("end", () => {
      zipFile.close();
      resolve({
        rootDir: destinationDir,
        extractedFiles,
        skippedFiles
      });
    });
  });
}
