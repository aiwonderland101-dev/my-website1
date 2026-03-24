import { describe, expect, test } from "vitest";
import { existsSync, readFileSync } from "node:fs";

describe("global builder access dock", () => {
  test("only links to existing builder routes", () => {
    expect(existsSync("apps/web/app/(builder)/wonder-build/page.tsx")).toBe(true);
    expect(existsSync("apps/web/app/(builder)/wonder-build-mobile/page.tsx")).toBe(true);
  });

  test("dock and root layout expose universal entry/exit controls", () => {
    const dock = readFileSync("apps/web/app/components/navigation/BuilderAccessDock.tsx", "utf8");
    const rootLayout = readFileSync("apps/web/app/layout.tsx", "utf8");

    expect(dock).toContain('href: "/wonder-build"');
    expect(dock).toContain('href: "/wonder-build-mobile"');
    expect(dock).toContain('label="Leave page"');
    expect(dock).toContain('href="/dashboard"');
    expect(rootLayout).toContain("<BuilderAccessDock />");
  });
});
