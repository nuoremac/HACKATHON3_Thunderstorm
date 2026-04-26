"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { signUpWithEmail } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const { data, error } = await signUpWithEmail(email, password, {
      full_name: name,
      department,
    });

    if (error) {
      setError(error.message);
      setIsSubmitting(false);
      return;
    }

    if (data.session) {
      router.replace("/dashboard");
      return;
    }

    setSuccessMessage("Account created. Check your email to verify your account, then log in.");
    setIsSubmitting(false);
  };

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
          <div className="relative mx-auto h-12 w-12 overflow-hidden rounded-2xl bg-white shadow-inner ring-1 ring-border/40">
            <Image
              src="/logo.jpg"
              alt="Campus Radar Logo"
              fill
              className="object-cover p-1"
            />
          </div>
          <h1 className="mt-4 font-display text-3xl font-black tracking-[-0.03em]">Get Started</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an account to join the campus network.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              placeholder="First Last"
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground" htmlFor="email">
              University Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="student@university.edu"
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted-foreground" htmlFor="department">
              Department
            </label>
            <select
              id="department"
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="" disabled hidden>
                Select your department
              </option>
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
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                placeholder="••••••••"
                className="flex h-10 w-full rounded-md border border-input bg-background/50 pl-3 pr-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {successMessage ? <p className="text-sm text-foreground">{successMessage}</p> : null}

          <Button type="submit" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
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
