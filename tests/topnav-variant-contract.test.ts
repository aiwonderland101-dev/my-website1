import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";

function read(path: string) {
  return readFileSync(path, "utf8");
}

describe("top nav variant wiring", () => {
  test("TopNav supports transparent variant with conditional styling", () => {
    const topNav = read("apps/web/app/components/navigation/TopNav.tsx");

    expect(topNav).toContain('variant?: "default" | "transparent"');
    expect(topNav).toContain('const isTransparent = variant === "transparent";');
    expect(topNav).toContain('const headerClasses = isTransparent');
    expect(topNav).toContain('focus-visible:ring-2');
  });

});
