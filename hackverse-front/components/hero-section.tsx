"use client";

import { ArrowUpRight, BrainCircuit, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n-context";

export function HeroSection() {
  const { t } = useI18n();

  const principles = [
    {
      icon: Sparkles,
      title: t("principle1Title"),
      text: t("principle1Text"),
    },
    {
      icon: BrainCircuit,
      title: t("principle2Title"),
      text: t("principle2Text"),
    },
    {
      icon: Users,
      title: t("principle3Title"),
      text: t("principle3Text"),
    },
  ];

  return (
    <section className="shell grid min-h-[calc(100vh-7rem)] items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="animate-fade-up" id="top">
        <h1 className="display-title mt-5 max-w-5xl text-6xl sm:text-7xl lg:text-8xl">
          {t("heroTitle")}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          {t("heroSubtitle")}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/signup">
              {t("getStarted")} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">{t("logIn")}</Link>
          </Button>
        </div>
      </div>

      <Card className="relative overflow-hidden p-5">
        <div className="subtle-grid relative min-h-[24rem] rounded-[1.5rem] bg-radar-forest/10">
          <span className="absolute inset-[18%] rounded-full border border-radar-forest/30 animate-pulse-radar" />
          <span className="absolute inset-[31%] rounded-full border border-radar-forest/30 animate-pulse-radar [animation-delay:700ms]" />
          <span className="absolute left-1/2 top-1/2 h-1 w-[42%] origin-left animate-sweep bg-gradient-to-r from-radar-forest to-transparent" />
          <span className="absolute left-[64%] top-[30%] h-4 w-4 rounded-full bg-radar-clay shadow-[0_0_0_10px_rgba(201,95,63,0.14)]" />
          <span className="absolute left-[34%] top-[58%] h-4 w-4 rounded-full bg-radar-amber shadow-[0_0_0_10px_rgba(214,148,53,0.14)]" />
          <span className="absolute left-[73%] top-[66%] h-4 w-4 rounded-full bg-radar-blue shadow-[0_0_0_10px_rgba(65,109,122,0.14)]" />
        </div>
        <div className="relative -mt-24 rounded-[1.5rem] border border-border bg-card/90 p-6 shadow-card backdrop-blur-xl">
          <p className="eyebrow">{t("radarLiveConnection")}</p>
          <h2 className="font-display text-4xl leading-[0.95] tracking-[-0.06em]">
            {t("radarFreeTime")}
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {t("radarDescription")}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <strong className="block text-2xl text-radar-forest">87%</strong>
              <span className="text-xs font-bold text-muted-foreground">{t("radarRelevance")}</span>
            </div>
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <strong className="block text-2xl text-radar-forest">{t("radarLow")}</strong>
              <span className="text-xs font-bold text-muted-foreground">{t("radarRisk")}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:col-span-2 lg:grid-cols-3" id="product">
        {principles.map((principle, index) => (
          <Card
            className="animate-fade-up p-6"
            key={principle.title}
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <principle.icon className="mb-8 h-8 w-8 text-radar-clay" />
            <h3 className="text-xl font-black tracking-[-0.03em]">{principle.title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{principle.text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
