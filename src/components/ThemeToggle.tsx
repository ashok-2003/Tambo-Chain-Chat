"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-secondary/20 hover:bg-secondary/40 transition-colors duration-300 backdrop-blur-sm border border-border"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <Sun className="h-5 w-5 text-primary animate-fade-in" />
            ) : (
                <Moon className="h-5 w-5 text-primary animate-fade-in" />
            )}
        </button>
    );
}
