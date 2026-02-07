
export interface CoinGeckoPriceData {
    prices: [number, number][];
    market_caps: [number, number][];
    total_volumes: [number, number][];
}

export interface CoinGeckoMarketData {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    fully_diluted_valuation: number;
    total_volume: number;
    high_24h: number;
    low_24h: number;
    price_change_24h: number;
    price_change_percentage_24h: number;
    market_cap_change_24h: number;
    market_cap_change_percentage_24h: number;
    circulating_supply: number;
    total_supply: number;
    max_supply: number;
    ath: number;
    ath_change_percentage: number;
    ath_date: string;
    atl: number;
    atl_change_percentage: number;
    atl_date: string;
    roi: null;
    last_updated: string;
}

const BASE_URL = "https://api.coingecko.com/api/v3";

// Simple cache to avoid hitting rate limits
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 1000; // 1 minute

export const coingeckoService = {
    async getMarketData(ids: string[]): Promise<CoinGeckoMarketData[]> {
        const idsString = ids.join(",");
        const cacheKey = `market-${idsString}`;
        const cached = cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }

        try {
            const response = await fetch(
                `${BASE_URL}/coins/markets?vs_currency=usd&ids=${idsString}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch market data");
            }

            const data = await response.json();
            cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            console.error("CoinGecko API Error:", error);
            return [];
        }
    },

    async getPriceHistory(id: string, days: string = "7"): Promise<CoinGeckoPriceData | null> {
        const cacheKey = `history-${id}-${days}`;
        const cached = cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }

        try {
            const response = await fetch(
                `${BASE_URL}/coins/${id}/market_chart?vs_currency=usd&days=${days}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch price history");
            }

            const data = await response.json();
            cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            console.error("CoinGecko API Error:", error);
            return null;
        }
    },

    async searchCoins(query: string): Promise<{ id: string; name: string; symbol: string; thumb: string }[]> {
        if (!query || query.length < 2) return [];

        const cacheKey = `search-${query}`;
        const cached = cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }

        try {
            const response = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`);

            if (!response.ok) {
                throw new Error("Failed to search coins");
            }

            const data = await response.json();
            const coins = (data.coins || []).slice(0, 5);

            cache.set(cacheKey, { data: coins, timestamp: Date.now() });
            return coins;
        } catch (error) {
            console.error("CoinGecko Search Error:", error);
            return [];
        }
    }
};
