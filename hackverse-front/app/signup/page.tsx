import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function SignupPage() {
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
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary font-display text-lg font-black tracking-[-0.1em] text-primary-foreground shadow-inner">
            CR
          </span>
          <h1 className="mt-4 font-display text-3xl font-black tracking-[-0.03em]">Get Started</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an account to join the campus network.
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              placeholder="First Last"
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground" htmlFor="email">
              University Email
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
            <label className="text-sm font-bold text-muted-foreground" htmlFor="department">
              Department
            </label>
            <select
              id="department"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled selected hidden>Select your department</option>
              <option value="cs">Computer Science</option>
              <option value="eng">Engineering</option>
              <option value="bus">Business</option>
              <option value="arts">Arts & Design</option>
              <option value="other">Other</option>
            </select>
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
          <Button asChild className="mt-2 w-full">
            <Link href="/dashboard">Create Account</Link>
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/login" className="font-bold underline hover:text-primary">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
