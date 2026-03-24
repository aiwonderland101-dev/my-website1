import { readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

describe("homepage visual effects accessibility contract", () => {
  const cssSource = readFileSync("apps/web/app/homepage/Homepage.module.css", "utf8");

  test("includes reduced-motion guard for homepage animation", () => {
    expect(cssSource).toContain("@media (prefers-reduced-motion: reduce)");
    expect(cssSource).toMatch(/\.loadingPulse\s*\{[^}]*animation:\s*none;/s);
  });

  test("uses gradient overlay and scoped blur pseudo-element", () => {
    expect(cssSource).toMatch(/\.heroFrame::before\s*\{[^}]*filter:\s*blur\(/s);
    expect(cssSource).toMatch(/\.heroFrame::after\s*\{[^}]*linear-gradient\(/s);
  });

  test("adds text contrast guard for hero labels", () => {
    expect(cssSource).toMatch(/\.heroLabel\s*\{[^}]*text-shadow:/s);
  });
});
