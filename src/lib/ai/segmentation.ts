/**
 * Modular AI segmentation layer.
 *
 * The app talks to the `Segmenter` interface only, so a real matting model
 * (U^2-Net, MODNet, BiRefNet, or a server-side GPU endpoint) can be plugged in
 * later by implementing `Segmenter` and registering it in `getSegmenter()`.
 */

export type SegmentationResult = {
  /** RGBA mask-applied image as a data URL (transparent background). */
  cutoutUrl: string;
  width: number;
  height: number;
  /** 0..1 confidence used for the "AI Quality" indicator. */
  confidence: number;
};

export interface Segmenter {
  readonly name: string;
  removeBackground(
    source: HTMLImageElement,
    onProgress?: (pct: number) => void,
  ): Promise<SegmentationResult>;
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

const MAX_EDGE = 1600;

function fitCanvas(img: HTMLImageElement) {
  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, ctx, width, height };
}

/**
 * Local, dependency-free matting approximation. Flood fills from the image
 * border across colour-similar pixels, then feathers the resulting edge.
 * Good enough for the prototype; swap for a real model in production.
 */
export class LocalHeuristicSegmenter implements Segmenter {
  readonly name = "snapcut-local-v1";

  async removeBackground(
    source: HTMLImageElement,
    onProgress?: (pct: number) => void,
  ): Promise<SegmentationResult> {
    const { canvas, ctx, width, height } = fitCanvas(source);
    const image = ctx.getImageData(0, 0, width, height);
    const data = image.data;
    const total = width * height;

    onProgress?.(15);
    await frame();

    // Estimate background tone from the border ring.
    let br = 0;
    let bg = 0;
    let bb = 0;
    let count = 0;
    for (let x = 0; x < width; x++) {
      for (const y of [0, height - 1]) {
        const i = (y * width + x) * 4;
        br += data[i]!;
        bg += data[i + 1]!;
        bb += data[i + 2]!;
        count++;
      }
    }
    for (let y = 0; y < height; y++) {
      for (const x of [0, width - 1]) {
        const i = (y * width + x) * 4;
        br += data[i]!;
        bg += data[i + 1]!;
        bb += data[i + 2]!;
        count++;
      }
    }
    br /= count;
    bg /= count;
    bb /= count;

    onProgress?.(35);
    await frame();

    const tolerance = 46;
    const visited = new Uint8Array(total);
    const alpha = new Float32Array(total).fill(1);
    const stack: number[] = [];

    const push = (idx: number) => {
      if (!visited[idx]) {
        visited[idx] = 1;
        stack.push(idx);
      }
    };

    for (let x = 0; x < width; x++) {
      push(x);
      push((height - 1) * width + x);
    }
    for (let y = 0; y < height; y++) {
      push(y * width);
      push(y * width + width - 1);
    }

    let removed = 0;
    while (stack.length) {
      const idx = stack.pop()!;
      const i = idx * 4;
      const dist = Math.sqrt(
        (data[i]! - br) ** 2 + (data[i + 1]! - bg) ** 2 + (data[i + 2]! - bb) ** 2,
      );
      if (dist > tolerance) continue;
      alpha[idx] = 0;
      removed++;
      const x = idx % width;
      const y = (idx / width) | 0;
      if (x > 0) push(idx - 1);
      if (x < width - 1) push(idx + 1);
      if (y > 0) push(idx - width);
      if (y < height - 1) push(idx + width);
    }

    onProgress?.(70);
    await frame();

    // Feather the mask so edges (hair, fur) look soft rather than jagged.
    const blurred = new Float32Array(total);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= height) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            if (xx < 0 || xx >= width) continue;
            sum += alpha[yy * width + xx]!;
            n++;
          }
        }
        blurred[y * width + x] = sum / n;
      }
    }

    for (let idx = 0; idx < total; idx++) {
      data[idx * 4 + 3] = Math.round(Math.min(1, Math.max(0, blurred[idx]!)) * 255);
    }

    ctx.putImageData(image, 0, 0);
    onProgress?.(95);
    await frame();

    const ratio = removed / total;
    // Confidence drops when almost nothing or almost everything was removed.
    const confidence = ratio > 0.08 && ratio < 0.92 ? 0.93 : 0.68;

    onProgress?.(100);
    return {
      cutoutUrl: canvas.toDataURL("image/png"),
      width,
      height,
      confidence,
    };
  }
}

function frame() {
  return new Promise((r) => setTimeout(r, 16));
}

let segmenter: Segmenter = new LocalHeuristicSegmenter();

export function getSegmenter(): Segmenter {
  return segmenter;
}

/** Register a production model (server GPU inference, WASM model, etc.). */
export function setSegmenter(next: Segmenter) {
  segmenter = next;
}

export function qualityLabel(confidence: number) {
  if (confidence >= 0.9) return "Excellent";
  if (confidence >= 0.75) return "Good";
  return "Fair";
}
