import { describe, it, expect } from "vitest";
import { formatBytes, isOverdue } from "./format";

describe("formatBytes", () => {
  it("returns em-dash for null/undefined", () => {
    expect(formatBytes(null)).toBe("—");
    expect(formatBytes(undefined)).toBe("—");
  });

  it("formats bytes under 1KB as B", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
  });

  it("formats KB / MB / GB with one decimal", () => {
    expect(formatBytes(2048)).toBe("2.0 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
    expect(formatBytes(3 * 1024 * 1024 * 1024)).toBe("3.0 GB");
  });
});

describe("isOverdue", () => {
  const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  it("returns false when deadline missing", () => {
    expect(isOverdue(null, "pending")).toBe(false);
  });

  it("returns false for approved/rejected even if past deadline", () => {
    expect(isOverdue(past, "approved")).toBe(false);
    expect(isOverdue(past, "rejected")).toBe(false);
  });

  it("returns true when past deadline and status active", () => {
    expect(isOverdue(past, "pending")).toBe(true);
    expect(isOverdue(past, "in_progress")).toBe(true);
    expect(isOverdue(past, "submitted")).toBe(true);
  });

  it("returns false when deadline in future", () => {
    expect(isOverdue(future, "pending")).toBe(false);
  });
});
