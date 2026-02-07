"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { coingeckoService } from "@/services/coingecko";

export const whatIfSimulatorSchema = z.object({
    token: z.string().describe("Token ID to simulate (e.g. 'ethereum')"),
});

export type WhatIfSimulatorProps = z.infer<typeof whatIfSimulatorSchema>;

export function WhatIfSimulator({ token }: WhatIfSimulatorProps) {
    const [amount, setAmount] = useState<number>(1000);
    const [months, setMonths] = useState<number>(12);
    const [priceData, setPriceData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [projectedValue, setProjectedValue] = useState<number>(0);
    const [riskScore, setRiskScore] = useState<number>(0);

    useEffect(() => {
        async function fetchContext() {
            setLoading(true);
            try {
                const data = await coingeckoService.getMarketData([token]);
                if (data && data.length > 0) setPriceData(data[0]);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        }
        if (token) fetchContext();
    }, [token]);

    useEffect(() => {
        if (!priceData) return;
        const volatility = Math.abs(priceData.price_change_percentage_24h) * 2;
        const annualGrowth = (Math.random() * 0.5) + (priceData.price_change_percentage_24h > 0 ? 0.2 : -0.1);
        const projected = amount * (1 + (annualGrowth * (months / 12)));
        setProjectedValue(projected);

        const mcapScore = Math.min(100, Math.max(0, 100 - (priceData.market_cap_rank || 100)));
        const risk = 100 - (mcapScore * 0.7) + (volatility * 2);
        setRiskScore(Math.min(95, Math.max(5, risk)));
    }, [amount, months, priceData]);

    if (loading || !priceData) {
        return (
            <div className="w-full max-w-md p-6 rounded-xl border border-border bg-card animate-pulse">
                <div className="h-5 w-40 bg-muted rounded mb-4" />
                <div className="h-10 w-full bg-muted rounded mb-3" />
                <div className="h-10 w-full bg-muted rounded" />
            </div>
        );
    }

    const profit = projectedValue - amount;
    const roi = (profit / amount) * 100;

    return (
        <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                <img src={priceData.image} alt={priceData.name} className="w-7 h-7 rounded-full" />
                <div>
                    <h3 className="font-semibold text-sm leading-none mb-0.5">What If Simulator</h3>
                    <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wide">{priceData.name}</p>
                </div>
            </div>

            {/* Inputs */}
            <div className="px-5 py-4 grid grid-cols-2 gap-3">
                <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono block mb-1.5">Investment ($)</label>
                    <input
                        type="number"
                        className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm font-mono focus:ring-1 focus:ring-primary/40 outline-none transition-all"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                    />
                </div>
                <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono block mb-1.5">Duration (mo)</label>
                    <input
                        type="number"
                        max={60}
                        className="w-full bg-muted/30 border border-border rounded-lg px-3 py-2.5 text-sm font-mono focus:ring-1 focus:ring-primary/40 outline-none transition-all"
                        value={months}
                        onChange={(e) => setMonths(Number(e.target.value))}
                    />
                </div>
            </div>

            {/* Results */}
            <div className="mx-5 mb-5 rounded-lg bg-muted/20 border border-border p-4 relative overflow-hidden">
                <div className="absolute top-2 right-2 opacity-5">
                    <Activity className="w-20 h-20" />
                </div>

                <div className="relative z-10 space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Projected Value</span>
                        <span className={cn("text-xl font-bold font-mono",
                            profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                        )}>
                            ${projectedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Profit / Loss</span>
                        <span className={cn("font-mono font-medium",
                            profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                        )}>
                            {profit >= 0 ? "+" : ""}{profit.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({roi.toFixed(1)}%)
                        </span>
                    </div>

                    <div className="pt-3 border-t border-dashed border-border">
                        <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Risk</span>
                            <span className={cn("text-[10px] font-mono font-bold px-2 py-0.5 rounded-md",
                                riskScore < 30 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                    riskScore < 70 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                                        "bg-red-500/10 text-red-500"
                            )}>{riskScore.toFixed(0)}/100</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className={cn("h-full rounded-full transition-all duration-700",
                                    riskScore < 30 ? "bg-emerald-500" :
                                        riskScore < 70 ? "bg-amber-500" :
                                            "bg-red-500"
                                )}
                                style={{ width: `${riskScore}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-5 pb-4">
                <p className="text-[10px] text-muted-foreground text-center font-mono">
                    * Estimates based on historic volatility. Not financial advice.
                </p>
            </div>
        </div>
    );
}
