# Module 9: Evaluation

> **Goal of this module:** Learn how to actually measure whether an agentic/RAG system is good, rather than just "it seems to work when I tried it a few times." Every module before this one taught you how to *build* — this one teaches you how to know whether what you built is actually working, which is the difference between a demo and something you can trust, iterate on, and defend in an interview.

---

## 1. Why "It Seems to Work" Isn't Good Enough

LLM outputs are non-deterministic (Module 1 — temperature, sampling), retrieval quality varies by query (Module 5-6), and agent loops can take different paths across runs (Module 2, 7). This means:

- A system that worked on the 5 examples you tried manually can silently fail on inputs you didn't think to test.
- Without a way to measure quality, you can't tell if a change (new prompt, different model, new chunking strategy) actually made things better or worse — you're just guessing based on vibes.
- Interviews and real production systems both expect you to answer "how do you know it's good?" with something more concrete than "I tried it and it looked right."

**Evaluation is what turns "I built a RAG system" into "I built a RAG system and can tell you it retrieves the right context 85% of the time, and here's how I measured that."**

---

## 2. Hallucination Detection

A **hallucination** is when the model generates a confident-sounding claim that isn't actually supported by the provided context (in a RAG system) or isn't factually true (in general use).

**Why RAG doesn't automatically prevent hallucination:** giving a model correct context doesn't guarantee it uses that context — it can still ignore the provided information and answer from parametric memory (Module 6, §3's failure mode table), especially if the context doesn't clearly contain the answer and the model tries to be "helpful" anyway.

**How to detect it, practically:**
- **Groundedness checking** — for each claim in the generated answer, verify it's actually supported by the retrieved context. This can be done manually (spot-checking) or automated using an LLM-as-judge (see §5) specifically prompted to check "is this claim supported by this source text, yes/no."
- **Citation verification** — if the system claims to cite sources, verify the cited source actually contains the claimed information (not just that a citation format exists).
- **Consistency checking** — ask the same question multiple times (or with slight rephrasing) and check whether the answer stays consistent; wildly different answers to the same underlying question is a red flag, though not conclusive proof of hallucination on its own.

---

## 3. RAG-Specific Evaluation Metrics

These metrics evaluate the two separate stages of a RAG system independently — retrieval quality and generation quality — because a failure in either stage looks the same to an end user ("bad answer") but requires completely different fixes.

### Retrieval Metrics

**Precision@K** — of the K chunks retrieved, what fraction are actually relevant to the query?
```
Precision@K = (relevant chunks retrieved) / K
```
Low precision means your retrieval is pulling in noise — irrelevant chunks that dilute the context and can confuse or mislead the generation step.

**Recall@K** — of all the relevant chunks that exist in the knowledge base, what fraction did the top-K retrieval actually find?
```
Recall@K = (relevant chunks retrieved) / (total relevant chunks that exist)
```
Low recall means your retrieval is missing important information, even if what it did retrieve was accurate — a chunking or embedding-model problem (Module 5), or K set too low.

**The trade-off between them:** increasing K generally increases recall (you're casting a wider net) but can decrease precision (more noise creeps in). This is a real tuning decision, not a "bigger K is always better" situation — and it's exactly why Module 5's chunking quality matters so much: better chunking means you can hit high precision AND high recall at a smaller K.

### Generation Metrics

**Faithfulness** — does the generated answer only make claims that are actually supported by the retrieved context, without adding unsupported claims (hallucination, applied specifically to RAG outputs)?

**Groundedness** — similar to faithfulness, sometimes used interchangeably; specifically measures whether each part of the answer can be traced back to a specific piece of retrieved context, rather than being an unsupported general claim.

**Answer Relevance** — separate from faithfulness — does the generated answer actually address the user's question, even if every claim in it is faithfully grounded? (A perfectly faithful answer that doesn't actually answer what was asked still fails the user.)

| | Faithful to context? (Yes) | Faithful to context? (No) |
|---|---|---|
| **Relevant to query? (Yes)** | ✅ Good | ⚠️ Hallucinated but on-topic |
| **Relevant to query? (No)** | ⚠️ Faithful but useless | ❌ Both wrong |

---

## 4. Precision@K / Recall@K — Worked Example

```python
def precision_at_k(retrieved_ids: list, relevant_ids: set, k: int) -> float:
    top_k = retrieved_ids[:k]
    relevant_retrieved = sum(1 for doc_id in top_k if doc_id in relevant_ids)
    return relevant_retrieved / k

def recall_at_k(retrieved_ids: list, relevant_ids: set, k: int) -> float:
    top_k = retrieved_ids[:k]
    relevant_retrieved = sum(1 for doc_id in top_k if doc_id in relevant_ids)
    return relevant_retrieved / len(relevant_ids) if relevant_ids else 0.0

# Example: a query has 4 truly relevant chunks in the knowledge base (relevant_ids)
# Your system retrieved the top 5 chunks (retrieved_ids)
relevant_ids = {"doc_12", "doc_45", "doc_78", "doc_90"}
retrieved_ids = ["doc_12", "doc_33", "doc_45", "doc_67", "doc_90"]

print(precision_at_k(retrieved_ids, relevant_ids, k=5))  # 3/5 = 0.6
print(recall_at_k(retrieved_ids, relevant_ids, k=5))     # 3/4 = 0.75
```

**Where does `relevant_ids` come from in practice?** This requires a labeled evaluation set — a set of test queries where you (or domain experts) have already determined which documents/chunks are genuinely relevant. Building this labeled set is real, often manual work, but it's what makes evaluation objective rather than subjective — without it, you're back to "it seems to work."

---

## 5. LLM-as-a-Judge

Manually reading every output to check faithfulness/relevance doesn't scale. **LLM-as-a-judge** uses a separate LLM call (often a strong model, sometimes deliberately a different model than the one being evaluated to avoid self-preference bias) to score outputs against defined criteria.

```python
import anthropic

client = anthropic.Anthropic()

def judge_faithfulness(context: str, answer: str) -> dict:
    prompt = f"""You are evaluating whether an AI-generated answer is faithful
to the provided context — i.e., every claim in the answer must be supported
by the context, with no unsupported additions.

Context:
{context}

Answer:
{answer}

Respond with ONLY a JSON object:
{{"faithful": true/false, "unsupported_claims": ["list any claims not supported by context"], "reasoning": "brief explanation"}}"""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}]
    )
    import json
    raw = response.content[0].text.strip().strip("```json").strip("```")
    return json.loads(raw)
```

**Why this works reasonably well:** models are often better at *evaluating* a given answer against explicit criteria than at generating a perfect answer from scratch (the same asymmetry that makes Module 2's reflection pattern useful) — judging is a narrower, more constrained task than open-ended generation.

**Risks and limitations of LLM-as-a-judge, worth knowing explicitly:**
- **Self-preference bias** — a model may rate its own outputs (or outputs in a style similar to its own) more favorably than a truly neutral judge would.
- **Prompt sensitivity** — how the judging criteria are phrased affects the scores; an inconsistent judging prompt produces inconsistent evaluation, undermining the whole point.
- **Not a substitute for real labeled data entirely** — LLM-as-a-judge scales well, but periodically validating judge scores against actual human judgment on a sample is important to confirm the judge itself is calibrated correctly.

---

## 6. Evaluating Agentic Systems Specifically (Beyond RAG)

RAG metrics (precision/recall/faithfulness) evaluate the retrieval+generation pair, but agentic systems (Module 2, 7) have additional dimensions worth measuring:

- **Task completion rate** — across a test set of tasks, what fraction did the agent actually complete successfully end-to-end (not just produce *an* output, but the *correct* output)?
- **Tool call accuracy** — did the agent call the right tool, with the right arguments, at the right time? (Distinct from whether the final answer was correct — an agent can accidentally get the right final answer despite a wrong intermediate tool call, which is a fragile success worth catching.)
- **Efficiency** — how many steps/tool calls/tokens did the agent use to complete the task? Two agents can both succeed, but one that took 15 tool calls and one that took 4 have very different cost/latency profiles worth distinguishing (directly relevant to Module 7's cost concerns around iterative retrieval).
- **Trajectory evaluation** — for multi-step agents, evaluating not just the final output but the reasoning path taken (was each intermediate step sensible, or did the agent get lucky despite a flawed reasoning trace?).

---

## 7. Building a Simple Evaluation Set (Practical Starting Point)

You don't need a massive labeled dataset to start evaluating meaningfully:

1. **Collect 15-30 realistic test queries** representative of what real users will actually ask (not just easy examples — include edge cases, ambiguous phrasing, multi-part questions).
2. **For RAG evaluation:** manually identify which source chunks are genuinely relevant to each query (this becomes your `relevant_ids` ground truth for Precision@K/Recall@K).
3. **For generation quality:** write or approve a reference/ideal answer for each query, or at minimum clear criteria for what a good answer must include.
4. **Run your system against all test queries**, log the full trace (retrieved chunks, tool calls, final answer).
5. **Score automatically** where possible (Precision@K/Recall@K are purely mechanical once you have ground truth) and use LLM-as-a-judge for faithfulness/relevance at scale, spot-checking a subset manually to confirm judge scores make sense.
6. **Re-run this same set after every meaningful change** (new prompt, different chunking strategy, different model) to see whether the change actually helped — this is what makes iteration principled instead of guesswork.

This is a genuinely realistic, buildable evaluation setup for a solo project — and having one is a substantive, concrete thing to describe in an interview ("I built a 25-query eval set with labeled ground truth and tracked precision/recall/faithfulness across iterations") versus not having one at all.

---

## Comparisons Table: What Each Metric Actually Catches

| Metric | Catches | Doesn't catch |
|---|---|---|
| Precision@K | Retrieval pulling in irrelevant noise | Whether the generated answer used the good chunks well |
| Recall@K | Retrieval missing important information entirely | Generation quality given what was retrieved |
| Faithfulness/Groundedness | Model adding unsupported claims not in context | Whether the answer actually addresses the question |
| Answer Relevance | Model faithfully answering the wrong question | Whether individual claims are actually supported |
| Task Completion Rate (agentic) | Whether the agent achieved the actual goal | *How* it got there — a lucky wrong path can still complete the task |
| Tool Call Accuracy | Wrong/unnecessary tool usage even when the final answer happens to be right | Overall answer quality |

---

## Interview-Style Q&A

**Q1: Why do you need separate metrics for retrieval (Precision@K/Recall@K) and generation (faithfulness/relevance) instead of just judging the final answer as good/bad?**
A bad final answer could stem from either stage — retrieval missing/including wrong chunks, or generation misusing good chunks — and these require completely different fixes (better chunking/embeddings vs. better prompting/grounding instructions). Evaluating only the final output can't distinguish which stage actually failed.

**Q2: What's the trade-off in increasing K in a RAG system, and how does chunking quality relate to it?**
Increasing K generally improves recall (more relevant chunks are likely captured) but can reduce precision (more irrelevant chunks get mixed in as noise). Better chunking (Module 5) — chunks that are coherent, appropriately sized, and well-bounded — lets you achieve both good precision and good recall at a smaller K, rather than needing an increasingly large K to compensate for poor chunk quality.

**Q3: Why can a RAG system still hallucinate even when given the correct retrieved context?**
Providing correct context doesn't force the model to use it — the model can still answer from parametric memory (Module 1) instead of the provided context, particularly if the context doesn't clearly and directly contain the answer. This is why faithfulness/groundedness checks are a distinct, necessary evaluation step even when retrieval itself is working correctly.

**Q4: What's a key risk of using LLM-as-a-judge for evaluation, and how do you mitigate it?**
Self-preference bias — a model may score outputs (especially its own or stylistically similar ones) more favorably than a neutral judge would. Mitigate by using a different model as judge than the one being evaluated where feasible, keeping judging prompts consistent and well-specified, and periodically validating judge scores against a sample of actual human judgment to confirm calibration.

**Q5: Why does tool call accuracy matter as a separate metric from final answer correctness in agentic systems?**
An agent can occasionally reach a correct final answer despite calling the wrong tool or using wrong arguments along the way — a fragile, lucky success rather than a reliable one. Measuring tool call accuracy separately catches this brittleness before it causes failures on inputs where the lucky outcome doesn't happen to occur.

**Q6: What's the minimum viable evaluation setup for a solo project, and why is it worth building even at small scale?**
A modest set (15-30 representative test queries) with manually labeled ground truth (relevant chunks per query, and/or reference answers), scored automatically where possible (Precision@K/Recall@K) and via LLM-as-a-judge for qualitative dimensions (faithfulness, relevance). Even at small scale, this turns "did my change help?" from a guess into a measured comparison — and re-running the same set after changes is what makes iteration principled rather than vibes-based.

---

## 🛑 Common Pitfalls & Debugging

1. **Evaluating on Training Data**: Writing test cases based on the exact queries you used to design the prompt. The agent will pass them perfectly, but fail on real user inputs.
   - *Fix*: Maintain a completely separate blind test set of real-world queries.
2. **Vibes-Based Iteration**: Changing a prompt because it failed one specific edge case, without re-running an evaluation suite, only to realize you accidentally broke 10 other common queries.
   - *Fix*: Never commit a prompt or pipeline change without running your automated evaluation suite first.

```quiz
Q: What is a major risk when using an LLM-as-a-judge to evaluate your agent's outputs?
- [ ] It cannot evaluate code generation tasks.
- [ ] It requires humans to manually score every single prompt.
- [x] Self-preference bias, where a model unfairly scores its own outputs or stylistically similar ones higher.
Explanation: LLMs tend to favor their own generation style. To mitigate this, use a different LLM for judging (e.g., use Claude to judge GPT-4 outputs) and calibrate the judge against human scores.
```

---

## What's Next

**Module 10: Production Topics** — the operational concerns that separate a working prototype from a system that can actually run reliably for real users: caching, cost optimization, rate limiting, streaming, guardrails, moderation, observability, tracing, retries, and fallback models. This is the last module — where everything built across Modules 1-9 gets hardened for real-world deployment.
