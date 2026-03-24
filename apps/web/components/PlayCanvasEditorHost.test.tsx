/* @vitest-environment jsdom */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/IframePlayCanvasHost", () => ({
  IframePlayCanvasHost: ({ sceneId }: { sceneId: string }) => <div data-testid="iframe-host">{sceneId}</div>,
}));

vi.mock("@/components/DirectPlayCanvasHost", () => ({
  DirectPlayCanvasHost: ({ sceneId }: { sceneId: string }) => <div data-testid="direct-host">{sceneId}</div>,
}));

import PlayCanvasEditorHost from "@/components/PlayCanvasEditorHost";

describe("PlayCanvasEditorHost", () => {
  it("uses iframe mode by default", () => {
    render(<PlayCanvasEditorHost sceneId="scene-1" />);

    expect(screen.getByTestId("iframe-host").textContent).toBe("scene-1");
    expect(screen.queryByTestId("direct-host")).toBeNull();
  });

  it("uses direct mode when explicitly requested", () => {
    render(<PlayCanvasEditorHost sceneId="scene-2" mode="direct" />);

    expect(screen.getByTestId("direct-host").textContent).toBe("scene-2");
    expect(screen.queryByTestId("iframe-host")).toBeNull();
  });
});
