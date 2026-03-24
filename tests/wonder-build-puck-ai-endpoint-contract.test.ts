import { describe, expect, test } from "vitest";
import { readFileSync, existsSync } from "node:fs";

describe("wonder build puck ai endpoint contract", () => {
  test("ships app router puck API route", () => {
    expect(existsSync("apps/web/app/api/puck/route.ts")).toBe(true);
  });

  test("configures puck cloud handler with AI context", () => {
    const route = readFileSync("apps/web/app/api/puck/route.ts", "utf8");

    expect(route).toContain('await import("@puckeditor/cloud-client")');
    expect(route).toContain("puckHandler(request");
    expect(route).toContain("ai:");
    expect(route).toContain("context");
    expect(route).toContain("Google landing pages");
  });

  test("editor config includes iframe and permissions hardening", () => {
    const editor = readFileSync("apps/web/app/(builder)/wonder-build/puck/PuckEditorClient.tsx", "utf8");

    expect(editor).toContain("iframe={");
    expect(editor).toContain("enabled: false");
    expect(editor).toContain("permissions={");
    expect(editor).toContain("delete: false");
  });

  test("editor mirrors API trust states in UI", () => {
    const editor = readFileSync("apps/web/app/(builder)/wonder-build/puck/PuckEditorClient.tsx", "utf8");

    expect(editor).toContain('status === "loading"');
    expect(editor).toContain('status === "empty"');
    expect(editor).toContain('status === "error"');
  });
});
