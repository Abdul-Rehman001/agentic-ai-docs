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

## From Module 3: Memory

**Working Memory** — What's actively held for the current reasoning step; the immediate context/scratchpad.

**Short-term Memory** — Recent conversation turns kept in context, not yet compressed or discarded.

**Long-term Memory** — Information retained indefinitely in external storage, retrieved only when relevant to the current query.

**Episodic Memory** — Memory of specific past events/conversations, tied to a particular time/context.

**Semantic Memory** — Durable, event-independent facts (e.g., a user preference), decoupled from which conversation they came from.

**Sliding Window (memory)** — Keeping only the last N turns of a conversation, dropping older ones entirely.

**Rolling Summarization** — Periodically compressing older conversation turns into a summary to keep context bounded while preserving gist.

**Fact Extraction** — Running an LLM step to pull out durable, reusable facts from a conversation for long-term storage, rather than storing the raw conversation.

**Recency Weighting** — Prioritizing more recent facts over older, potentially stale or contradicted ones during memory retrieval.

---

## From Module 4: MCP (Model Context Protocol)

**MCP (Model Context Protocol)** — An open standard protocol defining how AI applications (clients) discover and communicate with external tools, data sources, and prompts (servers), without needing bespoke per-application integrations.

**MCP Host** — The application the user interacts with, containing one or more MCP Clients (e.g., Claude Desktop, an IDE, a custom agent app).

**MCP Client** — Component inside a host maintaining a connection to a specific MCP Server and handling protocol-level communication.

**MCP Server** — Exposes a set of capabilities (tools, resources, prompts) from an external system, usable by any MCP-compatible client.

**MCP Tool** — A callable function exposed by an MCP server, conceptually identical to Module 1's function/tool calling, but discoverable/invokable via the standardized protocol.

**MCP Resource** — Addressable, typically read-only content (a file, record, document) an MCP server exposes for the host to pull into context.

**MCP Prompt** — A pre-defined, reusable prompt template exposed by an MCP server.

**Sampling (MCP)** — A primitive letting an MCP server request that the client's LLM generate a completion on the server's behalf, inverting the usual client-to-server call direction.

---

## From Module 5: Retrieval Fundamentals

**Embedding** — A fixed-length vector representing the semantic meaning of a piece of text, produced by a trained embedding model, such that semantically similar text produces vectors that are close together in vector space.

**Embedding Dimensions** — The length of an embedding vector; higher dimensions can capture more nuance at the cost of storage and compute.

**Cosine Similarity** — A similarity metric measuring the angle between two vectors, ignoring magnitude; the common default for text embeddings.

**Euclidean Distance** — Straight-line distance between two vectors; sensitive to magnitude, less common for text embeddings.

**Dot Product** — Sum of element-wise products of two vectors; related to cosine similarity but not normalized by magnitude, cheaper to compute.

**Chunking** — Splitting source documents into smaller pieces before embedding, so retrieval can return the relevant part of a document rather than the whole thing.

**Fixed-size Chunking** — Splitting text every N tokens/characters regardless of content structure.

**Semantic Chunking** — Using embeddings to detect meaning shifts and split chunks at those boundaries.

**Recursive Chunking** — Splitting by the largest structural unit first, recursively splitting further if a piece exceeds the target size.

**Chunk Overlap** — Repeating a small amount of content between adjacent chunks so boundary-spanning ideas aren't lost from both chunks.

**Vector Database** — A database optimized for storing embeddings and performing fast similarity search over large numbers of vectors.

**Index (vector DB)** — The underlying data structure enabling fast approximate similarity search over stored vectors.

**Namespace** — A partition within a vector DB collection, often used for multi-tenancy/isolation.

**Metadata Filtering** — Narrowing a similarity search using structured filters (e.g., category, date) alongside the vector comparison.

**ANN (Approximate Nearest Neighbor) Search** — Search algorithms that trade a small amount of accuracy for large speed gains versus exact nearest-neighbor search, enabling similarity search at scale.

**HNSW (Hierarchical Navigable Small World)** — A widely used ANN algorithm using a multi-layer graph structure to navigate from coarse to precise search results quickly.

**IVF (Inverted File Index)** — An ANN technique that partitions vector space into clusters and searches only the most relevant cluster(s) at query time.

**PQ (Product Quantization)** — A technique that compresses vectors into smaller approximate representations to reduce memory and speed up comparisons, often combined with IVF.

**Dense Retrieval** — Embedding-based similarity search, strong at semantic/paraphrase matching.

**Sparse Retrieval** — Traditional keyword-based search (e.g., BM25), strong at exact term matching.

**BM25** — A ranking function for sparse/keyword retrieval based on term frequency and inverse document frequency.

**Hybrid Retrieval** — Combining dense and sparse retrieval results (e.g., via Reciprocal Rank Fusion) to capture both semantic and exact-match relevance.

**Reciprocal Rank Fusion** — A method for merging ranked result lists from multiple retrieval methods (e.g., dense + sparse) into a single combined ranking.

---

## From Module 6: RAG & Advanced RAG

**RAG (Retrieval-Augmented Generation)** — Retrieving relevant external content and providing it as context to an LLM before generation, addressing knowledge freshness and grounding/citability.

**Grounding** — An answer's traceability back to specific retrieved source content, reducing reliance on the model's parametric (memorized) knowledge.

**Parametric Knowledge** — Knowledge an LLM "remembers" from training, as opposed to knowledge provided via retrieved context at inference time.

**Query Rewriting** — Using an LLM to reformulate a user's raw query into a form better suited for retrieval before searching.

**Parent-Child Retrieval** — Indexing small precise chunks for search matching, but returning their larger parent chunk/section to the LLM for generation.

**Multi-Vector Retrieval** — Indexing multiple representations of the same source chunk (e.g., summaries, hypothetical questions) to improve the odds a user's query matches something semantically close to it.

**Graph RAG** — Retrieval using a knowledge graph (entities as nodes, relationships as edges) instead of/alongside vector similarity, suited to multi-hop, relationship-based questions.

**Corrective RAG (CRAG)** — Adding an explicit relevance-grading step after retrieval, with a corrective fallback (re-retrieval, web search, flagging low confidence) if retrieved content is graded as poor.

**Self-RAG** — A RAG approach where the model generates explicit reflection signals during generation assessing whether retrieval was needed, whether retrieved passages are relevant, and whether the final answer is grounded in them.

**Adaptive RAG** — Routing queries to different retrieval strategies (none, single-step, iterative multi-step) based on a query's assessed complexity, rather than applying one fixed retrieval pipeline uniformly.

**Multi-hop Question** — A question requiring reasoning across multiple connected pieces of information/entities rather than a single direct lookup.

---

## From Module 7: Agentic RAG

**Agentic RAG** — Treating retrieval as one tool among several that an agent can choose to invoke, iterate on, or skip, based on its own reasoning at each step of the agent loop — rather than retrieval being a fixed, always-executed pipeline stage.

**Iterative Retrieval** — Retrieving multiple times within a single request, with each retrieval's query and necessity decided based on what prior retrievals revealed, rather than a single fixed retrieval pass.

---

## From Module 8: AI Architecture

**LLM Gateway** — A dedicated architectural layer centralizing model routing, fallback handling, cost tracking, and prompt versioning for all LLM calls in a system.

**Tool Router** — The component deciding which specific tool or external system handles a given sub-task, distinct from the Planner's higher-level task decomposition.

**Stateless Application Layer** — Designing backend/gateway/planner/router components so any instance can handle any request, with all actual state held in dedicated data stores (Redis/SQL/Vector DB) rather than in the application process itself, enabling horizontal scaling.

**Prompt Versioning** — Managing which version of a prompt template is active via a config/database layer rather than hardcoding it in application code, enabling rollback or A/B testing without redeployment.

---

## From Module 9: Evaluation

**Hallucination** — A confident-sounding model claim that isn't actually supported by the provided context or isn't factually true.

**Groundedness** — Whether each part of a generated answer can be traced back to specific retrieved context, rather than being an unsupported claim.

**Faithfulness** — Whether a generated answer's claims are all supported by the retrieved context, without unsupported additions.

**Answer Relevance** — Whether a generated answer actually addresses the user's question, independent of whether its claims are faithful/grounded.

**Precision@K** — The fraction of the top-K retrieved chunks that are actually relevant to the query.

**Recall@K** — The fraction of all truly relevant chunks in the knowledge base that were successfully retrieved within the top-K.

**LLM-as-a-Judge** — Using a separate LLM call to score outputs against defined evaluation criteria, instead of manual human review of every output.

**Self-preference Bias** — The tendency of a model acting as judge to rate outputs (especially its own or stylistically similar ones) more favorably than a neutral judge would.

**Task Completion Rate** — In agentic systems, the fraction of test tasks an agent actually completes correctly end-to-end.

**Tool Call Accuracy** — Whether an agent called the right tool with the right arguments at the right time, evaluated separately from whether the final answer happened to be correct.

**Trajectory Evaluation** — Assessing the reasoning path an agent took to reach an answer, not just the final output.

---

## From Module 10: Production Topics

**Semantic Caching** — Caching keyed on embedding similarity rather than exact string match, so semantically similar (not just identical) queries can hit the cache.

**Model Tiering** — Using cheaper/faster models for simple sub-tasks and reserving expensive reasoning-tier models for genuinely complex steps, as a cost-optimization strategy.

**Guardrails** — Application-level checks and constraints on model inputs and/or outputs to prevent unsafe, off-topic, or policy-violating behavior, distinct from a model's built-in safety training.

**Moderation** — Screening inputs/outputs specifically for harmful content, often via a dedicated moderation API/model.

**Exponential Backoff** — A retry strategy where wait time between attempts increases progressively, rather than retrying immediately at a fixed interval.

**Fallback Model** — An alternate model/provider a system switches to if the primary one is unavailable or fails repeatedly, to still serve the request.

**Observability** — The general ability to understand what a system is doing and why, after the fact, without needing to reproduce an issue live.

**Tracing** — Recording the full path a single request took through a system (decisions, tool calls, retrieved content, outputs) as one connected, inspectable record.

---

*(This glossary is complete through Module 10 — the full 10-module handbook.)*
