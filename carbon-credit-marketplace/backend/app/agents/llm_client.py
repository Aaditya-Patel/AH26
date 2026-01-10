"""
OpenAI LLM client wrapper

TODO: Developer 2 will implement:
- OpenAI client initialization
- get_embedding() function
- get_completion() function with system prompts
"""

from openai import AsyncOpenAI
from app.config import get_settings

settings = get_settings()

# Initialize OpenAI client
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def get_embedding(text: str) -> list[float]:
    """Get embedding for text"""
    # TODO: Implement by Developer 2
    pass


async def get_completion(prompt: str, system_prompt: str = None) -> str:
    """Get completion from GPT-4o-mini"""
    # TODO: Implement by Developer 2
    pass
