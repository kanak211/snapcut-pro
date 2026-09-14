import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import { useState } from "react";

import beforeImg from "@/assets/demo-before.jpg";
import afterImg from "@/assets/demo-after.png";
import { Dropzone } from "@/components/tool/Dropzone";
import { SiteShell } from "@/components/site/SiteShell";
import {
  ApiSection,
  CtaSection,
  FeaturesSection,
  HowItWorksSection,
  PrivacySection,
  TargetUsersSection,
} from "@/components/site/sections";
import { Button } from "@/components/ui/button";
import { stageFiles } from "@/lib/upload-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SnapCut — Remove Backgrounds. Create More." },
      {
        name: "description",
        content:
          "SnapCut uses AI to instantly remove backgrounds from your images and create professional, ready-to-use visuals in seconds.",
      },
      { property: "og:title", content: "SnapCut — Remove Backgrounds. Create More." },
      {
        property: "og:description",
        content: "AI background removal, manual touch-up, background templates and batch exports.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [view, setView] = useState<"before" | "after">("after");

  return (
    <SiteShell>
      <section className="relative overflow-hidden">
        <div className="glow-orb top-[-120px] left-[-80px] size-[420px] bg-[#287BFF]" />
        <div className="glow-orb top-[80px] right-[-100px] size-[380px] bg-[#6D3DF5]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-16 pb-20 sm:px-6 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" /> AI background removal in seconds
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] sm:text-6xl">
              Remove Backgrounds.
              <br />
              <span className="text-brand-gradient">Create More.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              SnapCut uses AI to instantly remove backgrounds from your images and create
              professional, ready-to-use visuals in seconds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-brand-gradient shadow-lift">
                <Link to="/remove-background">
                  Remove Background Now <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/how-it-works">
                  <PlayCircle className="size-4" /> See How It Works
                </Link>
              </Button>
            </div>

            <div className="mt-10">
              <Dropzone
                onFiles={(files) => {
                  stageFiles(files);
                  navigate({ to: "/remove-background" });
                }}
              />
            </div>
          </div>

          <div className="relative">
            <div className="card-surface animate-float overflow-hidden p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">AI cutout preview</p>
                <div className="flex rounded-full bg-secondary p-1 text-xs font-medium">
                  {(["before", "after"] as const).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setView(key)}
                      className={cn(
                        "rounded-full px-3 py-1.5 capitalize transition-colors",
                        view === key
                          ? "bg-brand-gradient text-white"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
              <div
                className={cn(
                  "overflow-hidden rounded-2xl",
                  view === "after" ? "checkerboard" : "bg-secondary",
                )}
              >
                <img
                  src={view === "after" ? afterImg : beforeImg}
                  alt={
                    view === "after"
                      ? "Portrait with the background removed on a transparent checkerboard"
                      : "Original portrait with a gray studio background"
                  }
                  width={912}
                  height={1104}
                  className="mx-auto max-h-[520px] w-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturesSection />
      <HowItWorksSection />
      <TargetUsersSection />
      <ApiSection />
      <PrivacySection />
      <CtaSection />
    </SiteShell>
  );
}
