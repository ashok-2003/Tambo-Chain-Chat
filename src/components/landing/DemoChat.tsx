"use client";

import { useState, useEffect } from "react";
import { Send, Sparkles, User, Bot } from "lucide-react";
import { GenerativeCard } from "./GenerativeCard";

const EXAMPLES = [
    { label: "Why is it up?", query: "Analyze what drove this 3.2% growth", type: "chart" as const },
    { label: "Check risks", query: "Any new risks in my portfolio?", type: "risk" as const },
];

export function DemoChat() {
    const [step, setStep] = useState<"idle" | "typing" | "thinking" | "response">("idle");
    const [inputText, setInputText] = useState("");
    const [activeExample, setActiveExample] = useState(0);
    const [showResult, setShowResult] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (step === "idle") {
            timeout = setTimeout(() => setStep("typing"), 1500);
        } else if (step === "typing") {
            const targetText = EXAMPLES[activeExample].query;
            if (inputText.length < targetText.length) {
                timeout = setTimeout(() => {
                    setInputText(targetText.slice(0, inputText.length + 1));
                }, 30 + Math.random() * 30);
            } else {
                timeout = setTimeout(() => setStep("thinking"), 500);
            }
        } else if (step === "thinking") {
            timeout = setTimeout(() => {
                setStep("response");
                setShowResult(true);
            }, 1500);
        } else if (step === "response") {
            timeout = setTimeout(() => {
                setShowResult(false);
                setInputText("");
                setStep("idle");
                setActiveExample((prev) => (prev + 1) % EXAMPLES.length);
            }, 6000);
        }

        return () => clearTimeout(timeout);
    }, [step, inputText, activeExample]);

    const currentExample = EXAMPLES[activeExample];

    return (
        <div className="w-full max-w-4xl mx-auto mt-4">
            <div className="relative bg-card border border-border/80 dark:border-border rounded-2xl shadow-xl shadow-black/[0.04] dark:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col min-h-[420px] transition-all duration-500">

                {/* Terminal-style header */}
                <div className="relative z-10 border-b border-border/80 dark:border-border px-5 py-3.5 flex items-center justify-between bg-muted/20 dark:bg-white/2">
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-400/60 dark:bg-red-400/40" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60 dark:bg-amber-400/40" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60 dark:bg-emerald-400/40" />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded overflow-hidden">
                            <img src="/logos/Gemini_Generated_Image_m8vxwvm8vxwvm8vx.svg" alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-mono font-medium text-muted-foreground uppercase tracking-[0.2em]">
                            chainchat
                        </span>
                    </div>
                    <div className="w-16" />
                </div>

                {/* Chat messages */}
                <div className="relative z-10 flex-1 p-6 space-y-5 overflow-y-auto">
                    {/* Bot intro */}
                    <div className="flex gap-3 animate-fade-in">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Bot className="h-4 w-4 text-primary" />
                        </div>
                        <div className="space-y-3">
                            <div className="bg-muted/50 dark:bg-white/6 px-4 py-2.5 rounded-xl rounded-tl-sm text-sm text-foreground/90 leading-relaxed">
                                Welcome back. Your portfolio is up <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">3.2%</span> today.
                            </div>
                            {step === "idle" && (
                                <div className="flex gap-2 flex-wrap animate-fade-in">
                                    {EXAMPLES.map((ex, i) => (
                                        <button
                                            key={i}
                                            className={`text-xs px-3.5 py-1.5 rounded-full border transition-all duration-200 font-medium ${
                                                i === activeExample
                                                    ? "bg-primary/10 border-primary/30 text-primary"
                                                    : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                                            }`}
                                        >
                                            {ex.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User message */}
                    {(step === "thinking" || step === "response") && (
                        <div className="flex gap-3 flex-row-reverse animate-slide-up">
                            <div className="h-7 w-7 rounded-lg bg-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
                                <User className="h-4 w-4 text-foreground/60" />
                            </div>
                            <div className="bg-primary/10 dark:bg-primary/15 px-4 py-2.5 rounded-xl rounded-tr-sm text-sm text-foreground/90">
                                {currentExample.query}
                            </div>
                        </div>
                    )}

                    {/* Thinking indicator */}
                    {step === "thinking" && (
                        <div className="flex gap-3 animate-fade-in">
                            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Bot className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex items-center gap-1.5 h-7 px-1">
                                <div className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce" />
                            </div>
                        </div>
                    )}

                    {/* AI Response with generated component */}
                    {step === "response" && (
                        <div className="flex gap-3 animate-slide-up">
                            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Sparkles className="h-4 w-4 text-primary" />
                            </div>
                            <div className="space-y-3 w-full max-w-[85%]">
                                <div className="bg-muted/50 dark:bg-white/6 px-4 py-2.5 rounded-xl rounded-tl-sm text-sm text-foreground/90">
                                    Here&apos;s that analysis for you.
                                </div>
                                <GenerativeCard type={currentExample.type} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Input area */}
                <div className="relative z-10 p-4 border-t border-border/80 dark:border-border bg-muted/10 dark:bg-white/2">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={inputText}
                            readOnly
                            placeholder="Ask about your crypto..."
                            className="w-full bg-muted/40 dark:bg-muted/30 border border-border rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 text-foreground placeholder:text-muted-foreground/50 font-mono transition-all"
                        />
                        <button className="absolute right-2 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                            <Send className="h-4 w-4 text-primary" />
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
