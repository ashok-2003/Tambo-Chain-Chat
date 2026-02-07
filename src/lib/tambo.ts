
import {
  PriceChart,
  priceChartSchema,
} from "@/components/tambo/generative/price-chart";
import {
  MarketSnapshotCard,
  marketCardSchema,
} from "@/components/tambo/generative/market-card";
import {
  PortfolioTable,
  portfolioTableSchema,
} from "@/components/tambo/interactable/portfolio-table";
import {
  Watchlist,
  watchlistSchema,
} from "@/components/tambo/interactable/watchlist";
import {
  WhatIfSimulator,
  whatIfSimulatorSchema,
} from "@/components/tambo/interactable/what-if-simulator";
import {
  RiskGauge,
  riskGaugeSchema,
} from "@/components/tambo/insight/risk-gauge";
import {
  AllocationBreakdown,
  allocationBreakdownSchema,
} from "@/components/tambo/insight/allocation-breakdown";
import {
  NewsFeed,
  newsFeedSchema,
} from "@/components/tambo/generative/news-feed";

import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

import { cryptoPriceTool } from "@/lib/tools/crypto-price";
import { newsTool } from "@/lib/tools/news";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

export const tools: TamboTool[] = [
  cryptoPriceTool,
  newsTool,
];


export const components: TamboComponent[] = [

  {
    name: "PriceChart",
    description:
      "A specialized chart for cryptocurrency price history. Fetches its own data given token IDs. Use this when the user asks for PRICE history of specific coins.",
    component: PriceChart,
    propsSchema: priceChartSchema,
  },
  {
    name: "MarketSnapshotCard",
    description:
      "A card showing current price, 24h change, market cap, and volume for a SINGLE crypto asset.",
    component: MarketSnapshotCard,
    propsSchema: marketCardSchema,
  },
  {
    name: "PortfolioTable",
    description:
      "An editable table to track a crypto portfolio. Can initialize with a list of assets.",
    component: PortfolioTable,
    propsSchema: portfolioTableSchema,
  },
  {
    name: "Watchlist",
    description:
      "A persistent list of tracked tokens. It saves to local storage. Use this when the user wants to 'watch' or 'track' coins.",
    component: Watchlist,
    propsSchema: watchlistSchema,
  },
  {
    name: "WhatIfSimulator",
    description:
      "A simulator to calculate potential returns and risk for a trade. Use this for 'what if I bought...' or 'simulate investment' queries.",
    component: WhatIfSimulator,
    propsSchema: whatIfSimulatorSchema,
  },
  {
    name: "RiskGauge",
    description:
      "A visual gauge to show a risk score from 0-100.",
    component: RiskGauge,
    propsSchema: riskGaugeSchema,
  },
  {
    name: "AllocationBreakdown",
    description:
      "A donut chart showing asset allocation percentages.",
    component: AllocationBreakdown,
    propsSchema: allocationBreakdownSchema,
  },
  {
    name: "NewsFeed",
    description: "A scrolling feed of trending news for specific crypto topics. Use this when the user asks for 'news', 'latest updates', or 'what is happening' with a specific coin.",
    component: NewsFeed,
    propsSchema: newsFeedSchema,
  },
];
