import anthropic

client = anthropic.Anthropic()

# Mock Vector DB and Embed function for illustration
class MockVectorDB:
    def query(self, vector, top_k):
        # In reality, this searches the DB. 
        # We mock returning relevant chunks.
        class Chunk:
            def __init__(self, text):
                self.text = text
        return [
            Chunk("Refund policy: Items can be returned within 30 days of purchase."),
            Chunk("To process a refund, please contact support with your order ID.")
        ]

def mock_embed_fn(text: str):
    return [0.1, 0.2, 0.3] # Mock embedding vector

def rag_answer(query: str, vector_db, embed_fn, top_k=5) -> str:
    """A minimal Retrieval-Augmented Generation implementation."""
    # 1. Embed Query
    query_vector = embed_fn(query)
    
    # 2. Retrieve
    retrieved = vector_db.query(vector=query_vector, top_k=top_k)
    context = "\n\n---\n\n".join(chunk.text for chunk in retrieved)

    # 3. Prompt Assembly
    prompt = f"""Answer the question using ONLY the context below.
If the context doesn't contain the answer, say so — do not guess.

Context:
{context}

Question: {query}"""

    # 4. Generate
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )
    return response.content[0].text

if __name__ == "__main__":
    db = MockVectorDB()
    answer = rag_answer("What is the refund window?", db, mock_embed_fn)
    print(answer)
