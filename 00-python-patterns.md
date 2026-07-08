# Module 0: Python Patterns for Agentic AI

> **Goal of this module:** If you are coming from JavaScript/TypeScript, or haven't used Python in a while, jumping straight into Agentic AI code can feel jarring. This module is **not** a generic Python tutorial. Instead, it tightly scopes the exact 8 Python patterns you will see repeatedly across Modules 1-10, explaining *why* they are used in AI engineering and mapping them to JS/TS concepts where helpful.

---

## 1. Type Hints and Pydantic

In traditional Python, types are implicit. In Agentic AI, strict types are load-bearing: you use them to define the exact JSON schema an LLM must output (Module 1), or the exact arguments a tool requires.

**The Pattern:** You will frequently see standard Python type hints combined with `pydantic` (a validation library).

```python
from pydantic import BaseModel, Field

# JS/TS Equivalent: interface UserData { name: string; age: number; }
class UserSummary(BaseModel):
    name: str = Field(description="The user's full name")
    age: int = Field(gt=0, description="The user's age in years")
    is_active: bool = True
```

**Where you'll see this:** 
- Defining "Structured Outputs" so the LLM replies in JSON (Module 1).
- Defining tool schemas so the LLM knows what arguments your function expects (Module 1, 4).

---

## 2. Async / Await (`asyncio`)

Agentic AI involves heavy I/O: waiting for the LLM to generate text, waiting for a database search, or waiting for an external API tool. Synchronous code blocks the whole app.

**The Pattern:** Python uses `async def` and `await` just like JavaScript.

```python
import asyncio
import anthropic

async def fetch_llm_response(prompt: str):
    # JS/TS Equivalent: const response = await client.messages.create(...)
    client = anthropic.AsyncAnthropic()
    response = await client.messages.create(
        model="claude-3-5-sonnet",
        max_tokens=100,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content
```

**Where you'll see this:** 
- Building MCP Servers (Module 4) which are almost exclusively async.
- Streaming responses to a frontend (Module 10).

---

## 3. Decorators (`@`)

Decorators wrap a function to modify its behavior. If you've used NestJS or Angular, these look familiar. In AI, they are heavily used to register standard functions as "Tools" that the LLM can see.

**The Pattern:** 

```python
# JS/TS Equivalent: Similar to TypeScript decorators like @Get('/api')
@mcp_server.tool()
def get_weather(city: str) -> str:
    """Returns the weather for a given city."""
    return f"The weather in {city} is sunny."
```

**Where you'll see this:** 
- Registering tools in Model Context Protocol (MCP) servers (Module 4).
- Registering nodes in graph-based agent frameworks like LangGraph (Module 2).

---

## 4. Context Managers (`with` blocks)

Context managers automatically handle setup and teardown of resources. They guarantee that a resource (like a file, database connection, or API stream) is cleanly closed when the block ends, even if an error occurs.

**The Pattern:** 

```python
# JS/TS Equivalent: closest is try/finally, or 'using' declarations in newer TS
with open("system_prompt.txt", "r") as file:
    prompt = file.read()
# The file is automatically closed here!

# In AI Streaming:
with client.messages.stream(...) as stream:
    for text in stream.text_stream:
        print(text)
# The HTTP stream is safely closed when the block ends.
```

**Where you'll see this:** 
- Safely managing streaming connections to LLM providers (Module 10).
- Opening local files to inject as context into prompts.

---

## 5. Generators and Iterators (`yield`)

Generators produce a sequence of values lazily over time, rather than computing them all at once and returning an array.

**The Pattern:** Uses the `yield` keyword instead of `return`.

```python
# JS/TS Equivalent: function* () { yield ... }
def stream_tokens(mock_response: list[str]):
    for token in mock_response:
        yield token  # Pauses execution and returns the token

# Consuming the generator:
for chunk in stream_tokens(["Hello", " ", "World"]):
    print(chunk, end="")
```

**Where you'll see this:** 
- Relaying streamed text from the LLM Gateway back to your React/Next.js frontend (Module 8, 10).

---

## 6. Dataclasses and JSON Serialization

When passing data to tools, or converting LLM outputs to Python objects, you often need lightweight data containers that easily serialize to JSON.

**The Pattern:**

```python
from dataclasses import dataclass, asdict
import json

@dataclass
class ToolCall:
    name: str
    arguments: dict

action = ToolCall(name="search_db", arguments={"query": "refund policy"})

# JS/TS Equivalent: JSON.stringify(action)
json_string = json.dumps(asdict(action))
```

**Where you'll see this:** 
- Storing conversation history and memory logs (Module 3).
- Serializing agent states before saving them to Redis (Module 8).

---

## 7. `requests` and `httpx` (API Calls)

Agent tools almost always interact with the outside world via HTTP. While `requests` is the standard for synchronous code, `httpx` is used when you need `async`.

**The Pattern:**

```python
import httpx

async def fetch_stock_price(ticker: str) -> dict:
    # JS/TS Equivalent: const response = await fetch(...)
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://api.example.com/stock/{ticker}")
        return response.json()
```

**Where you'll see this:** 
- Writing custom tools for your agent to fetch live data (Module 1).
- MCP Servers making external requests (Module 4).

---

## 8. Basic `numpy` Math

You don't need a PhD in math, but you do need to understand how to compare vectors (arrays of numbers) to find similar text. 

**The Pattern:** 

```python
import numpy as np

# A vector representing a query
query_vector = np.array([0.1, 0.3, -0.5])
# A vector representing a document
doc_vector = np.array([0.2, 0.3, -0.4])

# Dot product (a common similarity metric)
similarity = np.dot(query_vector, doc_vector)
```

**Where you'll see this:** 
- Calculating Cosine Similarity and Dot Products for Vector Embeddings in Retrieval/RAG (Module 5, 6).

---

## What's Next

Now that you're armed with the exact Python patterns you'll need, you're ready to dive into **Module 1: LLM Fundamentals & Tool Calling**, where you'll immediately see Pydantic schemas and Tool Calling in action.
