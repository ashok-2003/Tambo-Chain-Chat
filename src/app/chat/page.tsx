"use client";

import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";
import { Header } from "@/components/tambo/header";
import * as React from "react";

export default function Home() {
  const mcpServers = useMcpServers();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL!}
      mcpServers={mcpServers}
    >
      <div className="flex flex-col h-screen bg-background overflow-hidden selection:bg-primary/15">
        <Header />
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <MessageThreadFull className="h-full w-full" />
        </main>
      </div>
    </TamboProvider>
  );
}
