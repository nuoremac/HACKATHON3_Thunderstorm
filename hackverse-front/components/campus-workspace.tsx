"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { memo } from "react";

import {
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  Handshake,
  MessageSquarePlus,
  Compass,
  Star,
  Users,
  Activity,
  LogOut,
  Bell,
  Search,
  Settings,
  Sun,
  Moon,
  Monitor
} from "lucide-react";

import {
  calculateConfidence,
  calculateRecommendationScore,
  getDominantRisk,
  scoreAsPercent,
} from "@/lib/scoring";
import { cn } from "@/lib/utils";
import type {
  Recommendation,
  Student,
  CampusEvent,
  Association,
  HelpRequest,
  ImpactProfile,
} from "@/types/campus";
import * as api from "@/lib/api";
import { 
  adoptionPlan as mockAdoptionPlan, 
  adminMetrics as mockAdminMetrics,
  engagementData as mockEngagementData,
  riskItems as mockRiskItems
} from "@/data/mock-campus";

// Dynamic import for Recharts to improve bundle size and prevent SSR issues
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const BarChart = dynamic(() => import("recharts").then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(mod => mod.Bar), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function CampusWorkspace() {
  const [activeTab, setActiveTab] = useState("student");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [student, setStudent] = useState<Student | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [impact, setImpact] = useState<ImpactProfile | null>(null);
  const [requests, setRequests] = useState<HelpRequest[]>([]);

  const [selectedRequestId, setSelectedRequestId] = useState<string | undefined>();
  const selectedRequest = requests.find((request) => request.id === selectedRequestId);

  useEffect(() => {
    async function loadStudent() {
      try {
        const allStudents = await api.getStudents();
        if (allStudents.length > 0) {
          setStudent(allStudents[0]);
        }
      } catch (err) {
        console.error("Failed to load student context:", err);
      }
    }
    loadStudent();
  }, []);

  useEffect(() => {
    if (!student) return;

    async function loadRadarData() {
      try {
        setIsLoading(true);
        const [recs, evs, assocs, imp] = await Promise.all([
          api.getRecommendations(student.id),
          api.getEvents(),
          api.getAssociations(),
          api.getImpactProfile(student.id),
        ]);

        setRecommendations(recs);
        setEvents(evs);
        setAssociations(assocs);
        setImpact(imp);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to connect to the backend radar.");
        setIsLoading(false);
      }
    }

    loadRadarData();
  }, [student?.id]);

  if (error || !student) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background p-6">
        <Card className="max-w-md border-radar-clay/20 bg-radar-clay/5">
          <CardHeader>
            <CardTitle className="text-radar-clay flex items-center gap-2">
              <CircleAlert className="h-5 w-5" /> Connection Lost
            </CardTitle>
            <CardDescription>{error || "No student context found."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()} className="w-full bg-radar-clay hover:bg-radar-clay/90 text-white">
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background relative">
      <Tabs 
        defaultValue="student" 
        value={activeTab} 
        onValueChange={(val) => {
          setActiveTab(val);
          if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' });
        }} 
        className="flex w-full items-start"
      >
        
        {/* FULL HEIGHT SIDEBAR */}
        <aside className="sticky top-0 z-40 hidden h-screen w-[280px] flex-col border-r border-border/40 bg-card/60 backdrop-blur-2xl lg:flex pb-6">
          <div className="flex h-20 items-center px-6 border-b border-border/40">
            <Link className="flex items-center gap-3" href="/">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-radar-amber font-display font-black tracking-[-0.1em] text-radar-ink shadow-inner">
                CR
              </span>
              <span className="leading-tight">
                <span className="block font-black tracking-[-0.03em] text-[15px]">Campus Radar</span>
                <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                  Workspace
                </span>
              </span>
            </Link>
          </div>

          <div className="border-b border-border/40 px-3 py-4 bg-background/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <button className="flex w-full items-center gap-3.5 rounded-2xl border border-transparent p-2 transition-all hover:bg-card hover:shadow-sm hover:border-border/40 group text-left">
              <div className="grid h-14 w-14 flex-none place-items-center rounded-2xl bg-gradient-to-br from-radar-blue to-radar-amber font-black text-white text-xl shadow-inner ring-2 ring-transparent transition-all group-hover:ring-radar-blue/30">
                {student.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg font-black leading-tight tracking-[-0.02em] text-foreground">{student.name}</p>
                <p className="truncate text-xs font-semibold text-muted-foreground mt-0.5">{student.department}</p>
              </div>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
            <div className="mb-3 px-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Main Menu
            </div>
            
            <TabsList className="flex flex-col items-stretch gap-1 border-none bg-transparent p-0 shadow-none">
              <TabsTrigger 
                className={cn(
                  "justify-start rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all hover:bg-accent/50 hover:text-foreground",
                  activeTab === "student" ? "bg-radar-blue text-white shadow-md hover:bg-radar-blue hover:text-white" : "text-muted-foreground"
                )} 
                value="student"
              >
                <Compass className={cn("mr-3 h-5 w-5", activeTab === "student" ? "text-white/80" : "text-muted-foreground")} /> Student Radar
              </TabsTrigger>
              <TabsTrigger 
                className={cn(
                  "justify-start rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all hover:bg-accent/50 hover:text-foreground",
                  activeTab === "impact" ? "bg-radar-blue text-white shadow-md hover:bg-radar-blue hover:text-white" : "text-muted-foreground"
                )} 
                value="impact"
              >
                <Star className={cn("mr-3 h-5 w-5", activeTab === "impact" ? "text-white/80" : "text-muted-foreground")} /> Impact Profile
              </TabsTrigger>
              <TabsTrigger 
                className={cn(
                  "justify-start rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all hover:bg-accent/50 hover:text-foreground",
                  activeTab === "events" ? "bg-radar-blue text-white shadow-md hover:bg-radar-blue hover:text-white" : "text-muted-foreground"
                )} 
                value="events"
              >
                <Users className={cn("mr-3 h-5 w-5", activeTab === "events" ? "text-white/80" : "text-muted-foreground")} /> Network & Events
              </TabsTrigger>

              <div className="my-4 px-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Management
              </div>

              <TabsTrigger 
                className={cn(
                  "justify-start rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all hover:bg-accent/50 hover:text-foreground",
                  activeTab === "admin" ? "bg-radar-blue text-white shadow-md hover:bg-radar-blue hover:text-white" : "text-muted-foreground"
                )} 
                value="admin"
              >
                <Activity className={cn("mr-3 h-5 w-5", activeTab === "admin" ? "text-white/80" : "text-muted-foreground")} /> Platform Admin
              </TabsTrigger>
              <TabsTrigger 
                className={cn(
                  "justify-start rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all hover:bg-accent/50 hover:text-foreground",
                  activeTab === "settings" ? "bg-radar-blue text-white shadow-md hover:bg-radar-blue hover:text-white" : "text-muted-foreground"
                )} 
                value="settings"
              >
                <Settings className={cn("mr-3 h-5 w-5", activeTab === "settings" ? "text-white/80" : "text-muted-foreground")} /> Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-auto px-4">
            <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive" asChild>
              <Link href="/">
                <LogOut className="mr-3 h-4 w-4" /> Sign Out
              </Link>
            </Button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col min-h-screen min-w-0">
          {/* Topbar */}
          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border/40 bg-background/80 px-8 backdrop-blur-xl">
             <div className="flex items-center gap-4">
               {/* Mobile sidebar toggle could go here */}
               <h1 className="font-display text-xl font-black capitalize tracking-[-0.02em]">
                 {activeTab === "events" ? "Network & Events" : activeTab === "admin" ? "Admin Metrics" : activeTab === "settings" ? "Preferences" : activeTab + " Dashboard"}
               </h1>
             </div>
             <div className="flex items-center gap-3">
               <div className="relative hidden w-64 md:block">
                 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                 <input 
                   type="text" 
                   placeholder="Search activities..." 
                   className="h-10 w-full rounded-full border border-border/60 bg-card/50 pl-10 pr-4 text-sm outline-none transition-colors focus:border-radar-blue focus:ring-1 focus:ring-radar-blue placeholder:text-muted-foreground"
                 />
               </div>
               <Button variant="outline" size="icon" className="rounded-full shadow-none bg-transparent">
                 <Bell className="h-4 w-4" />
               </Button>
             </div>
          </header>

          <div className="flex-1 p-8 pb-20 lg:p-12">
            <div className="mx-auto max-w-6xl w-full">
              <TabsContent value="student" className="m-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {isLoading ? <RadarSkeleton /> : <StudentRadar student={student} recommendations={recommendations} />}
              </TabsContent>

              <TabsContent value="impact" className="m-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {isLoading ? <RadarSkeleton /> : (
                  <ImpactSection
                    impact={impact}
                    requests={requests}
                    selectedRequestId={selectedRequestId}
                    selectedRequestTitle={selectedRequest?.title}
                    onSelectRequest={setSelectedRequestId}
                  />
                )}
              </TabsContent>

              <TabsContent value="events" className="m-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {isLoading ? <RadarSkeleton /> : <EventsSection events={events} associations={associations} />}
              </TabsContent>

              <TabsContent value="admin" className="m-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <AdminSection />
              </TabsContent>

              <TabsContent value="settings" className="m-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <SettingsSection student={student} />
              </TabsContent>
            </div>
          </div>
        </main>

      </Tabs>
    </div>
  );
}

function StudentRadar({ student, recommendations }: { student: Student; recommendations: Recommendation[] }) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-4xl font-black tracking-[-0.04em]">Your Connections</h2>
          <p className="mt-1 text-muted-foreground">Smart opportunities tailored to your real-time situation.</p>
        </div>
        <Badge variant="outline" className="w-fit border-radar-forest/30 bg-radar-forest/5 text-radar-forest py-1.5 px-4 rounded-xl text-sm transition-colors hover:bg-radar-forest/10">
          <div className="mr-2 h-2 w-2 rounded-full bg-radar-forest animate-pulse inline-block" />
          {scoreAsPercent(student.profileCertainty)}% Context Signal
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.length > 0 ? (
          recommendations.map((recommendation, index) => (
            <RecommendationCard
              index={index}
              key={recommendation.id}
              recommendation={recommendation}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <Compass className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-semibold">No signals detected yet. Try updating your profile context.</p>
          </div>
        )}
      </div>
    </div>
  );
}

const RecommendationCard = memo(({
  recommendation,
  index,
}: {
  recommendation: Recommendation;
  index: number;
}) => {
  const score = scoreAsPercent(calculateRecommendationScore(recommendation.scores));
  
  const accentMapping = {
    event: "group-hover:border-radar-amber/50",
    association: "group-hover:border-radar-blue/50",
    help: "group-hover:border-radar-clay/50",
    career: "group-hover:border-radar-forest/50",
    person: "group-hover:border-radar-blue/50",
  }[recommendation.type] || "group-hover:border-border/60";

  const glowMapping = {
    event: "from-radar-amber/10",
    association: "from-radar-blue/10",
    help: "from-radar-clay/10",
    career: "from-radar-forest/10",
    person: "from-radar-blue/10",
  }[recommendation.type] || "from-transparent";

  const stripMapping = {
    event: "group-hover:from-radar-amber",
    association: "group-hover:from-radar-blue",
    help: "group-hover:from-radar-clay",
    career: "group-hover:from-radar-forest",
    person: "group-hover:from-radar-blue",
  }[recommendation.type] || "group-hover:from-radar-blue";

  return (
    <Card className={cn("group relative flex flex-col justify-between overflow-hidden border-border/60 bg-card/60 p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-card hover:bg-card", accentMapping)} style={{ animationDelay: `${index * 80}ms` }}>
      {/* Background glow injected through brand colors */}
      <div className={cn("absolute inset-0 bg-gradient-to-br via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none -z-0", glowMapping)} />
      
      <div className="relative z-10">
        <div className={cn("h-1 w-full bg-gradient-to-r from-border to-transparent transistion-colors", stripMapping)} />
        <CardHeader className="p-6 pb-4">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <Badge variant={getTypeBadgeVariant(recommendation.type)} className="uppercase tracking-[0.15em] text-[10px] rounded-lg px-2.5 shadow-sm">
              {recommendation.type}
            </Badge>
            <span className={cn("text-xs font-black transition-colors", stripMapping.replace("group-hover:from-", "text-muted-foreground group-hover:text-"))}>{score}% Match</span>
          </div>
          <CardTitle className="leading-tight text-xl">{recommendation.title}</CardTitle>
          <CardDescription className="mt-2 text-xs font-semibold text-foreground/70">{recommendation.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0">
          <p className="text-sm leading-relaxed text-muted-foreground">{recommendation.description}</p>
          
          <div className="mt-5 space-y-2">
            {recommendation.reasons.slice(0, 2).map((reason, i) => (
              <div key={i} className="flex items-start text-xs text-muted-foreground">
                <CheckCircle2 className="mr-2 mt-0.5 h-3 w-3 text-radar-blue flex-shrink-0 opacity-70" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </div>
      <div className="px-6 py-4 border-t border-border/40 bg-background/50 mt-auto group-hover:bg-radar-blue/5 transition-colors">
        <Button className="w-full justify-between shadow-none bg-transparent text-foreground border border-border/60 hover:bg-radar-blue hover:text-white hover:border-transparent transition-all">
          {recommendation.actionLabel}
          <ArrowUpRight className="h-4 w-4 opacity-70" />
        </Button>
      </div>
    </Card>
  );
});

RecommendationCard.displayName = "RecommendationCard";

function ImpactSection({
  impact,
  requests,
  selectedRequestId,
  selectedRequestTitle,
  onSelectRequest,
}: {
  impact: ImpactProfile | null;
  requests: HelpRequest[];
  selectedRequestId?: string;
  selectedRequestTitle?: string;
  onSelectRequest: (id: string) => void;
}) {
  if (!impact) return null;
  const helpedTotal = impact.skills.reduce((sum, skill) => sum + skill.helpedCount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-4xl font-black tracking-[-0.04em]">Impact Analytics</h2>
        <p className="mt-1 text-muted-foreground">Quantify and visualize your mentorship footprint.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="relative overflow-hidden border-none shadow-soft text-radar-cream bg-gradient-to-br from-radar-forest to-radar-blue">
          {/* Subtle gradient effects */}
          <div className="absolute inset-0 bg-white/5 mix-blend-screen" />
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 h-56 w-56 rounded-full bg-black/10 blur-2xl" />
          
          <CardContent className="p-10 lg:p-12 flex flex-col h-full justify-between relative z-10">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-radar-cream/70 block mb-4">
                Lifetime Impact
              </span>
              <div className="flex items-baseline gap-3">
                <strong className="block font-display text-8xl md:text-9xl leading-none tracking-[-0.06em]">
                  {helpedTotal}
                </strong>
                <span className="text-xl font-medium text-radar-cream/80">peers</span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-radar-cream/80">
                Successfully guided through academic challenges, project building, and career prep.
              </p>
            </div>
            
            <div className="mt-10 flex flex-wrap gap-2">
              {impact.badges.map((badge) => (
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-md px-3 py-1.5 font-bold" key={badge}>
                  {badge}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col bg-card/60 backdrop-blur-md shadow-card border-border/50">
          <CardHeader className="pb-4">
            <CardTitle>Skill Confidence</CardTitle>
            <CardDescription>Mentorship performance based on peer feedback.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-7">
            {impact.skills.map((skill) => (
              <div key={skill.name}>
                <div className="mb-2 flex justify-between gap-3 text-sm font-black">
                  <span>{skill.name}</span>
                  <span className="text-muted-foreground">{skill.helpedCount} helped</span>
                </div>
                <Progress value={scoreAsPercent(skill.confidence)} className="h-2.5 bg-radar-blue/10 [&>div]:bg-radar-blue" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/60 backdrop-blur-md shadow-sm border-border/50">
        <CardHeader className="border-b border-border/40 pb-5 mb-5 px-8 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Help Requests</CardTitle>
              <CardDescription className="mt-1">Manage ongoing and completed mentorship threads.</CardDescription>
            </div>
            <Button size="sm" variant="outline" className="hidden sm:inline-flex">View All</Button>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {requests.length > 0 ? (
              requests.map((request) => (
                <button
                  className={cn(
                    "group w-full rounded-2xl border bg-background/50 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-card hover:bg-card",
                    selectedRequestId === request.id ? "border-radar-blue/50 shadow-sm ring-1 ring-radar-blue/20" : "border-border/60"
                  )}
                  key={request.id}
                  type="button"
                  onClick={() => onSelectRequest(request.id)}
                >
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <Badge variant="outline" className="text-[10px] bg-background">{request.skill}</Badge>
                    <Badge variant={request.status === "Completed" ? "success" : "secondary"} className="uppercase tracking-wider text-[9px] px-2 py-0.5">
                      {request.status}
                    </Badge>
                  </div>
                  <h3 className="font-display text-lg font-black leading-tight tracking-[-0.02em] group-hover:text-radar-blue transition-colors">{request.title}</h3>
                  <p className="mt-1 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <span className="inline-block h-4 w-4 rounded-full bg-border grid place-items-center text-[8px] uppercase">{request.requester.substring(0, 1)}</span>
                    {request.requester}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">{request.detail}</p>
                </button>
              ))
            ) : (
              <p className="text-muted-foreground text-center col-span-full py-10">No active help requests found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EventsSection({ events, associations }: { events: CampusEvent[]; associations: Association[] }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-4xl font-black tracking-[-0.04em]">Campus Network</h2>
        <p className="text-muted-foreground mt-1">Discover dynamic events and influential associations.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl font-bold tracking-tight">Curated Events</h3>
            <Button variant="ghost" size="sm" className="text-radar-blue">See Calendar</Button>
          </div>
          <div className="space-y-4">
            {events.length > 0 ? (
              events.map((event) => (
                <Card className="overflow-hidden border-border/50 bg-card/40 backdrop-blur-md shadow-sm transition-all hover:bg-card hover:shadow-card group" key={event.id}>
                  <div className="flex justify-between items-center bg-background/50 px-6 py-3 border-b border-border/40">
                    <Badge variant="secondary" className="bg-radar-amber/15 text-radar-amber shadow-none">{event.startTime}</Badge>
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-radar-blue inline-block" /> {event.location}
                    </span>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-display text-xl font-black leading-tight tracking-[-0.02em] mb-2">{event.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground mb-6 line-clamp-2">{event.description}</p>
                    
                    <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                           <div className="h-7 w-7 rounded-full bg-radar-forest/20 border-2 border-background flex items-center justify-center text-[9px] font-bold text-radar-forest z-30">+</div>
                           <div className="h-7 w-7 rounded-full bg-radar-blue/80 border-2 border-background z-20" />
                           <div className="h-7 w-7 rounded-full bg-radar-amber border-2 border-background z-10" />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">{event.interestedCount} going</span>
                      </div>
                      <Button size="sm" className="rounded-xl shadow-none">RSVP Now</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">No upcoming events found.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
           <div className="flex items-center justify-between">
            <h3 className="font-display text-2xl font-bold tracking-tight">Associations</h3>
            <Button variant="ghost" size="sm" className="text-radar-blue">Browse All</Button>
          </div>
          <div className="space-y-4">
            {associations.map((association, idx) => (
              <Card className={cn(
                "border-border/50 bg-card/40 backdrop-blur-md shadow-sm transition-all hover:-translate-y-1 hover:shadow-card relative overflow-hidden",
                idx === 0 ? "hover:border-radar-blue/40" : idx === 1 ? "hover:border-radar-amber/40" : "hover:border-radar-clay/40"
              )} key={association.id}>
                
                {/* Subtle side glow */}
                <div className={cn(
                  "absolute left-0 top-0 w-1.5 h-full opacity-50 transition-opacity", 
                  idx === 0 ? "bg-radar-blue" : idx === 1 ? "bg-radar-amber" : "bg-radar-clay"
                )} />

                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-inner",
                        idx === 0 ? "bg-gradient-to-br from-radar-blue to-[hsl(var(--card))]" : idx === 1 ? "bg-gradient-to-br from-radar-amber to-[hsl(var(--card))]" : "bg-gradient-to-br from-radar-clay to-[hsl(var(--card))]"
                      )}>
                        {association.name.substring(0, 1)}
                      </div>
                      <h3 className="font-display text-lg font-black leading-tight tracking-[-0.02em]">{association.name}</h3>
                    </div>
                    <Badge variant="outline" className="rounded-lg bg-background text-[10px]">{association.relevantStudents} peers</Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground mb-5">
                    {association.mission}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {association.tags.map((tag) => (
                      <Badge variant="secondary" className="bg-radar-blue/5 text-radar-blue text-[10px] uppercase tracking-wider" key={tag}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full bg-background/50 hover:bg-radar-blue hover:text-white hover:border-radar-blue transition-colors">
                    View Chapter Profile
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminSection() {
  return (
    <div className="space-y-8">
      <div>
         <h2 className="font-display text-4xl font-black tracking-[-0.04em]">Platform Intelligence</h2>
         <p className="text-muted-foreground mt-1">Global campus analytics, system health, and adoption metrics.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {mockAdminMetrics.map((metric, i) => (
          <Card className={cn(
            "relative overflow-hidden p-6 border-border/40 transition-all hover:-translate-y-1 hover:shadow-card group",
            metric.tone === "warning" ? "bg-radar-clay/5 hover:border-radar-clay/30" : 
            metric.tone === "success" ? "bg-radar-blue/5 hover:border-radar-blue/30" : "bg-card shadow-sm"
          )} key={metric.label}>
             {metric.tone === "warning" && <div className="absolute top-0 right-0 w-16 h-16 bg-radar-clay/10 rounded-bl-[100px] -z-0" />}
             {metric.tone === "success" && <div className="absolute top-0 right-0 w-16 h-16 bg-radar-blue/10 rounded-bl-[100px] -z-0" />}
            
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground mb-3">{metric.label}</p>
              <strong className={cn("font-display text-5xl leading-none tracking-[-0.05em] block", metric.tone === "warning" ? "text-radar-clay" : "text-radar-forest")}>
                {metric.value}
              </strong>
              {metric.detail && (
                <p className="mt-3 text-xs font-medium text-muted-foreground">{metric.detail}</p>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm flex flex-col">
          <CardHeader className="border-b border-border/30 px-8 py-6">
            <CardTitle>Engagement Pulse</CardTitle>
            <CardDescription className="mt-1">Department activity levels vs isolation risk factors.</CardDescription>
          </CardHeader>
          <CardContent className="h-[380px] p-8">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={mockEngagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.4)" />
                <XAxis dataKey="domain" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))", fontWeight: 600 }} dy={15} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.4)", radius: 8 }}
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    fontWeight: 600,
                    padding: "12px 16px"
                  }}
                />
                <Bar dataKey="engagement" fill="hsl(var(--accent) / 0.8)" name="Active Engagement" radius={[4, 4, 0, 0]} maxBarSize={48} />
                <Bar dataKey="isolationRisk" fill="#c95f3f" name="Isolation Risk" radius={[4, 4, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-6 flex flex-col h-full">
          <Card className="flex-1 bg-radar-clay/5 border-radar-clay/20 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                 <div className="bg-radar-clay/10 p-2 rounded-xl">
                   <CircleAlert className="h-5 w-5 text-radar-clay" />
                 </div>
                 <CardTitle className="text-radar-clay text-xl">System Alerts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {mockRiskItems.map((risk) => (
                <div className="group relative pl-4" key={risk.title}>
                  <div className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-radar-clay" />
                  <div className="mb-1">
                    <h3 className="font-bold text-sm text-radar-clay">{risk.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">{risk.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ student }: { student: Student }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-8 w-full">
      <div>
        <h2 className="font-display text-4xl font-black tracking-[-0.04em]">Preferences</h2>
        <p className="text-muted-foreground mt-1">Manage your account, privacy settings, and notification channels.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1.5fr]">
        <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm h-full flex flex-col">
          <CardHeader className="border-b border-border/40 pb-5">
            <CardTitle>Profile Details</CardTitle>
            <CardDescription className="mt-1">Control how you appear to others on Campus Radar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 flex-1">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-xl bg-gradient-to-br from-radar-blue to-radar-amber font-black text-white text-2xl shadow-inner">
                  {student.initials}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">{student.name}</h3>
                  <p className="text-sm text-muted-foreground">{student.department} · {student.academicYear}</p>
                </div>
              </div>
              <Button variant="outline" className="text-radar-blue border-border/60 hover:bg-radar-blue hover:text-white transition-colors">
                Change Avatar
              </Button>
            </div>
            
            <div className="pt-6 border-t border-border/40">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                  <input type="text" defaultValue={student.name} className="w-full rounded-xl border border-border/60 bg-background/50 px-4 py-2.5 text-sm focus:border-radar-blue focus:ring-1 focus:ring-radar-blue outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Campus Email</label>
                  <input type="email" defaultValue={`${student.id}@campus.edu`} readOnly className="w-full rounded-xl border border-border/30 bg-muted/30 px-4 py-2.5 text-sm text-muted-foreground outline-none cursor-not-allowed" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/60 backdrop-blur-md shadow-sm h-full flex flex-col">
          <CardHeader className="border-b border-border/40 pb-5">
            <CardTitle>Discovery & Privacy</CardTitle>
            <CardDescription className="mt-1">Manage what signals Campus Radar uses to match you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6 flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">Timetable Integration</p>
                <p className="text-xs text-muted-foreground mt-0.5">Use your current free slots to suggest events.</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-radar-blue relative cursor-pointer">
                 <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">Mentorship Availability</p>
                <p className="text-xs text-muted-foreground mt-0.5">Allow peers to request 30-min help sessions.</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-radar-blue relative cursor-pointer">
                 <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">Incognito Mode</p>
                <p className="text-xs text-muted-foreground mt-0.5">Hide your profile from the public directory.</p>
              </div>
               <div className="h-6 w-11 rounded-full bg-muted relative cursor-pointer">
                 <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-background shadow-sm" />
              </div>
            </div>

            <div className="pt-6 mt-2 border-t border-border/40">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-sm">Interface Theme</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Customize the visual appearance.</p>
                </div>
              </div>
              {mounted && (
                <div className="flex bg-muted/30 p-1 rounded-xl border border-border/40 w-full sm:w-fit">
                   <button onClick={() => setTheme("light")} className={cn("flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-colors border", theme === "light" ? "bg-background shadow-sm border-border/60 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
                     <Sun className="h-3.5 w-3.5" /> Light
                   </button>
                   <button onClick={() => setTheme("dark")} className={cn("flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-colors border", theme === "dark" ? "bg-background shadow-sm border-border/60 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
                     <Moon className="h-3.5 w-3.5" /> Dark
                   </button>
                   <button onClick={() => setTheme("system")} className={cn("flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold rounded-lg transition-colors border", theme === "system" ? "bg-background shadow-sm border-border/60 text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
                     <Monitor className="h-3.5 w-3.5" /> System
                   </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" className="border-border/60">Cancel</Button>
        <Button className="bg-radar-blue text-white hover:bg-radar-blue/90 font-bold shadow-sm">Save Changes</Button>
      </div>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-muted/40", className)} />;
}

function RadarSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-[420px] w-full" />
        ))}
      </div>
    </div>
  );
}

function getTypeBadgeVariant(type: Recommendation["type"]) {
  if (type === "event") return "amber";
  if (type === "association") return "blue";
  if (type === "help") return "clay";
  if (type === "career") return "success";
  return "default";
}
