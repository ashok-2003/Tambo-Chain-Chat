
export interface SlashCommandContext {
    // Add context properties here as needed
    // e.g., router, toast, thread control, etc.
    reload: () => void;
    navigate: (url: string) => void;
}

export interface SlashCommand {
    name: string;
    description: string;
    execute: (args: string[], context: SlashCommandContext) => Promise<void> | void;
}

export const SLASH_COMMANDS: Record<string, SlashCommand> = {
    clear: {
        name: "clear",
        description: "Clears the chat history (reloads the page)",
        execute: (_, context) => {
            context.reload();
        },
    },
    price: {
        name: "price",
        description: "Get current price of a cryptocurrency. Usage: /price <symbol>",
        execute: async (args, _) => {
            const symbol = args[0]?.toUpperCase();
            if (!symbol) {
                alert("Please provide a symbol. Usage: /price <symbol>");
                return;
            }
            try {
                const response = await fetch(
                    `https://min-api.cryptocompare.com/data/price?fsym=${symbol}&tsyms=USD`
                );
                const data = await response.json();
                if (data.USD) {
                    alert(`Price of ${symbol}: $${data.USD}`);
                } else {
                    alert(`Could not find price for ${symbol}`);
                }
            } catch (error) {
                console.error("Failed to fetch price", error);
                alert("Failed to fetch price");
            }
        },
    },
    connect: {
        name: "connect",
        description: "Connect to an MCP server. Usage: /connect <url>",
        execute: (args, context) => {
            const url = args[0];
            if (!url) {
                alert("Please provide a URL. Usage: /connect <url>");
                return;
            }
            // Since we can't easily trigger the modal opening from here without more complex state management,
            // we'll partially implement this by navigating to a query param or showing an alert for now.
            // Ideally, this would toggle the state in the MessageInput component.
            alert(`Please use the MCP Config button to connect to: ${url}`);
        },
    },
};

export function parseSlashCommand(input: string): {
    commandName: string;
    args: string[];
} | null {
    if (!input.startsWith("/")) return null;

    const parts = input.slice(1).trim().split(/\s+/);
    if (parts.length === 0) return null;

    const commandName = parts[0].toLowerCase();
    const args = parts.slice(1);

    return { commandName, args };
}
