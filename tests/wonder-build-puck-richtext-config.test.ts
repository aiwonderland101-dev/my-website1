import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";

describe("wonder build puck richtext config", () => {
  test("config enables richtext contentEditable and editor options", () => {
    const source = readFileSync("apps/web/app/(builder)/wonder-build/puck/puck.config.tsx", "utf8");

    expect(source).toContain('type: "richtext"');
    expect(source).toContain("contentEditable: true");
    expect(source).toContain("bold: false");
    expect(source).toContain("heading: { levels: [1, 2] }");
  });

  test("config uses RichTextMenu and tiptap superscript selector", () => {
    const source = readFileSync("apps/web/app/(builder)/wonder-build/puck/puck.config.tsx", "utf8");

    expect(source).toContain("RichTextMenu.Group");
    expect(source).toContain("RichTextMenu.Bold");
    expect(source).toContain("extensions: [Superscript]");
    expect(source).toContain('editor?.isActive("superscript")');
    expect(source).toContain("toggleSuperscript");
  });

  test("core package exports RichTextMenu helper", () => {
    const runtime = readFileSync("packages/puckeditor-core/index.js", "utf8");
    const types = readFileSync("packages/puckeditor-core/index.d.ts", "utf8");

    expect(runtime).toContain("function RichTextMenu");
    expect(runtime).toContain("RichTextMenu.Group");
    expect(types).toContain("export const RichTextMenu");
    expect(types).toContain("export type RichTextField");
  });
});
