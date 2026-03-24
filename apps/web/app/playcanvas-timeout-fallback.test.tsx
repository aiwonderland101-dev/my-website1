/* @vitest-environment jsdom */
import React from "react";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildPlayCanvasEditorUrl } from "../lib/playcanvas";

let mockSceneId = "";

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === "sceneId" ? mockSceneId : null),
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

import DashboardEditorPlayCanvasPage from "./(workspace)/dashboard/editor-playcanvas/page";
import WonderBuildPlayCanvasPage from "./(builder)/wonder-build/playcanvas/page";

beforeEach(() => {
  vi.useFakeTimers();
  mockSceneId = "scene-123";
});

afterEach(() => {
  act(() => {
    vi.runOnlyPendingTimers();
  });
  vi.useRealTimers();
});

describe("PlayCanvas bridge timeout fallback", () => {
  it("transitions dashboard bridge from loading to timeout fallback with external CTA", async () => {
    render(<DashboardEditorPlayCanvasPage />);

    expect(screen.queryByText("Embed blocked — continue in PlayCanvas")).toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(10_000);
    });

    expect(screen.getByText("Embed blocked — continue in PlayCanvas")).toBeTruthy();
    expect(screen.getByText("PlayCanvas embed did not become ready. Continue in a new tab.")).toBeTruthy();

    const cta = screen.getByRole("link", { name: "Open PlayCanvas in New Tab" });
    expect(cta.getAttribute("href")).toBe(buildPlayCanvasEditorUrl("scene-123"));
  });

  it("transitions wonder-build bridge from loading to timeout fallback with external CTA", async () => {
    render(<WonderBuildPlayCanvasPage />);

    expect(screen.queryByText("Embed blocked — continue in PlayCanvas")).toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(10_000);
    });

    expect(screen.getByText("Embed blocked — continue in PlayCanvas")).toBeTruthy();
    expect(screen.getByText("WonderPlay embed did not become ready. Continue in a new tab.")).toBeTruthy();

    const cta = screen.getByRole("link", { name: "Open PlayCanvas in New Tab" });
    expect(cta.getAttribute("href")).toBe(buildPlayCanvasEditorUrl("scene-123"));
  });
});
