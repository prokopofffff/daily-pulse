/**
 * OpenAI client factory.
 *
 * Reads OPENAI_API_KEY / OPENAI_MODEL from the environment. When no key is
 * present (or the app runs in mock mode) callers should fall back to the
 * deterministic mock paths — `hasOpenAI()` gates that decision.
 */

import OpenAI from "openai";
import { USE_MOCK } from "@/lib/config";

/** The model used for report generation and Q&A. */
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

/**
 * True when a real OpenAI call can be made: an API key is configured and the
 * app is not forced into mock mode. Server-only (reads a non-public env var).
 */
export function hasOpenAI(): boolean {
  return !USE_MOCK && Boolean(process.env.OPENAI_API_KEY);
}

let cached: OpenAI | null = null;

/**
 * Returns a memoized OpenAI client, or null when no API key is configured.
 * Never throws — callers should branch on the null result.
 */
export function getOpenAI(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!cached) {
    cached = new OpenAI({ apiKey });
  }
  return cached;
}
