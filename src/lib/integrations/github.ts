/**
 * GitHub collector — commits, PRs and deploy activity, surfaced as the
 * "critical issues" signal on the dashboard.
 *
 * Real path (guarded by GITHUB_TOKEN + GITHUB_REPO): queries the GitHub REST
 * API for open issues labelled critical. When either is absent (or in mock
 * mode) it returns deterministic seeded metrics.
 */

import type { Metric } from "@/lib/types";
import {
  CollectorResult,
  env,
  mockMetricsForSource,
  shouldUseMock,
} from "./shared";

/** Collect GitHub-sourced metrics (critical issues) for an org. */
export async function collectGithub(orgId: string): Promise<CollectorResult> {
  const token = env("GITHUB_TOKEN");
  const repo = env("GITHUB_REPO");

  if (shouldUseMock(token, repo)) {
    return collectGithubMock(orgId);
  }

  return collectGithubLive(orgId, token as string, repo as string);
}

function collectGithubMock(orgId: string): CollectorResult {
  const metrics = mockMetricsForSource(orgId, "github");
  return { metrics, points: [] };
}

/**
 * Live GitHub path — counts open issues labelled "critical" in GITHUB_REPO
 * ("owner/name"). Degrades to seeded data on any failure.
 */
async function collectGithubLive(
  orgId: string,
  token: string,
  repo: string,
): Promise<CollectorResult> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${repo}/issues?state=open&labels=critical&per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      },
    );
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    const issues = (await res.json()) as unknown[];
    const count = Array.isArray(issues) ? issues.length : 0;

    const metrics: Metric[] = [
      {
        id: `metric_critical_issues_${orgId}`,
        orgId,
        key: "critical_issues",
        label: "Critical issues",
        date: "2026-07-01",
        value: count,
        previousValue: null,
        deltaPct: null,
        format: "number",
        source: "github",
      },
    ];
    return { metrics, points: [] };
  } catch {
    return collectGithubMock(orgId);
  }
}
