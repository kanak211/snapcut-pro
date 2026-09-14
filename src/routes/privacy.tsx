import { createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "@/components/site/SiteShell";
import { CtaSection, PrivacySection } from "@/components/site/sections";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy & Security — SnapCut" },
      {
        name: "description",
        content:
          "Secure uploads, temporary storage, automatic deletion and encrypted communication. Your images belong to you.",
      },
      { property: "og:title", content: "Privacy & Security — SnapCut" },
      { property: "og:description", content: "Your images belong to you." },
    ],
  }),
  component: () => (
    <SiteShell>
      <div className="pt-6" />
      <PrivacySection />
      <CtaSection />
    </SiteShell>
  ),
});
