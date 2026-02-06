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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function AllocationBreakdown({ data, title = "Allocation Breakdown" }: AllocationBreakdownProps) {
    // Sort data by value and take top 5 + "Others" if too many?
    // For simplicity, just show all for now.

    if (!data || data.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">No allocation data provided.</div>;
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="w-full max-w-sm p-4 rounded-xl border bg-card text-card-foreground shadow-sm">
            <h3 className="font-semibold mb-4 text-center">{title}</h3>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="asset"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="var(--background)" strokeWidth={2} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}
                            itemStyle={{ color: "#fff" }}
                            formatter={(value: number) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, 'Value']}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-muted-foreground">
                <div>Total Value</div>
                <div className="text-right font-mono font-medium text-foreground">${total.toLocaleString()}</div>
            </div>
        </div>
    );
}
