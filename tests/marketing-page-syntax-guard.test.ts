import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import ts from "typescript";

describe("marketing page syntax guard", () => {
  test("page.tsx transpiles without JSX syntax errors", () => {
    const source = readFileSync("apps/web/app/page.tsx", "utf8");

    const result = ts.transpileModule(source, {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
      },
      reportDiagnostics: true,
      fileName: "page.tsx",
    });

    const diagnostics = result.diagnostics ?? [];
    const syntaxErrors = diagnostics.filter((diag) => diag.category === ts.DiagnosticCategory.Error);

    expect(syntaxErrors, JSON.stringify(syntaxErrors, null, 2)).toHaveLength(0);
  });
});
