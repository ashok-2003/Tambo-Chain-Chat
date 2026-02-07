"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { MarketStatus } from "./market-status";
import { Bell } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
    return (
        <header className="w-full h-16 border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 transition-all duration-300">
            {/* Left Zone: Logo & Status */}
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 group cursor-pointer">
                    <div className="relative w-8 h-8 rounded-lg bg-linear-to-tr from-primary to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.5)] group-hover:shadow-[0_0_25px_rgba(var(--primary),0.7)] transition-all duration-300">
                        <span className="text-white font-bold text-lg">C</span>
                        <div className="absolute inset-0 bg-white/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70 group-hover:to-primary transition-all duration-300">
                        ChainChat
                    </h1>
                </div>

                <div className="hidden md:block">
                    <MarketStatus />
                </div>
            </div>

            {/* Right Zone: Actions & Profile */}
            <div className="flex items-center space-x-3">
                {/* Notifications Mock */}
                <button className="p-2 rounded-full hover:bg-secondary/20 transition-colors relative group">
                    <Bell className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
                </button>

                {/* Wallet Connection Mock */}
                <ConnectButton />

                <div className="h-6 w-px bg-border/50 mx-2" />

                <ThemeToggle />
            </div>
        </header>
    );
}
