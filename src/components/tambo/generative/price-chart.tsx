"use client";

import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { z } from "zod";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { coingeckoService } from "@/services/coingecko";

export const priceChartSchema = z.object({
    tokens: z.array(z.string()).describe("List of token IDs (e.g., ['bitcoin', 'ethereum'])"),
    timeframe: z.string().optional().describe("Timeframe in days (default: '7')"),
    title: z.string().optional().describe("Chart title"),
});

export type PriceChartProps = z.infer<typeof priceChartSchema>;

interface ChartDataPoint {
    date: string;
    [key: string]: number | string;
}

export function PriceChart({ tokens = [], timeframe = "7", title }: PriceChartProps) {
    const fetchPriceHistory = async () => {
        const promises = tokens.map(token => coingeckoService.getPriceHistory(token, timeframe));
        const results = await Promise.all(promises);

        if (results.every(r => r === null)) {
            throw new Error("Failed to fetch data for all tokens");
        }

        // Process data
        const timestampMap = new Map<number, { [key: string]: number }>();

        results.forEach((res, index) => {
            if (!res) return;
            const tokenName = tokens[index];
            res.prices.forEach(([timestamp, price]) => {
                // Round timestamp to nearest hour/day to align slightly off data
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
            <div className="w-full h-[360px] flex flex-col items-center justify-center bg-muted/20 rounded-xl border border-border/40 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]" />
                <Activity className="w-8 h-8 text-muted-foreground/50 mb-3 animate-bounce" />
                <div className="text-sm font-medium text-muted-foreground">Analyzing market data...</div>
            </div>
        );
    }

    if (isError || (chartData.length === 0 && !loading)) {
        return (
            <div className="w-full h-[360px] flex flex-col items-center justify-center bg-muted/10 rounded-xl border border-destructive/20 text-center p-6">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
                    <Activity className="w-6 h-6 text-destructive" />
                </div>
                <h4 className="font-semibold text-foreground mb-1">Data Unavailable</h4>
                <p className="text-sm text-muted-foreground">
                    {(error as Error)?.message || "Could not fetch price history for these tokens."}
                </p>
            </div>
        );
    }

    const colors = ["#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

    return (
        <div className="w-full p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-lg leading-none mb-1">{title || `Market Performance`}</h3>
                    <p className="text-xs text-muted-foreground">Last {timeframe} days history</p>
                </div>
                <div className="flex gap-2">
                    {tokens.map((t, i) => (
                        <div key={t} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border/50 text-xs font-medium transition-colors hover:bg-muted">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                            <span className="capitalize">{t}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            {tokens.map((token, index) => (
                                <linearGradient key={token} id={`color-${token}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.1} vertical={false} />
                        <XAxis
                            dataKey="date"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={40}
                            tick={{ fill: 'var(--muted-foreground)' }}
                            dy={10}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                            tick={{ fill: 'var(--muted-foreground)' }}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: "12px",
                                border: "1px solid var(--border)",
                                backgroundColor: "var(--popover)",
                                color: "var(--popover-foreground)",
                                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)"
                            }}
                            itemStyle={{ fontSize: "12px", fontWeight: 500 }}
                            labelStyle={{ color: "var(--muted-foreground)", fontSize: "11px", marginBottom: "4px" }}
                            cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.5 }}
                        />
                        {tokens.map((token, index) => (
                            <Area
                                key={token}
                                type="monotone"
                                dataKey={token}
                                stroke={colors[index % colors.length]}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill={`url(#color-${token})`}
                                activeDot={{ r: 4, strokeWidth: 0, fill: colors[index % colors.length] }}
                                animationDuration={1500}
                                animationEasing="ease-out"
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
