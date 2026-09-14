import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Download, Loader2, Pencil, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SiteShell } from "@/components/site/SiteShell";
import { Dropzone } from "@/components/tool/Dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getSegmenter, loadImage } from "@/lib/ai/segmentation";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/batch")({
  head: () => ({
    meta: [
      { title: "Batch Background Removal — SnapCut" },
      {
        name: "description",
        content: "Remove backgrounds in bulk: upload many images and download them all at once.",
      },
      { property: "og:title", content: "Batch Background Removal — SnapCut" },
      {
        property: "og:description",
        content: "Queue dozens of images and export transparent PNGs in one pass.",
      },
    ],
  }),
  component: BatchPage,
});

type Item = {
  id: string;
  name: string;
  originalUrl: string;
  status: "queued" | "processing" | "completed";
  resultUrl?: string;
};

function BatchPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [running, setRunning] = useState(false);

  const completed = items.filter((i) => i.status === "completed").length;

  const addFiles = (files: File[]) => {
    setItems((prev) => [
      ...prev,
      ...files.map((file, i) => ({
        id: `${Date.now()}-${i}-${file.name}`,
        name: file.name,
        originalUrl: URL.createObjectURL(file),
        status: "queued" as const,
      })),
    ]);
  };

  const processAll = async () => {
    setRunning(true);
    const segmenter = getSegmenter();
    for (const item of items) {
      if (item.status === "completed") continue;
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "processing" } : i)),
      );
      try {
        const img = await loadImage(item.originalUrl);
        const result = await segmenter.removeBackground(img);
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: "completed", resultUrl: result.cutoutUrl } : i,
          ),
        );
      } catch {
        setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "queued" } : i)));
      }
    }
    setRunning(false);
    toast.success("Batch complete");
  };

  const downloadOne = (item: Item) => {
    if (!item.resultUrl) return;
    const link = document.createElement("a");
    link.href = item.resultUrl;
    link.download = `${item.name.replace(/\.[^.]+$/, "")}-snapcut.png`;
    link.click();
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">
              Remove backgrounds <span className="text-brand-gradient">in bulk</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Drop a whole folder of product shots and let SnapCut work through the queue.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              className="rounded-full bg-brand-gradient shadow-lift"
              disabled={!items.length || running}
              onClick={processAll}
            >
              <Sparkles className="size-4" /> Process all
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              disabled={!completed}
              onClick={() => items.filter((i) => i.status === "completed").forEach(downloadOne)}
            >
              <Download className="size-4" /> Download All
            </Button>
          </div>
        </header>

        <Dropzone multiple compact onFiles={addFiles} />

        {items.length > 0 && (
          <>
            <div className="card-surface mt-6 p-5">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>
                  {completed} / {items.length} images processed
                </span>
                <span className="text-muted-foreground">
                  {Math.round((completed / items.length) * 100)}%
                </span>
              </div>
              <Progress value={(completed / items.length) * 100} className="mt-3" />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item) => (
                <article key={item.id} className="card-surface overflow-hidden">
                  <div
                    className={cn(
                      "relative aspect-square",
                      item.status === "completed" ? "checkerboard" : "bg-secondary",
                    )}
                  >
                    <img
                      src={item.resultUrl ?? item.originalUrl}
                      alt={item.name}
                      className="size-full object-contain"
                    />
                    {item.status === "processing" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-navy/70 text-white">
                        <Loader2 className="size-6 animate-spin" />
                        <span className="text-xs font-medium">AI is removing the background…</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
                      {item.status === "completed" ? (
                        <>
                          <CheckCircle2 className="size-3.5 text-emerald-600" /> Completed
                        </>
                      ) : (
                        item.status
                      )}
                    </p>
                    {item.status === "completed" && (
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 rounded-lg"
                          onClick={() => window.open(item.resultUrl, "_blank")}
                        >
                          <Pencil className="size-3.5" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 rounded-lg bg-brand-gradient"
                          onClick={() => downloadOne(item)}
                        >
                          <Download className="size-3.5" /> Save
                        </Button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {items.length === 0 && (
          <div className="mt-10 text-center text-sm text-muted-foreground">
            No images queued yet — drop up to 50 files above to get started.
          </div>
        )}
      </div>
    </SiteShell>
  );
}
