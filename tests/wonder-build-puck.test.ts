import { describe, expect, test } from "vitest";
import { NextRequest } from "next/server";
import { POST as puckAiPost } from "../apps/web/app/api/wonder-build/puck-ai/route";

describe("wonder build puck ai api", () => {
  test("returns nextData on standard prompt", async () => {
    const request = new NextRequest("http://localhost/api/wonder-build/puck-ai", {
      method: "POST",
      body: JSON.stringify({
        prompt: "add social proof",
        currentData: { content: [{ type: "Heading", props: { text: "Hello" } }] },
      }),
    });

    const response = await puckAiPost(request);
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload.nextData.content.length).toBe(2);
  });

  test("returns patch when prompt asks for patch", async () => {
    const request = new NextRequest("http://localhost/api/wonder-build/puck-ai", {
      method: "POST",
      body: JSON.stringify({
        prompt: "use patch mode",
        currentData: { content: [] },
      }),
    });

    const response = await puckAiPost(request);
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(Array.isArray(payload.patch)).toBe(true);
    expect(payload.patch[0].op).toBe("add");
  });
});
