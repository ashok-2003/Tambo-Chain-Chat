"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { z } from "zod";
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

export function PriceChart({ tokens, timeframe = "7", title }: PriceChartProps) {
    const [data, setData] = useState<ChartDataPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const promises = tokens.map(token => coingeckoService.getPriceHistory(token, timeframe));
                const results = await Promise.all(promises);

                if (results.every(r => r === null)) {
                    throw new Error("Failed to fetch data for all tokens");
                }

                // Process data
                // Assume all return roughly same timestamps, align by index for simplicity or use timestamp mapping
                // For varying lengths, a proper map by timestamp is better.

                const timestampMap = new Map<number, { [key: string]: number }>();

                results.forEach((res, index) => {
                    if (!res) return;
                    const tokenName = tokens[index];
                    res.prices.forEach(([timestamp, price]) => {
                        // Round timestamp to nearest hour/day to align slightly off data
                        // For 7 days, hourly is good.
                        const alignedTime = Math.floor(timestamp / 1000 / 60 / 60) * 1000 * 60 * 60;

                        const existing = timestampMap.get(alignedTime) || {};
                        timestampMap.set(alignedTime, { ...existing, [tokenName]: price });
                    });
                });

                const chartData: ChartDataPoint[] = Array.from(timestampMap.entries())
                    .sort(([a], [b]) => a - b)
                    .map(([timestamp, values]) => ({
                        date: new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: timeframe === '1' ? '2-digit' : undefined }),
                        ...values,
                    }));

                setData(chartData);
            } catch (err) {
                console.error(err);
                setError("Failed to load chart data");
            } finally {
                setLoading(false);
            }
        }

        if (tokens.length > 0) {
            fetchData();
        }
    }, [tokens, timeframe]);

    if (loading) {
        return (
            <div className="w-full h-64 flex items-center justify-center bg-muted/20 rounded-lg animate-pulse">
                <div className="text-muted-foreground">Loading market data...</div>
            </div>
        );
    }

    if (error || data.length === 0) {
        return (
            <div className="w-full h-64 flex items-center justify-center bg-muted/20 rounded-lg border border-destructive/20">
                <div className="text-destructive">{error || "No data available"}</div>
            </div>
        );
    }

    const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"];

    return (
        <div className="w-full p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">{title || `Price Performance (${timeframe}d)`}</h3>
                <div className="flex gap-2">
                    {tokens.map((t, i) => (
                        <span key={t} className="text-xs px-2 py-1 rounded-full bg-muted" style={{ color: colors[i % colors.length] }}>
                            {t}
                        </span>
                    ))}
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            {tokens.map((token, index) => (
                                <linearGradient key={token} id={`color-${token}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0} />
                                </linearGradient>
                            ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                        <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                        <YAxis
                            domain={['auto', 'auto']}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(val) => `$${val.toLocaleString()}`}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}
                            itemStyle={{ color: "#fff" }}
                            labelStyle={{ color: "#888" }}
                        />
                        {tokens.map((token, index) => (
                            <Area
                                key={token}
                                type="monotone"
                                dataKey={token}
                                stroke={colors[index % colors.length]}
                                fillOpacity={1}
                                fill={`url(#color-${token})`}
                            />
                        ))}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
