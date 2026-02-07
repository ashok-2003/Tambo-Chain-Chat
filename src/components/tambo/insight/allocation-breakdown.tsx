"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { z } from "zod";

export const allocationBreakdownSchema = z.object({
    data: z.array(z.object({
        asset: z.string(),
        value: z.number(),
    })).describe("List of assets and their values/percentages"),
    title: z.string().optional().describe("Chart title"),
});

export type AllocationBreakdownProps = z.infer<typeof allocationBreakdownSchema>;

const COLORS = ['#d4956a', '#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f87171'];

export function AllocationBreakdown({ data, title = "Allocation Breakdown" }: AllocationBreakdownProps) {
    if (!data || data.length === 0) {
        return (
            <div className="p-6 text-center text-sm text-muted-foreground border border-border rounded-xl bg-card">
                No allocation data provided.
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="w-full max-w-sm p-5 rounded-xl border border-border bg-card shadow-sm">
            <h3 className="font-semibold text-sm text-center mb-1">{title}</h3>
            <p className="text-[10px] text-muted-foreground text-center font-mono tracking-wide uppercase mb-4">Portfolio Distribution</p>

            <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={78}
                            fill="#8884d8"
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="asset"
                            strokeWidth={0}
                        >
                            {data.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                borderRadius: "8px",
                                border: "1px solid var(--border)",
                                backgroundColor: "var(--popover)",
                                color: "var(--popover-foreground)",
                                boxShadow: "0 4px 16px -4px rgba(0,0,0,0.2)",
                                fontSize: "12px",
                            }}
                            formatter={(value: number) => [`$${value.toLocaleString()} (${((value / total) * 100).toFixed(1)}%)`, '']}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            iconSize={8}
                            formatter={(value) => <span className="text-xs text-muted-foreground ml-1">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between pt-4 mt-2 border-t border-border">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Total Value</span>
                <span className="text-sm font-mono font-semibold text-foreground">${total.toLocaleString()}</span>
            </div>
        </div>
    );
}
