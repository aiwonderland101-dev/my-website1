import { afterEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as generateHandler } from "../apps/web/app/api/wonder-build/generate/route";
import { wonderBuildClient, AuthError, PaywallError, ServerError } from "../apps/web/lib/wonder-build/client";
import {
  createProject,
  listProjects,
  getProjectById,
  saveWonderBuildState,
  WonderBuildState
} from "../apps/web/lib/wonder-build/projects";

vi.mock("../apps/web/app/utils/supabase/server", () => ({
  createSupabaseServerClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: "user-1", app_metadata: {} } } }),
    },
  }),
}));

vi.mock("../apps/web/lib/smokeAuth", () => ({
  getSmokeUserIdFromRequest: () => undefined,
}));

const originalFetch = global.fetch;

afterEach(() => {
  vi.restoreAllMocks();
  global.fetch = originalFetch;
});

describe("wonder build client", () => {
  test("returns generated root on success", async () => {
    const root = { id: "root", type: "root", props: {}, children: [] };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, root }),
    } as Response);

    const result = await wonderBuildClient.generate({ prompt: "hello" });
    expect(result.root).toEqual(root);
  });

  test("throws auth error on 401", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: "Unauthorized" }),
    } as Response);

    await expect(wonderBuildClient.generate({ prompt: "hello" })).rejects.toBeInstanceOf(AuthError);
  });

  test("throws paywall error on 402/403", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 402,
      json: async () => ({ error: "PAYWALL" }),
    } as Response);

    await expect(wonderBuildClient.generate({ prompt: "hello" })).rejects.toBeInstanceOf(PaywallError);
  });

  test("throws server error on other failures", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: "boom" }),
    } as Response);

    await expect(wonderBuildClient.generate({ prompt: "hello" })).rejects.toBeInstanceOf(ServerError);
  });
});

describe("wonder build persistence", () => {
  test("saves state to .wonderbuild/state.json", async () => {
    const spy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });
    global.fetch = spy as unknown as typeof fetch;

    const state: WonderBuildState = {
      version: 1,
      updatedAt: new Date().toISOString(),
      state: { blocks: [] },
    };

    await saveWonderBuildState("project-1", state);

    expect(spy).toHaveBeenCalled();
    const call = spy.mock.calls[0];
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body.path).toBe(".wonderbuild/state.json");
  });
});


describe("wonder build projects", () => {
  test("createProject returns a persisted project record", async () => {
    const created = await createProject("New Build", "wonder-build");

    expect(created.id).toBeTruthy();
    expect(created.name).toBe("New Build");

    const found = await getProjectById(created.id);
    expect(found?.id).toBe(created.id);

    const all = await listProjects();
    expect(all.some((project) => project.id === created.id)).toBe(true);
  });
});

describe("wonder build api", () => {

  test("returns deterministic WonderBuildState payload", async () => {
    const requestA = new NextRequest("http://localhost/api/wonder-build/generate", {
      method: "POST",
      body: JSON.stringify({ prompt: "SaaS landing page" }),
    });
    const requestB = new NextRequest("http://localhost/api/wonder-build/generate", {
      method: "POST",
      body: JSON.stringify({ prompt: "SaaS landing page" }),
    });

    const responseA = await generateHandler(requestA);
    const responseB = await generateHandler(requestB);

    expect(responseA.status).toBe(200);
    expect(responseB.status).toBe(200);

    const jsonA = await responseA.json();
    const jsonB = await responseB.json();

    expect(Array.isArray(jsonA.wonderBuildState.blocks)).toBe(true);
    expect(jsonA.wonderBuildState.blocks.map((b: any) => b.type)).toEqual(["hero", "features", "footer"]);
    expect(jsonA.wonderBuildState).toEqual(jsonB.wonderBuildState);
  });

  test("returns 400 when prompt missing", async () => {
    const request = new NextRequest("http://localhost/api/wonder-build/generate", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await generateHandler(request);
    expect(response.status).toBe(400);
  });
});
