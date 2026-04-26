import type { Metadata, Viewport } from "next";

import { SiteFooter } from "@/components/site-footer";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Radar",
  description:
    "A contextual campus connection engine for students, associations, events, and impact profiles.",
  icons: {
    icon: "/logo.jpg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#214f42",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <I18nProvider>
            <div className="pointer-events-none fixed -left-24 top-40 -z-10 h-72 w-72 rounded-full bg-radar-amber/25 blur-2xl" />
            <div className="pointer-events-none fixed -right-24 bottom-28 -z-10 h-80 w-80 rounded-full bg-radar-forest/20 blur-2xl" />
            <div className="flex min-h-screen flex-col">
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
