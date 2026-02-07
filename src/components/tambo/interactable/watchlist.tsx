"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { Plus, X, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { coingeckoService, CoinGeckoMarketData } from "@/services/coingecko";

export const watchlistSchema = z.object({
    // No props needed, uses internal state
});

export type WatchlistProps = z.infer<typeof watchlistSchema>;

export function Watchlist() {
    const [tokens, setTokens] = useState<string[]>([]);
    const [marketData, setMarketData] = useState<CoinGeckoMarketData[]>([]);
    const [loading, setLoading] = useState(false);
    const [newToken, setNewToken] = useState("");
    const [error, setError] = useState("");
    const [searching, setSearching] = useState(false);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("tambo-watchlist");
        if (saved) {
            setTokens(JSON.parse(saved));
        } else {
            setTokens(["bitcoin", "ethereum", "solana"]); // Default
        }
    }, []);

    // Save to localStorage
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
            // First try to search for the coin to get the correct ID
            const searchResults = await coingeckoService.searchCoins(newToken);

            if (searchResults.length > 0) {
                // Use the first result's ID (most relevant)
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
        if (e.key === 'Enter') {
            addToken();
        }
    }

    return (
        <div className="w-full max-w-sm rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/30">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4 fill-primary stroke-primary" /> Watchlist
                </h3>
                <div className="flex gap-2 relative">
                    <input
                        type="text"
                        placeholder="Add token (e.g. Bitcoin)"
                        className={cn(
                            "flex-1 px-3 py-1.5 text-sm rounded-md bg-background border outline-none focus:ring-1 ring-primary transition-colors",
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
                        className="px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[60px]"
                    >
                        {searching ? "..." : "Add"}
                    </button>
                </div>
                {error && <div className="text-xs text-destructive mt-1.5 pl-1">{error}</div>}
            </div>

            <div className="divide-y divide-border">
                {loading && marketData.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground animate-pulse">Loading prices...</div>
                ) : (
                    marketData.map(coin => {
                        const isPositive = coin.price_change_percentage_24h >= 0;
                        return (
                            <div key={coin.id} className="p-3 flex items-center justify-between hover:bg-muted/20 transition-colors group">
                                <div className="flex items-center gap-2">
                                    <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                                    <div>
                                        <div className="font-medium text-sm leading-none">{coin.symbol.toUpperCase()}</div>
                                        <div className="text-xs text-muted-foreground">{coin.name}</div>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-4">
                                    <div>
                                        <div className="font-medium text-sm font-mono">${coin.current_price.toLocaleString()}</div>
                                        <div className={cn("text-xs", isPositive ? "text-green-500" : "text-red-500")}>
                                            {isPositive ? "+" : ""}{coin.price_change_percentage_24h.toFixed(2)}%
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeToken(coin.id)}
                                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
                {marketData.length === 0 && !loading && (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        Your watchlist is empty.
                    </div>
                )}
            </div>
        </div>
    );
}
