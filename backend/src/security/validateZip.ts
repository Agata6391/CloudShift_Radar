export const MAX_ZIP_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_EXTRACTED_FILE_BYTES = 1 * 1024 * 1024;
export const MAX_TOTAL_EXTRACTED_BYTES = 15 * 1024 * 1024;

export function validateZip(buffer: Buffer, filename: string): void {
  if (!filename.toLowerCase().endsWith(".zip")) {
    throw new Error("Repository upload must be a .zip file.");
  }

  if (buffer.length === 0) {
    throw new Error("Uploaded ZIP is empty.");
  }

  if (buffer.length > MAX_ZIP_SIZE_BYTES) {
    throw new Error("Uploaded ZIP exceeds the 25 MB MVP limit.");
  }

  const hasLocalFileHeader = buffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
  const hasEmptyZipHeader = buffer.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (!hasLocalFileHeader && !hasEmptyZipHeader) {
    throw new Error("Uploaded file does not appear to be a valid ZIP archive.");
  }
}
