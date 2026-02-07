"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Plus, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { coingeckoService, CoinGeckoMarketData } from "@/services/coingecko";

export const watchlistSchema = z.object({});

export type WatchlistProps = z.infer<typeof watchlistSchema>;

export function Watchlist() {
    const [tokens, setTokens] = useState<string[]>([]);
    const [marketData, setMarketData] = useState<CoinGeckoMarketData[]>([]);
    const [loading, setLoading] = useState(false);
    const [newToken, setNewToken] = useState("");
    const [error, setError] = useState("");
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("tambo-watchlist");
        if (saved) {
            setTokens(JSON.parse(saved));
        } else {
            setTokens(["bitcoin", "ethereum", "solana"]);
        }
    }, []);

    useEffect(() => {
        if (tokens.length > 0) {
            localStorage.setItem("tambo-watchlist", JSON.stringify(tokens));
            fetchData();
        }
    }, [tokens]);

    const fetchData = async () => {
        if (tokens.length === 0) return;
        setLoading(true);
        try {
            const data = await coingeckoService.getMarketData(tokens);
            setMarketData(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const addToken = async () => {
        if (!newToken) return;
        setError("");
        setSearching(true);

        try {
            const searchResults = await coingeckoService.searchCoins(newToken);
            if (searchResults.length > 0) {
                const bestMatch = searchResults[0].id;
                if (tokens.includes(bestMatch)) {
                    setError("Token already in watchlist");
                } else {
                    setTokens([...tokens, bestMatch]);
                    setNewToken("");
                }
            } else {
                setError("Token not found");
            }
        } catch (e) {
            console.error(e);
            setError("Failed to search token");
        } finally {
            setSearching(false);
        }
    };

    const removeToken = (token: string) => {
        setTokens(tokens.filter(t => t !== token));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') addToken();
    };

    return (
        <div className="w-full max-w-sm rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Header with search */}
            <div className="px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <h3 className="font-semibold text-sm">Watchlist</h3>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Add token (e.g. Bitcoin)"
                        className={cn(
                            "flex-1 px-3 py-2 text-sm rounded-lg bg-muted/40 border border-border outline-none focus:ring-1 focus:ring-primary/40 transition-all font-mono placeholder:font-sans placeholder:text-muted-foreground/50",
                            error ? "border-destructive focus:ring-destructive" : ""
                        )}
                        value={newToken}
                        onChange={(e) => {
                            setNewToken(e.target.value);
                            if (error) setError("");
                        }}
                        onKeyDown={handleKeyDown}
                        disabled={searching}
                    />
                    <button
                        onClick={addToken}
                        disabled={searching || !newToken}
                        className="px-3 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {searching ? "..." : <Plus className="w-4 h-4" />}
                    </button>
                </div>
                {error && <div className="text-xs text-destructive mt-2">{error}</div>}
            </div>

            {/* Token list */}
            <div className="divide-y divide-border">
                {loading && marketData.length === 0 ? (
                    <div className="px-5 py-6 text-center text-xs text-muted-foreground font-mono animate-pulse">
                        LOADING PRICES...
                    </div>
                ) : (
                    marketData.map(coin => {
                        const isPositive = coin.price_change_percentage_24h >= 0;
                        return (
                            <div key={coin.id} className="px-5 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors group">
                                <div className="flex items-center gap-2.5">
                                    <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                                    <div>
                                        <div className="font-semibold text-xs leading-none mb-0.5">{coin.symbol.toUpperCase()}</div>
                                        <div className="text-[10px] text-muted-foreground">{coin.name}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="font-medium text-xs font-mono">${coin.current_price.toLocaleString()}</div>
                                        <div className={cn("text-[10px] font-mono font-medium",
                                            isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                                        )}>
                                            {isPositive ? "+" : ""}{coin.price_change_percentage_24h.toFixed(2)}%
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeToken(coin.id)}
                                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-0.5"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
                {marketData.length === 0 && !loading && (
                    <div className="px-5 py-8 text-center text-xs text-muted-foreground">
                        Your watchlist is empty.
                    </div>
                )}
            </div>
        </div>
    );
}
