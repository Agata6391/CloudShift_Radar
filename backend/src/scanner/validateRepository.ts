import { promises as fs } from "node:fs";
import path from "node:path";
import type { ValidationResult, ValidationError, RepositoryMetadata } from "@cloudshift-radar/shared";
import { isAllowedScanFile, shouldIgnorePath } from "../security/sanitizePaths";

const CRITICAL_FILES: Record<string, string[]> = {
  JavaScript: ["package.json"],
  TypeScript: ["package.json", "tsconfig.json"],
  Python: ["requirements.txt", "setup.py", "pyproject.toml"],
  Java: ["pom.xml", "build.gradle"],
  "C#": ["*.csproj", "*.sln"],
  Go: ["go.mod"],
  Ruby: ["Gemfile"]
};

const MAX_FILES = 1000;
const MAX_DIRECTORY_DEPTH = 10;

interface FileInfo {
  relativePath: string;
  size: number;
}

async function walkDirectory(rootDir: string): Promise<FileInfo[]> {
  const files: FileInfo[] = [];

  async function walk(currentDir: string) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const absolutePath = path.join(currentDir, entry.name);
        const relativePath = path.relative(rootDir, absolutePath).replace(/\\/g, "/");

        if (shouldIgnorePath(relativePath)) {
          continue;
        }

        if (entry.isDirectory()) {
          await walk(absolutePath);
          continue;
        }

        if (entry.isFile() && isAllowedScanFile(relativePath)) {
          try {
            const stats = await fs.stat(absolutePath);
            files.push({
              relativePath,
              size: stats.size
            });
          } catch {
            // Skip files that can't be read
          }
        }
      }
    } catch {
      // Skip directories that can't be read
    }
  }

  await walk(rootDir);
  return files;
}

function calculateMaxDepth(files: FileInfo[]): number {
  if (files.length === 0) return 0;
  return Math.max(...files.map(f => f.relativePath.split("/").length));
}

function detectLanguages(files: FileInfo[]): string[] {
  const extensionCount = new Map<string, number>();

  files.forEach(f => {
    const ext = path.extname(f.relativePath).toLowerCase();
    if (ext) {
      extensionCount.set(ext, (extensionCount.get(ext) || 0) + 1);
    }
  });

  const languageMap: Record<string, string> = {
    ".js": "JavaScript",
    ".jsx": "JavaScript",
    ".ts": "TypeScript",
    ".tsx": "TypeScript",
    ".py": "Python",
    ".java": "Java",
    ".go": "Go",
    ".rb": "Ruby",
    ".php": "PHP",
    ".cs": "C#",
    ".cpp": "C++",
    ".c": "C",
    ".rs": "Rust",
    ".swift": "Swift",
    ".kt": "Kotlin"
  };

  const detected = new Set<string>();
  extensionCount.forEach((count, ext) => {
    if (languageMap[ext] && count >= 2) {
      detected.add(languageMap[ext]);
    }
  });

  return Array.from(detected).sort();
}

function detectKeyFiles(files: FileInfo[]): string[] {
  const keyFileNames = [
    "package.json",
    "requirements.txt",
    "dockerfile",
    "docker-compose.yml",
    "docker-compose.yaml",
    "pom.xml",
    "build.gradle",
    "go.mod",
    "gemfile",
    "cargo.toml"
  ];

  return files
    .map(f => path.basename(f.relativePath))
    .filter(basename => keyFileNames.includes(basename.toLowerCase()));
}

function checkCriticalFiles(files: FileInfo[], languages: string[]): boolean {
  if (languages.length === 0) return true;

  const fileBasenames = new Set(
    files.map(f => path.basename(f.relativePath).toLowerCase())
  );

  for (const language of languages) {
    const criticalFiles = CRITICAL_FILES[language];
    if (!criticalFiles) continue;

    const hasAny = criticalFiles.some(pattern => {
      if (pattern.includes("*")) {
        const ext = pattern.replace("*", "");
        return Array.from(fileBasenames).some(f => f.endsWith(ext));
      }
      return fileBasenames.has(pattern.toLowerCase());
    });

    if (hasAny) return true;
  }

  return false;
}

function getCriticalFilesForLanguages(languages: string[]): string[] {
  const files = new Set<string>();
  languages.forEach(lang => {
    const criticalFiles = CRITICAL_FILES[lang];
    if (criticalFiles) {
      criticalFiles.forEach(f => files.add(f));
    }
  });
  return Array.from(files);
}

export async function validateRepository(rootDir: string): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  try {
    // 1. Verify directory exists
    const stats = await fs.stat(rootDir);
    if (!stats.isDirectory()) {
      errors.push({
        code: "INVALID_DIRECTORY",
        message: "Extracted path is not a directory",
        severity: "error"
      });
      return { valid: false, errors, warnings, validatedAt: new Date().toISOString() };
    }

    // 2. Walk directory and collect files
    const files = await walkDirectory(rootDir);

    if (files.length === 0) {
      errors.push({
        code: "EMPTY_REPOSITORY",
        message: "Repository contains no files",
        severity: "error"
      });
      return { valid: false, errors, warnings, validatedAt: new Date().toISOString() };
    }

    // 3. Check file count limit
    if (files.length > MAX_FILES) {
      errors.push({
        code: "TOO_MANY_FILES",
        message: `Repository contains ${files.length} files (limit: ${MAX_FILES})`,
        severity: "error",
        details: "Consider excluding unnecessary files or splitting the repository"
      });
    }

    // 4. Calculate max depth
    const maxDepth = calculateMaxDepth(files);
    if (maxDepth > MAX_DIRECTORY_DEPTH) {
      warnings.push({
        code: "DEEP_DIRECTORY_STRUCTURE",
        message: `Directory structure is ${maxDepth} levels deep (recommended: < ${MAX_DIRECTORY_DEPTH})`,
        severity: "warning",
        details: "Deep directory structures may indicate unnecessary nesting"
      });
    }

    // 5. Detect languages
    const detectedLanguages = detectLanguages(files);
    if (detectedLanguages.length === 0) {
      warnings.push({
        code: "NO_LANGUAGE_DETECTED",
        message: "Could not detect primary programming language",
        severity: "warning",
        details: "Repository may not contain source code files or uses uncommon languages"
      });
    }

    // 6. Detect key files
    const keyFiles = detectKeyFiles(files);
    const fileBasenames = files.map(f => path.basename(f.relativePath).toLowerCase());

    // 7. Check for critical configuration files
    const hasCriticalFiles = checkCriticalFiles(files, detectedLanguages);
    if (!hasCriticalFiles && detectedLanguages.length > 0) {
      const expectedFiles = getCriticalFilesForLanguages(detectedLanguages);
      warnings.push({
        code: "MISSING_CONFIG_FILES",
        message: "Missing critical configuration files for detected languages",
        severity: "warning",
        details: `Expected files like: ${expectedFiles.join(", ")}`
      });
    }

    // 8. Calculate total size
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);

    // 9. Build metadata
    const metadata: RepositoryMetadata = {
      totalFiles: files.length,
      totalSize,
      detectedLanguages,
      hasPackageJson: fileBasenames.includes("package.json"),
      hasRequirementsTxt: fileBasenames.includes("requirements.txt"),
      hasDockerfile: fileBasenames.some(f => f.startsWith("dockerfile")),
      hasTerraform: files.some(f => f.relativePath.endsWith(".tf")),
      hasKubernetes: files.some(f => 
        f.relativePath.includes("k8s") || 
        f.relativePath.includes("kubernetes") ||
        f.relativePath.endsWith(".yaml") && fileBasenames.some(b => 
          b.includes("deployment") || 
          b.includes("service") || 
          b.includes("ingress")
        )
      ),
      maxDirectoryDepth: maxDepth
    };

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      metadata,
      validatedAt: new Date().toISOString()
    };

  } catch (error) {
    errors.push({
      code: "VALIDATION_ERROR",
      message: error instanceof Error ? error.message : "Unknown validation error",
      severity: "error"
    });
    return { valid: false, errors, warnings, validatedAt: new Date().toISOString() };
  }
}

// Made with Bob
