import { ArrowUpRight, BrainCircuit, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const principles = [
  {
    icon: Sparkles,
    title: "Connection moments",
    text: "The app proposes concrete actions: ask for help, attend together, join a micro-group, or discover an association.",
  },
  {
    icon: BrainCircuit,
    title: "Explainable recommendations",
    text: "Every card shows the signals, confidence, and assumptions behind the suggestion.",
  },
  {
    icon: ShieldCheck,
    title: "Twist 01 safe",
    text: "New-student data is treated as a hypothesis, not a permanent identity.",
  },
];

export function HeroSection() {
  return (
    <section className="shell grid min-h-[calc(100vh-7rem)] items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="animate-fade-up" id="top">
        <Badge variant="clay">Hackverse 24H · Vercel-ready frontend</Badge>
        <h1 className="display-title mt-5 max-w-5xl text-6xl sm:text-7xl lg:text-8xl">
          Unlock your true campus potential.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
          Stop missing out. Campus Radar intelligently connects you with the right peers, associations, and events at the perfect time, turning your daily schedule into game-changing opportunities.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/signup">
              Get Started <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Log in</Link>
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
          <p className="eyebrow">Live connection moment</p>
          <h2 className="font-display text-4xl leading-[0.95] tracking-[-0.06em]">
            45 minutes free near Block B.
          </h2>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            6 new students are free, Robotics Club starts soon, and a verified mentor is
            available. Risk is low because assumptions are visible.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <strong className="block text-2xl text-radar-forest">87%</strong>
              <span className="text-xs font-bold text-muted-foreground">relevance</span>
            </div>
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <strong className="block text-2xl text-radar-forest">low</strong>
              <span className="text-xs font-bold text-muted-foreground">assumption risk</span>
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
