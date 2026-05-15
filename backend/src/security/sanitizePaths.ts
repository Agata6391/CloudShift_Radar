import path from "node:path";

const IGNORED_DIRECTORIES = new Set([
  "node_modules",
  "vendor",
  "dist",
  "build",
  ".git",
  ".next",
  ".cache",
  "coverage",
  "venv",
  "__pycache__"
]);

const ALLOWED_EXACT_FILES = new Set([
  ".env",
  ".env.example",
  "Dockerfile",
  "docker-compose.yml",
  "package.json",
  "requirements.txt",
  "pom.xml",
  "build.gradle",
  "application.yml",
  "application-prod.yml",
  "README.md"
]);

const ALLOWED_EXTENSIONS = new Set([
  ".js",
  ".ts",
  ".tsx",
  ".jsx",
  ".py",
  ".java",
  ".json",
  ".yml",
  ".yaml",
  ".tf",
  ".md"
]);

const IGNORED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".ico",
  ".mp4",
  ".mov",
  ".avi",
  ".zip",
  ".tar",
  ".gz",
  ".7z",
  ".rar",
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  ".bin",
  ".pdf",
  ".woff",
  ".woff2",
  ".ttf",
  ".map"
]);

export function normalizeZipPath(entryName: string): string | null {
  const cleaned = entryName.replace(/\\/g, "/");
  const normalized = path.posix.normalize(cleaned);

  if (
    normalized.startsWith("../") ||
    normalized.includes("/../") ||
    /^[a-zA-Z]:/.test(normalized) ||
    path.posix.isAbsolute(normalized) ||
    normalized === "." ||
    normalized.length === 0
  ) {
    return null;
  }

  return normalized;
}

export function shouldIgnorePath(relativePath: string): boolean {
  const parts = relativePath.split(/[\\/]+/);
  return parts.some((part) => IGNORED_DIRECTORIES.has(part));
}

export function isAllowedScanFile(relativePath: string): boolean {
  if (shouldIgnorePath(relativePath)) {
    return false;
  }

  const basename = path.basename(relativePath);
  const extension = path.extname(relativePath).toLowerCase();

  if (IGNORED_EXTENSIONS.has(extension.toLowerCase())) {
    return false;
  }

  return ALLOWED_EXACT_FILES.has(basename) || ALLOWED_EXTENSIONS.has(extension);
}

export function safeJoin(baseDir: string, relativePath: string): string {
  const targetPath = path.resolve(baseDir, relativePath);
  const basePath = path.resolve(baseDir);

  if (targetPath !== basePath && !targetPath.startsWith(`${basePath}${path.sep}`)) {
    throw new Error("ZIP entry attempted to write outside the extraction directory.");
  }

  return targetPath;
}
