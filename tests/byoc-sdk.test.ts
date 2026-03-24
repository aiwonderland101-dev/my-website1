import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  listByocEnvironments,
  saveByocEnvironment,
  validateByocEnvironment,
} from "../apps/web/lib/byocSdk";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    clear: () => {
      store = {};
    },
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

describe("BYOC SDK", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    localStorageMock.clear();

    Object.defineProperty(globalThis, "window", {
      value: { localStorage: localStorageMock },
      configurable: true,
      writable: true,
    });
  });

  test("validates payload shape", () => {
    expect(
      validateByocEnvironment({
        tenantName: "",
        provider: "aws",
        region: "us-east-1",
        projectOrAccountId: "123",
        roleArn: "arn:aws:iam::123:role/test",
      }),
    ).toContain("Tenant name is required");
  });

  test("saves and lists environments without API routes", async () => {
    await saveByocEnvironment({
      tenantName: "Acme Studio",
      provider: "gcp",
      region: "us-central1",
      projectOrAccountId: "project-123",
      roleArn: "principal://iam.googleapis.com/projects/123/locations/global/workloadIdentityPools/wonder/providers/oidc",
    });

    const environments = await listByocEnvironments();

    expect(environments).toHaveLength(1);
    expect(environments[0]).toMatchObject({
      tenantName: "Acme Studio",
      provider: "gcp",
      region: "us-central1",
    });
  });
});
