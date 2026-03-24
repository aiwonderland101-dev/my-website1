import { describe, expect, test } from "vitest";
import { existsSync, readFileSync } from "node:fs";

describe("playcanvas bridge routing", () => {
  test("ships a dashboard editor bridge page", () => {
    expect(existsSync("apps/web/app/(workspace)/dashboard/editor-playcanvas/page.tsx")).toBe(true);
  });

  test("dashboard and wonderplay surfaces expose bridge links", () => {
    const dashboardLayout = readFileSync("apps/web/app/(workspace)/dashboard/layout.tsx", "utf8");
    const wonderPlayPage = readFileSync("apps/web/app/(builder)/wonder-build/playcanvas/page.tsx", "utf8");

    expect(dashboardLayout).toContain("/dashboard/editor-playcanvas");
    expect(wonderPlayPage).toContain('href="/dashboard/editor-playcanvas"');
  });
});
