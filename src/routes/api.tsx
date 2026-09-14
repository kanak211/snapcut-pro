import { createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "@/components/site/SiteShell";
import { ApiSection, CtaSection, PrivacySection } from "@/components/site/sections";

export const Route = createFileRoute("/api")({
  head: () => ({
    meta: [
      { title: "SnapCut API for Developers" },
      {
        name: "description",
        content:
          "Use the SnapCut API to automatically remove image backgrounds directly from your applications and workflows.",
      },
      { property: "og:title", content: "SnapCut API for Developers" },
      {
        property: "og:description",
        content: "A single REST call turns any product photo into a transparent PNG.",
      },
    ],
  }),
  component: () => (
    <SiteShell>
      <div className="pt-6" />
      <ApiSection />
      <PrivacySection />
      <CtaSection />
    </SiteShell>
  ),
});
