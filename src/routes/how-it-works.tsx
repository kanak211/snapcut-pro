import { createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "@/components/site/SiteShell";
import { CtaSection, HowItWorksSection, TargetUsersSection } from "@/components/site/sections";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — SnapCut" },
      {
        name: "description",
        content:
          "Upload, let the AI remove the background, then download or replace it — three steps from photo to polished visual.",
      },
      { property: "og:title", content: "How It Works — SnapCut" },
      {
        property: "og:description",
        content: "Upload → AI Processing → Edit → Export.",
      },
    ],
  }),
  component: () => (
    <SiteShell>
      <div className="pt-4" />
      <HowItWorksSection />
      <TargetUsersSection />
      <CtaSection />
    </SiteShell>
  ),
});
