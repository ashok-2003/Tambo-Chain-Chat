"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { MarketStatus } from "./market-status";
import { Bell } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Header() {
    return (
        <header className="w-full h-14 border-b border-border bg-background/90 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-5 transition-all duration-200">
            {/* Left: Logo & Market */}
            <div className="flex items-center gap-5">
                <a href="/" className="flex items-center gap-2.5 group">
                    <div className="w-7 h-7 rounded-lg overflow-hidden transition-transform duration-200 group-hover:scale-105">
                        <img
                            src="/logos/Gemini_Generated_Image_m8vxwvm8vxwvm8vx.svg"
                            alt="ChainChat"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <span className="text-sm font-semibold tracking-[-0.01em] text-foreground">
                        ChainChat
                    </span>
                </a>

                <div className="hidden md:flex items-center">
                    <div className="w-px h-5 bg-border mr-5" />
                    <MarketStatus />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                {/* <button className="relative p-2 rounded-lg hover:bg-muted transition-colors group">
                    <Bell className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
                </button> */}

                <ConnectButton />

                <div className="w-px h-5 bg-border mx-1" />

                <ThemeToggle />
            </div>
        </header>
    );
}
