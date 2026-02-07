"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function MarketStatus() {
    const isPositive = true;

    return (
        <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground tracking-wide">BTC</span>
                <span className="font-mono font-medium text-foreground">$98,420</span>
                <span className={`font-mono font-medium flex items-center ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    2.4%
                </span>
            </div>

            <div className="w-px h-3.5 bg-border" />

            <div className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground tracking-wide">ETH</span>
                <span className="font-mono font-medium text-foreground">$3,842</span>
                <span className="font-mono font-medium flex items-center text-emerald-600 dark:text-emerald-400">
                    <ArrowUpRight className="w-3 h-3" />
                    1.8%
                </span>
            </div>
        </div>
    );
}
