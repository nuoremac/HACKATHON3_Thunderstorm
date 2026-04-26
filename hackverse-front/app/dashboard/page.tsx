"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CampusWorkspace } from "@/components/campus-workspace";
import { getSession } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const session = await getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      setSessionChecked(true);
    }

    checkSession();
  }, [router]);

  if (!sessionChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Checking session...
      </div>
    );
  }

  return <CampusWorkspace />;
}
