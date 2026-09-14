import { ImagePlus, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

import { cn } from "@/lib/utils";

const ACCEPT = "image/png,image/jpeg,image/jpg,image/webp";
const MAX_BYTES = 20 * 1024 * 1024;

export function filterValidImages(files: File[]) {
  return files.filter((f) => f.type.startsWith("image/") && f.size <= MAX_BYTES);
}

export function Dropzone({
  multiple = false,
  onFiles,
  compact = false,
  className,
}: {
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  compact?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handle = (list: FileList | null) => {
    if (!list) return;
    const files = filterValidImages(Array.from(list));
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handle(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed border-border bg-card text-center transition-all duration-300 hover:border-primary/60 hover:shadow-lift",
        dragging && "scale-[1.01] border-primary bg-accent/40",
        compact ? "px-6 py-8" : "px-6 py-14",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "var(--gradient-brand-soft)" }}
      />
      <div className="relative flex flex-col items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lift">
          {compact ? <ImagePlus className="size-6" /> : <UploadCloud className="size-7" />}
        </div>
        <p className="text-lg font-semibold">
          {multiple ? "Drop your images here" : "Drop your image here"}
        </p>
        <p className="text-sm text-muted-foreground">or choose an image from your device</p>
        <p className="text-xs font-medium text-muted-foreground/80">
          PNG, JPG, JPEG, WEBP • Up to 20 MB
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
