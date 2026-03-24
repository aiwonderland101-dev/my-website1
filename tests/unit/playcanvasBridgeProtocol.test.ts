import { describe, expect, test, vi } from "vitest";
import {
  getBridgeMessageFromEvent,
  isPlayCanvasBridgeMessage,
  sendBridgeMessage,
} from "../../apps/web/lib/playcanvasBridgeProtocol";

describe("playcanvasBridgeProtocol", () => {
  test("rejects events from untrusted origins", () => {
    const expectedSource = {} as Window;
    const event = {
      origin: "https://evil.example.com",
      source: expectedSource,
      data: { type: "bridge:ready", payload: {} },
    } as Pick<MessageEvent, "origin" | "source" | "data">;

    expect(getBridgeMessageFromEvent(event, expectedSource)).toBeNull();
  });

  test("rejects events from unexpected source window", () => {
    const expectedSource = {} as Window;
    const event = {
      origin: "https://playcanvas.com",
      source: {} as Window,
      data: { type: "bridge:ready", payload: {} },
    } as Pick<MessageEvent, "origin" | "source" | "data">;

    expect(getBridgeMessageFromEvent(event, expectedSource)).toBeNull();
  });

  test("accepts valid trusted payloads", () => {
    const expectedSource = {} as Window;
    const event = {
      origin: "https://playcanvas.com",
      source: expectedSource,
      data: { type: "bridge:error", payload: { message: "failed", code: "E_SYNC" } },
    } as Pick<MessageEvent, "origin" | "source" | "data">;

    const parsed = getBridgeMessageFromEvent(event, expectedSource);

    expect(parsed).toEqual(event.data);
    expect(isPlayCanvasBridgeMessage(parsed)).toBe(true);
  });

  test("rejects invalid payload shape", () => {
    const expectedSource = {} as Window;
    const event = {
      origin: "https://playcanvas.com",
      source: expectedSource,
      data: { type: "bridge:error", payload: { code: "E_SYNC" } },
    } as Pick<MessageEvent, "origin" | "source" | "data">;

    expect(getBridgeMessageFromEvent(event, expectedSource)).toBeNull();
  });

  test("posts only to trusted origin", () => {
    const postMessage = vi.fn();
    const targetWindow = { postMessage } as unknown as Window;

    const blocked = sendBridgeMessage(targetWindow, "https://evil.example.com", {
      type: "bridge:ready",
      payload: {},
    });

    const sent = sendBridgeMessage(targetWindow, "https://playcanvas.com", {
      type: "bridge:ready",
      payload: {},
    });

    expect(blocked).toBe(false);
    expect(sent).toBe(true);
    expect(postMessage).toHaveBeenCalledTimes(1);
  });
});
