import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteShell } from "@/components/site/SiteShell";
import { Dropzone } from "@/components/tool/Dropzone";
import { Editor, type EditorSource } from "@/components/tool/Editor";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getSegmenter, loadImage } from "@/lib/ai/segmentation";
import { takeStagedFiles } from "@/lib/upload-store";

export const Route = createFileRoute("/remove-background")({
  head: () => ({
    meta: [
      { title: "AI Background Remover — SnapCut" },
      {
        name: "description",
        content:
          "Upload an image and let SnapCut's AI remove the background, then touch up, replace the background and export.",
      },
      { property: "og:title", content: "AI Background Remover — SnapCut" },
      {
        property: "og:description",
        content: "Drag, drop and get a transparent PNG in seconds.",
      },
    ],
  }),
  component: RemoveBackgroundPage,
});

type Stage = "upload" | "processing" | "editor";

function RemoveBackgroundPage() {
  const [stage, setStage] = useState<Stage>("upload");
  const [queue, setQueue] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [source, setSource] = useState<EditorSource | null>(null);

  useEffect(() => {
    const staged = takeStagedFiles();
    if (staged.length) setQueue(staged);
  }, []);

  const run = async (file: File) => {
    setStage("processing");
    setProgress(8);
    try {
      const originalUrl = URL.createObjectURL(file);
      const img = await loadImage(originalUrl);
      const result = await getSegmenter().removeBackground(img, setProgress);
      setSource({
        name: file.name,
        originalUrl,
        cutoutUrl: result.cutoutUrl,
        width: result.width,
        height: result.height,
        confidence: result.confidence,
      });
      setStage("editor");
      toast.success("Background removed successfully");
    } catch {
      toast.error("We couldn't process that image. Try another one.");
      setStage("upload");
    }
  };

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold sm:text-4xl">
            AI <span className="text-brand-gradient">Background Remover</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Upload one image or several, let the AI do the cutting, then refine and export.
          </p>
        </header>

        {stage === "upload" && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Dropzone multiple onFiles={(files) => setQueue((q) => [...q, ...files])} />

            <aside className="card-surface p-5">
              <h2 className="text-sm font-semibold">Uploaded images</h2>
              {queue.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Nothing here yet. Your uploads will preview in this panel.
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {queue.map((file, i) => (
                    <li key={`${file.name}-${i}`} className="flex items-center gap-3">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="size-12 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${file.name}`}
                        onClick={() => setQueue((q) => q.filter((_, idx) => idx !== i))}
                        className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
                      >
                        <X className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <Button
                className="mt-5 w-full rounded-xl bg-brand-gradient shadow-lift"
                disabled={queue.length === 0}
                onClick={() => queue[0] && run(queue[0])}
              >
                <Sparkles className="size-4" /> Start AI background removal
              </Button>
              {queue.length > 1 && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {queue.length} images queued — the first opens in the editor, the rest are
                  perfect for batch processing.
                </p>
              )}
            </aside>
          </div>
        )}

        {stage === "processing" && (
          <div className="card-surface mx-auto max-w-lg p-10 text-center">
            <div className="relative mx-auto flex size-20 items-center justify-center rounded-3xl bg-brand-gradient text-white shadow-lift">
              <Loader2 className="size-8 animate-spin" />
            </div>
            <h2 className="mt-6 text-xl font-bold">AI is removing the background...</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Detecting the subject and refining fine edges.
            </p>
            <Progress value={progress} className="mt-6" />
            <p className="mt-2 text-xs font-medium text-muted-foreground">{progress}%</p>
          </div>
        )}

        {stage === "editor" && source && (
          <Editor
            source={source}
            onReset={() => {
              setSource(null);
              setQueue([]);
              setStage("upload");
            }}
          />
        )}
      </div>
    </SiteShell>
  );
}
