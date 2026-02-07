"use client";

import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { z } from "zod";
import { Activity } from "lucide-react";
import { coingeckoService } from "@/services/coingecko";

export const priceChartSchema = z.object({
    tokens: z.array(z.string()).describe("List of token IDs (e.g., ['bitcoin', 'ethereum'])"),
    timeframe: z.string().optional().describe("Timeframe in days (default: '7')"),
    title: z.string().optional().describe("Chart title"),
});

export type PriceChartProps = z.infer<typeof priceChartSchema>;

export function PriceChart({ tokens = [], timeframe = "7", title }: PriceChartProps) {
    const fetchPriceHistory = async () => {
        const promises = tokens.map(token => coingeckoService.getPriceHistory(token, timeframe));
        const results = await Promise.all(promises);

        if (results.every(r => r === null)) {
            throw new Error("Failed to fetch data for all tokens");
        }

        const timestampMap = new Map<number, { [key: string]: number }>();

        results.forEach((res, index) => {
            if (!res) return;
            const tokenName = tokens[index];
            res.prices.forEach(([timestamp, price]) => {
                const alignedTime = Math.floor(timestamp / 1000 / 60 / 60) * 1000 * 60 * 60;
                const existing = timestampMap.get(alignedTime) || {};
                timestampMap.set(alignedTime, { ...existing, [tokenName]: price });
            });
        });

        return Array.from(timestampMap.entries())
            .sort(([a], [b]) => a - b)
            .map(([timestamp, values]) => ({
                date: new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: timeframe === '1' ? '2-digit' : undefined }),
                ...values,
            }));
    };

    const { data: chartData = [], isLoading: loading, error, isError } = useQuery({
        queryKey: ['priceHistory', tokens, timeframe],
        queryFn: fetchPriceHistory,
        enabled: tokens.length > 0,
        refetchOnWindowFocus: false,
    });

    if (loading) {
        return (
            <div className="w-full h-[360px] flex flex-col items-center justify-center bg-muted/20 rounded-xl border border-border animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-muted/10 to-transparent skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]" />
                <Activity className="w-6 h-6 text-muted-foreground/40 mb-3" />
                <div className="text-xs font-medium text-muted-foreground font-mono tracking-wide">LOADING MARKET DATA...</div>
            </div>
        );
    }

    if (isError || (chartData.length === 0 && !loading)) {
        return (
            <div className="w-full h-[360px] flex flex-col items-center justify-center bg-card rounded-xl border border-border text-center p-6">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center mb-3">
                    <Activity className="w-5 h-5 text-destructive" />
                </div>
                <h4 className="font-semibold text-sm text-foreground mb-1">Data Unavailable</h4>
                <p className="text-xs text-muted-foreground max-w-xs">
                    {(error as Error)?.message || "Could not fetch price history for these tokens."}
                </p>
            </div>
        );
    }

    const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
    const rawColors = ["#d4956a", "#60a5fa", "#a78bfa", "#34d399", "#fbbf24"];

    return (
        <div className="w-full p-6 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-semibold text-base leading-none mb-1.5">{title || "Market Performance"}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{timeframe}D HISTORY</p>
                </div>
                <div className="flex gap-2">
                    {tokens.map((t, i) => (
                        <div key={t} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/50 text-xs font-medium">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: rawColors[i % rawColors.length] }} />
                            <span className="capitalize">{t}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                        <defs>
                            {tokens.map((token, index) => (
                                <linearGradient key={token} id={`color-${token}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={rawColors[index % rawColors.length]} stopOpacity={0.15} />
                                    <stop offset="95%" stopColor={rawColors[index % rawColors.length]} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} vertical={false} />
                        <XAxis
                            dataKey="date"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={40}
                            tick={{ fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
                            dy={10}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                            tick={{ fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: "8px",
                                border: "1px solid var(--border)",
                                backgroundColor: "var(--popover)",
                                color: "var(--popover-foreground)",
                                boxShadow: "0 4px 16px -4px rgba(0,0,0,0.2)",
                                fontSize: "12px",
                                fontFamily: "var(--font-mono)",
                            }}
                            itemStyle={{ fontSize: "11px", fontWeight: 500 }}
                            labelStyle={{ color: "var(--muted-foreground)", fontSize: "10px", marginBottom: "4px" }}
                            cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.3 }}
                        />
                        {tokens.map((token, index) => (
                            <Area
                                key={token}
                                type="monotone"
                                dataKey={token}
                                stroke={rawColors[index % rawColors.length]}
                                strokeWidth={1.5}
                                fillOpacity={1}
                                fill={`url(#color-${token})`}
                                activeDot={{ r: 3, strokeWidth: 0, fill: rawColors[index % rawColors.length] }}
                                animationDuration={1200}
                                animationEasing="ease-out"
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
