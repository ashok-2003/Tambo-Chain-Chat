"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Plus, Trash2, RefreshCw, Calculator } from "lucide-react";
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
    id: string; // Internal ID for keys
    asset: string; // Coin ID (e.g. bitcoin)
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
        // Add a placeholder item
        setItems([...items, {
            id: Math.random().toString(36).substr(2, 9),
            asset: "bitcoin",
            quantity: 1,
            avgBuy: 0,
            currentPrice: null
        }]);
    };

    const updateItem = (id: string, field: keyof PortfolioItem, value: any) => {
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
        <div className="w-full rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-muted/30">
                <h3 className="font-semibold flex items-center gap-2">
                    <Calculator className="w-4 h-4" /> Portfolio Simulator
                </h3>
                <button
                    onClick={fetchPrices}
                    className={cn("p-2 rounded-full hover:bg-muted transition-colors", loading && "animate-spin")}
                    title="Refresh Prices"
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                        <tr>
                            <th className="px-4 py-3">Asset</th>
                            <th className="px-4 py-3 text-right">Qty</th>
                            <th className="px-4 py-3 text-right">Avg Buy</th>
                            <th className="px-4 py-3 text-right">Current</th>
                            <th className="px-4 py-3 text-right">Value</th>
                            <th className="px-4 py-3 text-right">P/L</th>
                            <th className="px-4 py-3 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {items.map(item => {
                            const currentValue = item.quantity * (item.currentPrice || 0);
                            const cost = item.quantity * item.avgBuy;
                            const pnl = currentValue - cost;

                            return (
                                <tr key={item.id} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-4 py-3 font-medium">
                                        <input
                                            className="bg-transparent border-b border-dashed border-muted-foreground/30 focus:border-primary focus:outline-none w-24"
                                            value={item.asset}
                                            onChange={(e) => updateItem(item.id, 'asset', e.target.value)}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <input
                                            type="number"
                                            className="bg-transparent border-b border-dashed border-muted-foreground/30 focus:border-primary focus:outline-none w-16 text-right"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <input
                                            type="number"
                                            className="bg-transparent border-b border-dashed border-muted-foreground/30 focus:border-primary focus:outline-none w-20 text-right"
                                            value={item.avgBuy}
                                            onChange={(e) => updateItem(item.id, 'avgBuy', parseFloat(e.target.value) || 0)}
                                        />
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono">
                                        {item.currentPrice ? `$${item.currentPrice.toLocaleString()}` : "Loading..."}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono font-medium">
                                        ${currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </td>
                                    <td className={cn("px-4 py-3 text-right font-mono font-medium", pnl >= 0 ? "text-green-500" : "text-red-500")}>
                                        {pnl >= 0 ? "+" : ""}{pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                    No assets in portfolio. Add one to start tracking.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-muted/20 border-t flex justify-between items-center">
                <button
                    onClick={addItem}
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Add Asset
                </button>

                <div className="text-right">
                    <div className="text-xs text-muted-foreground uppercase">Total Portfolio Value</div>
                    <div className="text-xl font-bold font-mono">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    <div className={cn("text-xs font-mono", pnlPercent >= 0 ? "text-green-500" : "text-red-500")}>
                        {pnlPercent >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}% (${totalPnL.toFixed(2)})
                    </div>
                </div>
            </div>
        </div>
    );
}
