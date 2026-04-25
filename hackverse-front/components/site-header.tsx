import Link from "next/link";

import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Product", href: "/" },
  { label: "Student", href: "/dashboard" },
  { label: "Impact", href: "/dashboard" },
  { label: "Admin", href: "/dashboard" },
];

export function SiteHeader({ isDashboard = false }: { isDashboard?: boolean }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="shell flex items-center justify-between py-3">
        <Link className="flex items-center gap-3 pl-2" href="/">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary font-display text-lg font-black tracking-[-0.1em] text-primary-foreground shadow-inner">
            CR
          </span>
          <span className="leading-tight">
            <span className="block font-black tracking-[-0.03em]">Campus Radar</span>
            <span className="hidden text-xs text-muted-foreground sm:block">
              Contextual connection engine
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
          {navItems.map((item, index) => (
            <Link
              className="rounded-full px-4 py-2 text-sm font-black text-muted-foreground transition hover:bg-accent hover:text-foreground"
              href={item.href}
              key={`${item.href}-${index}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {isDashboard ? (
          <Button asChild className="hidden sm:inline-flex" variant="outline">
            <Link href="/">Sign out</Link>
          </Button>
        ) : (
          <div className="hidden sm:flex sm:items-center sm:gap-2">
            <Button asChild variant="ghost" className="font-bold">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
