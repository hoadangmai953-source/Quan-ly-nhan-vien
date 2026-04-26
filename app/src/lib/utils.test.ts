import { describe, it, expect } from "vitest";
import { cn, initials } from "./utils";

describe("cn", () => {
  it("merges class strings and dedupes tailwind conflicts", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", undefined, "text-lg")).toBe("text-lg");
  });

  it("handles falsy values", () => {
    const flag = false as boolean;
    expect(cn("a", flag && "b", null, "c")).toBe("a c");
  });
});

describe("initials", () => {
  it("returns ? for null/undefined/empty", () => {
    expect(initials(null)).toBe("?");
    expect(initials(undefined)).toBe("?");
  });

  it("uses last two words for full name", () => {
    expect(initials("Nguyễn Văn A")).toBe("VA");
    expect(initials("Trần Thị Bích Ngọc")).toBe("BN");
  });

  it("works with single word", () => {
    expect(initials("Devin")).toBe("D");
  });
});
