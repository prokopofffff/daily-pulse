/**
 * POST /api/insights/stream
 *
 * Streams an AI answer to a free-form question about an org's data as a
 * text/plain token stream (consumed by the Insights "Ask a question" panel).
 *
 * Body: { orgId?: string; question: string }
 */

import { CURRENT_ORG_ID } from "@/lib/config";
import { streamAnswer } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface StreamRequestBody {
  orgId?: string;
  question?: string;
}

export async function POST(req: Request): Promise<Response> {
  let body: StreamRequestBody;
  try {
    body = (await req.json()) as StreamRequestBody;
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const question = (body.question ?? "").trim();
  if (!question) {
    return new Response("Missing 'question'", { status: 400 });
  }
  const orgId = body.orgId?.trim() || CURRENT_ORG_ID;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of streamAnswer(orgId, question)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `\n\n[stream error] ${err instanceof Error ? err.message : "unknown"}`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
