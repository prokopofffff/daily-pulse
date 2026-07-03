/**
 * Barrel for the Daily Pulse AI backend.
 *
 * Exposes the two capabilities consumed by server actions and API routes:
 *   - generateDailyReport(orgId): structured AIReportOutput (mock-safe)
 *   - streamAnswer(orgId, question): streamed text answer (mock-safe)
 */

export { generateDailyReport, buildMockReport } from "./generate-report";
export { streamAnswer } from "./stream-insights";
export { hasOpenAI, getOpenAI, OPENAI_MODEL } from "./client";
export { aiReportOutputSchema, aiReportJsonSchema } from "./schema";
