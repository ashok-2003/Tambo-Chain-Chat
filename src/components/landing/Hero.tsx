"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowRight } from "lucide-react";

export function Hero() {
    return (
        <section className="relative w-full max-w-4xl mx-auto pt-24 pb-16 px-6 text-center">
            <div className="absolute top-6 right-6">
                <ThemeToggle />
            </div>

            <div className="space-y-8 animate-fade-in">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/50 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Your Personal Assistance for Crypto
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-7xl font-bold tracking-[-0.03em] leading-[1.05]">
                    <span className="text-gradient">Talk to your</span>
                    <br />
                    <span className="text-primary">crypto portfolio.</span>
                </h1>

                {/* Subtext */}
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed font-light">
                    Ask questions about your Portfolio, And intereact with It in real time.
                </p>

                {/* CTAs */}
                <div className="flex gap-4 justify-center pt-2">
                    <a
                        href="/chat"
                        className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-sm text-primary-foreground bg-primary hover:brightness-110 transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_16px_rgba(194,102,45,0.15)]"
                    >
                        Launch App
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </a>
                    <a
                        href="https://github.com/yourusername/chainchat"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-medium text-sm border border-border text-foreground/80 hover:text-foreground hover:border-foreground/20 hover:bg-muted/50 transition-all duration-200"
                    >
                        GitHub
                    </a>
                </div>
            </div>
        </section>
    );
}
