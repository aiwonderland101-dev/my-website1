import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";

describe("playcanvas + wonderplay + unreal linkage", () => {
  test("uses shared playcanvas.com URL helper", () => {
    const helper = readFileSync("apps/web/lib/playcanvas.ts", "utf8");
    const wonderPlay = readFileSync("apps/web/app/(builder)/wonder-build/playcanvas/page.tsx", "utf8");
    const dashboardBridge = readFileSync("apps/web/app/(workspace)/dashboard/editor-playcanvas/page.tsx", "utf8");
    const iframeBridge = readFileSync("apps/web/components/PlayCanvasBridge.tsx", "utf8");

    expect(helper).toContain("https://playcanvas.com/editor");
    expect(wonderPlay).toContain("buildPlayCanvasEditorUrl(sceneId)");
    expect(dashboardBridge).toContain("buildPlayCanvasEditorUrl(sceneId)");
    expect(iframeBridge).toContain("buildPlayCanvasEditorUrl(sceneId)");
    expect(iframeBridge).toContain("isTrustedPlayCanvasOrigin");
  });

  test("cross-links wonderplay, dashboard bridge, and unreal route", () => {
    const wonderPlay = readFileSync("apps/web/app/(builder)/wonder-build/playcanvas/page.tsx", "utf8");
    const dashboardBridge = readFileSync("apps/web/app/(workspace)/dashboard/editor-playcanvas/page.tsx", "utf8");
    const unrealRoute = readFileSync("apps/web/app/(builder)/unreal-wonder-build/page.tsx", "utf8");
    const unrealPkg = readFileSync("packages/unreal-wonder-build/src/UnrealWonderBuildPage.tsx", "utf8");

    expect(wonderPlay).toContain('href="/dashboard/editor-playcanvas"');
    expect(wonderPlay).toContain('href="/unreal-wonder-build"');
    expect(dashboardBridge).toContain('href="/wonder-build/playcanvas"');
    expect(dashboardBridge).toContain('href="/unreal-wonder-build"');
    expect(unrealRoute).toContain('href="/wonder-build/playcanvas"');
    expect(unrealPkg).toContain('href="https://playcanvas.com/editor"');
  });

  test("dashboard bridge follows header contract", () => {
    const dashboardBridge = readFileSync("apps/web/app/(workspace)/dashboard/editor-playcanvas/page.tsx", "utf8");

    expect(dashboardBridge).toContain("PageHeader");
    expect(dashboardBridge).toContain("Breadcrumbs");
    expect(dashboardBridge).toContain('title="PlayCanvas Editor Bridge"');
    expect(dashboardBridge).toContain("subtitle=");
    expect(dashboardBridge).toContain("action=");
  });
});
