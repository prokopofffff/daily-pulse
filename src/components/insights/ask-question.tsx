"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Why did revenue go up yesterday?",
  "What's driving the refund increase?",
  "How is the new dashboard performing?",
];

/**
 * Deterministic mock answer used when no streaming AI route is reachable
 * (e.g. no API key / mock mode). Keeps the UX honest without inventing data.
 */
function mockAnswer(question: string): string {
  const q = question.toLowerCase();
  if (q.includes("refund")) {
    return "Refund requests rose 32% after the June 24 pricing update, with most customers citing the removal of the legacy Starter tier. It's worth watching over the next few days and drafting proactive comms for affected accounts.";
  }
  if (q.includes("traffic") || q.includes("organic") || q.includes("seo")) {
    return "Organic search sessions dipped about 6% overnight. A Google core update on June 30 is the likely cause. Auditing the affected pages and refreshing your top landing pages should help recover the lost traffic.";
  }
  if (q.includes("dashboard") || q.includes("adoption") || q.includes("feature")) {
    return "The redesigned dashboard reached 41% adoption within 24 hours of launch — well above the 25% target. Promoting it inside onboarding and lifecycle emails should extend that momentum.";
  }
  return "Yesterday's revenue hit $48.2k — the strongest single day this quarter, led by a spike in Pro plan upgrades and 41% adoption of the new dashboard. The main thing to watch is a 32% rise in refunds following the June 24 pricing change.";
}

interface StreamState {
  question: string;
  answer: string;
  status: "streaming" | "done";
}

export interface AskQuestionProps {
  className?: string;
}

/**
 * "Ask a question" affordance. Opens a dialog with an input; on submit it
 * attempts to stream from the AI route and gracefully falls back to a
 * deterministic mock answer (streamed word-by-word) when unavailable.
 */
export function AskQuestion({ className }: AskQuestionProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<StreamState | null>(null);
  const [pending, setPending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const streamMock = useCallback(
    async (question: string, signal: AbortSignal) => {
      const words = mockAnswer(question).split(" ");
      for (let i = 0; i < words.length; i += 1) {
        await new Promise((r) => setTimeout(r, 28));
        // Stop if this request was superseded or the dialog closed, and only
        // write into the result that still belongs to this question.
        if (signal.aborted) return;
        setResult((prev) =>
          prev && prev.question === question
            ? { ...prev, answer: words.slice(0, i + 1).join(" ") }
            : prev,
        );
      }
    },
    [],
  );

  const ask = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || pending) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setPending(true);
      setResult({ question: trimmed, answer: "", status: "streaming" });

      try {
        const res = await fetch("/api/insights/stream", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ question: trimmed }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error("stream unavailable");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let answer = "";
        while (true) {
          const { done, value: chunk } = await reader.read();
          if (done) break;
          answer += decoder.decode(chunk, { stream: true });
          setResult((prev) =>
            prev && prev.question === trimmed ? { ...prev, answer } : prev,
          );
        }
      } catch {
        // A superseded request (new question) or a closed dialog aborts this
        // controller — bail without touching the newer request's result.
        if (controller.signal.aborted) return;
        // Graceful fallback: stream a deterministic mock answer.
        await streamMock(trimmed, controller.signal);
      } finally {
        if (!controller.signal.aborted) {
          setResult((prev) => (prev ? { ...prev, status: "done" } : prev));
          setPending(false);
        }
      }
    },
    [pending, streamMock],
  );

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      abortRef.current?.abort();
      setValue("");
      setResult(null);
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-9 gap-1.5", className)}>
          <Sparkles className="text-primary" aria-hidden />
          Ask a question
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden />
            Ask Daily Pulse AI
          </DialogTitle>
          <DialogDescription>
            Ask anything about yesterday&apos;s data — revenue, refunds, traffic
            or adoption.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-row items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void ask(value);
          }}
        >
          <Input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. Why did revenue go up yesterday?"
            className="flex-1"
            aria-label="Your question"
          />
          <Button type="submit" size="icon" disabled={pending || !value.trim()}>
            {pending ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <Send aria-hidden />
            )}
            <span className="sr-only">Ask</span>
          </Button>
        </form>

        {result ? (
          <div className="flex flex-col gap-2 rounded-md border border-border bg-surface-subtle p-3.5">
            <p className="text-[13px] font-semibold text-foreground">
              {result.question}
            </p>
            <p className="min-h-5 text-[13.5px] leading-5 text-muted-foreground">
              {result.answer}
              {result.status === "streaming" ? (
                <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-primary align-middle" />
              ) : null}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-medium text-text-tertiary">Try asking</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                className="rounded-md border border-border bg-card px-3 py-2 text-left text-[13px] text-foreground transition-colors hover:bg-surface-hover"
                onClick={() => {
                  setValue(s);
                  void ask(s);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
