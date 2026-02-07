"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useState } from "react";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted transition-colors duration-200"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <Sun className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            ) : (
                <Moon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            )}
        </button>
    );
}
