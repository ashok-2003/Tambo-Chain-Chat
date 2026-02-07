"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { useTamboThread, type TamboThreadMessage } from "@tambo-ai/react";
import { Download, FileJson, FileText, Printer } from "lucide-react";
import * as React from "react";

/**
 * Downloads content as a file.
 */
const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/**
 * Converts messages to Markdown format.
 */
const messagesToMarkdown = (messages: TamboThreadMessage[]) => {
    return messages
        .filter((m) => m.role !== "tool") // Filter out tool messages if preferred, or keep them
        .map((m) => {
            const role = m.role === "user" ? "**User**" : "**Assistant**";
            let content = "";
            if (typeof m.content === "string") {
                content = m.content;
            } else if (Array.isArray(m.content)) {
                content = m.content
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .map((c: any) => {
                        if (c.type === "text") return c.text;
                        if (c.type === "resource") return `[Resource: ${c.resource?.uri}]`;
                        if (c.type === "image_url") return `![Image](${c.image_url?.url})`;
                        return "";
                    })
                    .join(" ");
            }
            return `${role}:\n${content}\n\n---\n`;
        })
        .join("\n");
};

/**
 * Component for exporting chat history.
 */
export function ChatExportMenu() {
    const { thread } = useTamboThread();

    const handleExportMarkdown = () => {
        if (!thread.messages) return;
        const content = messagesToMarkdown(thread.messages);
        downloadFile(`chat-${thread.id}.md`, content, "text/markdown");
    };

    const handleExportJSON = () => {
        if (!thread.messages) return;
        const content = JSON.stringify(thread.messages, null, 2);
        downloadFile(`chat-${thread.id}.json`, content, "application/json");
    };

    const handlePrintPDF = () => {
        window.print();
    };

    if (!thread.messages || thread.messages.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Export Chat"
                >
                    <Download className="w-4 h-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50"
            >
                <DropdownMenuItem
                    onSelect={handleExportMarkdown}
                    className="flex items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-muted cursor-pointer"
                >
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Markdown</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onSelect={handleExportJSON}
                    className="flex items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-muted cursor-pointer"
                >
                    <FileJson className="mr-2 h-4 w-4" />
                    <span>JSON</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onSelect={handlePrintPDF}
                    className="flex items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-muted cursor-pointer"
                >
                    <Printer className="mr-2 h-4 w-4" />
                    <span>Print / PDF</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
