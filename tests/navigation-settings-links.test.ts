import { describe, expect, test } from "vitest";
import { existsSync, readFileSync } from "node:fs";

function read(path: string) {
  return readFileSync(path, "utf8");
}

describe("route-group href hygiene", () => {
  test("dashboard navigation links do not use Next.js route-group segments", () => {
    const dashboardLayout = read("apps/web/app/(workspace)/dashboard/layout.tsx");
    const dashboardRepoView = read("apps/web/app/(workspace)/dashboard/components/DashboardRepoView.tsx");

    expect(dashboardLayout).not.toContain("/(builder)");
    expect(dashboardLayout).toContain('href: "/wonder-build"');
    expect(dashboardLayout).toContain('href: "/unreal-wonder-build"');

    expect(dashboardRepoView).not.toContain('href="/(builder)/wonder-build"');
    expect(dashboardRepoView).toContain('href="/wonder-build"');
  });
});

describe("settings nav accessibility and active-state behavior", () => {
  test("settings layout uses Link + usePathname with labeled navigation", () => {
    const settingsLayout = read("apps/web/app/settings/layout.tsx");

    expect(settingsLayout).toContain('import Link from "next/link"');
    expect(settingsLayout).toContain('import { usePathname } from "next/navigation"');
    expect(settingsLayout).toContain('aria-label="Settings navigation"');
    expect(settingsLayout).toContain('aria-current={isActive ? "page" : undefined}');
    expect(settingsLayout).not.toContain('href="/settings/copilot"');
  });

  test("dashboard settings tabs compute active state from pathname", () => {
    const dashboardSettingsLayout = read("apps/web/app/(workspace)/dashboard/settings/layout.tsx");

    expect(dashboardSettingsLayout).toContain('import { usePathname } from "next/navigation"');
    expect(dashboardSettingsLayout).toContain("const isActive = pathname === t.href;");
    expect(dashboardSettingsLayout).toContain('aria-current={isActive ? "page" : undefined}');
    expect(dashboardSettingsLayout).toContain('href: "/dashboard/settings/byoc"');
    expect(existsSync("apps/web/app/(workspace)/dashboard/settings/byoc/page.tsx")).toBe(true);
  });
});
