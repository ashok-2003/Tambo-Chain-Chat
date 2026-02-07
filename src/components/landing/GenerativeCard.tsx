"use client";

import { TrendingUp, AlertTriangle } from "lucide-react";

interface GenerativeCardProps {
    type: "chart" | "risk" | "table";
}

export function GenerativeCard({ type }: GenerativeCardProps) {
    if (type === "chart") {
        return (
            <div className="w-full bg-card border border-border rounded-xl p-5 shadow-sm animate-slide-up">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
                    <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-semibold text-sm text-foreground">Performance (7D)</h3>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground tracking-wide uppercase">Tambo AI</span>
                </div>
                <div className="h-36 flex items-end justify-between gap-1.5 px-1">
                    {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                        <div
                            key={i}
                            className="flex-1 rounded-t transition-all duration-300 hover:opacity-80 relative group"
                            style={{ height: `${h}%` }}
                        >
                            <div
                                className="absolute bottom-0 w-full rounded-t bg-linear-to-t from-primary/60 to-primary/20"
                                style={{ height: '100%' }}
                            />
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-mono px-2 py-1 rounded whitespace-nowrap">
                                ${(h * 10 + 400).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-3 text-[10px] font-mono text-muted-foreground px-1">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                </div>
            </div>
        );
    }

    if (type === "risk") {
        return (
            <div className="w-full bg-card border border-border rounded-xl p-5 shadow-sm animate-slide-up">
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-border">
                    <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </div>
                        <h3 className="font-semibold text-sm text-foreground">Risk Analysis</h3>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground tracking-wide uppercase">Tambo AI</span>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Portfolio Volatility</span>
                            <span className="text-amber-500 font-mono font-semibold text-xs">HIGH &middot; 85/100</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full w-[85%] bg-linear-to-r from-amber-500 to-red-500 rounded-full transition-all duration-1000" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Concentration warning: 80% of assets in meme tokens. Consider diversifying into blue-chip assets.
                    </p>
                </div>
            </div>
        );
    }

    return null;
}
