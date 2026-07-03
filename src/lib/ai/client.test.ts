// @vitest-environment node
import { describe, it, expect, afterEach, vi } from "vitest";

// Ensure any real network client construction has no effect: we never call it.
describe("client — default (mock mode) environment", () => {
  it("hasOpenAI() is false with no OPENAI_API_KEY set", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.resetModules();
    const { hasOpenAI } = await import("./client");
    expect(hasOpenAI()).toBe(false);
    vi.unstubAllEnvs();
  });

  it("getOpenAI() returns null with no API key", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.resetModules();
    const { getOpenAI } = await import("./client");
    expect(getOpenAI()).toBeNull();
    vi.unstubAllEnvs();
  });

  it("OPENAI_MODEL defaults to gpt-4o-mini when OPENAI_MODEL unset", async () => {
    vi.stubEnv("OPENAI_MODEL", "");
    vi.resetModules();
    const { OPENAI_MODEL } = await import("./client");
    expect(OPENAI_MODEL).toBe("gpt-4o-mini");
    vi.unstubAllEnvs();
  });
});

describe("client — hasOpenAI gating logic", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.doUnmock("@/lib/config");
  });

  it("stays false even with a key while USE_MOCK is true", async () => {
    vi.doMock("@/lib/config", () => ({
      USE_MOCK: true,
      CURRENT_ORG_ID: "org_acme",
    }));
    vi.stubEnv("OPENAI_API_KEY", "sk-test-key");
    vi.resetModules();
    const { hasOpenAI } = await import("./client");
    expect(hasOpenAI()).toBe(false);
  });

  it("is true only when USE_MOCK is false AND a key is present", async () => {
    vi.doMock("@/lib/config", () => ({
      USE_MOCK: false,
      CURRENT_ORG_ID: "org_acme",
    }));
    vi.stubEnv("OPENAI_API_KEY", "sk-test-key");
    vi.resetModules();
    const { hasOpenAI } = await import("./client");
    expect(hasOpenAI()).toBe(true);
  });

  it("is false when USE_MOCK is false but no key is present", async () => {
    vi.doMock("@/lib/config", () => ({
      USE_MOCK: false,
      CURRENT_ORG_ID: "org_acme",
    }));
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.resetModules();
    const { hasOpenAI } = await import("./client");
    expect(hasOpenAI()).toBe(false);
  });
});
