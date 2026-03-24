import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("apps/web tailwind css contract", () => {
  it("keeps Tailwind v3 directives without mixed v4 import syntax", () => {
    const css = readFileSync("apps/web/app/globals.css", "utf8");

    expect(css).toContain("@tailwind base;");
    expect(css).toContain("@tailwind components;");
    expect(css).toContain("@tailwind utilities;");
    expect(css).not.toContain('@import "tailwindcss";');
  });

  it("uses tailwindcss plugin in postcss config", () => {
    const postcssConfig = readFileSync("apps/web/postcss.config.js", "utf8");

    expect(postcssConfig).toContain("'tailwindcss': {}");
    expect(postcssConfig).toContain("'autoprefixer': {}");
  });
});
