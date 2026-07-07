import anthropic

client = anthropic.Anthropic()

def get_weather(location: str) -> str:
    """Mock weather API."""
    if "tokyo" in location.lower():
        return "Sunny, 22°C"
    return "Cloudy, 15°C"

# 1. Define the tool
tools = [{
    "name": "get_weather",
    "description": "Get the current weather in a given location",
    "input_schema": {
        "type": "object",
        "properties": {
            "location": {"type": "string", "description": "The city name"}
        },
        "required": ["location"]
    }
}]

# 2. Ask the model
response = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1024,
    tools=tools,
    messages=[{"role": "user", "content": "What's the weather in Tokyo?"}]
)

# 3. Model decides to use the tool
if response.stop_reason == "tool_use":
    tool_call = next(c for c in response.content if c.type == "tool_use")
    print(f"Model wants to call: {tool_call.name} with {tool_call.input}")
    
    # 4. You (the application) run the actual function
    if tool_call.name == "get_weather":
        result = get_weather(tool_call.input["location"])
        
        # 5. Send the result back to the model
        final_response = client.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            tools=tools,
            messages=[
                {"role": "user", "content": "What's the weather in Tokyo?"},
                {"role": "assistant", "content": response.content},
                {
                    "role": "user",
                    "content": [{
                        "type": "tool_result",
                        "tool_use_id": tool_call.id,
                        "content": result
                    }]
                }
            ]
        )
        print(final_response.content[0].text)
