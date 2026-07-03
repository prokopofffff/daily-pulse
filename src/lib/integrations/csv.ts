/**
 * CSV collector — manual metric upload.
 *
 * parseCsvToMetrics parses a small CSV export into normalized Metric[]. The
 * parser is dependency-free and tolerant of quoted fields, surrounding
 * whitespace and a trailing newline.
 *
 * Expected header (case-insensitive), extra columns are ignored:
 *   key,label,date,value,previousValue,format
 * Only `key`, `date` and `value` are required; sensible defaults fill the rest.
 */

import type {
  Metric,
  MetricFormat,
  MetricKey,
} from "@/lib/types";
import { SYNC_NOW_ISO } from "./shared";

const METRIC_KEYS: readonly MetricKey[] = [
  "revenue",
  "new_customers",
  "lost_customers",
  "orders",
  "visitors",
  "conversion",
  "support_tickets",
  "critical_issues",
  "errors",
];

const METRIC_FORMATS: readonly MetricFormat[] = [
  "currency",
  "number",
  "percent",
  "compact",
];

/** Parse a CSV string into Metric[] scoped to the given org. */
export function parseCsvToMetrics(orgId: string, csvText: string): Metric[] {
  const rows = parseCsv(csvText);
  if (rows.length < 2) return [];

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name.toLowerCase());

  const keyIdx = idx("key");
  const labelIdx = idx("label");
  const dateIdx = idx("date");
  const valueIdx = idx("value");
  const prevIdx = idx("previousvalue");
  const formatIdx = idx("format");

  if (keyIdx === -1 || dateIdx === -1 || valueIdx === -1) return [];

  const metrics: Metric[] = [];
  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r];
    if (cols.length === 1 && cols[0].trim() === "") continue; // blank line

    const rawKey = (cols[keyIdx] ?? "").trim();
    if (!isMetricKey(rawKey)) continue;

    const value = toNumber(cols[valueIdx]);
    if (value == null) continue;

    const previousValue =
      prevIdx !== -1 ? toNumber(cols[prevIdx]) : null;
    const deltaPct =
      previousValue != null && previousValue !== 0
        ? round1(((value - previousValue) / previousValue) * 100)
        : null;

    const rawFormat = formatIdx !== -1 ? (cols[formatIdx] ?? "").trim() : "";
    const format: MetricFormat = isMetricFormat(rawFormat)
      ? rawFormat
      : "number";

    const label =
      labelIdx !== -1 && (cols[labelIdx] ?? "").trim() !== ""
        ? cols[labelIdx].trim()
        : defaultLabel(rawKey);

    metrics.push({
      id: `metric_csv_${orgId}_${rawKey}_${r}`,
      orgId,
      key: rawKey,
      label,
      date: (cols[dateIdx] ?? "").trim(),
      value,
      previousValue,
      deltaPct,
      format,
      source: "csv",
    });
  }

  return metrics;
}

/* ------------------------------------------------------------------ */
/* Internal helpers                                                    */
/* ------------------------------------------------------------------ */

/** Minimal RFC-4180-ish CSV tokenizer (handles quotes and escaped quotes). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      pushField();
    } else if (c === "\n") {
      pushRow();
    } else if (c === "\r") {
      // swallow; handled by the \n that follows (or ignore lone \r)
    } else {
      field += c;
    }
  }
  // flush trailing field/row unless the text ended on a clean row break
  if (field !== "" || row.length > 0) pushRow();

  return rows;
}

function toNumber(raw: string | undefined): number | null {
  if (raw == null) return null;
  const cleaned = raw.trim().replace(/[$,%]/g, "").replace(/,/g, "");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function isMetricKey(v: string): v is MetricKey {
  return (METRIC_KEYS as readonly string[]).includes(v);
}

function isMetricFormat(v: string): v is MetricFormat {
  return (METRIC_FORMATS as readonly string[]).includes(v);
}

function defaultLabel(key: MetricKey): string {
  return key
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Exposed for callers that want the fixed ingest timestamp. */
export const CSV_INGESTED_AT = SYNC_NOW_ISO;
