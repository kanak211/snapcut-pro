export type BackgroundChoice =
  | { kind: "transparent" }
  | { kind: "color"; value: string }
  | { kind: "gradient"; value: string; css: string }
  | { kind: "image"; value: string };

export const presetTemplates: {
  id: string;
  label: string;
  choice: BackgroundChoice;
  swatch: string;
}[] = [
  {
    id: "amazon-white",
    label: "Amazon White",
    choice: { kind: "color", value: "#FFFFFF" },
    swatch: "#FFFFFF",
  },
  {
    id: "studio-gray",
    label: "Studio Gray",
    choice: { kind: "color", value: "#E9ECF3" },
    swatch: "#E9ECF3",
  },
  {
    id: "soft-gradient",
    label: "Soft Gradient",
    choice: {
      kind: "gradient",
      value: "#287BFF|#6D3DF5",
      css: "linear-gradient(135deg, #287BFF, #6D3DF5)",
    },
    swatch: "linear-gradient(135deg, #287BFF, #6D3DF5)",
  },
  {
    id: "office",
    label: "Office",
    choice: {
      kind: "gradient",
      value: "#DCE3F0|#AFC0DA",
      css: "linear-gradient(160deg, #DCE3F0, #AFC0DA)",
    },
    swatch: "linear-gradient(160deg, #DCE3F0, #AFC0DA)",
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    choice: {
      kind: "gradient",
      value: "#FFFFFF|#EDF1FA",
      css: "linear-gradient(180deg, #FFFFFF, #EDF1FA)",
    },
    swatch: "linear-gradient(180deg, #FFFFFF, #EDF1FA)",
  },
  {
    id: "social",
    label: "Social Media",
    choice: {
      kind: "gradient",
      value: "#8B5CF6|#3B82F6",
      css: "linear-gradient(135deg, #8B5CF6, #3B82F6)",
    },
    swatch: "linear-gradient(135deg, #8B5CF6, #3B82F6)",
  },
  {
    id: "professional",
    label: "Professional",
    choice: {
      kind: "gradient",
      value: "#10152F|#050824",
      css: "linear-gradient(135deg, #10152F, #050824)",
    },
    swatch: "linear-gradient(135deg, #10152F, #050824)",
  },
  {
    id: "minimal",
    label: "Minimal",
    choice: { kind: "color", value: "#F7F8FC" },
    swatch: "#F7F8FC",
  },
];

export function backgroundCss(choice: BackgroundChoice): string | undefined {
  switch (choice.kind) {
    case "color":
      return choice.value;
    case "gradient":
      return choice.css;
    case "image":
      return `center / cover no-repeat url(${choice.value})`;
    default:
      return undefined;
  }
}

/** Paints the chosen background onto an export canvas. */
export async function paintBackground(
  ctx: CanvasRenderingContext2D,
  choice: BackgroundChoice,
  width: number,
  height: number,
) {
  if (choice.kind === "transparent") return;
  if (choice.kind === "color") {
    ctx.fillStyle = choice.value;
    ctx.fillRect(0, 0, width, height);
    return;
  }
  if (choice.kind === "gradient") {
    const [from, to] = choice.value.split("|");
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, from ?? "#287BFF");
    grad.addColorStop(1, to ?? "#6D3DF5");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    return;
  }
  await new Promise<void>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const scale = Math.max(width / img.width, height / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (width - w) / 2, (height - h) / 2, w, h);
      resolve();
    };
    img.onerror = () => resolve();
    img.src = choice.value;
  });
}
