# Glossary

> Append-only. Terms are added as each module is built. Alphabetical within each module's block for easy scanning.

---

## From Module 1: LLM Fundamentals & Tool Calling

**Token** — The basic unit of text an LLM processes; a subword piece, not necessarily a full word. ~4 characters ≈ 1 token in English.

**Context Window** — Max number of tokens (input + output combined) a model can process in a single request.

**BPE (Byte Pair Encoding)** — A subword tokenization algorithm that iteratively merges the most frequent character/byte pairs to build a vocabulary.

**Lost in the Middle** — The phenomenon where LLMs attend less reliably to information placed in the middle of a very long context, compared to the start or end.

**Temperature** — A sampling parameter that reshapes the probability distribution over next tokens; low = deterministic, high = more random.

**Top-k Sampling** — Restricts next-token sampling to the k most probable tokens.

**Top-p (Nucleus) Sampling** — Restricts next-token sampling to the smallest set of tokens whose cumulative probability ≥ p.

**Greedy Decoding** — Always picking the single highest-probability next token (equivalent to temperature=0 or top_k=1).

**Chain-of-Thought (CoT)** — Prompting technique where the model is asked to reason step-by-step before giving a final answer.

**Few-shot Prompting** — Including a small number of example input/output pairs in the prompt to steer model behavior.

**Function/Tool Calling** — Mechanism by which an LLM emits a structured request (function name + arguments) for the calling application to execute, rather than emitting free text.

**Tool Use Block / Tool Result** — The structured message types used to represent a model's request to call a tool, and the application's response with the tool's output.

**Structured Output** — Model output constrained to a specific schema (typically JSON) rather than free-form prose.

**Constrained Decoding** — Mechanically restricting which tokens can be sampled at each generation step so output cannot violate a target schema.

**Reasoning Model** — An LLM variant trained/allowed to perform extended internal deliberation before producing a final answer (contrast: chat/instruct model).

**Fine-tuning** — Updating a model's weights via additional training on task/domain-specific data, as opposed to prompting (which changes behavior only at inference time).

**Distillation** — Fine-tuning a smaller/cheaper model to mimic the behavior of a larger model on a specific task.

---

## From Module 2: Agentic Core

**Agent** — An LLM operating in a loop with the ability to use tools, observe results, and decide next steps toward a goal, with some degree of autonomy — as opposed to a single fixed input→output response.

**Agent Loop** — The Reason → Act → Observe → Decide (repeat or finish) cycle that underlies essentially all agent frameworks.

**ReAct (Reason + Act)** — A pattern where the model interleaves explicit reasoning ("Thought") with tool calls ("Action") and reads results ("Observation"), improving both accuracy and debuggability versus reasoning or acting alone.

**Single-Agent Architecture** — One agent/loop handling an entire task with access to all needed tools.

**Multi-Agent Architecture** — Multiple specialized agents, each with a narrower role/tool set, coordinating (often via a supervisor) to solve a larger task.

**Planner** — Agent role responsible for decomposing a high-level goal into an ordered sequence of sub-tasks.

**Executor** — Agent role responsible for actually carrying out a given sub-task, typically via tool calls.

**Supervisor** — Agent role that routes tasks to the appropriate specialist agent(s) and aggregates/synthesizes their outputs.

**Critic** — Agent role that reviews a plan or output for errors, gaps, or policy violations, without necessarily fixing them itself.

**Reflection** — A self-critique loop where an agent (or a separate critic) evaluates its own output and revises it before finalizing.

**Coordination Failure** — A multi-agent-specific failure mode where agents miscommunicate, duplicate work, or propagate one agent's error silently to another.

---

*(Modules 3+ will append their terms below as they're built.)*
