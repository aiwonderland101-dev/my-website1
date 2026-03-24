import { beforeEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

const store = new Map<string, Blob>();
const listErrorRef = { value: false };

vi.mock("@infra/services/storage/provider", () => ({
  storageProvider: {
    upload: vi.fn(async (path: string, file: Buffer) => {
      store.set(path, new Blob([file]));
      return { path };
    }),
    download: vi.fn(async (path: string) => ({ data: store.get(path) ?? null, error: null })),
    remove: vi.fn(async (path: string) => {
      store.delete(path);
    }),
    list: vi.fn(async (prefix: string) => {
      if (listErrorRef.value) {
        return { data: null, error: { message: "boom" } };
      }

      const names = Array.from(store.keys())
        .filter((key) => key.startsWith(prefix) && key.endsWith(".json"))
        .map((key) => ({ name: key.slice(prefix.length + 1) }));

      return { data: names, error: null };
    }),
  },
}));

import { POST as uploadArtifact } from "../apps/web/app/api/wonderspace/projects/[projectId]/artifacts/upload/route";
import { GET as listArtifacts } from "../apps/web/app/api/wonderspace/projects/[projectId]/artifacts/route";
import { GET as getDeploymentUrl } from "../apps/web/app/api/wonderspace/projects/[projectId]/artifacts/[buildId]/deployment-url/route";

describe("wonderspace project artifacts routes", () => {
  beforeEach(() => {
    store.clear();
    listErrorRef.value = false;
  });

  test("uploads a zip artifact and returns metadata", async () => {
    const formData = new FormData();
    formData.set("buildId", "build-123");
    formData.set("file", new File([new Uint8Array([80, 75, 3, 4])], "export.zip", { type: "application/zip" }));

    const request = new NextRequest("http://localhost/api/wonderspace/projects/project-1/artifacts/upload", {
      method: "POST",
      body: formData,
    });

    const response = await uploadArtifact(request, { params: Promise.resolve({ projectId: "project-1" }) });

    expect(response.status).toBe(201);
    const payload = await response.json();
    expect(payload.artifact.buildId).toBe("build-123");
    expect(payload.artifact.projectId).toBe("project-1");
  });

  test("rejects non-zip uploads", async () => {
    const formData = new FormData();
    formData.set("file", new File(["hello"], "notes.txt", { type: "text/plain" }));

    const request = new NextRequest("http://localhost/api/wonderspace/projects/project-1/artifacts/upload", {
      method: "POST",
      body: formData,
    });

    const response = await uploadArtifact(request, { params: Promise.resolve({ projectId: "project-1" }) });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Only ZIP uploads are supported" });
  });

  test("lists uploaded artifacts", async () => {
    const formData = new FormData();
    formData.set("buildId", "build-list");
    formData.set("file", new File([new Uint8Array([80, 75, 3, 4])], "export.zip", { type: "application/zip" }));

    const uploadRequest = new NextRequest("http://localhost/api/wonderspace/projects/project-a/artifacts/upload", {
      method: "POST",
      body: formData,
    });
    await uploadArtifact(uploadRequest, { params: Promise.resolve({ projectId: "project-a" }) });

    const response = await listArtifacts(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project-a" }),
    });

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.artifacts).toHaveLength(1);
    expect(payload.artifacts[0].buildId).toBe("build-list");
  });

  test("returns 500 when artifact listing fails", async () => {
    listErrorRef.value = true;

    const response = await listArtifacts(new Request("http://localhost"), {
      params: Promise.resolve({ projectId: "project-a" }),
    });

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Failed to list artifacts" });
  });

  test("returns public deployment URL", async () => {
    const formData = new FormData();
    formData.set("buildId", "build-url");
    formData.set("file", new File([new Uint8Array([80, 75, 3, 4])], "export.zip", { type: "application/zip" }));

    const uploadRequest = new NextRequest("http://localhost/api/wonderspace/projects/project-z/artifacts/upload", {
      method: "POST",
      body: formData,
    });
    await uploadArtifact(uploadRequest, { params: Promise.resolve({ projectId: "project-z" }) });

    const response = await getDeploymentUrl(
      new NextRequest("http://localhost/api/wonderspace/projects/project-z/artifacts/build-url/deployment-url"),
      { params: Promise.resolve({ projectId: "project-z", buildId: "build-url" }) },
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.visibility).toBe("public");
    expect(payload.url).toContain("/api/wonderspace/projects/project-z/artifacts/build-url/download");
  });

  test("returns 404 when deployment URL artifact does not exist", async () => {
    const response = await getDeploymentUrl(
      new NextRequest("http://localhost/api/wonderspace/projects/project-z/artifacts/missing/deployment-url"),
      { params: Promise.resolve({ projectId: "project-z", buildId: "missing" }) },
    );

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Artifact not found" });
  });
});
