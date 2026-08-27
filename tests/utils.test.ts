import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (className merge utility)", () => {
  it("merges multiple class names into one string", () => {
    expect(cn("px-4", "py-2", "rounded")).toBe("px-4 py-2 rounded");
  });

  it("deduplicates conflicting Tailwind utilities (last wins)", () => {
    // tailwind-merge should keep the last conflicting utility
    expect(cn("px-4", "px-8")).toBe("px-8");
    expect(cn("text-red-500", "text-blue-300")).toBe("text-blue-300");
  });

  it("handles conditional class names via clsx", () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe("base active");
  });

  it("returns an empty string when called with no arguments", () => {
    expect(cn()).toBe("");
  });

  it("ignores falsy values (undefined, null, false, 0)", () => {
    expect(cn("hello", undefined, null, false, 0, "world")).toBe("hello world");
  });

    it("accepts an array of class names", () => {
    expect(cn(["flex", "items-center", "gap-2"])).toBe("flex items-center gap-2");
  });
});
