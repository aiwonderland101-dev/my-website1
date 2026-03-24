import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@theatre/core", () => ({
  getProject: vi.fn(() => ({ sheet: vi.fn() })),
  types: { number: vi.fn() },
}));

const initialize = vi.fn();

vi.mock("@theatre/studio", () => ({
  default: {
    initialize,
  },
}));

describe("setupTheatreBridge", () => {
  beforeEach(() => {
    initialize.mockClear();
  });

  it("binds Theatre globals for PlayCanvas scripts", async () => {
    const host: Record<string, unknown> = {};
    const { setupTheatreBridge } = await import("./theatreBridgeSetup");

    const bindings = await setupTheatreBridge(host);

    expect(host.getProject).toBe(bindings.getProject);
    expect(host.studio).toBe(bindings.studio);
    expect(host.t).toBe(bindings.t);
    expect(initialize).toHaveBeenCalledTimes(1);
  });
});
