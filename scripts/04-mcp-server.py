from mcp.server import Server
from mcp.types import Tool, TextContent
import asyncio

# A minimal example of an MCP Server
app = Server("weather-server")

@app.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="get_weather",
            description="Get current weather for a city",
            inputSchema={
                "type": "object",
                "properties": {"city": {"type": "string"}},
                "required": ["city"]
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "get_weather":
        city = arguments["city"]
        # In real code: call an actual weather API
        result = f"{city}: Rain, 80% chance"
        return [TextContent(type="text", text=result)]
    raise ValueError(f"Unknown tool: {name}")

# To run this, you would typically use an MCP transport layer (stdio or sse).
# e.g., using mcp.server.stdio
print("MCP Server defined. Any MCP-compatible client can now discover and call get_weather() without custom integration.")
