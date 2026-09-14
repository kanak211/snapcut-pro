import { Link } from "@tanstack/react-router";
import logo from "@/assets/snapcut-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = 36,
  withWordmark = true,
}: {
  className?: string;
  size?: number;
  withWordmark?: boolean;
}) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)} aria-label="SnapCut home">
      <img
        src={logo.url}
        alt="SnapCut logo"
        width={size}
        height={size}
        className="rounded-xl shadow-soft"
        style={{ width: size, height: size }}
      />
      {withWordmark && (
        <span className="text-lg font-extrabold tracking-tight">
          Snap<span className="text-brand-gradient">Cut</span>
        </span>
      )}
    </Link>
  );
}
