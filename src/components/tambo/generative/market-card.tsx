"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Activity } from "lucide-react";
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

        if (symbol) {
            fetchData();
        }

        return () => { mounted = false; };
    }, [symbol]);

    if (loading) {
        return (
            <div className="w-64 p-4 rounded-xl border bg-card/50 animate-pulse">
                <div className="h-6 w-24 bg-muted rounded mb-4"></div>
                <div className="h-8 w-32 bg-muted rounded mb-2"></div>
                <div className="h-4 w-16 bg-muted rounded"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="w-64 p-4 rounded-xl border border-destructive/30 bg-destructive/10">
                <div className="text-sm text-destructive">Could not load data for {symbol}</div>
            </div>
        );
    }

    const isPositive = data.price_change_percentage_24h >= 0;

    return (
        <div className="w-64 p-4 rounded-xl border bg-linear-to-br from-card to-card/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {data.image && <img src={data.image} alt={data.name} className="w-6 h-6 rounded-full" />}
                    <span className="font-semibold text-lg">{data.name}</span>
                    <span className="text-xs text-muted-foreground uppercase">{data.symbol}</span>
                </div>
                <div className={cn("flex items-center text-xs font-medium px-2 py-1 rounded-full", isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                    {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                    {Math.abs(data.price_change_percentage_24h).toFixed(2)}%
                </div>
            </div>

            <div className="mb-4">
                <div className="text-2xl font-bold tracking-tight">
                    ${data.current_price.toLocaleString()}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                    <div className="mb-0.5">Market Cap</div>
                    <div className="font-medium text-foreground">${(data.market_cap / 1e9).toFixed(2)}B</div>
                </div>
                <div>
                    <div className="mb-0.5">Volume (24h)</div>
                    <div className="font-medium text-foreground">${(data.total_volume / 1e6).toFixed(0)}M</div>
                </div>
            </div>
        </div>
    );
}
