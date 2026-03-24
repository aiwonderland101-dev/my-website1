import { describe, expect, test } from "vitest";
import { parseArtifactMetadata } from "../apps/web/lib/wonderspace/artifacts";

describe("artifact metadata schema", () => {
  test("accepts valid metadata", () => {
    const result = parseArtifactMetadata({
      projectId: "project-1",
      buildId: "build-1",
      createdAt: "2026-01-10T12:30:00.000Z",
      status: "uploaded",
      publicPath: "/api/wonderspace/projects/project-1/artifacts/build-1/download",
    });

    expect(result.success).toBe(true);
  });

  test("rejects invalid metadata", () => {
    const result = parseArtifactMetadata({
      projectId: "",
      buildId: "",
      createdAt: "not-a-date",
      status: "unknown",
      publicPath: "",
    });

    expect(result.success).toBe(false);
  });
});
