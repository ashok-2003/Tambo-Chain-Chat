"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";

export const riskGaugeSchema = z.object({
    score: z.number().min(0).max(100).describe("Risk score from 0 (Safe) to 100 (High Risk)"),
    label: z.string().optional().describe("Label for the gauge (default: 'Risk Score')"),
});

export type RiskGaugeProps = z.infer<typeof riskGaugeSchema>;

export function RiskGauge({ score, label = "Risk Analysis" }: RiskGaugeProps) {
    const clampedScore = Math.min(100, Math.max(0, score));

    let colorClass = "text-emerald-600 dark:text-emerald-400";
    let barColor = "bg-emerald-500";
    let statusText = "Low Risk";
    let statusBg = "bg-emerald-500/10";

    if (clampedScore > 35) {
        colorClass = "text-amber-600 dark:text-amber-400";
        barColor = "bg-amber-500";
        statusText = "Medium Risk";
        statusBg = "bg-amber-500/10";
    }
    if (clampedScore > 70) {
        colorClass = "text-red-500";
        barColor = "bg-red-500";
        statusText = "High Risk";
        statusBg = "bg-red-500/10";
    }

    const rotation = (clampedScore / 100) * 180 - 90;

    return (
        <div className="w-full max-w-xs p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col items-center">
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.15em] mb-5">{label}</div>

            {/* Gauge */}
            <div className="relative w-44 h-22 overflow-hidden mb-3">
                <div className="absolute bottom-0 left-0 w-full h-full bg-muted/50 rounded-t-full" />
                <div className="absolute bottom-0 left-0 w-full h-full rounded-t-full opacity-15 bg-linear-to-r from-emerald-500 via-amber-500 to-red-500" />

                {/* Needle */}
                <div
                    className="absolute bottom-0 left-1/2 w-0.5 h-[88%] bg-foreground/80 origin-bottom transition-transform duration-1000 ease-out"
                    style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
                >
                    <div className="w-3 h-3 rounded-full bg-foreground absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 shadow-sm" />
                </div>
            </div>

            {/* Score */}
            <div className="text-center">
                <div className={cn("text-3xl font-bold font-mono leading-none mb-2", colorClass)}>
                    {clampedScore}
                </div>
                <div className={cn("inline-flex px-2.5 py-1 rounded-md text-xs font-semibold", statusBg, colorClass)}>
                    {statusText}
                </div>
            </div>
        </div>
    );
}
