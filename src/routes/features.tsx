import { createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "@/components/site/SiteShell";
import { CtaSection, FeaturesSection, PrivacySection } from "@/components/site/sections";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — SnapCut AI Background Remover" },
      {
        name: "description",
        content:
          "Hair and fur detection, manual touch-up, background replacement, batch processing and high-resolution exports.",
      },
      { property: "og:title", content: "Features — SnapCut" },
      {
        property: "og:description",
        content: "Everything SnapCut gives you for clean, professional cutouts.",
      },
    ],
  }),
  component: () => (
    <SiteShell>
      <div className="pt-10" />
      <FeaturesSection />
      <PrivacySection />
      <CtaSection />
    </SiteShell>
  ),
});
