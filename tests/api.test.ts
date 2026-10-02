import { APICallError, RetryError } from "ai";
import { describe, expect, it } from "vitest";
import { describeAiError } from "@/lib/api";

function apiError(statusCode: number) {
  return new APICallError({
    message: "upstream",
    url: "https://example.test",
    requestBodyValues: {},
    statusCode,
  });
}

describe("describeAiError", () => {
  it("tells the user to wait when the free-tier quota is hit", () => {
    expect(describeAiError(apiError(429))).toMatchObject({ status: 503 });
    expect(describeAiError(apiError(503)).message).toMatch(/try again in a minute/i);
  });

  it("looks through the SDK's retry wrapper to the real cause", () => {
    const error = new RetryError({
      message: "failed",
      reason: "maxRetriesExceeded",
      errors: [apiError(429)],
    });
    expect(describeAiError(error).status).toBe(503);
  });

  it("falls back to a generic message for anything else", () => {
    expect(describeAiError(new Error("boom"))).toEqual({
      status: 502,
      message: "Couldn't reach the AI model. Try again.",
    });
  });
});
