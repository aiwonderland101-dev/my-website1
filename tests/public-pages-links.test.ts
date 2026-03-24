import { describe, expect, test } from "vitest";
import { existsSync, readFileSync } from "node:fs";

describe("public pages hub route wiring", () => {
  test("keeps every linked route mapped to an app route", () => {
    const pagesHub = readFileSync("apps/web/app/public-pages/page.tsx", "utf8");

    expect(pagesHub).toContain('href="/dashboard/projects"');
    expect(pagesHub).toContain('href="/public-pages/auth"');

    const expectedRouteFiles = [
      "apps/web/app/page.tsx",
      "apps/web/app/(workspace)/dashboard/page.tsx",
      "apps/web/app/(workspace)/dashboard/projects/page.tsx",
      "apps/web/app/public-pages/auth/page.tsx",
      "apps/web/app/(builder)/wonder-build/page.tsx",
      "apps/web/app/wonderspace/page.tsx",
      "apps/web/app/(tools)/playground/page.tsx",
      "apps/web/app/marketplace/page.tsx",
      "apps/web/app/docs/page.tsx",
    ];

    for (const routeFile of expectedRouteFiles) {
      expect(existsSync(routeFile), `${routeFile} should exist`).toBe(true);
    }
  });
});
