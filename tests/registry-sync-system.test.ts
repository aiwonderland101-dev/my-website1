import { describe, expect, test } from "vitest";
import { existsSync, readFileSync } from "node:fs";

function read(file: string) {
  return readFileSync(file, "utf8");
}

describe("wonderspace unified registry system", () => {
  test("defines root registry source-of-truth and theia sync tasks", () => {
    expect(existsSync("registry.json")).toBe(true);
    expect(existsSync(".theia/tasks.json")).toBe(true);

    const registry = read("registry.json");
    const tasks = read(".theia/tasks.json");

    expect(registry).toContain('"schemaVersion": 1');
    expect(registry).toContain('"id": "unreal-wonder-build"');
    expect(tasks).toContain("WonderSpace: Sync Assets (dry-run)");
    expect(tasks).toContain("scripts/registry/sync-assets.mjs --dry-run");
  });

  test("wires runner, api route, and script with deterministic destination mapping", () => {
    const worker = read("runners/registry.worker.ts");
    const script = read("scripts/registry/sync-assets.mjs");
    const route = read("apps/web/app/api/wonderspace/registry/sync/route.ts");

    expect(worker).toContain("export function planRegistryAssets");
    expect(worker).toContain('"map-fab-vault"');
    expect(script).toContain("normalizeTarget");
    expect(script).toContain("registry.lock.json");
    expect(route).toContain('state: "empty"');
    expect(route).toContain("aiChecklistFallback");
  });
});
