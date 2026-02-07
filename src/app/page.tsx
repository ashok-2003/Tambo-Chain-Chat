import { DemoChat } from "@/components/landing/DemoChat";
import { Hero } from "@/components/landing/Hero";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start overflow-hidden relative">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

      <main className="w-full max-w-7xl px-4 z-10 flex flex-col items-center pb-20">
        <Hero />
        <DemoChat />
      </main>
    </div>
  );
}

