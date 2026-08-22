import { describe, expect, it } from "vitest";
import { validateScanInput } from "@/lib/scan-validation";

describe("validateScanInput", () => {
  it("rejects a missing image", () => {
    expect(validateScanInput({})).toBe("No image was received.");
  });

  it("rejects an image payload below the minimum size", () => {
    expect(validateScanInput({ base64: "a".repeat(31) })).toBe("No image was received.");
  });

  it("accepts a payload at the supported boundaries", () => {
    expect(validateScanInput({ base64: "a".repeat(32) })).toBeNull();
    expect(validateScanInput({ base64: "a".repeat(12_000_000) })).toBeNull();
  });

  it("rejects an oversized image payload", () => {
    expect(validateScanInput({ base64: "a".repeat(12_000_001) })).toBe(
      "That image is too large. Try a smaller photo.",
    );
  });
});
