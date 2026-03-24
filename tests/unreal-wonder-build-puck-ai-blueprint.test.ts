import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";

describe("unreal-wonder-build puck ai blueprint", () => {
  test("tracks requested puck dependencies in package metadata", () => {
    const pkg = JSON.parse(readFileSync("packages/unreal-wonder-build/package.json", "utf8"));

    expect(pkg.puckIntegration.requiredPackages).toContain("@puckeditor/plugin-ai");
    expect(pkg.puckIntegration.requiredPackages).toContain("@puckeditor/cloud-client");
    expect(pkg.puckIntegration.requiredPackages).toContain("zod");
  });

  test("includes all requested integration snippets", () => {
    const source = readFileSync("packages/unreal-wonder-build/src/puckAiBlueprint.ts", "utf8");

    expect(source).toContain('import z from "zod/v4"');
    expect(source).toContain("z.toJSONSchema");
    expect(source).toContain('import { puckHandler, tool } from "@puckeditor/cloud-client"');
    expect(source).toContain('bind: "getImageUrl"');
    expect(source).toContain('z.enum(["dogs", "cats"])');
    expect(source).toContain('fetch("https://example.com/api/random-image")');
  });

  test("verify_logic smoke script passes without network", () => {
    const out = execSync("node packages/unreal-wonder-build/scripts/verify_logic.js", { encoding: "utf8" });
    expect(out).toContain("verify_logic.js passed");
  });
});
