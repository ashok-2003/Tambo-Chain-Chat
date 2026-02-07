"use client";

import { createMarkdownComponents } from "@/components/tambo/markdown-components";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { type McpServerInfo, MCPTransport } from "@tambo-ai/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Trash2,
  X,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Box,
} from "lucide-react";
import React from "react";
import { createPortal } from "react-dom";
import { Streamdown } from "streamdown";

// Types for health check and tools
type Tool = {
  name: string;
  description?: string;
};

type ServerHealth = {
  status: "online" | "offline" | "error" | "checking";
  latency?: number;
  lastChecked?: number;
  error?: string;
  tools?: Tool[];
};

type ServerHealthMap = Record<string, ServerHealth>;

/**
 * Modal component for configuring client-side MCP (Model Context Protocol) servers.
 *
 * This component provides a user interface for managing MCP server connections that
 * will be used to extend the capabilities of the tambo application. The servers are
 * stored in browser localStorage and connected directly from the client-side.
 *
 * @param props - Component props
 * @param props.isOpen - Whether the modal is currently open/visible
 * @param props.onClose - Callback function called when the modal should be closed
 * @returns The modal component or null if not open
 */
export const McpConfigModal = ({
  isOpen,
  onClose,
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}) => {
  // Initialize from localStorage directly to avoid conflicts
  const [mcpServers, setMcpServers] = React.useState<McpServerInfo[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("mcp-servers") ?? "[]");
    } catch {
      return [];
    }
  });
  const [serverUrl, setServerUrl] = React.useState("");
  const [serverName, setServerName] = React.useState("");
  const [transportType, setTransportType] = React.useState<MCPTransport>(
    MCPTransport.HTTP
  );
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [showInstructions, setShowInstructions] = React.useState(false);

  // New state for health and tools
  const [serverHealths, setServerHealths] = React.useState<ServerHealthMap>({});
  const [isTestLoading, setIsTestLoading] = React.useState(false);
  const [testResult, setTestResult] = React.useState<ServerHealth | null>(null);
  const [expandedServers, setExpandedServers] = React.useState<Set<number>>(
    new Set()
  );

  // Handle Escape key to close modal
  React.useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Save servers to localStorage when updated and emit events
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("mcp-servers", JSON.stringify(mcpServers));

      // Emit custom event to notify other components in the same tab
      window.dispatchEvent(
        new CustomEvent("mcp-servers-updated", {
          detail: mcpServers,
        })
      );

      if (mcpServers.length > 0) {
        setSavedSuccess(true);
        const timer = setTimeout(() => setSavedSuccess(false), 2000);
        return () => clearTimeout(timer);
      }
    }
  }, [mcpServers]);

  // Periodic health check for all servers
  React.useEffect(() => {
    if (!isOpen) return;

    const checkAllServers = async () => {
      const newHealths: ServerHealthMap = { ...serverHealths };
      let changed = false;

      for (const server of mcpServers) {
        const url = typeof server === "string" ? server : server.url;
        // Don't re-check if checked recently (e.g. within 30s) unless it was error/checking
        const current = newHealths[url];
        if (
          current?.lastChecked &&
          Date.now() - current.lastChecked < 30000 &&
          current.status === "online"
        ) {
          continue;
        }

        // Set to checking if not already
        if (current?.status !== "checking") {
          setServerHealths((prev) => ({
            ...prev,
            [url]: { ...prev[url], status: "checking" },
          }));
        }

        const health = await checkServerHealth(url);
        newHealths[url] = health;
        changed = true;
      }

      if (changed) {
        setServerHealths((prev) => ({ ...prev, ...newHealths }));
      }
    };

    // Check immediately on open
    checkAllServers();

    // Then poll every 30s
    const interval = setInterval(checkAllServers, 30000);
    return () => clearInterval(interval);
  }, [isOpen, mcpServers]);

  const checkServerHealth = async (url: string): Promise<ServerHealth> => {
    const start = Date.now();
    try {
      // 1. Try health endpoint
      // We'll try a few common patterns concurrently to be robust
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      // Parallel fetch to potential health/tools endpoints
      // Note: In a real standardized world, this would be a single known endpoint.
      // Here we assume /health or root might work, and /tools for tools.
      const healthPromise = fetch(`${url}/health`, {
        signal: controller.signal,
      }).catch(() => null);
      const rootPromise = fetch(url, { signal: controller.signal }).catch(
        () => null
      );
      const toolsPromise = fetch(`${url}/tools`, {
        signal: controller.signal,
      }).catch(() => null); // Or /mcp/tools or via JSON-RPC

      const [healthRes, rootRes, toolsRes] = await Promise.all([
        healthPromise,
        rootPromise,
        toolsPromise,
      ]);

      clearTimeout(timeoutId);

      const latency = Date.now() - start;
      const isOnline =
        (healthRes?.ok || rootRes?.ok) ?? (toolsRes?.ok ? true : false);

      if (!isOnline) {
        return {
          status: "offline",
          lastChecked: Date.now(),
          error: "Unreachable",
        };
      }

      // Try to parse tools
      let tools: Tool[] = [];
      if (toolsRes?.ok) {
        try {
          const data = await toolsRes.json();
          if (data.tools && Array.isArray(data.tools)) {
            tools = data.tools;
          } else if (Array.isArray(data)) {
            // Heuristic: if array of objects with name, assume tools
            tools = data;
          }
        } catch (e) {
          console.warn("Failed to parse tools", e);
        }
      }

      return {
        status: "online",
        latency,
        lastChecked: Date.now(),
        tools,
      };
    } catch (e: any) {
      return {
        status: "error",
        lastChecked: Date.now(),
        error: e.message || "Connection failed",
      };
    }
  };

  const handleTestConnection = async () => {
    if (!serverUrl.trim()) return;

    setIsTestLoading(true);
    setTestResult(null);

    const health = await checkServerHealth(serverUrl.trim());

    setTestResult(health);
    setIsTestLoading(false);
  };

  const addServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (serverUrl.trim()) {
      const serverConfig = {
        url: serverUrl.trim(),
        transport: transportType,
        ...(serverName.trim() ? { name: serverName.trim() } : {}),
      };
      setMcpServers((prev) => [...prev, serverConfig]);

      // Pre-populate health if we just tested it
      if (testResult && serverUrl.trim() === serverConfig.url) {
        setServerHealths((prev) => ({
          ...prev,
          [serverConfig.url]: testResult,
        }));
      }

      // Reset form fields
      setServerUrl("");
      setServerName("");
      setTransportType(MCPTransport.HTTP);
      setTestResult(null);
    }
  };

  const removeServer = (index: number) => {
    setMcpServers((prev) => prev.filter((_, i) => i !== index));
    // Optional: cleanup health state, though not strictly necessary
  };

  const toggleServerExpand = (index: number) => {
    const newSet = new Set(expandedServers);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setExpandedServers(newSet);
  };

  // Helper function to get server display information
  const getServerInfo = (server: McpServerInfo) => {
    if (typeof server === "string") {
      return { url: server, transport: "HTTP (default)", name: null };
    } else {
      return {
        url: server.url,
        transport: server.transport ?? "HTTP (default)",
        name: server.name ?? null,
      };
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Close modal when clicking on backdrop (not on the modal content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getTransportDisplayText = (transport: MCPTransport) => {
    return transport === MCPTransport.HTTP ? "HTTP (default)" : "SSE";
  };

  if (!isOpen) return null;

  const instructions = `
###

**What is an MCP Server?**
Think of an MCP server as a "power-up" that adds new capabilities to this chat. It sits on your computer and safely lets the AI talk to your local tools, files, or other services.

**How to connect:**

1.  **Run an MCP Server**: 
    You can run a server using a terminal or an MCP manager app. It needs to provide a URL (like \`http://localhost:3000\`).

2.  **Paste the URL**:
    Copy that URL into the box below.

3.  **Test & Add**:
    Click "Test" to make sure it's working, then click "Add Server".

*Once connected, the AI can use the tools provided by that server.*
`;

  const modalContent = (
    <motion.div
      className={cn(
        "fixed inset-0 bg-backdrop flex items-center justify-center z-50",
        className
      )}
      onClick={handleBackdropClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-card rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold">MCP Server Configuration</h2>
          <button
            onClick={onClose}
            className="hover:bg-muted rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          <div className="mb-6 bg-container border border-muted rounded-lg">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between p-2 hover:bg-muted transition-colors cursor-pointer"
              type="button"
            >
              <span className="text-sm font-semibold text-foreground">
                How to Setup
              </span>
              <ChevronDown
                className={`w-4 h-4 text-foreground transition-transform duration-200 ${showInstructions ? "rotate-180" : ""
                  }`}
              />
            </button>
            {showInstructions && (
              <motion.div
                className="px-4 pb-4 border-t border-muted"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Streamdown components={createMarkdownComponents()}>
                  {instructions}
                </Streamdown>
              </motion.div>
            )}
          </div>
          {/* Description */}
          <div className="mb-6">
            <p className="text-foreground mb-3 text-sm leading-relaxed">
              Connect{" "}
              <span className="font-semibold text-foreground">External Tools</span>{" "}
              (MCP Servers) to give the AI access to more capabilities, like your
              local files, databases, or custom scripts.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={addServer} className="mb-8">
            <div className="space-y-4">
              {/* Server URL */}
              <div>
                <label
                  htmlFor="server-url"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  Server URL
                  <span className="text-muted-foreground font-normal ml-1">
                    (e.g., http://localhost:3000)
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    id="server-url"
                    type="url"
                    value={serverUrl}
                    onChange={(e) => {
                      setServerUrl(e.target.value);
                      setTestResult(null); // Clear previous test result on change
                    }}
                    placeholder="https://your-mcp-server-url.com"
                    className="flex-1 px-3 py-2.5 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-150 text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={!serverUrl.trim() || isTestLoading}
                    className={cn(
                      "px-3 py-2.5 rounded-lg border border-muted bg-muted/50 hover:bg-muted font-medium text-sm transition-colors flex items-center gap-2",
                      isTestLoading && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {isTestLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Activity className="w-4 h-4" />
                    )}
                    Test
                  </button>
                </div>
                {/* Test Result Feedback */}
                {testResult && (
                  <div className={cn(
                    "mt-2 text-sm flex items-center gap-2",
                    testResult.status === "online" ? "text-green-600" : "text-destructive"
                  )}>
                    {testResult.status === "online" ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Connected ({testResult.latency}ms)</span>
                        {testResult.tools && testResult.tools.length > 0 && (
                          <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full ml-1">
                            {testResult.tools.length} tools found
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        <span>Connection failed: {testResult.error || "Unknown error"}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Server Name */}
              <div>
                <label
                  htmlFor="server-name"
                  className="block text-sm font-semibold text-foreground mb-2"
                >
                  Server Name
                  <span className="text-muted-foreground font-normal ml-1">
                    (optional)
                  </span>
                </label>
                <input
                  id="server-name"
                  type="text"
                  value={serverName}
                  onChange={(e) => setServerName(e.target.value)}
                  placeholder="Custom server name"
                  className="w-full px-3 py-2.5 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-150 text-sm"
                />
              </div>

              {/* Transport Type */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Transport Type
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="w-full px-3 py-2.5 border border-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-card text-foreground text-sm flex items-center justify-between hover:bg-muted-backdrop cursor-pointer transition-all duration-150"
                    >
                      <span>{getTransportDisplayText(transportType)}</span>
                      <ChevronDown className="w-4 h-4 text-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-full min-w-[200px] bg-card border border-muted rounded-lg shadow-lg z-50 py-1 animate-in fade-in-0 zoom-in-95 duration-100"
                    align="start"
                  >
                    <DropdownMenuItem
                      className="px-3 py-2 text-sm text-foreground hover:bg-muted-backdrop cursor-pointer focus:bg-muted-backdrop focus:outline-none"
                      onClick={() => setTransportType(MCPTransport.HTTP)}
                    >
                      HTTP (default)
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="px-3 py-2 text-sm text-foreground hover:bg-muted-backdrop cursor-pointer focus:bg-muted-backdrop focus:outline-none"
                      onClick={() => setTransportType(MCPTransport.SSE)}
                    >
                      SSE
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer transition-all duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!serverUrl.trim()}
            >
              Add Server
            </button>
          </form>

          {/* Success Message */}
          {savedSuccess && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm animate-in slide-in-from-top-1 duration-200">
              <div className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Servers saved to browser storage
              </div>
            </div>
          )}

          {/* Server List */}
          {mcpServers.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3 leading-none">
                <h4 className="font-medium text-foreground">
                  Connected Servers ({mcpServers.length})
                </h4>
                {/* Refresh Button - Optional but nice */}
                <button
                  onClick={() => {
                    // Force re-check
                    setServerHealths({});
                    // Effect will trigger check
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
              </div>

              <div className="space-y-2">
                {mcpServers.map((server, index) => {
                  const serverInfo = getServerInfo(server);
                  const health = serverHealths[serverInfo.url];
                  const isOnline = health?.status === "online";
                  const isChecking = health?.status === "checking";
                  const isError = health?.status === "error" || health?.status === "offline";
                  const isExpanded = expandedServers.has(index);

                  return (
                    <motion.div
                      layout
                      key={`${serverInfo.url}-${index}`}
                      className="border border-muted rounded-lg overflow-hidden transition-all duration-200"
                    >
                      <div className="flex items-start justify-between p-4 bg-card hover:bg-muted/20 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center mb-1 gap-2">
                            {/* Status Indicator */}
                            <div className="relative group">
                              {isChecking ? (
                                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse" />
                              ) : isOnline ? (
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_4px_rgba(34,197,94,0.5)]" />
                              ) : (
                                <div className="w-2.5 h-2.5 bg-destructive rounded-full" />
                              )}
                              {/* Tooltip for status */}
                              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-50 border border-border">
                                {isChecking ? "Checking..." : isOnline ? `Online (${health?.latency || "<1"}ms)` : `Offline: ${health?.error || "Unknown"}`}
                              </div>
                            </div>

                            <span className="text-foreground font-medium truncate">
                              {serverInfo.url}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1.5 ml-4.5">
                            {serverInfo.name && (
                              <span>{serverInfo.name}</span>
                            )}
                            <span className="uppercase tracking-wider text-[10px] bg-muted/50 px-1.5 py-0.5 rounded border border-muted-foreground/20">
                              {serverInfo.transport}
                            </span>
                            {health?.tools && health.tools.length > 0 && (
                              <button
                                onClick={() => toggleServerExpand(index)}
                                className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
                              >
                                <Box className="w-3 h-3" />
                                {health.tools.length} tools
                                <ChevronDown className={cn("w-3 h-3 transition-transform", isExpanded && "rotate-180")} />
                              </button>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => removeServer(index)}
                          className="ml-4 px-2 py-1.5 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-md transition-all duration-150 flex-shrink-0"
                          title="Remove server"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Expanded Tools List */}
                      <AnimatePresence>
                        {isExpanded && health?.tools && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-muted/30 border-t border-muted px-4"
                          >
                            <div className="py-3 space-y-2">
                              <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Available Tools</h5>
                              <div className="grid gap-2">
                                {health.tools.map((tool, tIdx) => (
                                  <div key={tIdx} className="bg-card border border-muted p-2 rounded text-sm flex flex-col gap-0.5">
                                    <div className="font-medium text-foreground flex items-center gap-2">
                                      <div className="w-1 h-1 bg-primary rounded-full"></div>
                                      {tool.name}
                                    </div>
                                    {tool.description && (
                                      <div className="text-muted-foreground text-xs ml-3 line-clamp-1">{tool.description}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center p-8 border-2 border-dashed border-muted rounded-lg">
              <p className="text-muted-foreground text-sm">
                No MCP servers configured yet
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Add your first server above to get started
              </p>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-8 bg-container border border-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2 text-foreground">What is MCP?</h4>
            <p className="text-foreground text-sm leading-relaxed">
              The{" "}
              <a
                href="https://docs.tambo.co/concepts/model-context-protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-2 hover:text-foreground"
              >
                Model Context Protocol (MCP)
              </a>{" "}
              is a standard that allows applications to communicate with
              external tools and services. By configuring MCP servers, your
              tambo application will be able to make calls to these tools.
            </p>
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Learn more:</span>{" "}
              <a
                href="https://docs.tambo.co/concepts/model-context-protocol/clientside-mcp-connection"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                client-side
              </a>{" "}
              |{" "}
              <a
                href="https://docs.tambo.co/concepts/model-context-protocol/serverside-mcp-connection"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                server-side
              </a>{" "}
              MCP configuration.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Use portal to render outside current DOM tree to avoid nested forms
  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};

/**
 * Type for MCP Server entries
 */
export type McpServer = string | { url: string };

/**
 * Load and reactively track MCP server configurations from browser localStorage.
 *
 * This hook retrieves saved MCP server configurations and automatically updates
 * when servers are added/removed from the modal or other tabs. It deduplicates
 * servers by URL and handles parsing errors gracefully.
 *
 * @returns Array of unique MCP server configurations that updates automatically or empty array if none found or in SSR context
 *
 * @example
 * ```tsx
 * function MyApp() {
 *   const mcpServers = useMcpServers(); // Reactive - updates automatically
 *   // Returns: [{ url: "https://api.example.com" }, "https://api2.example.com"]
 *
 *   return (
 *     <TamboProvider mcpServers={mcpServers}>
 *       {children}
 *     </TamboProvider>
 *   );
 * }
 * ```
 */
export function useMcpServers(): McpServer[] {
  const [servers, setServers] = React.useState<McpServer[]>(() => {
    if (typeof window === "undefined") return [];

    const savedServersData = localStorage.getItem("mcp-servers");
    if (!savedServersData) return [];

    try {
      const servers = JSON.parse(savedServersData);
      // Deduplicate servers by URL to prevent multiple tool registrations
      const uniqueUrls = new Set();
      return servers.filter((server: McpServer) => {
        const url = typeof server === "string" ? server : server.url;
        if (uniqueUrls.has(url)) return false;
        uniqueUrls.add(url);
        return true;
      });
    } catch (e) {
      console.error("Failed to parse saved MCP servers", e);
      return [];
    }
  });

  React.useEffect(() => {
    const updateServers = () => {
      if (typeof window === "undefined") return;

      const savedServersData = localStorage.getItem("mcp-servers");
      if (!savedServersData) {
        setServers([]);
        return;
      }

      try {
        const newServers = JSON.parse(savedServersData);
        // Deduplicate servers by URL
        const uniqueUrls = new Set();
        const deduped = newServers.filter((server: McpServer) => {
          const url = typeof server === "string" ? server : server.url;
          if (uniqueUrls.has(url)) return false;
          uniqueUrls.add(url);
          return true;
        });
        setServers(deduped);
      } catch (e) {
        console.error("Failed to parse saved MCP servers", e);
        setServers([]);
      }
    };

    // Listen for custom events (same tab updates)
    const handleCustomEvent = () => updateServers();
    window.addEventListener("mcp-servers-updated", handleCustomEvent);

    // Listen for storage events (cross-tab updates)
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === "mcp-servers") {
        updateServers();
      }
    };
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener("mcp-servers-updated", handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  return servers;
}
