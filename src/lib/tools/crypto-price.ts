
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

export const fetchCryptoPrice = async ({ tokenId, currency = "usd" }: { tokenId: string; currency?: string }) => {
    try {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=${currency}&include_24h_change=true`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch price: ${response.statusText}`);
        }

        const data = await response.json();
        return data[tokenId];
    } catch (error) {
        console.error("Error fetching crypto price:", error);
        return { error: "Failed to fetch price" };
    }
};

export const cryptoPriceTool: TamboTool = {
    name: "get_crypto_price",
    description: "Get the current price and 24h change of a cryptocurrency. Use this when the user asks for the price of a specific token (e.g., bitcoin, ethereum, solana).",
    inputSchema: z.object({
        tokenId: z.string().describe("The API ID of the token (e.g., 'bitcoin', 'ethereum', 'solana'). Lowercase."),
        currency: z.string().optional().describe("The target currency (default: 'usd')."),
    }),
    outputSchema: z.any(),
    tool: fetchCryptoPrice,
};
