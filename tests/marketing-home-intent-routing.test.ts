import { describe, expect, test } from "vitest";
import { readFileSync, existsSync } from "node:fs";

describe("marketing homepage signpost routing", () => {
  test("keeps homepage wired to live signpost links module", () => {
    expect(existsSync("apps/web/app/homepage-links.ts")).toBe(true);

    const marketingHome = readFileSync("apps/web/app/page.tsx", "utf8");
    expect(marketingHome).toContain("HOMEPAGE_SIGN_LINKS");
    expect(marketingHome).toContain("Choose your Wonderland path");
    expect(marketingHome).toContain("Start exploring");
    expect(marketingHome).toContain("wonderland-theme.webp");
  });

  test("includes auth-aware and public destination routes", () => {
    const linksSource = readFileSync("apps/web/app/homepage-links.ts", "utf8");

    expect(linksSource).toContain("href: '/features'");
    expect(linksSource).toContain("href: '/docs'");
    expect(linksSource).toContain("href: '/tutorials'");
    expect(linksSource).toContain("href: '/community'");
    expect(linksSource).toContain("href: '/support'");
    expect(linksSource).toContain("href: '/status'");
    expect(linksSource).toContain("href: '/wonder-build'");
    expect(linksSource).toContain("href: '/unreal-wonder-build'");

    const marketingHome = readFileSync("apps/web/app/page.tsx", "utf8");
    expect(marketingHome).toContain('href="/features"');
  });
});
