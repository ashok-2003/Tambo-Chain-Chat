"use client";

import { ThemeToggle } from "@/components/ThemeToggle";

export function Hero() {
    return (
        <section className="relative w-full max-w-5xl mx-auto pt-20 pb-12 px-6 text-center">
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="space-y-6 animate-fade-in">
                <div className="inline-block px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-sm font-medium mb-4 backdrop-blur-md">
                    The UI Strikes Back Hackathon
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-white via-white to-gray-400 dark:from-white dark:via-gray-200 dark:to-gray-500 pb-2">
                    Talk to your <br />
                    <span className="text-primary drop-shadow-[0_0_15px_rgba(0,255,159,0.3)]">crypto portfolio.</span>
                </h1>

                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    No more static dashboards. Just ask, and ChainChat generates interactive charts, tables, and simulators instantly.
                </p>

                <div className="flex gap-4 justify-center pt-4">
                    <a
                        href="/chat"
                        className="px-8 py-3 rounded-md font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(0,255,159,0.3)] hover:shadow-[0_0_25px_rgba(0,255,159,0.5)]"
                    >
                        Launch App
                    </a>
                    <a
                        href="https://github.com/yourusername/chainchat"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-3 rounded-md font-medium border border-border bg-secondary/5 hover:bg-secondary/10 hover:border-primary/50 transition-colors"
                    >
                        GitHub
                    </a>
                </div>
            </div>
        </section>
    );
}
