import { describe, expect, it } from "vitest";
import { getPlayCanvasMode, supportsPlayCanvasEditorUrl } from "@/lib/playcanvas";

describe("playcanvas mode helpers", () => {
  it("defaults to iframe for unknown mode values", () => {
    expect(getPlayCanvasMode(undefined)).toBe("iframe");
    expect(getPlayCanvasMode("unknown")).toBe("iframe");
  });

  it("supports direct mode", () => {
    expect(getPlayCanvasMode("direct")).toBe("direct");
    expect(supportsPlayCanvasEditorUrl("direct")).toBe(false);
    expect(supportsPlayCanvasEditorUrl("iframe")).toBe(true);
  });
});
