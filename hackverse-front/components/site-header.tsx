"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useI18n } from "@/lib/i18n-context";
import { cn } from "@/lib/utils";

const navItems: { label: string; href: string }[] = [];

export function SiteHeader({ isDashboard = false }: { isDashboard?: boolean }) {
  const { language, setLanguage, t } = useI18n();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="shell flex items-center justify-between py-3">
        <Link className="flex items-center gap-3 pl-2" href="/">
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white shadow-inner ring-1 ring-border/40">
            <Image 
              src="/logo.jpg" 
              alt="Campus Radar Logo" 
              fill 
              className="object-cover p-1"
            />
          </div>
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

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 rounded-full bg-muted/30 p-1 ring-1 ring-border/40">
            <button 
              onClick={() => setLanguage("en")}
              className={cn(
                "rounded-full px-2 py-1 text-[10px] font-black transition-all",
                language === "en" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage("fr")}
              className={cn(
                "rounded-full px-2 py-1 text-[10px] font-black transition-all",
                language === "fr" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              FR
            </button>
          </div>

          {isDashboard ? (
            <Button asChild className="hidden sm:inline-flex" variant="outline">
              <Link href="/">Sign out</Link>
            </Button>
          ) : (
            <div className="hidden sm:flex sm:items-center sm:gap-2">
              <Button asChild variant="ghost" className="font-bold">
                <Link href="/login">{t("logIn")}</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">{t("signUp")}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
