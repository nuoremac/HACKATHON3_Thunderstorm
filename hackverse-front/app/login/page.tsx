import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <div className="absolute left-8 top-8">
        <Button asChild variant="ghost" className="gap-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-sm animate-fade-up rounded-[1.5rem] border border-border bg-card p-8 shadow-card backdrop-blur-xl">
        <div className="mb-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary font-display text-lg font-black tracking-[-0.1em] text-primary-foreground shadow-inner">
            CR
          </span>
          <h1 className="mt-4 font-display text-3xl font-black tracking-[-0.03em]">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your credentials to access the radar.
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="student@university.edu"
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••"
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Button asChild className="w-full">
            <Link href="/dashboard">Sign In</Link>
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Don&apos;t have an account? </span>
          <Link href="/signup" className="font-bold underline hover:text-primary">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
