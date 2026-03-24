import { describe, expect, test } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import signMap from "../apps/web/app/homepage-sign-map.json";

function collectRoutes(dir: string, root: string): string[] {
  const out: string[] = [];
  for (const item of readdirSync(dir)) {
    const full = path.join(dir, item);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...collectRoutes(full, root));
      continue;
    }

    if (item === "page.tsx") {
      const relDir = path.relative(root, path.dirname(full));
      const segments = relDir
        .split(path.sep)
        .filter(Boolean)
        .filter((segment) => !segment.startsWith("("));
      out.push(`/${segments.join("/")}`.replace(/\/$/, "") || "/");
    }
  }
  return out;
}

describe("homepage sign map json", () => {
  test("uses canonical sign labels", () => {
    const labels = signMap.map((entry) => entry.label);
    expect(labels).toEqual([
      "features",
      "docs",
      "tutorials",
      "community",
      "support",
      "status",
      "wonder build",
      "unreal build",
      "wonderspace",
    ]);
  });

  test("all sign routes exist and metadata is absolute-position ready", () => {
    const appRoot = path.resolve(process.cwd(), "apps/web/app");
    const routes = new Set(collectRoutes(appRoot, appRoot));

    for (const entry of signMap) {
      expect(routes.has(entry.href)).toBe(true);
      expect(entry.chipPosition.top.endsWith("%")).toBe(true);
      expect(entry.chipPosition.left.endsWith("%")).toBe(true);
      expect(entry.chipPosition.width.endsWith("%")).toBe(true);
      expect(entry.chipPosition.height.endsWith("%")).toBe(true);
      expect(entry.polygonPoints.includes(",")).toBe(true);
    }
  });

  test("page uses json sign map and updated wonderland hero image", () => {
    expect(existsSync("apps/web/app/homepage-sign-map.json")).toBe(true);

    const source = require("node:fs").readFileSync("apps/web/app/page.tsx", "utf8");
    expect(source).toContain("homepage-sign-map.json");
    expect(source).toContain("wonderland-theme.webp");
    expect(source).toContain("HOMEPAGE_SIGN_LINKS");
  });
});
