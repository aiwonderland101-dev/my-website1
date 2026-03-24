import { describe, expect, test } from "vitest";
import { existsSync, readFileSync } from "node:fs";

describe("marketing builder entrypoints", () => {
  test("brand link targets validated builder route with accessible label and focus ring", () => {
    expect(existsSync("apps/web/app/(builder)/wonder-build/puck/page.tsx")).toBe(true);

    const rootLayout = readFileSync("apps/web/app/layout.tsx", "utf8");
    expect(rootLayout).toContain('href="/wonder-build/puck"');
    expect(rootLayout).toContain('aria-label="Open AI Builder"');
    expect(rootLayout).toContain("focus-visible:ring-2");
    expect(rootLayout).toContain("min-h-10");
  });

  test("homepage primary CTA aligns to builder flow", () => {
    const homepage = readFileSync("apps/web/app/homepage/Homepage.tsx", "utf8");
    expect(homepage).toContain('href="/wonder-build/puck"');
    expect(homepage).toContain("Open AI Builder");
  });
});
