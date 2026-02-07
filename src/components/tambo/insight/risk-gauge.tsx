"use client";

import { z } from "zod";
import { cn } from "@/lib/utils";

export const riskGaugeSchema = z.object({
    score: z.number().min(0).max(100).describe("Risk score from 0 (Safe) to 100 (High Risk)"),
    label: z.string().optional().describe("Label for the gauge (default: 'Risk Score')"),
});

export type RiskGaugeProps = z.infer<typeof riskGaugeSchema>;

export function RiskGauge({ score, label = "Risk Analysis" }: RiskGaugeProps) {
    // Normalize score
    const clampedScore = Math.min(100, Math.max(0, score));

    // Determine color zone
    let colorClass = "text-green-500";
    let bgClass = "bg-green-500";
    let statusText = "Low Risk";

    if (clampedScore > 35) {
        colorClass = "text-yellow-500";
        bgClass = "bg-yellow-500";
        statusText = "Medium Risk";
    }
    if (clampedScore > 70) {
        colorClass = "text-red-500";
        bgClass = "bg-red-500";
        statusText = "High Risk";
    }

    // Calculate rotation for needle/bar
    // For a semi-circle gauge (-90deg to 90deg)
    const rotation = (clampedScore / 100) * 180 - 90;

    return (
        <div className="w-full max-w-xs p-4 rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col items-center">
            <h3 className="font-semibold text-sm text-muted-foreground mb-4 uppercase tracking-wider">{label}</h3>

            <div className="relative w-48 h-24 overflow-hidden mb-2">
                {/* Background Arc */}
                <div className="absolute bottom-0 left-0 w-full h-full bg-muted rounded-t-full"></div>

                {/* Colored Zones (Simplified as gradient or segments) */}
                <div className="absolute bottom-0 left-0 w-full h-full rounded-t-full opacity-20 bg-linear-to-r from-green-500 via-yellow-500 to-red-500"></div>

                {/* Needle */}
                <div
                    className="absolute bottom-0 left-1/2 w-1 h-[90%] bg-foreground origin-bottom transition-transform duration-1000 ease-out"
                    style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
                >
                    <div className="w-4 h-4 rounded-full bg-foreground absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 shadow-lg"></div>
                </div>
            </div>

            <div className="text-center">
                <div className={cn("text-3xl font-bold font-mono leading-none mb-1", colorClass)}>
                    {clampedScore}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                    {statusText}
                </div>
            </div>
        </div>
    );
}
