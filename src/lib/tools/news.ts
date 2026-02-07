
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

// Interface for the API response item
interface CryptoCompareNewsItem {
    id: string;
    guid: string;
    published_on: number;
    imageurl: string;
    title: string;
    url: string;
    body: string;
    tags: string;
    lang: string;
    upvotes: string;
    downvotes: string;
    categories: string;
    source_info: {
        name: string;
        img: string;
        lang: string;
    };
    source: string;
}

export const fetchCryptoNews = async ({ topic }: { topic?: string }) => {
    try {
        console.log(`Fetching news for topic: ${topic || "general"}`);

        // Fetch from CryptoCompare public API
        const response = await fetch("https://min-api.cryptocompare.com/data/v2/news/?lang=EN");

        if (!response.ok) {
            throw new Error(`News API responded with status: ${response.status}`);
        }

        const data = await response.json();
        const newsItems: CryptoCompareNewsItem[] = data.Data || [];

        // Map to our desired format
        const formattedNews = newsItems.map((item) => ({
            title: item.title,
            domain: item.source_info?.name || item.source,
            url: item.url,
            published_at: new Date(item.published_on * 1000).toISOString(),
            // Adding body snippet could be useful for context if needed later
            // snippet: item.body.substring(0, 150) + "..."
        }));

        if (topic) {
            const lowerTopic = topic.toLowerCase();
            // Filter locally since the public API endpoint doesn't support granular arbitrary query
            return formattedNews.filter(
                (n) => n.title.toLowerCase().includes(lowerTopic) ||
                    (n.domain && n.domain.toLowerCase().includes(lowerTopic))
            );
        }

        return formattedNews.slice(0, 20); // Return top 20 items to avoid overwhelming context
    } catch (error) {
        console.error("Error fetching crypto news:", error);
        return []; // Return empty array on failure to be graceful
    }
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
