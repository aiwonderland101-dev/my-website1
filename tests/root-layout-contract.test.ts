import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

describe("apps/web root layout contract", () => {
  test("root layout remains canonical document shell", () => {
    const rootLayout = readFileSync("apps/web/app/layout.tsx", "utf8");

    expect(rootLayout).toContain("export default function RootLayout");
    expect(rootLayout).toContain("<html");
    expect(rootLayout).toContain("<body");
  });

  test("root layout is not replaced by marketing client-navigation logic", () => {
    const rootLayout = readFileSync("apps/web/app/layout.tsx", "utf8");

    expect(rootLayout).not.toContain("usePathname");
    expect(rootLayout).not.toContain("useRouter");
  });
});
