"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { ExternalLink, Newspaper, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const newsFeedSchema = z.object({
    topic: z.string().optional().describe("Specific topic to filter news (e.g., 'Bitcoin', 'DeFi')"),
    limit: z.number().optional().describe("Number of news items to show (default: 5)"),
});

export type NewsFeedProps = z.infer<typeof newsFeedSchema>;

interface NewsItem {
    id: string;
    title: string;
    summary: string;
    source: string;
    url: string;
    publishedAt: string;
    sentiment: "positive" | "negative" | "neutral";
    imageUrl?: string;
}

const generateMockNews = (topic: string = "Crypto"): NewsItem[] => {
    const topics = ["Bitcoin", "Ethereum", "Solana", "DeFi", "NFTs", "Regulation"];
    const sources = ["CoinDesk", "CoinTelegraph", "The Block", "Decrypt", "Bloomberg Crypto"];

    return Array.from({ length: 10 }).map((_, i) => {
        const randomTopic = topic === "Crypto" ? topics[Math.floor(Math.random() * topics.length)] : topic;
        const isPositive = Math.random() > 0.4;

        const actions = isPositive
            ? ["surges past key resistance levels", "sees unprecedented institutional inflow", "announces major partnership", "completes successful upgrade", "dominates trading volume"]
            : ["faces regulatory scrutiny", "experiences short-term correction", "struggles with network congestion", "sees minor pullback after rally", "consolidates at support levels"];

        const consequences = isPositive
            ? "sparking renewed optimism among retail and institutional investors alike. Analysts suggest this could be the start of a sustained bullish trend."
            : "leading to caution across the broader market. Experts advise traders to watch for volatility in the coming days while long-term fundamentals remain intact.";

        const detailedSummary = `Breaking: ${randomTopic} ${actions[Math.floor(Math.random() * actions.length)]}, ${consequences} Trading volume has increased by ${Math.floor(Math.random() * 50) + 10}% in the last 24 hours.`;

        return {
            id: `news-${i}`,
            title: `${randomTopic} ${isPositive ? "Soars" : "Dips"} in Major Market Move`,
            summary: detailedSummary,
            source: sources[Math.floor(Math.random() * sources.length)],
            url: `https://www.google.com/search?q=${randomTopic}+crypto+news`,
            publishedAt: `${Math.floor(Math.random() * 12) + 1}h ago`,
            sentiment: isPositive ? "positive" : Math.random() > 0.5 ? "negative" : "neutral",
            imageUrl: `https://source.unsplash.com/random/400x200/?${randomTopic},crypto,blockchain&sig=${i}`
        };
    });
};

export function NewsFeed({ topic = "Crypto", limit = 5 }: NewsFeedProps) {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setNews(generateMockNews(topic).slice(0, limit));
            setLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [topic, limit]);

    if (loading) {
        return (
            <div className="w-full max-w-lg rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                </div>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-2 py-3 border-t border-border first:border-0">
                        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-full bg-muted rounded animate-pulse" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">Trending {topic} News</h3>
                </div>
                <div className="flex items-center text-[10px] text-muted-foreground gap-1 font-mono tracking-wide uppercase">
                    <Clock className="w-3 h-3" />
                    <span>Live</span>
                </div>
            </div>

            {/* News items */}
            <div className="divide-y divide-border max-h-[480px] overflow-y-auto">
                {news.map((item, index) => (
                    <div
                        key={item.id}
                        className="px-5 py-4 hover:bg-muted/30 transition-colors group animate-fade-in"
                        style={{ animationDelay: `${index * 60}ms` }}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider",
                                    item.sentiment === "positive" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                                        item.sentiment === "negative" ? "bg-red-500/10 text-red-500" :
                                            "bg-muted text-muted-foreground"
                                )}>
                                    {item.source}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono">{item.publishedAt}</span>
                            </div>

                            <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors p-1 opacity-0 group-hover:opacity-100"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>

                        <h4 className="text-sm font-semibold leading-snug text-foreground mb-1.5">
                            {item.title}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {item.summary}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
