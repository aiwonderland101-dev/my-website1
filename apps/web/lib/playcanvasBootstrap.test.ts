/* @vitest-environment jsdom */
import { describe, expect, it, vi } from "vitest";

import {
  ensurePlayCanvasBootstrapLoaded,
  getPlayCanvasBootstrapSrc,
  resetPlayCanvasBootstrapLoader,
  shouldUseDirectPlayCanvasMode,
} from "@/lib/playcanvasBootstrap";

describe("playcanvas bootstrap loader", () => {
  it("uses fallback src when env var is empty", () => {
    expect(getPlayCanvasBootstrapSrc()).toBe("/playcanvas/direct-bootstrap.js");
  });

  it("recognizes direct mode", () => {
    vi.stubEnv("NEXT_PUBLIC_PLAYCANVAS_MODE", "direct");
    expect(shouldUseDirectPlayCanvasMode()).toBe(true);
  });

  it("injects bootstrap script and resolves on load", async () => {
    resetPlayCanvasBootstrapLoader();
    delete window.PlayCanvasEditorBootstrap;

    const promise = ensurePlayCanvasBootstrapLoaded();
    const script = document.getElementById("playcanvas-direct-bootstrap") as HTMLScriptElement | null;
    expect(script).toBeTruthy();

    window.PlayCanvasEditorBootstrap = { mount: () => ({ destroy: () => undefined }) };
    script?.dispatchEvent(new Event("load"));

    await expect(promise).resolves.toBeUndefined();
  });
});
