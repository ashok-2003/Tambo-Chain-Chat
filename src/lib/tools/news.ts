
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

// Mock news data for demonstration/fallback
const MOCK_NEWS = [
    {
        title: "Bitcoin Surges Past Key Resistance Level",
        domain: "coindesk.com",
        url: "https://www.coindesk.com/market/2024/02/10/bitcoin-surges",
        published_at: new Date().toISOString(),
    },
    {
        title: "Ethereum Upgrade scheduled for next month",
        domain: "decrypt.co",
        url: "https://decrypt.co/news/ethereum-upgrade",
        published_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    },
    {
        title: "Solana DeFi Volume Hits Record High",
        domain: "blockworks.co",
        url: "https://blockworks.co/news/solana-defi-record",
        published_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    },
    {
        title: "Regulatory Clarity improves for Crypto Markets",
        domain: "bloomberg.com",
        url: "https://www.bloomberg.com/crypto/news",
        published_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    },
];

export const fetchCryptoNews = async ({ topic }: { topic?: string }) => {
    // In a production app, you would call a real API here like CryptoPanic or NewsAPI
    // const response = await fetch(`https://cryptopanic.com/api/v1/posts/?auth_token=YOUR_KEY&filter=${topic}`);

    console.log(`Fetching news for topic: ${topic || "general"}`);

    // Return mock data for reliable demo experience without API keys
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (topic) {
        // rudimentary filter for mock
        return MOCK_NEWS.filter(n => n.title.toLowerCase().includes(topic.toLowerCase()) || !topic);
    }
    return MOCK_NEWS;
};

export const newsTool: TamboTool = {
    name: "get_crypto_news",
    description: "Get the latest news headlines for the crypto market or a specific topic. Use this when the user asks for 'news', 'headlines', or 'what's happening'.",
    inputSchema: z.object({
        topic: z.string().optional().describe("Specific topic or token to filter news by (e.g., 'bitcoin', 'regulation')."),
    }),
    outputSchema: z.any(),
    tool: fetchCryptoNews,
};
