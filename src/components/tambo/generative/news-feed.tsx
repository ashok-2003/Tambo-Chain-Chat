"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { ExternalLink, Flame, Newspaper, TrendingUp, Clock } from "lucide-react";
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

// Mock data generator for hackathon demo stability
const generateMockNews = (topic: string = "Crypto"): NewsItem[] => {
    const topics = ["Bitcoin", "Ethereum", "Solana", "DeFi", "NFTs", "Regulation"];
    const sources = ["CoinDesk", "CoinTelegraph", "The Block", "Decrypt", "Bloomberg Crypto"];

    return Array.from({ length: 10 }).map((_, i) => {
        const randomTopic = topic === "Crypto" ? topics[Math.floor(Math.random() * topics.length)] : topic;
        const isPositive = Math.random() > 0.4;

        // Elaborated content for "wow" factor
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
            url: `https://www.google.com/search?q=${randomTopic}+crypto+news`, // Real functional link to search
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
        // Simulate API fetch delay
        const timer = setTimeout(() => {
            setNews(generateMockNews(topic).slice(0, limit));
            setLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [topic, limit]);

    if (loading) {
        return (
            <div className="w-full max-w-lg p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                </div>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4 p-3 rounded-xl border bg-card/50">
                        <div className="h-20 w-20 bg-muted rounded-lg animate-pulse shrink-0" />
                        <div className="space-y-2 flex-1">
                            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                            <div className="h-3 w-full bg-muted rounded animate-pulse" />
                            <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-muted/20 flex items-center justify-between sticky top-0 backdrop-blur-md z-10">
                <div className="flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm">Trending {topic} News</h3>
                </div>
                <div className="flex items-center text-xs text-muted-foreground gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Live Updates</span>
                </div>
            </div>

            <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto custom-scrollbar">
                {news.map((item, index) => (
                    <div
                        key={item.id}
                        className="flex flex-col gap-3 p-5 hover:bg-muted/5 transition-colors group relative overflow-hidden"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                                    item.sentiment === "positive" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                        item.sentiment === "negative" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                            "bg-gray-500/10 text-gray-500 border-gray-500/20"
                                )}>
                                    {item.source}
                                </span>
                                <span className="text-[10px] text-muted-foreground">• {item.publishedAt}</span>
                            </div>

                            <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors p-2 -mr-2 -mt-2 opacity-70 hover:opacity-100"
                                title="Open source in new tab"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-base font-semibold leading-tight text-foreground">
                                {item.title}
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed cursor-text selection:bg-primary/20">
                                {item.summary}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
