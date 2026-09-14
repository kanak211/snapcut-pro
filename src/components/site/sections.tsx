import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  Brush,
  Building2,
  Code2,
  Download,
  Image as ImageIcon,
  Layers,
  Lock,
  Maximize2,
  MousePointerClick,
  Palette,
  PenTool,
  Printer,
  Scan,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  Upload,
  Users,
  Wand2,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  invert = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
  align?: "center" | "left";
  invert?: boolean;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
          <Sparkles className="size-3.5" /> {eyebrow}
        </span>
      )}
      <h2
        className={`mt-4 text-3xl font-extrabold sm:text-4xl ${invert ? "text-white" : "text-foreground"}`}
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-3 text-base ${invert ? "text-white/65" : "text-muted-foreground"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

const features = [
  {
    icon: Scan,
    title: "AI Background Removal",
    body: "Automatically detect and remove image backgrounds.",
  },
  { icon: Wand2, title: "Hair & Fur Detection", body: "Handle complex edges and fine details." },
  {
    icon: MousePointerClick,
    title: "One-Click Editing",
    body: "Get professional results with minimal effort.",
  },
  { icon: Brush, title: "Manual Touch-Up", body: "Erase or restore areas manually." },
  {
    icon: Palette,
    title: "Background Replacement",
    body: "Add colors, images, and professional templates.",
  },
  { icon: Layers, title: "Batch Processing", body: "Process multiple images simultaneously." },
  { icon: Maximize2, title: "High Resolution", body: "Export professional-quality images." },
  {
    icon: Trash2,
    title: "Privacy",
    body: "Automatically delete uploaded images after a defined period.",
  },
];

export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Features"
        title="Everything you need for clean cutouts"
        subtitle="Professional-grade tools wrapped in a workflow that takes seconds."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <article
            key={f.title}
            className="card-surface group p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-brand-gradient group-hover:text-white">
              <f.icon className="size-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const steps = [
  { no: "01", title: "Upload", body: "Upload your photo.", icon: Upload },
  {
    no: "02",
    title: "AI Removes Background",
    body: "SnapCut automatically detects the subject and removes the background.",
    icon: Sparkles,
  },
  {
    no: "03",
    title: "Download & Create",
    body: "Choose a new background or download your transparent PNG.",
    icon: Download,
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-navy py-20 text-navy-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          title={<span className="text-white">How it works</span>}
          subtitle="From raw photo to polished visual in three steps."
          invert
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <article
              key={s.no}
              className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur transition-colors hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <span className="text-4xl font-extrabold text-brand-gradient">{s.no}</span>
                <s.icon className="size-5 text-white/60" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-white/60">{s.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-white/70">
          {["Upload", "AI Processing", "Edit", "Export"].map((label, i) => (
            <span key={label} className="flex items-center gap-3">
              <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2">
                {label}
              </span>
              {i < 3 && <ArrowRight className="size-4 text-white/35" />}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

const audiences = [
  { icon: ShoppingBag, title: "E-commerce Sellers" },
  { icon: ImageIcon, title: "Content Creators" },
  { icon: Building2, title: "Real Estate Agents" },
  { icon: Users, title: "Small Businesses" },
  { icon: PenTool, title: "Designers" },
  { icon: Printer, title: "Print-on-Demand Sellers" },
  { icon: Code2, title: "Developers" },
];

export function TargetUsersSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Who it's for"
        title="Built for creators, sellers & businesses"
        subtitle="Teams of one or one thousand — SnapCut keeps every visual on brand."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {audiences.map((a) => (
          <article
            key={a.title}
            className="card-surface flex items-center gap-3 p-5 transition-transform hover:-translate-y-1"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white">
              <a.icon className="size-5" />
            </span>
            <h3 className="text-sm font-semibold">{a.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

const codeSample = `curl -X POST https://api.snapcut.ai/v1/remove \\
  -H "Authorization: Bearer sk_live_••••••••" \\
  -F "image=@product.jpg" \\
  -F "format=png" \\
  -F "resolution=2048"

{
  "id": "img_9fa2c7",
  "status": "completed",
  "quality": "excellent",
  "output_url": "https://cdn.snapcut.ai/img_9fa2c7.png"
}`;

export function ApiSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Developers"
            align="left"
            title="Bring SnapCut into your own app"
            subtitle="Use the SnapCut API to automatically remove image backgrounds directly from your applications and workflows."
          />
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild className="rounded-full bg-brand-gradient shadow-lift">
              <Link to="/api">Explore API</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/api">View Documentation</Link>
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-navy shadow-lift">
          <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3.5">
            <span className="size-3 rounded-full bg-[#ff5f57]" />
            <span className="size-3 rounded-full bg-[#febc2e]" />
            <span className="size-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 font-mono text-xs text-white/45">remove-background.sh</span>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed text-white/80">
            <code>{codeSample}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

const privacyPoints = [
  { icon: Lock, title: "Secure image uploads", body: "Every upload travels over encrypted TLS." },
  {
    icon: Boxes,
    title: "Temporary image storage",
    body: "Files live only as long as your job needs them.",
  },
  {
    icon: Trash2,
    title: "Automatic file deletion",
    body: "Processed images are purged on a fixed schedule.",
  },
  {
    icon: ShieldCheck,
    title: "Encrypted communication",
    body: "API and app traffic is encrypted end to end.",
  },
  {
    icon: Layers,
    title: "No unnecessary permanent storage",
    body: "We never keep what we don't need.",
  },
];

export function PrivacySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Privacy & security"
        title="Your images belong to you."
        subtitle="SnapCut is built so your content stays yours, start to finish."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {privacyPoints.map((p) => (
          <article key={p.title} className="card-surface p-6">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <p.icon className="size-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
      <div className="relative overflow-hidden rounded-4xl bg-brand-gradient px-8 py-14 text-center shadow-lift">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Remove Backgrounds. Create More.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/80">
          Start with 10 free images. No credit card required.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" variant="secondary" className="rounded-full">
            <Link to="/remove-background">Remove Background Now</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <Link to="/pricing">See Pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
