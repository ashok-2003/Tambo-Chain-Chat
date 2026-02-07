"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { coingeckoService, CoinGeckoMarketData } from "@/services/coingecko";

export const portfolioTableSchema = z.object({
    initialPortfolio: z.array(z.object({
        asset: z.string(),
        quantity: z.number(),
        avgBuy: z.number(),
    })).optional().describe("Initial portfolio data"),
});

export type PortfolioTableProps = z.infer<typeof portfolioTableSchema>;

interface PortfolioItem {
    id: string;
    asset: string;
    quantity: number;
    avgBuy: number;
    currentPrice: number | null;
    marketData?: CoinGeckoMarketData;
}

export function PortfolioTable({ initialPortfolio = [] }: PortfolioTableProps) {
    const [items, setItems] = useState<PortfolioItem[]>(() =>
        initialPortfolio.map(p => ({
            id: Math.random().toString(36).substr(2, 9),
            asset: p.asset,
            quantity: p.quantity,
            avgBuy: p.avgBuy,
            currentPrice: null
        }))
    );
    const [loading, setLoading] = useState(false);

    const fetchPrices = async () => {
        if (items.length === 0) return;
        setLoading(true);
        try {
            const ids = [...new Set(items.map(i => i.asset))];
            const marketData = await coingeckoService.getMarketData(ids);
            setItems(prev => prev.map(item => {
                const data = marketData.find(d => d.id === item.asset);
                return {
                    ...item,
                    currentPrice: data?.current_price || item.currentPrice,
                    marketData: data
                };
            }));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrices();
    }, []);

    const addItem = () => {
        setItems([...items, {
            id: Math.random().toString(36).substr(2, 9),
            asset: "bitcoin",
            quantity: 1,
            avgBuy: 0,
            currentPrice: null
        }]);
    };

    const updateItem = (id: string, field: keyof PortfolioItem, value: string | number) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const totalValue = items.reduce((sum, item) => sum + (item.quantity * (item.currentPrice || 0)), 0);
    const totalCost = items.reduce((sum, item) => sum + (item.quantity * item.avgBuy), 0);
    const totalPnL = totalValue - totalCost;
    const pnlPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

    return (
        <div className="w-full rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-border flex justify-between items-center">
                <h3 className="font-semibold text-sm">Portfolio Simulator</h3>
                <button
                    onClick={fetchPrices}
                    className={cn("p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground", loading && "animate-spin")}
                    title="Refresh Prices"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            <th className="px-4 py-2.5 text-left font-medium text-muted-foreground uppercase tracking-wider">Asset</th>
                            <th className="px-4 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider">Qty</th>
                            <th className="px-4 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider">Avg Buy</th>
                            <th className="px-4 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider">Current</th>
                            <th className="px-4 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider">Value</th>
                            <th className="px-4 py-2.5 text-right font-medium text-muted-foreground uppercase tracking-wider">P/L</th>
                            <th className="px-4 py-2.5 w-10" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {items.map(item => {
                            const currentValue = item.quantity * (item.currentPrice || 0);
                            const cost = item.quantity * item.avgBuy;
                            const pnl = currentValue - cost;

                            return (
                                <tr key={item.id} className="hover:bg-muted/20 transition-colors group">
                                    <td className="px-4 py-2.5">
                                        <input
                                            className="bg-transparent border-b border-dashed border-transparent focus:border-primary focus:outline-none w-24 text-sm font-medium"
                                            value={item.asset}
                                            onChange={(e) => updateItem(item.id, 'asset', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <input
                                            type="number"
                                            className="bg-transparent border-b border-dashed border-transparent focus:border-primary focus:outline-none w-16 text-right font-mono text-sm"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <input
                                            type="number"
                                            className="bg-transparent border-b border-dashed border-transparent focus:border-primary focus:outline-none w-20 text-right font-mono text-sm"
                                            value={item.avgBuy}
                                            onChange={(e) => updateItem(item.id, 'avgBuy', parseFloat(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td className="px-4 py-2.5 text-right font-mono text-sm text-muted-foreground">
                                        {item.currentPrice ? `$${item.currentPrice.toLocaleString()}` : "..."}
                                    </td>
                                    <td className="px-4 py-2.5 text-right font-mono text-sm font-medium">
                                        ${currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </td>
                                    <td className={cn("px-4 py-2.5 text-right font-mono text-sm font-medium",
                                        pnl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                                    )}>
                                        {pnl >= 0 ? "+" : ""}{pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-2.5 text-center">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                                    No assets in portfolio. Add one to start tracking.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-border flex justify-between items-center bg-muted/20">
                <button
                    onClick={addItem}
                    className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" /> Add Asset
                </button>

                <div className="text-right">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono mb-0.5">Total Value</div>
                    <div className="text-lg font-bold font-mono">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <div className={cn("text-xs font-mono", pnlPercent >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500")}>
                        {pnlPercent >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}% (${totalPnL.toFixed(2)})
                    </div>
                </div>
            </div>
        </div>
    );
}
