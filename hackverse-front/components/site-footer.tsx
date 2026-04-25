"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();

  if (pathname === "/dashboard") {
    return null;
  }

  return (
    <footer className="mt-20 border-t border-border/40 bg-background pb-8 pt-16">
      <div className="shell flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display text-xs font-black tracking-[-0.1em] text-primary-foreground shadow-inner">
            CR
          </span>
          <span className="text-sm">
            <span className="font-black tracking-[-0.03em]">Campus Radar</span> © {new Date().getFullYear()}
          </span>
        </div>
        <nav className="flex gap-4 text-sm font-medium text-muted-foreground">
          <Link href="/" className="transition hover:text-foreground">Product</Link>
          <Link href="/dashboard" className="transition hover:text-foreground">Student Demo</Link>
          <Link href="/login" className="transition hover:text-foreground">Log in</Link>
          <Link href="#" className="transition hover:text-foreground">Privacy & Terms</Link>
        </nav>
      </div>
    </footer>
  );
}
