import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";

describe("wonder build puck layout wrapper", () => {
  test("editor uses Puck.Layout wrapper for client hydration", () => {
    const client = readFileSync("apps/web/app/(builder)/wonder-build/puck/PuckEditorClient.tsx", "utf8");

    expect(client).toContain("function LayoutWrapper");
    expect(client).toContain("<Puck.Layout />");
    expect(client).toContain("import { Puck } from \"@puckeditor/core\"");
  });

  test("core runtime exposes Puck.Layout API", () => {
    const runtime = readFileSync("packages/puckeditor-core/index.js", "utf8");
    const types = readFileSync("packages/puckeditor-core/index.d.ts", "utf8");

    expect(runtime).toContain("const PuckContext");
    expect(runtime).toContain("Puck.Layout = PuckLayout");
    expect(types).toContain("Layout: React.FC");
  });

  test("root layout stays free of placeholder homepage marker logic", () => {
    const rootLayout = readFileSync("apps/web/app/layout.tsx", "utf8");

    expect(rootLayout).not.toContain("const isHomepage = pathname === \"/\"");
    expect(rootLayout).toContain("<BuilderAccessDock />");
    expect(rootLayout).toContain("{children}");
  });
});
