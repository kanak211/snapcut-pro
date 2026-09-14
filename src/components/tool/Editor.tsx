import {
  Brush,
  CheckCircle2,
  Download,
  Eraser,
  Image as ImageIcon,
  Palette,
  RefreshCw,
  Redo2,
  RotateCcw,
  Sparkles,
  Undo2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  backgroundCss,
  paintBackground,
  presetTemplates,
  type BackgroundChoice,
} from "@/components/tool/backgrounds";
import { loadImage, qualityLabel } from "@/lib/ai/segmentation";
import { cn } from "@/lib/utils";

export type EditorSource = {
  name: string;
  originalUrl: string;
  cutoutUrl: string;
  width: number;
  height: number;
  confidence: number;
};

type Tool = "erase" | "restore";

export function Editor({ source, onReset }: { source: EditorSource; onReset: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalRef = useRef<HTMLImageElement | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const futureRef = useRef<ImageData[]>([]);
  const drawing = useRef(false);

  const [view, setView] = useState<"original" | "result">("result");
  const [tool, setTool] = useState<Tool>("erase");
  const [brush, setBrush] = useState(40);
  const [background, setBackground] = useState<BackgroundChoice>({ kind: "transparent" });
  const [solid, setSolid] = useState("#FFFFFF");
  const [format, setFormat] = useState<"png" | "jpg">("png");
  const [resolution, setResolution] = useState<"original" | "1080" | "2048" | "4096">("original");
  const [ready, setReady] = useState(false);
  const [historyTick, setHistoryTick] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const [cutout, original] = await Promise.all([
        loadImage(source.cutoutUrl),
        loadImage(source.originalUrl),
      ]);
      if (!active) return;
      originalRef.current = original;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = source.width;
      canvas.height = source.height;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(cutout, 0, 0, canvas.width, canvas.height);
      historyRef.current = [];
      futureRef.current = [];
      setHistoryTick((t) => t + 1);
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [source]);

  const snapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (historyRef.current.length > 25) historyRef.current.shift();
    futureRef.current = [];
    setHistoryTick((t) => t + 1);
  }, []);

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const paint = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const scale = canvas.width / canvas.getBoundingClientRect().width;
    const radius = (brush * scale) / 2;

    ctx.save();
    if (tool === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (originalRef.current) {
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(originalRef.current, 0, 0, canvas.width, canvas.height);
    }
    ctx.restore();
  };

  const undo = () => {
    const canvas = canvasRef.current;
    const prev = historyRef.current.pop();
    if (!canvas || !prev) return;
    const ctx = canvas.getContext("2d")!;
    futureRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.putImageData(prev, 0, 0);
    setHistoryTick((t) => t + 1);
  };

  const redo = () => {
    const canvas = canvasRef.current;
    const next = futureRef.current.pop();
    if (!canvas || !next) return;
    const ctx = canvas.getContext("2d")!;
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.putImageData(next, 0, 0);
    setHistoryTick((t) => t + 1);
  };

  const resetMask = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cutout = await loadImage(source.cutoutUrl);
    const ctx = canvas.getContext("2d")!;
    snapshot();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(cutout, 0, 0, canvas.width, canvas.height);
    toast.success("Edits reset");
  };

  const download = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const target =
      resolution === "original" ? Math.max(source.width, source.height) : Number(resolution);
    const scale = target / Math.max(source.width, source.height);
    const out = document.createElement("canvas");
    out.width = Math.round(source.width * scale);
    out.height = Math.round(source.height * scale);
    const ctx = out.getContext("2d")!;

    const effective: BackgroundChoice =
      format === "jpg" && background.kind === "transparent"
        ? { kind: "color", value: "#FFFFFF" }
        : background;
    await paintBackground(ctx, effective, out.width, out.height);
    ctx.drawImage(canvas, 0, 0, out.width, out.height);

    const link = document.createElement("a");
    link.download = `${source.name.replace(/\.[^.]+$/, "")}-snapcut.${format}`;
    link.href = out.toDataURL(format === "png" ? "image/png" : "image/jpeg", 0.92);
    link.click();
    toast.success("Download started — 1 image credit used");
  };

  const bg = useMemo(() => backgroundCss(background), [background]);
  const canUndo = historyRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;
  void historyTick;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs value={view} onValueChange={(v) => setView(v as "original" | "result")}>
            <TabsList className="rounded-full">
              <TabsTrigger value="original" className="rounded-full px-5">
                Original
              </TabsTrigger>
              <TabsTrigger value="result" className="rounded-full px-5">
                Result
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 font-medium text-emerald-600">
              <CheckCircle2 className="size-4" /> Background removed successfully
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 font-medium text-accent-foreground">
              <Sparkles className="size-4" /> AI Quality: {qualityLabel(source.confidence)}
            </span>
          </div>
        </div>

        <div className="card-surface overflow-hidden p-3">
          <div
            className={cn(
              "relative flex items-center justify-center overflow-hidden rounded-2xl",
              background.kind === "transparent" && view === "result" && "checkerboard",
            )}
            style={
              view === "result" && background.kind !== "transparent"
                ? background.kind === "image"
                  ? { background: bg }
                  : { background: bg }
                : undefined
            }
          >
            <img
              src={source.originalUrl}
              alt="Original"
              className={cn("max-h-[62vh] w-auto", view === "result" && "hidden")}
            />
            <canvas
              ref={canvasRef}
              onPointerDown={(e) => {
                if (view !== "result") return;
                drawing.current = true;
                e.currentTarget.setPointerCapture(e.pointerId);
                snapshot();
                const p = pointFromEvent(e);
                paint(p.x, p.y);
              }}
              onPointerMove={(e) => {
                if (!drawing.current) return;
                const p = pointFromEvent(e);
                paint(p.x, p.y);
              }}
              onPointerUp={() => {
                drawing.current = false;
              }}
              className={cn(
                "max-h-[62vh] w-auto touch-none",
                view === "original" && "hidden",
                tool === "erase" ? "cursor-crosshair" : "cursor-cell",
                !ready && "opacity-0",
              )}
            />
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <Panel title="Manual touch-up" icon={<Brush className="size-4" />}>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={tool === "erase" ? "default" : "outline"}
              className={cn("rounded-xl", tool === "erase" && "bg-brand-gradient")}
              onClick={() => setTool("erase")}
            >
              <Eraser className="size-4" /> Erase
            </Button>
            <Button
              variant={tool === "restore" ? "default" : "outline"}
              className={cn("rounded-xl", tool === "restore" && "bg-brand-gradient")}
              onClick={() => setTool("restore")}
            >
              <RefreshCw className="size-4" /> Restore
            </Button>
          </div>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <Label>Brush size</Label>
              <span className="font-medium text-muted-foreground">{brush}px</span>
            </div>
            <Slider
              value={[brush]}
              min={10}
              max={100}
              step={1}
              onValueChange={([v]) => setBrush(v ?? 40)}
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Button variant="outline" className="rounded-xl" onClick={undo} disabled={!canUndo}>
              <Undo2 className="size-4" /> Undo
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={redo} disabled={!canRedo}>
              <Redo2 className="size-4" /> Redo
            </Button>
            <Button variant="outline" className="rounded-xl" onClick={resetMask}>
              <RotateCcw className="size-4" /> Reset
            </Button>
          </div>
        </Panel>

        <Panel title="Background" icon={<Palette className="size-4" />}>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={background.kind === "transparent" ? "default" : "outline"}
              className={cn(
                "rounded-xl",
                background.kind === "transparent" && "bg-brand-gradient",
              )}
              onClick={() => setBackground({ kind: "transparent" })}
            >
              Transparent
            </Button>
            <Button
              variant={background.kind === "color" ? "default" : "outline"}
              className={cn("rounded-xl", background.kind === "color" && "bg-brand-gradient")}
              onClick={() => setBackground({ kind: "color", value: solid })}
            >
              Solid Color
            </Button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <input
              type="color"
              value={solid}
              onChange={(e) => {
                setSolid(e.target.value);
                setBackground({ kind: "color", value: e.target.value });
              }}
              className="h-10 w-14 cursor-pointer rounded-lg border border-border bg-card"
              aria-label="Pick a solid background color"
            />
            <label className="flex-1">
              <span className="sr-only">Custom background image</span>
              <Input
                type="file"
                accept="image/*"
                className="cursor-pointer text-xs"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file)
                    setBackground({ kind: "image", value: URL.createObjectURL(file) });
                }}
              />
            </label>
          </div>

          <p className="mt-4 mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Preset templates
          </p>
          <div className="grid grid-cols-4 gap-2">
            {presetTemplates.map((preset) => (
              <button
                key={preset.id}
                type="button"
                title={preset.label}
                onClick={() => setBackground(preset.choice)}
                className="group flex flex-col items-center gap-1"
              >
                <span
                  className="block h-10 w-full rounded-lg border border-border transition-transform group-hover:scale-105"
                  style={{ background: preset.swatch }}
                />
                <span className="text-[10px] leading-tight text-muted-foreground">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Export" icon={<ImageIcon className="size-4" />}>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={format === "png" ? "default" : "outline"}
              className={cn("rounded-xl", format === "png" && "bg-brand-gradient")}
              onClick={() => setFormat("png")}
            >
              PNG · transparent
            </Button>
            <Button
              variant={format === "jpg" ? "default" : "outline"}
              className={cn("rounded-xl", format === "jpg" && "bg-brand-gradient")}
              onClick={() => setFormat("jpg")}
            >
              JPG · background
            </Button>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {(["original", "1080", "2048", "4096"] as const).map((res) => (
              <Button
                key={res}
                size="sm"
                variant={resolution === res ? "secondary" : "ghost"}
                className="rounded-lg text-xs"
                onClick={() => setResolution(res)}
              >
                {res === "original" ? "Original" : `${res}px`}
              </Button>
            ))}
          </div>
          <Button className="mt-4 w-full rounded-xl bg-brand-gradient shadow-lift" onClick={download}>
            <Download className="size-4" /> Download Image
          </Button>
          <Button variant="outline" className="mt-2 w-full rounded-xl" onClick={onReset}>
            Edit Again
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">1 image credit used</p>
        </Panel>
      </aside>
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card-surface p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <span className="flex size-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
          {icon}
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}
