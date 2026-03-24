import { describe, expect, test } from "vitest";
import { existsSync, readFileSync } from "node:fs";

describe("unreal wonder build playcanvas bridge", () => {
  test("ships a PlayCanvas bridge component in unreal-wonder-build", () => {
    const filePath = "packages/unreal-wonder-build/components/PlayCanvasEngine.tsx";

    expect(existsSync(filePath)).toBe(true);

    const source = readFileSync(filePath, "utf8");

    expect(source).toContain("import * as pc from 'playcanvas';");
    expect(source).toContain("new pc.Application(canvasRef.current!");
    expect(source).toContain("app.destroy()");
    expect(source).toContain("<canvas ref={canvasRef}");
  });
});
