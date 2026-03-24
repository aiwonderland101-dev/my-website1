import { describe, expect, test } from "vitest";
import { existsSync, readFileSync } from "node:fs";

describe("dashboard agents options catalog", () => {
  test("ships options API route and agents dashboard page", () => {
    expect(existsSync("apps/web/app/api/platform/options/route.ts")).toBe(true);
    expect(existsSync("apps/web/app/(workspace)/dashboard/agents/page.tsx")).toBe(true);
  });

  test("agents page uses trust-layer states and options sections", () => {
    const page = readFileSync("apps/web/app/(workspace)/dashboard/agents/page.tsx", "utf8");
    expect(page).toContain("/api/platform/options");
    expect(page).toContain("SkeletonGrid");
    expect(page).toContain("EmptyState");
    expect(page).toContain("ToastStack");
    expect(page).toContain("AI, Agents, Runners & Workers");
  });

  test("options route points to existing product routes", () => {
    const source = readFileSync("apps/web/app/api/platform/options/route.ts", "utf8");
    const hrefs = Array.from(source.matchAll(/"(\/[^\"]+)"/g)).map((m) => m[1]);

    const expectedRoutes = [
      "/ai-modules",
      "/playground",
      "/dashboard/agents",
      "/dashboard/editor-playcanvas",
      "/dashboard/projects",
      "/dashboard/collaboration",
      "/dashboard/overview",
      "/settings/security",
    ];

    for (const route of expectedRoutes) {
      expect(hrefs).toContain(route);
    }

    expect(existsSync("apps/web/app/ai-modules/page.tsx")).toBe(true);
    expect(existsSync("apps/web/app/(tools)/playground/page.tsx")).toBe(true);
    expect(existsSync("apps/web/app/(workspace)/dashboard/projects/page.tsx")).toBe(true);
    expect(existsSync("apps/web/app/(workspace)/dashboard/collaboration/page.tsx")).toBe(true);
    expect(existsSync("apps/web/app/(workspace)/dashboard/overview/page.tsx")).toBe(true);
    expect(existsSync("apps/web/app/settings/security/page.tsx")).toBe(true);
  });
});
