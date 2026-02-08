"use client";

import { useQuery } from "@tanstack/react-query";
import { Bar, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { z } from "zod";
import { Activity, BarChart2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { coingeckoService } from "@/services/coingecko";
import { useState } from "react";

export const priceChartSchema = z.object({
    tokens: z.array(z.string()).describe("List of token IDs (e.g., ['bitcoin', 'ethereum'])"),
    timeframe: z.string().optional().describe("Timeframe in days (default: '7')"),
    title: z.string().optional().describe("Chart title"),
});

export type PriceChartProps = z.infer<typeof priceChartSchema>;

interface ChartDataPoint {
    date: string;
    // For line chart
    [key: string]: number | string | any;
}

interface OHLCDataPoint {
    date: string;
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

const Candlestick = (props: any) => {
    const {
        x,
        y,
        width,
        height,
    } = props;

    // access data from payload
    const { open, close, high, low } = props.payload;

    const isGrowing = close > open;
    const color = isGrowing ? "#10b981" : "#ef4444";
    // Ratio is chart pixel height / value range
    // Since Bar with [min, max] maps y to max and height to (max-min)
    // We can trust y and height passed by Bar for range [low, high]
    // height corresponds to (high - low)
    const ratio = height / (high - low);

    return (
        <g stroke={color} fill={color} strokeWidth="2">
            <path
                d={`
          M ${x + width / 2}, ${y}
          L ${x + width / 2}, ${y + height}
        `}
            />
            {/* Body */}
            <rect
                x={x + width * 0.25}
                y={isGrowing ? y + (high - close) * ratio : y + (high - open) * ratio}
                width={width * 0.5}
                height={Math.max(2, Math.abs(open - close) * ratio)}
                stroke="none"
            />
        </g>
    );
};

export function PriceChart({ tokens = [], timeframe = "7", title }: PriceChartProps) {
    const [chartType, setChartType] = useState<'line' | 'candle'>('line');

    const fetchPriceHistory = async () => {
        // If single token and candle mode, fetch OHLC
        if (tokens.length === 1 && chartType === 'candle') {
            const data = await coingeckoService.getOHLC(tokens[0], timeframe);
            if (!data) throw new Error("Failed to fetch OHLC data");

            return data.map(([timestamp, open, high, low, close]) => ({
                date: new Date(timestamp).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: timeframe === '1' ? '2-digit' : undefined
                }),
                timestamp,
                open,
                high,
                low,
                close,
                range: [low, high] // Add range for Bar chart
            }));
        }

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
        queryKey: ['priceHistory', tokens, timeframe, chartType],
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

    const colors = ["#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"];
    const isSingleToken = tokens.length === 1;

    // Calculate domain for candlestick to zoom in
    const getDomain = () => {
        if (chartType !== 'candle' || !isSingleToken) return ['auto', 'auto'];
        const lows = (chartData as OHLCDataPoint[]).map(d => d.low);
        const highs = (chartData as OHLCDataPoint[]).map(d => d.high);
        const min = Math.min(...lows);
        const max = Math.max(...highs);
        const padding = (max - min) * 0.1;
        return [min - padding, max + padding];
    };

    return (
        <div className="w-full p-6 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-semibold text-base leading-none mb-1.5">{title || "Market Performance"}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{timeframe}D HISTORY</p>
                </div>
                <div className="flex items-center gap-2">
                    {isSingleToken && (
                        <div className="flex bg-muted/50 rounded-lg p-1 border border-border/50 mr-2">
                            <button
                                onClick={() => setChartType('line')}
                                className={cn(
                                    "p-1.5 rounded-md transition-all",
                                    chartType === 'line' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                                title="Line Chart"
                            >
                                <TrendingUp size={16} />
                            </button>
                            <button
                                onClick={() => setChartType('candle')}
                                className={cn(
                                    "p-1.5 rounded-md transition-all",
                                    chartType === 'candle' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                                title="Candlestick Chart"
                            >
                                <BarChart2 size={16} />
                            </button>
                        </div>
                    )}

                    <div className="flex gap-2">
                        {tokens.map((t, i) => (
                            <div key={t} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border/50 text-xs font-medium transition-colors hover:bg-muted">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                                <span className="capitalize">{t}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'candle' && isSingleToken ? (
                        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                                domain={getDomain() as any}
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                                tick={{ fill: 'var(--muted-foreground)' }}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="rounded-xl border border-border bg-popover text-popover-foreground shadow-lg p-3 text-xs">
                                                <div className="text-muted-foreground mb-2">{label}</div>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                                    <span className="text-muted-foreground">Open:</span>
                                                    <span className="font-mono font-medium">${data.open.toLocaleString()}</span>
                                                    <span className="text-muted-foreground">High:</span>
                                                    <span className="font-mono font-medium text-emerald-500">${data.high.toLocaleString()}</span>
                                                    <span className="text-muted-foreground">Low:</span>
                                                    <span className="font-mono font-medium text-red-500">${data.low.toLocaleString()}</span>
                                                    <span className="text-muted-foreground">Close:</span>
                                                    <span className="font-mono font-medium">${data.close.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar
                                dataKey="range" // Use range [low, high]
                                shape={<Candlestick />}
                                animationDuration={1500}
                                animationEasing="ease-out"
                            >
                            </Bar>
                        </ComposedChart>
                    ) : (
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
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
