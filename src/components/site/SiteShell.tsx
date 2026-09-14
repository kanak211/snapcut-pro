import { Link } from "@tanstack/react-router";
import { Menu, Instagram, Linkedin } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Remove Background", to: "/remove-background" },
  { label: "Features", to: "/features" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Pricing", to: "/pricing" },
  { label: "API", to: "/api" },
] as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: link.to === "/" }}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground data-[status=active]:bg-secondary data-[status=active]:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Log In</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link to="/register">Sign Up</Link>
          </Button>
          <Button asChild size="sm" className="rounded-full bg-brand-gradient shadow-lift">
            <Link to="/remove-background">Start Creating</Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="outline" size="icon" className="rounded-full" aria-label="Open menu">
              <Menu className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-6">
            <div className="mt-6 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                <Button asChild variant="outline" className="rounded-full">
                  <Link to="/login" onClick={() => setOpen(false)}>
                    Log In
                  </Link>
                </Button>
                <Button asChild className="rounded-full bg-brand-gradient">
                  <Link to="/remove-background" onClick={() => setOpen(false)}>
                    Start Creating
                  </Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-white/60">Remove Backgrounds. Create More.</p>
          <div className="mt-6 flex gap-3">
            <a
              href="https://instagram.com"
              aria-label="Instagram"
              className="rounded-full border border-white/15 p-2.5 transition-colors hover:bg-white/10"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href="https://linkedin.com"
              aria-label="LinkedIn"
              className="rounded-full border border-white/15 p-2.5 transition-colors hover:bg-white/10"
            >
              <Linkedin className="size-4" />
            </a>
            <a
              href="https://x.com"
              aria-label="X"
              className="rounded-full border border-white/15 p-2.5 text-sm leading-4 transition-colors hover:bg-white/10"
            >
              <span className="block size-4 text-center font-semibold">X</span>
            </a>
          </div>
        </div>

        <FooterColumn
          title="Product"
          items={[
            { label: "Background Remover", to: "/remove-background" },
            { label: "Batch Processing", to: "/batch" },
            { label: "Templates", to: "/features" },
            { label: "Pricing", to: "/pricing" },
          ]}
        />
        <FooterColumn
          title="Company"
          items={[
            { label: "About", to: "/how-it-works" },
            { label: "Contact", to: "/pricing" },
            { label: "Privacy", to: "/privacy" },
            { label: "Terms", to: "/privacy" },
          ]}
        />
        <FooterColumn
          title="Developers"
          items={[
            { label: "API", to: "/api" },
            { label: "Documentation", to: "/api" },
            { label: "API Pricing", to: "/pricing" },
          ]}
        />
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-white/50">
        © 2026 SnapCut. All rights reserved.
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; to: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item.label}>
            <Link to={item.to} className="text-sm text-white/60 transition-colors hover:text-white">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
