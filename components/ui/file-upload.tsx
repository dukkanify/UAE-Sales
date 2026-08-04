"use client";

import * as React from "react";
import { Upload, X, FileIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  disabled?: boolean;
  className?: string;
  onFilesChange?: (files: File[]) => void;
}

function FileUpload({
  accept,
  multiple = false,
  maxSizeMb = 10,
  disabled,
  className,
  onFilesChange,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [files, setFiles] = React.useState<File[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const processFiles = (incoming: FileList | File[]) => {
    const list = Array.from(incoming);
    const maxBytes = maxSizeMb * 1024 * 1024;
    const valid = list.filter((file) => file.size <= maxBytes);

    if (valid.length !== list.length) {
      setError(`Some files exceed the ${maxSizeMb}MB limit and were skipped.`);
    } else {
      setError(null);
    }

    setFiles((prev) => {
      const next = multiple ? [...prev, ...valid] : valid.slice(0, 1);
      onFilesChange?.(next);
      return next;
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      onFilesChange?.(next);
      return next;
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card px-6 py-10 text-center transition-colors",
          isDragging && "border-accent bg-accent/5",
          disabled && "pointer-events-none opacity-50",
        )}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files);
        }}
      >
        <Upload className="mb-3 h-8 w-8 text-accent" />
        <p className="text-sm font-medium text-foreground">
          Drop files here or click to upload
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Max {maxSizeMb}MB per file</p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files?.length) processFiles(e.target.files);
          }}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {files.length > 0 ? (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm">{file.name}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => removeFile(index)}
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export { FileUpload };
