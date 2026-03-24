import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import homepageSignMap from "./homepage/homepage-sign-map.json";
import { HOMEPAGE_SIGN_LINKS } from "./homepage/homepage-links";

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

describe("homepage sign links", () => {
  it("keeps the sign map and canonical links in sync", () => {
    const canonicalByHref = new Map(HOMEPAGE_SIGN_LINKS.map((link) => [link.href, link]));
    const mapByHref = new Map(homepageSignMap.map((entry) => [entry.href, entry]));

    // Guard: map should not repeat destinations.
    expect(mapByHref.size).toBe(homepageSignMap.length);

    // Guard: every sign in the artwork maps to a canonical destination.
    for (const entry of homepageSignMap) {
      expect(canonicalByHref.has(entry.href)).toBe(true);
    }

    // Guard: canonical destination set must be fully represented in the artwork map.
    for (const link of HOMEPAGE_SIGN_LINKS) {
      expect(mapByHref.has(link.href)).toBe(true);
    }

    for (const link of HOMEPAGE_SIGN_LINKS) {
      const mapEntry = mapByHref.get(link.href);
      expect(mapEntry).toBeDefined();
      expect(mapEntry?.description).toBe(link.description);
      expect(mapEntry?.label).toBe(link.label);
    }
  });

  it("point only to existing app routes", () => {
    const availableRoutes = new Set(collectPageRoutes(APP_ROOT));

    for (const link of HOMEPAGE_SIGN_LINKS) {
      expect(availableRoutes.has(link.href)).toBe(true);
    }
  });

  it("does not include duplicate destination routes", () => {
    const hrefs = HOMEPAGE_SIGN_LINKS.map((link) => link.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("imports homepage metadata from the new homepage module", () => {
    const homepageSource = fs.readFileSync(path.join(APP_ROOT, "homepage", "Homepage.tsx"), "utf8");

    expect(homepageSource).toContain('import signMap from "./homepage-sign-map.json";');
    expect(homepageSource).toContain('import { HOMEPAGE_SIGN_LINKS } from "./homepage-links";');

    const entrypointSource = fs.readFileSync(path.join(APP_ROOT, "page.tsx"), "utf8");
    expect(entrypointSource).toContain('import Homepage from "./homepage/Homepage";');
  });
});
