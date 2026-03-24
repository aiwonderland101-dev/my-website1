/* @vitest-environment jsdom */
import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let mockSceneId = "";
let mockProjectId = "default";

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === "sceneId") return mockSceneId;
      if (key === "projectId") return mockProjectId;
      return null;
    },
  }),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={typeof href === "string" ? href : href?.pathname} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/theatreBridgeSetup", () => ({
  setupTheatreBridge: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/components/PlayCanvasEditorHost", () => ({
  default: () => <div data-testid="mock-bridge">Mock Bridge</div>,
}));

import EditorPlayCanvasPage from "./(workspace)/dashboard/editor-playcanvas/page";

function mockFetchSequence(responses: Array<() => Promise<Response>>) {
  const fetchMock = vi.fn();
  responses.forEach((factory) => fetchMock.mockImplementationOnce(factory));
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe("editor playcanvas trust-layer states", () => {
  beforeEach(() => {
    mockSceneId = "";
    mockProjectId = "default";
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading skeleton then empty states for first-time users", async () => {
    let resolveArtifacts: ((value: Response) => void) | null = null;
    let resolveProjects: ((value: Response) => void) | null = null;

    mockFetchSequence([
      () => new Promise((resolve) => {
        resolveArtifacts = resolve;
      }),
      () => new Promise((resolve) => {
        resolveProjects = resolve;
      }),
    ]);

    const { container } = render(<EditorPlayCanvasPage />);

    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);

    await act(async () => {
      resolveArtifacts?.(new Response(JSON.stringify({ artifacts: [] }), { status: 200 }));
      resolveProjects?.(new Response(JSON.stringify({ projects: [] }), { status: 200 }));
    });

    expect(await screen.findByText("No PlayCanvas exports yet")).toBeTruthy();
    expect(await screen.findByText("No setup records yet")).toBeTruthy();
  });

  it("shows error toast with retry action when project setup fetch fails", async () => {
    const fetchMock = mockFetchSequence([
      async () => new Response(JSON.stringify({ artifacts: [] }), { status: 200 }),
      async () => new Response("boom", { status: 500 }),
      async () => new Response(JSON.stringify({ projects: [] }), { status: 200 }),
    ]);

    render(<EditorPlayCanvasPage />);

    const retryButton = await screen.findByRole("button", { name: "Retry" });
    expect(await screen.findByText("Failed to load linked PlayCanvas projects.")).toBeTruthy();

    await act(async () => {
      fireEvent.click(retryButton);
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
