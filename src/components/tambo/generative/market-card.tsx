"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { coingeckoService, CoinGeckoMarketData } from "@/services/coingecko";

export const marketCardSchema = z.object({
    symbol: z.string().describe("The coin ID (e.g., 'bitcoin')"),
});

export type MarketCardProps = z.infer<typeof marketCardSchema>;

export function MarketSnapshotCard({ symbol }: MarketCardProps) {
    const [data, setData] = useState<CoinGeckoMarketData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        async function fetchData() {
            setLoading(true);
            try {
                const results = await coingeckoService.getMarketData([symbol]);
                if (mounted && results.length > 0) {
                    setData(results[0]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        if (symbol) fetchData();
        return () => { mounted = false; };
    }, [symbol]);

    if (loading) {
        return (
            <div className="w-72 p-5 rounded-xl border border-border bg-card animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 bg-muted rounded-full" />
                    <div className="h-5 w-24 bg-muted rounded" />
                </div>
                <div className="h-8 w-36 bg-muted rounded mb-4" />
                <div className="grid grid-cols-2 gap-3">
                    <div className="h-10 bg-muted rounded" />
                    <div className="h-10 bg-muted rounded" />
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="w-72 p-5 rounded-xl border border-destructive/20 bg-card">
                <div className="text-sm text-destructive">Could not load data for {symbol}</div>
            </div>
        );
    }

    const isPositive = data.price_change_percentage_24h >= 0;

    return (
        <div className="w-72 p-5 rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    {data.image && <img src={data.image} alt={data.name} className="w-7 h-7 rounded-full" />}
                    <div>
                        <span className="font-semibold text-sm text-foreground">{data.name}</span>
                        <span className="text-xs text-muted-foreground uppercase ml-1.5">{data.symbol}</span>
                    </div>
                </div>
                <div className={cn(
                    "flex items-center gap-0.5 text-xs font-mono font-semibold px-2 py-1 rounded-md",
                    isPositive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-500"
                )}>
                    {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(data.price_change_percentage_24h).toFixed(2)}%
                </div>
            </div>

            {/* Price */}
            <div className="mb-5">
                <div className="text-2xl font-bold font-mono tracking-tight">
                    ${data.current_price.toLocaleString()}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Mkt Cap</div>
                    <div className="text-sm font-mono font-medium text-foreground">${(data.market_cap / 1e9).toFixed(2)}B</div>
                </div>
                <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Vol 24h</div>
                    <div className="text-sm font-mono font-medium text-foreground">${(data.total_volume / 1e6).toFixed(0)}M</div>
                </div>
            </div>
        </div>
    );
}
