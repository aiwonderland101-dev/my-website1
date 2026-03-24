import { describe, expect, it, vi } from "vitest";

import { ConvaiNpcProvider, createNpcProviderFromEnv } from "@/lib/ai/convaiNpcProvider";
import { NpcProviderError } from "@/lib/aiNpcProvider";

describe("ConvaiNpcProvider", () => {
  it("creates a session when feature flag and keys are present", async () => {
    const provider = new ConvaiNpcProvider({
      NEXT_PUBLIC_ENABLE_CONVAI_NPC: "true",
      NEXT_PUBLIC_CONVAI_API_KEY: "test-key",
      NEXT_PUBLIC_CONVAI_CHARACTER_ID: "npc-123",
    });

    const session = await provider.createSession();

    expect(session.sessionId).toContain("npc-123-");
  });

  it("throws when provider is disabled by feature flag", async () => {
    const provider = new ConvaiNpcProvider({
      NEXT_PUBLIC_ENABLE_CONVAI_NPC: "false",
      NEXT_PUBLIC_CONVAI_API_KEY: "test-key",
      NEXT_PUBLIC_CONVAI_CHARACTER_ID: "npc-123",
    });

    await expect(provider.createSession()).rejects.toBeInstanceOf(NpcProviderError);
    await expect(provider.createSession()).rejects.toThrow("disabled by feature flag");
  });

  it("throws when required env keys are missing", async () => {
    const provider = new ConvaiNpcProvider({
      NEXT_PUBLIC_ENABLE_CONVAI_NPC: "true",
      NEXT_PUBLIC_CONVAI_API_KEY: "",
      NEXT_PUBLIC_CONVAI_CHARACTER_ID: "",
    });

    await expect(provider.createSession()).rejects.toThrow("missing required environment keys");
  });

  it("publishes npc responses to subscribers", async () => {
    const provider = new ConvaiNpcProvider({
      NEXT_PUBLIC_ENABLE_CONVAI_NPC: "true",
      NEXT_PUBLIC_CONVAI_API_KEY: "test-key",
      NEXT_PUBLIC_CONVAI_CHARACTER_ID: "npc-abc",
    });

    const session = await provider.createSession();
    const onResponse = vi.fn();

    const unsubscribe = provider.subscribeNpcResponses(session.sessionId, onResponse);
    await provider.sendUserUtterance(session.sessionId, "hello there");

    expect(onResponse).toHaveBeenCalledTimes(1);
    expect(onResponse.mock.calls[0][0].text).toContain("hello there");

    unsubscribe();
    await provider.sendUserUtterance(session.sessionId, "second");
    expect(onResponse).toHaveBeenCalledTimes(1);
  });

  it("factory returns configured provider based on env", () => {
    const provider = createNpcProviderFromEnv({
      NEXT_PUBLIC_ENABLE_CONVAI_NPC: "true",
      NEXT_PUBLIC_CONVAI_API_KEY: "key",
      NEXT_PUBLIC_CONVAI_CHARACTER_ID: "char",
    });

    expect(provider.name).toBe("convai");
    expect(provider.isConfigured).toBe(true);
  });
});
