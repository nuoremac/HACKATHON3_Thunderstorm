"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n-context";

export function SiteFooter() {
  const pathname = usePathname();
  const { t } = useI18n();

  if (pathname === "/dashboard") {
    return null;
  }

  return (
    <footer className="mt-20 border-t border-border/40 bg-background pb-8 pt-16">
      <div className="shell flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-white shadow-inner ring-1 ring-border/40">
            <Image 
              src="/logo.jpg" 
              alt="Campus Radar Logo" 
              fill 
              className="object-cover p-0.5"
            />
          </div>
          <span className="text-sm">
            <span className="font-black tracking-[-0.03em]">Campus Radar</span> © {new Date().getFullYear()}
          </span>
        </div>
        <nav className="flex gap-4 text-sm font-medium text-muted-foreground">
          <Link href="/login" className="transition hover:text-foreground">{t("logIn")}</Link>
          <Link href="#" className="transition hover:text-foreground">{t("privacyTerms")}</Link>
        </nav>
      </div>
    </footer>
  );
}
