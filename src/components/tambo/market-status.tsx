"use client";

import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

export function MarketStatus() {
    // Mock data - in a real app this would come from an API
    const isPositive = true;

    return (
        <div className="flex items-center space-x-3 px-3 py-1.5 rounded-full bg-secondary/10 border border-primary/20 backdrop-blur-sm">
            <div className="flex items-center space-x-2">
                <div className="bg-orange-500/20 p-1 rounded-full">
                    <Activity className="w-3.5 h-3.5 text-orange-500" />
                </div>
                <span className="text-xs font-semibold tracking-wider text-muted-foreground">BTC</span>
            </div>

            <div className="h-4 w-px bg-border/50" />

            <div className="flex items-center space-x-2">
                <span className="text-sm font-mono font-medium text-foreground">
                    $98,420
                </span>
                <span className={`text-xs font-medium flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                    2.4%
                </span>
            </div>
        </div>
    );
}
