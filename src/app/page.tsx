import { DemoChat } from "@/components/landing/DemoChat";
import { Hero } from "@/components/landing/Hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start overflow-hidden relative">
      {/* Subtle dot grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }} />

      {/* Warm gradient orb - top right */}
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      {/* Cool gradient orb - bottom left */}
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-chart-2/5 blur-[120px] pointer-events-none" />

      <main className="w-full max-w-6xl px-6 z-10 flex flex-col items-center pb-24">
        <Hero />
        <DemoChat />
      </main>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none z-10" />
    </div>
  );
}
