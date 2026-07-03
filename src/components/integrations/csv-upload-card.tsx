"use client";

import { useRef, useState } from "react";
import { FileUp, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/**
 * CSV upload card — lets an operator drop a spreadsheet of metrics when a
 * source has no native integration. In mock mode the "upload" is simulated
 * locally (no persistence); a real uploadCsv action would replace the timeout.
 */
export function CsvUploadCard() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  function pick() {
    inputRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : null);
  }

  function clearFile() {
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function upload() {
    if (!fileName) return;
    setUploading(true);
    // Mock upload — a real uploadCsv(orgId, file) server action would run here.
    await new Promise((resolve) => setTimeout(resolve, 700));
    setUploading(false);
    toast.success(`Imported ${fileName}`);
    clearFile();
  }

  return (
    <div className="flex min-h-[184px] flex-col justify-between gap-4 rounded-lg border border-border bg-card p-5">
      <div className="flex flex-col gap-3.5">
        <div className="flex flex-row items-start justify-between gap-2">
          <div className="flex size-11 items-center justify-center rounded-md border border-border bg-surface-subtle">
            <FileUp className="size-[22px] text-foreground" strokeWidth={1.75} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-base font-semibold leading-none text-foreground">
            CSV upload
          </p>
          <p className="text-[13px] leading-[18px] text-muted-foreground">
            Import metrics from a spreadsheet when there&rsquo;s no live source.
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={onFileChange}
      />

      {fileName ? (
        <div className="flex flex-row items-center justify-between gap-3">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-text-tertiary">
            <button
              type="button"
              onClick={clearFile}
              className="shrink-0 rounded-sm text-text-tertiary transition-colors hover:text-foreground"
              aria-label="Remove file"
            >
              <X className="size-3.5" />
            </button>
            <span className="truncate">{fileName}</span>
          </span>
          <Button size="sm" onClick={upload} disabled={uploading}>
            {uploading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Upload className="size-3.5" />
            )}
            {uploading ? "Importing…" : "Import"}
          </Button>
        </div>
      ) : (
        <Button variant="outline" className="w-full" onClick={pick}>
          <Upload className="size-3.5" />
          Choose CSV file
        </Button>
      )}
    </div>
  );
}
