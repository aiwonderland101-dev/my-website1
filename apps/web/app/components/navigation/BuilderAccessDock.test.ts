import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { BUILDER_DOCK_FOOTER_LINKS, BUILDER_LINKS } from "./BuilderAccessDock.links";

const APP_ROOT = path.resolve(process.cwd(), "apps/web/app");

function collectPageRoutes(dir: string): string[] {
  const routes: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      routes.push(...collectPageRoutes(entryPath));
      continue;
    }

    if (entry.isFile() && entry.name === "page.tsx") {
      const relativeDir = path.relative(APP_ROOT, path.dirname(entryPath));
      const segments = relativeDir
        .split(path.sep)
        .filter(Boolean)
        .filter((segment) => !segment.startsWith("("));
      const route = `/${segments.join("/")}`.replace(/\/$/, "") || "/";
      routes.push(route);
    }
  }

  return routes;
}

describe("BuilderAccessDock route contract", () => {
  it("points only to existing app routes", () => {
    const availableRoutes = new Set(collectPageRoutes(APP_ROOT));
    const dockHrefs = [
      ...BUILDER_LINKS.map((link) => link.href),
      BUILDER_DOCK_FOOTER_LINKS.leavePageFallbackHref,
      BUILDER_DOCK_FOOTER_LINKS.dashboardHref,
    ];

    for (const href of dockHrefs) {
      expect(availableRoutes.has(href)).toBe(true);
    }
  });

  it("does not include duplicate destination routes", () => {
    const hrefs = BUILDER_LINKS.map((link) => link.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("uses labels aligned with destination capability", () => {
    expect(BUILDER_LINKS).toEqual([
      { href: "/wonder-build/puck", label: "Wonder Build Editor (Puck)" },
      { href: "/wonder-build", label: "Wonder Build Workspace" },
      { href: "/wonder-build-mobile", label: "Unreal Wonder Build" },
    ]);
  });
});
