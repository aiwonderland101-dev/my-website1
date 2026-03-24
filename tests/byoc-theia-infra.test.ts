import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import {
  parseTenantFromHost,
  resolveTheiaUpstream,
} from "../apps/web/app/api/tenant-ide-proxy/[...path]/route";

function read(path: string) {
  return readFileSync(path, "utf8");
}

describe("tenant ide proxy helpers", () => {
  test("parses tenant from host with subdomain", () => {
    expect(parseTenantFromHost("acme.ide.yourdomain.com")).toBe("acme");
    expect(parseTenantFromHost("localhost:3000")).toBeNull();
  });

  test("resolves upstream from TENANT_THEIA_MAP JSON", () => {
    const map = JSON.stringify({ acme: "https://acme-theia.internal.example.com/" });
    expect(resolveTheiaUpstream("acme", map)).toBe("https://acme-theia.internal.example.com");
    expect(resolveTheiaUpstream("globex", map)).toBeNull();
    expect(resolveTheiaUpstream("acme", "{" )).toBeNull();
  });
});

describe("BYOC Theia infrastructure files", () => {
  test("dockerfile includes colyseus and supabase tooling", () => {
    const dockerfile = read("WonderSpace/Dockerfile");
    expect(dockerfile).toContain("scripts/supabase_mount.mjs");
    expect(dockerfile).toContain("\"colyseus.js\"");
    expect(dockerfile).toContain("\"@supabase/supabase-js\"");
  });

  test("vercel host rewrite points ide host to tenant proxy route", () => {
    const vercel = JSON.parse(read("vercel.json")) as {
      rewrites: Array<{ source: string; destination: string; has?: Array<{ type: string; value: string }> }>;
    };

    const ideRewrite = vercel.rewrites.find((entry) => entry.destination === "/api/tenant-ide-proxy/:path*");
    expect(ideRewrite?.source).toBe("/:path*");
    expect(ideRewrite?.has?.some((item) => item.type === "host" && item.value === "ide.yourdomain.com")).toBe(true);
  });
});
