# Agentic AI Handbook

A modular, self-built handbook for learning Agentic AI end-to-end — theory, architecture diagrams, Python code, comparisons, and interview notes. Built one module at a time, in the order below. Each module is self-contained; you shouldn't need to jump ahead to understand it.

## Learning Order & Progress

| # | Module | Status |
|---|---|---|
| 1 | [LLM Fundamentals & Tool Calling](./01-llm-fundamentals-and-tool-calling.md) | ✅ Done |
| 2 | [Agentic Core](./02-agentic-core.md) (agent loop, ReAct, planner/executor/supervisor/critic, reflection, single vs multi-agent) | ✅ Done |
| 3 | Memory (short-term, long-term, episodic, semantic, working) | ⏳ Next |
| 4 | MCP — Model Context Protocol | ⬜ Not started |
| 5 | Retrieval Fundamentals (embeddings, similarity math, chunking, vector DBs, dense/sparse/hybrid search, ANN/HNSW) | ⬜ Not started |
| 6 | RAG & Advanced RAG (query rewriting, CRAG, Self-RAG, Adaptive RAG, parent-child/multi-vector retrieval, Graph RAG) | ⬜ Not started |
| 7 | Agentic RAG (where retrieval and agents intersect) | ⬜ Not started |
| 8 | AI Architecture (full production system design) | ⬜ Not started |
| 9 | Evaluation (hallucination detection, Precision@K/Recall@K, groundedness, faithfulness, LLM-as-judge) | ⬜ Not started |
| 10 | Production Topics (caching, cost, rate limiting, streaming, guardrails, observability, tracing, retries, fallback models) | ⬜ Not started |

## Why This Order

Most GenAI roadmaps front-load embeddings/chunking/vector-DB/RAG theory (often 40%+ of total content) before ever touching "agents." Since the actual goal here is **agentic AI**, the agent core (Module 2) comes right after fundamentals — RAG and retrieval are treated as tools an agent can use, not prerequisites to understanding agents. Memory and MCP are placed right after the agent core since they're direct extensions of it (how an agent remembers, and how it standardizes tool access).

## Conventions Used Across All Modules

- **Language:** Python only.
- **Structure per module:** Concept overview → why it matters → architecture/flow diagram (ASCII) → deep dive per sub-topic → Python code examples → comparison tables → interview-style Q&A → "what's next."
- **Diagrams:** ASCII flow diagrams, kept inline in each module for quick reference without needing external tools.
- New terms introduced in a module are also added to [`glossary.md`](./glossary.md) — check there if a term is used before its "home" module.

## Files in This Folder

```
agentic-ai-handbook/
├── README.md                                    ← you are here
├── glossary.md                                   ← append-only term reference
├── 01-llm-fundamentals-and-tool-calling.md       ✅
├── 02-agentic-core.md                            (coming next)
├── 03-memory.md
├── 04-mcp.md
├── 05-retrieval-fundamentals.md
├── 06-rag-and-advanced-rag.md
├── 07-agentic-rag.md
├── 08-ai-architecture.md
├── 09-evaluation.md
└── 10-production.md
```

## How to Use This

1. Read a module fully before moving to the next — each one assumes the previous ones are understood.
2. Ask questions / go deeper on anything before advancing — no module gets marked "done" with open gaps.
3. When ready for the next module, just say so and it gets added to this folder, and this README + the glossary get updated.
