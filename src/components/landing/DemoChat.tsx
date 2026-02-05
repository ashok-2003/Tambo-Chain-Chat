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

    // Auto-play loop
    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (step === "idle") {
            // Wait a bit then start typing
            timeout = setTimeout(() => {
                setStep("typing");
            }, 1500);
        } else if (step === "typing") {
            // Simulate typing effect
            const targetText = EXAMPLES[activeExample].query;
            if (inputText.length < targetText.length) {
                timeout = setTimeout(() => {
                    setInputText(targetText.slice(0, inputText.length + 1));
                }, 30 + Math.random() * 30);
            } else {
                // Finished typing, send
                timeout = setTimeout(() => {
                    setStep("thinking");
                }, 500);
            }
        } else if (step === "thinking") {
            // Simulate network request
            timeout = setTimeout(() => {
                setStep("response");
                setShowResult(true);
            }, 1500);
        } else if (step === "response") {
            // Show result for a while then reset
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
        <div className="w-full max-w-2xl mx-auto mt-8 perspective-1000">
            <div className="bg-card/50 backdrop-blur-xl border border-border rounded-xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] dark:shadow-[0_0_40px_-10px_rgba(0,255,159,0.1)] overflow-hidden flex flex-col min-h-[400px] transition-all duration-500">

                {/* Chat Header */}
                <div className="border-b border-border/50 p-4 bg-secondary/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-red-500/80" />
                        <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                        <div className="h-3 w-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                        AI Oracle Active
                    </span>
                </div>

                {/* Chat Area */}
                <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                    {/* Introduction */}
                    <div className="flex gap-4 animate-fade-in">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <div className="bg-secondary/10 p-3 rounded-r-lg rounded-bl-lg text-sm text-foreground/90">
                                Welcome back! Your portfolio is up 3.2% today.
                            </div>
                            {step === "idle" && (
                                <div className="flex gap-2 flex-wrap animate-fade-in">
                                    {EXAMPLES.map((ex, i) => (
                                        <button
                                            key={i}
                                            className={`text-xs px-3 py-1.5 rounded-full border border-primary/20 hover:bg-primary/10 transition-colors ${i === activeExample ? 'bg-primary/10 border-primary/50 text-foreground' : 'text-muted-foreground'}`}
                                        >
                                            {ex.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User Query */}
                    {(step === "thinking" || step === "response") && (
                        <div className="flex gap-4 flex-row-reverse animate-slide-up">
                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                <User className="h-5 w-5 text-secondary-foreground" />
                            </div>
                            <div className="bg-primary/10 p-3 rounded-l-lg rounded-br-lg text-sm text-foreground/90">
                                {currentExample.query}
                            </div>
                        </div>
                    )}

                    {/* AI Response */}
                    {step === "response" && (
                        <div className="flex gap-4 animate-slide-up">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-3 w-full max-w-[80%]">
                                <div className="bg-secondary/10 p-3 rounded-r-lg rounded-bl-lg text-sm text-foreground/90">
                                    Here's that analysis for you.
                                </div>
                                <GenerativeCard type={currentExample.type} />
                            </div>
                        </div>
                    )}

                    {step === "thinking" && (
                        <div className="flex gap-4 animate-fade-in">
                            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                <Bot className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex items-center gap-1 h-8 px-2">
                                <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                            </div>
                        </div>
                    )}

                </div>

                {/* Mock Input Area */}
                <div className="p-4 border-t border-border/50 bg-background/50">
                    <div className="relative">
                        <input
                            type="text"
                            value={inputText}
                            readOnly
                            placeholder="Ask about your crypto..."
                            className="w-full bg-secondary/10 border border-border rounded-lg pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground/50 font-mono"
                        />
                        <div className="absolute right-2 top-2 p-1 bg-primary/10 rounded-md">
                            <Send className="h-4 w-4 text-primary" />
                        </div>
                    </div>
                </div>

            </div>
            <div className='text-center mt-4 text-sm text-muted-foreground animate-pulse'>
                Live Preview (Auto-playing)
            </div>
        </div >
    );
}
