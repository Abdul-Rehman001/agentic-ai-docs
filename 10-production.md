# Module 10: Production Topics

> **Goal of this module:** Learn the operational concerns that separate "it works when I run it" from "it works reliably for real users, at reasonable cost, and when things go wrong we know why." This is the final module — everything built across Modules 1-9 gets hardened here. None of this is optional in a real deployed system, even though it's easy to skip when building a demo.

---

## 1. Caching

**Why it matters:** LLM calls are slow and expensive. If the same (or similar) input is likely to recur — a common question, a repeated tool call with the same arguments, an identical retrieval query — serving a cached response avoids paying that cost again.

**Levels of caching worth knowing:**
- **Exact-match caching** — cache keyed on the exact input (e.g., exact user query string). Simple, high hit-rate only if inputs literally repeat.
- **Semantic caching** — cache keyed on embedding similarity (Module 5) rather than exact string match — if a new query is semantically very close to a previously answered one, serve the cached answer instead of re-running the full pipeline. More complex to implement correctly (need a similarity threshold that doesn't serve wrong cached answers for subtly different questions) but catches far more cache hits than exact-match alone.
- **Prompt caching (provider-level)** — many LLM providers offer caching of the static portion of a prompt (e.g., a long system prompt or a large retrieved context that doesn't change between calls), so you're not re-processing (and re-paying for) the same tokens on every call within a session.

**Where caching typically lives:** Redis (Module 8) — fast key-value lookups fit this need well.

---

## 2. Cost Optimization

Beyond caching, several concrete techniques reduce spend without necessarily sacrificing quality:

- **Model tiering** — use cheaper/faster models for simple sub-tasks (classification, routing, simple lookups) and reserve expensive reasoning-tier models (Module 1) for genuinely complex steps (planning, Module 2/8). This is the single highest-leverage cost lever in most agentic systems.
- **Token minimization** — trim unnecessary content from prompts (Module 1's context window awareness), avoid re-sending redundant conversation history unnecessarily, and use concise system prompts.
- **Bounding iterative loops** — capping retrieval iterations (Module 7) and reflection cycles (Module 2) prevents runaway cost from unbounded agent loops.
- **Batching** — where the use case allows (not real-time chat), batch multiple requests together; many providers offer discounted batch-processing rates for non-latency-sensitive workloads.

---

## 3. Rate Limiting

Two distinct reasons to rate limit, worth separating:

- **Protecting your own budget** — capping how many LLM calls a single user (or the system overall) can make in a time window, so a bug or abusive usage pattern doesn't produce a runaway bill.
- **Respecting the LLM provider's own rate limits** — providers enforce request-per-minute and token-per-minute caps; exceeding them causes failed requests. Your system needs to handle this gracefully (see Retries, §7) rather than just erroring out to the user.

```python
# Simple token-bucket-style rate limiter sketch
import time

class RateLimiter:
    def __init__(self, max_calls: int, window_seconds: int):
        self.max_calls = max_calls
        self.window = window_seconds
        self.calls = []

    def allow(self) -> bool:
        now = time.time()
        self.calls = [t for t in self.calls if now - t < self.window]
        if len(self.calls) < self.max_calls:
            self.calls.append(now)
            return True
        return False
```

---

## 4. Token Counting

Since context windows and cost are both measured in tokens (Module 1), actually counting tokens before sending a request — rather than guessing based on character count — matters for both correctness (avoiding context overflow errors) and cost predictability.

```python
# Conceptual — actual tokenizer depends on the specific model/provider
def estimate_tokens(text: str) -> int:
    # Rough heuristic: ~4 characters per token in English (Module 1)
    return len(text) // 4

# Production systems should use the provider's actual tokenizer library
# for precise counts rather than relying on this rough estimate alone.
```

**Practical use:** token counting feeds directly into context management decisions (Module 3's memory strategies) — deciding when to trigger summarization or trimming isn't a guess, it's a measured threshold.

---

## 5. Streaming

Rather than waiting for the entire LLM response to generate before showing anything to the user, **streaming** sends tokens to the frontend as they're generated, so the user sees the response appear incrementally — dramatically improving perceived responsiveness even though total generation time is unchanged.

```python
import anthropic

client = anthropic.Anthropic()

with client.messages.stream(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Explain streaming in one paragraph"}]
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)  # In a real app: send each chunk to the frontend
```

**Complication in agentic systems specifically:** streaming is straightforward for a single direct response, but trickier when tool calls are involved — you often want to stream the model's reasoning/text output, while tool calls themselves complete as discrete events (not token-by-token), so the frontend needs to handle a mix of streamed text and discrete tool-call/tool-result events within the same interaction.

---

## 6. Guardrails and Moderation

**Guardrails** are checks and constraints applied to model inputs and/or outputs to prevent unsafe, off-topic, or policy-violating behavior — distinct from the model's own built-in safety training, these are application-level controls you add on top.

- **Input guardrails** — checking user input before it reaches the model (e.g., blocking attempts at prompt injection, filtering clearly out-of-scope requests before spending an LLM call on them).
- **Output guardrails** — checking the model's response before it reaches the user (e.g., verifying a generated SQL query isn't destructive before executing it, checking generated content against a policy before display).
- **Moderation** — specifically screening for harmful content (hate speech, self-harm content, etc.) — often via a dedicated moderation API/model call, separate from the main generation model, run on both input and output.

**Why this matters more in agentic systems than simple chatbots:** an agent with tool access (Module 1, 2) can take real actions (send an email, run code, modify a database) — a guardrail failure here isn't just "bad text shown to a user," it's a real-world action taken incorrectly. Output guardrails on tool arguments specifically (not just final text) are a serious, non-optional consideration once tool calling is involved.

---

## 7. Retries and Fallback Models

**Retries** — LLM API calls can fail transiently (network issues, temporary rate limits, provider-side errors). Production systems retry failed calls automatically, typically with **exponential backoff** (wait progressively longer between retry attempts) rather than immediately hammering the API again.

```python
import time

def call_with_retry(fn, max_retries=3, base_delay=1):
    for attempt in range(max_retries):
        try:
            return fn()
        except Exception as e:
            if attempt == max_retries - 1:
                raise
            wait = base_delay * (2 ** attempt)  # exponential backoff
            time.sleep(wait)
```

**Fallback models** — if the primary model/provider is unavailable even after retries (or consistently too slow/rate-limited), the system can fall back to an alternate model or provider to still serve the request, rather than failing entirely. This is a direct responsibility of the LLM Gateway layer (Module 8).

**Where to draw the line:** not every failure should silently retry forever — combine retries with a reasonable max-attempt cap and a clear fallback or graceful failure message, rather than leaving a user waiting indefinitely.

---

## 8. Observability and Tracing

**Observability** — the general ability to understand what your system is doing and why, after the fact, without having to reproduce the exact issue live.

**Tracing** — the specific practice of recording the full path a single request took through the system: which planner decision was made (Module 8), which tools were called and with what arguments (Module 1/2), what was retrieved (Module 5-7), what the model's reasoning/intermediate steps were, and what the final output was — as one connected, inspectable record, not scattered disconnected log lines.

```
Trace for one request:
  request_id: abc123
  ├─ planner_decision: "needs retrieval + summarization"
  ├─ tool_call: search_knowledge_base(query="refund policy")
  │    └─ result: [3 chunks, ids: doc_12, doc_45, doc_90]
  ├─ tool_call: none (direct generation)
  ├─ final_output: "..."
  ├─ total_tokens: 1,240
  ├─ total_latency_ms: 2,340
  └─ model_used: claude-sonnet-4-6
```

**Why this matters more for agentic systems than simple request/response APIs:** when an agent takes a wrong action, the bug could be in the planning step, the tool selection, the tool arguments, the retrieved content, or the final generation — without a full trace connecting all of these for a single request, debugging becomes guesswork. This is the direct payoff of Module 2's ReAct pattern making reasoning explicit — that explicit reasoning is exactly what a good trace captures and makes inspectable after the fact.

---

## 9. Putting It Together: A Production Checklist

For any agentic/RAG system moving from "works when I run it" to "ready for real users," a reasonable minimum bar:

- [ ] Requests are rate-limited (per-user and/or globally)
- [ ] Common/similar queries are cached (at least exact-match; semantic caching if budget-sensitive)
- [ ] Model tiers are chosen deliberately per sub-task, not uniformly using the most expensive model everywhere
- [ ] Iterative loops (retrieval, reflection) have hard caps
- [ ] Failed LLM calls retry with backoff, with a fallback model/provider path
- [ ] Tool call arguments are validated/guardrailed before execution, especially for any action with real-world side effects
- [ ] Every request is traceable end-to-end — you can look up what happened for a specific failed request after the fact
- [ ] An evaluation set (Module 9) exists and is re-run when prompts/models/retrieval strategy change

This checklist, applied to your own code reviewer project, is a genuinely good exercise once you get to building it — not every box needs to be checked for a portfolio project, but being able to explain *which* ones you addressed and *why* you deprioritized the others is exactly the kind of production-mindedness that separates a tutorial-follower from someone who understands the space.

---

## Comparisons Table: Failure Handling Strategies

| Concern | Mechanism | Where it lives (Module 8 architecture) |
|---|---|---|
| Transient API failure | Retry with exponential backoff | LLM Gateway |
| Provider/model unavailable | Fallback model | LLM Gateway |
| Repeated queries | Caching (exact or semantic) | Redis |
| Runaway cost from loops | Hard iteration caps | Planner / Agent loop logic |
| Unsafe tool actions | Output guardrails on tool arguments | Tool Router |
| Harmful content | Moderation API/model | Input and Output guardrail layer |
| Debugging a bad response | Tracing | Spans the whole request path |

---

## Interview-Style Q&A

**Q1: What's the difference between exact-match caching and semantic caching, and why would you use the more complex one?**
Exact-match caching only hits when the input is literally identical to a previous request — simple but limited. Semantic caching uses embedding similarity (Module 5) to catch queries that are worded differently but mean the same thing, achieving a much higher cache hit rate at the cost of needing a carefully tuned similarity threshold to avoid serving a wrong cached answer for a subtly different question.

**Q2: Why is model tiering usually the highest-leverage cost optimization technique in an agentic system?**
Because agentic systems make many LLM calls across different sub-tasks (planning, tool selection, generation) with very different actual difficulty — using an expensive reasoning-tier model uniformly for all of them wastes cost on steps that a cheaper, faster model could handle just as well, while reserving the expensive model specifically for genuinely complex steps captures most of the quality benefit at a fraction of the cost.

**Q3: Why do agentic systems need output guardrails specifically on tool call arguments, not just on final text output?**
Because tool calls (Module 1, 2) can trigger real-world actions — sending emails, executing code, modifying databases. A guardrail failure on generated text is a display problem; a guardrail failure on a tool argument can mean an incorrect real-world action actually gets taken, which is a categorically more serious failure mode.

**Q4: Why is tracing more critical in agentic systems than in a simple single-call chatbot?**
A wrong final output in an agentic system could stem from a bad planning decision, wrong tool selection, wrong tool arguments, bad retrieval, or flawed generation — any of several distinct stages. Without a connected trace of the full path a request took, diagnosing which stage actually failed becomes guesswork rather than inspection.

**Q5: What's the risk of unbounded retries, and how should exponential backoff and max-attempt caps address it?**
Unbounded retries can compound latency (repeatedly retrying a call that will keep failing) and can worsen rate-limit issues by hammering the provider harder rather than backing off. Exponential backoff spaces out retry attempts progressively, and a max-attempt cap ensures the system eventually falls back or fails gracefully instead of leaving a request hanging indefinitely.

**Q6: For a solo portfolio project with limited budget, which production concerns from this module would you prioritize first, and why?**
Model tiering and hard caps on iterative loops (both directly control cost, which matters most under a real budget constraint), plus basic tracing (since debugging an agentic system without any visibility into its decision path is genuinely difficult even at small scale). Full production-grade moderation, semantic caching, and extensive rate-limiting infrastructure are reasonable to defer or simplify for a portfolio-scale project, as long as you can explain that trade-off deliberately rather than having simply not considered it.

---

## 🛑 Common Pitfalls & Debugging

1. **Missing Traces**: An agent hallucinates in production, and you have no idea why because you didn't log the intermediate tool calls.
   - *Fix*: Always log the full agent trace (input, thoughts, tool calls, tool results) to a system like Langfuse or Datadog.
2. **Silent Cost Spikes**: A bug in the agent loop causes it to continuously call a high-cost LLM indefinitely.
   - *Fix*: Implement strict budget caps per session/user, and use rate limiting at the gateway level.

```quiz
Q: Why are unbounded retries dangerous in an agentic system?
- [ ] They prevent the agent from ever using tools.
- [x] They compound latency and can worsen rate-limiting issues by hammering the API.
- [ ] They automatically upgrade you to a more expensive LLM tier.
Explanation: If an API is down, hitting it repeatedly will just result in more failures, slower response times, and potential bans. You should always use exponential backoff and a maximum retry cap.
```

---

## Handbook Complete

This closes the 10-module arc: LLM Fundamentals → Agentic Core → Memory → MCP → Retrieval Fundamentals → RAG & Advanced RAG → Agentic RAG → AI Architecture → Evaluation → Production Topics. Every module builds on the ones before it, and the glossary now holds a full cross-referenced term set spanning the whole handbook.

**Natural next step:** apply all of this directly to the AI code reviewer project — it's designed to exercise nearly every module here (agent loop, tool calling, code-aware chunking, RAG grounding, memory of repo conventions, a triage/planning layer, and — thanks to Modules 9-10 specifically — an actual way to evaluate whether its reviews are good and to run it reliably within a free-tier budget).
