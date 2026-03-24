import { beforeEach, describe, expect, test } from "vitest";
import path from "node:path";
import { promises as fs } from "node:fs";
import { GET, POST } from "../apps/web/app/api/byoc/environments/route";

const DATA_DIR = path.join(process.cwd(), "data");
const ENV_FILE = path.join(DATA_DIR, "byoc-environments.json");

describe("BYOC environments route", () => {
  beforeEach(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(ENV_FILE, JSON.stringify([], null, 2), "utf8");
  });

  test("POST creates an environment and GET lists it", async () => {
    const request = new Request("http://localhost/api/byoc/environments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tenantName: "Acme Studio",
        provider: "aws",
        region: "us-east-1",
        projectOrAccountId: "123456789012",
        roleArn: "arn:aws:iam::123456789012:role/wonder-build-byoc",
      }),
    });

    const createResponse = await POST(request);
    expect(createResponse.status).toBe(201);

    const listResponse = await GET();
    expect(listResponse.status).toBe(200);

    const payload = (await listResponse.json()) as { environments: Array<{ tenantName: string; provider: string }> };
    expect(payload.environments).toHaveLength(1);
    expect(payload.environments[0]).toMatchObject({ tenantName: "Acme Studio", provider: "aws" });
  });

  test("POST rejects invalid payload", async () => {
    const request = new Request("http://localhost/api/byoc/environments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        tenantName: "",
        provider: "digitalocean",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const payload = (await response.json()) as { error: string };
    expect(payload.error).toContain("Tenant name is required");
  });
});
