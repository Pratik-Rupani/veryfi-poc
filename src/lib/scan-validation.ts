export type ScanInput = {
  fileName?: string;
  contentType?: string;
  base64?: string;
};

export function validateScanInput(input: ScanInput): string | null {
  if (!input.base64 || input.base64.length < 32) return "No image was received.";
  if (input.base64.length > 12_000_000) return "That image is too large. Try a smaller photo.";
  return null;
}
