import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";

function read(path: string) {
  return readFileSync(path, "utf8");
}

describe("apps/web compatibility exports", () => {
  test("auth context exports useSupabase alias", () => {
    const source = read("apps/web/lib/supabase/auth-context.tsx");
    expect(source).toContain("export const useSupabase = () => useSupabaseAuth()");
  });

  test("wiring runtime exports injectWiringRuntime", () => {
    const source = read("apps/web/lib/wonder-build/wiringRuntime.ts");
    expect(source).toContain("export function injectWiringRuntime");
  });

  test("smoke auth exports getSmokeUserIdFromRequest", () => {
    const source = read("apps/web/lib/smokeAuth.ts");
    expect(source).toContain("export function getSmokeUserIdFromRequest");
  });

  test("supabase route exports supabaseRouteClient alias", () => {
    const source = read("apps/web/lib/supabase/route.ts");
    expect(source).toContain("export const supabaseRouteClient = () => createRouteClient()");
  });

  test("token helper exports makeApiToken", () => {
    const source = read("apps/web/lib/crypto/token.ts");
    expect(source).toContain("export function makeApiToken");
  });

  test("orchestrator exports generateAndSaveProject", () => {
    const source = read("engine/core/ai/orchestrator.ts");
    expect(source).toContain("export async function generateAndSaveProject");
  });
});
