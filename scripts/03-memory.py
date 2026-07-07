import anthropic
import json

client = anthropic.Anthropic()

def extract_facts(conversation_text: str) -> list[dict]:
    """Extract durable facts from a conversation for long-term memory."""
    response = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=512,
        messages=[{
            "role": "user",
            "content": f"""Extract durable, long-term-relevant facts from this
conversation. Return ONLY a JSON array of objects: [{{"fact": "...", "category": "..."}}].
No other text.

Conversation:
{conversation_text}"""
        }]
    )
    raw = response.content[0].text.strip().strip("```json").strip("```")
    return json.loads(raw)

# Example Usage:
conversation = "User: I'm currently studying system design to prepare for my interview at Google next month."
facts = extract_facts(conversation)
print("Extracted Facts:")
print(json.dumps(facts, indent=2))

# In a real system, you would embed these facts and store them in a Vector DB.
