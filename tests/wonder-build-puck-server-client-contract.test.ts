import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";

describe("wonder build puck server/client contract", () => {
  test("marks interactive puck and block components as client components", () => {
    const editorClient = readFileSync("apps/web/app/(builder)/wonder-build/puck/PuckEditorClient.tsx", "utf8");
    const headingBlock = readFileSync("apps/web/app/(builder)/wonder-build/puck/components/HeadingBlock.tsx", "utf8");

    expect(editorClient.startsWith('"use client";')).toBe(true);
    expect(headingBlock.startsWith('"use client";')).toBe(true);
  });

  test("keeps page as server component and uses header contract", () => {
    const page = readFileSync("apps/web/app/(builder)/wonder-build/puck/page.tsx", "utf8");

    expect(page).toContain("export default async function WonderBuildPuckPage()");
    expect(page).toContain("Breadcrumbs");
    expect(page).toContain("title=\"Puck Layout Studio\"");
    expect(page).toContain("subtitle=");
    expect(page).toContain("action=");
  });

  test("uses only verified Wonder Build routes in page actions", () => {
    const page = readFileSync("apps/web/app/(builder)/wonder-build/puck/page.tsx", "utf8");

    expect(page).toContain('href="/wonder-build"');
    expect(page).not.toContain("/wonder-build/playcanvas");
  });

  test("wires typed puck config with HeadingBlock component", () => {
    const config = readFileSync("apps/web/app/(builder)/wonder-build/puck/puck.config.tsx", "utf8");

    expect(config).toContain('import type { Config } from "@puckeditor/core"');
    expect(config).toContain("export const config: Config<Props>");
    expect(config).toContain("render: ({ title }) => <HeadingBlock title={title} />");
  });
});
