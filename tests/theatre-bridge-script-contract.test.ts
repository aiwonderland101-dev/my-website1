import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("theatre bridge PlayCanvas script", () => {
  it("ships a classic PlayCanvas script bound to Theatre globals", () => {
    const script = readFileSync("apps/web/public/playcanvas/theatre-bridge.js", "utf8");

    expect(script).toContain("pc.createScript('theatreBridge')");
    expect(script).toContain("const { getProject, t } = window;");
    expect(script).toContain("project.sheet('MainSheet')");
    expect(script).toContain("this.theatreObj.onValuesChange");
  });
});
