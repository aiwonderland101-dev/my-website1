import { describe, expect, test } from "vitest";
import { safeParseActivationData } from "../apps/web/lib/wonder-build/activation-schema";
import { readFileSync } from "node:fs";

describe("wonder build activation schema", () => {
  test("accepts known block payload shared by Puck and Unreal", () => {
    const result = safeParseActivationData({
      content: [
        { type: "Heading", props: { text: "Hello" } },
        { type: "Section", props: { title: "Hero" } },
      ],
    });

    expect(result.success).toBe(true);
  });

  test("rejects unsupported block type", () => {
    const result = safeParseActivationData({
      content: [{ type: "Video", props: { src: "x" } }],
    });

    expect(result.success).toBe(false);
  });

  test("swarm script includes both signaling and unreal processes", () => {
    const source = readFileSync("scripts/swarm/run-unreal-stack.mjs", "utf8");
    expect(source.includes("signaling-server")).toBe(true);
    expect(source.includes("unreal-instance")).toBe(true);
    expect(source.includes("WONDER_SIGNALING_CMD")).toBe(true);
    expect(source.includes("WONDER_UNREAL_CMD")).toBe(true);
  });
});
