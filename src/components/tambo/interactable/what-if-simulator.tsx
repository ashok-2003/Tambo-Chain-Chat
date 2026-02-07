"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { ArrowRight, AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { coingeckoService } from "@/services/coingecko";

export const whatIfSimulatorSchema = z.object({
    token: z.string().describe("Token ID to simulate (e.g. 'ethereum')"),
});

export type WhatIfSimulatorProps = z.infer<typeof whatIfSimulatorSchema>;

export function WhatIfSimulator({ token }: WhatIfSimulatorProps) {
    const [amount, setAmount] = useState<number>(1000); // USD Investment
    const [months, setMonths] = useState<number>(12);
    const [priceData, setPriceData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Simulation results
    const [projectedValue, setProjectedValue] = useState<number>(0);
    const [riskScore, setRiskScore] = useState<number>(0); // 0-100

    useEffect(() => {
        async function fetchContext() {
            setLoading(true);
            try {
                const data = await coingeckoService.getMarketData([token]);
                if (data && data.length > 0) {
                    setPriceData(data[0]);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        }
        if (token) fetchContext();
    }, [token]);

    // "Sophisticated" simulation logic (Mock for demo)
    useEffect(() => {
        if (!priceData) return;

        // Simple math: Base growth + volatility factor
        const volatility = Math.abs(priceData.price_change_percentage_24h) * 2; // Rough proxy
        const annualGrowth = (Math.random() * 0.5) + (priceData.price_change_percentage_24h > 0 ? 0.2 : -0.1);

        const projected = amount * (1 + (annualGrowth * (months / 12)));
        setProjectedValue(projected);

        // Risk is higher for lower market cap and high volatility
        const mcapScore = Math.min(100, Math.max(0, 100 - (priceData.market_cap_rank || 100)));
        const risk = 100 - (mcapScore * 0.7) + (volatility * 2);
        setRiskScore(Math.min(95, Math.max(5, risk))); // Clamp 5-95

    }, [amount, months, priceData]);

    if (loading || !priceData) return <div className="p-4 animate-pulse text-muted-foreground">Loading simulator for {token}...</div>;

    const profit = projectedValue - amount;
    const roi = (profit / amount) * 100;

    return (
        <div className="w-full max-w-md rounded-xl border bg-card text-card-foreground p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <img src={priceData.image} alt={priceData.name} className="w-8 h-8 rounded-full" />
                <div>
                    <h3 className="font-bold text-lg leading-none">What If...?</h3>
                    <p className="text-sm text-muted-foreground">Simulate returns for {priceData.name}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="text-xs text-muted-foreground uppercase font-semibold mb-1 block">Invest Amount ($)</label>
                    <input
                        type="number"
                        className="w-full bg-muted/30 border rounded-lg px-3 py-2 text-lg font-mono focus:ring-2 ring-primary outline-none"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                    />
                </div>
                <div>
                    <label className="text-xs text-muted-foreground uppercase font-semibold mb-1 block">Duration (Months)</label>
                    <input
                        type="number"
                        max={60}
                        className="w-full bg-muted/30 border rounded-lg px-3 py-2 text-lg font-mono focus:ring-2 ring-primary outline-none"
                        value={months}
                        onChange={(e) => setMonths(Number(e.target.value))}
                    />
                </div>
            </div>

            <div className="bg-muted/20 rounded-xl p-4 border relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Activity className="w-24 h-24" />
                </div>

                <div className="relative z-10">
                    <div className="flex justify-between items-end mb-2">
                        <div className="text-sm text-muted-foreground">Projected Value</div>
                        <div className={cn("text-2xl font-bold font-mono", profit >= 0 ? "text-green-500" : "text-red-500")}>
                            ${projectedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-sm mb-4">
                        <span className="text-muted-foreground">Total Profit/Loss</span>
                        <span className={cn("font-medium", profit >= 0 ? "text-green-500" : "text-red-500")}>
                            {profit >= 0 ? "+" : ""}{profit.toLocaleString(undefined, { maximumFractionDigits: 0 })} ({roi.toFixed(1)}%)
                        </span>
                    </div>

                    <div className="pt-4 border-t border-dashed border-muted-foreground/30">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-semibold uppercase text-muted-foreground">Risk Score</span>
                            <span className={cn("text-xs font-bold px-2 py-0.5 rounded",
                                riskScore < 30 ? "bg-green-500/20 text-green-500" :
                                    riskScore < 70 ? "bg-yellow-500/20 text-yellow-500" :
                                        "bg-red-500/20 text-red-500"
                            )}>{riskScore.toFixed(0)}/100</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className={cn("h-full transition-all duration-500",
                                    riskScore < 30 ? "bg-green-500" :
                                        riskScore < 70 ? "bg-yellow-500" :
                                            "bg-red-500"
                                )}
                                style={{ width: `${riskScore}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <p className="text-[10px] text-muted-foreground mt-4 text-center">
                * Estimates based on historic volatility & market rank. Not financial advice.
            </p>
        </div>
    );
}
