import { HeroSection } from "@/components/hero-section";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="pt-20">
        <HeroSection />
      </main>
    </>
  );
}
