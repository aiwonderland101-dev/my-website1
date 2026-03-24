import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { promises as fs } from "node:fs";
import path from "node:path";
import { GET, POST } from "../apps/web/app/api/wonderspace/projects/route";

const dataFile = path.join(process.cwd(), "data", "wonderspace-projects.json");

async function resetDataFile() {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify([], null, 2), "utf8");
}

describe("wonderspace projects route", () => {
  beforeEach(async () => {
    await resetDataFile();
  });

  afterEach(async () => {
    await resetDataFile();
  });

  test("POST persists PlayCanvas and workspace ownership metadata", async () => {
    const request = new Request("http://localhost/api/wonderspace/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Bridge Setup",
        workspaceOwner: "workspace-alpha",
        sceneId: "scene-42",
        playcanvasProjectId: "pc-99",
        integrationMode: "link",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const payload = await response.json();
    expect(payload.project.workspaceOwner).toBe("workspace-alpha");
    expect(payload.project.sceneId).toBe("scene-42");
    expect(payload.project.playcanvasProjectId).toBe("pc-99");

    const listResponse = await GET();
    const listPayload = await listResponse.json();
    expect(listPayload.projects[0].workspaceOwner).toBe("workspace-alpha");
    expect(listPayload.projects[0].integrationMode).toBe("link");
  });

  test("POST validates linked mode requirements", async () => {
    const request = new Request("http://localhost/api/wonderspace/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Missing scene",
        workspaceOwner: "workspace-alpha",
        integrationMode: "link",
        playcanvasProjectId: "pc-1",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Scene ID is required when linking an existing PlayCanvas project",
    });
  });
});
