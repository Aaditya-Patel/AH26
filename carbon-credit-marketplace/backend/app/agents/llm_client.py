"""
OpenAI LLM client wrapper
"""

from openai import AsyncOpenAI
from app.config import get_settings

settings = get_settings()

# Initialize OpenAI client
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


async def get_embedding(text: str) -> list[float]:
    """Get embedding for text using text-embedding-3-small"""
    try:
        response = await client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        raise Exception(f"Error generating embedding: {str(e)}")


async def get_completion(prompt: str, system_prompt: str = None) -> str:
    """Get completion from GPT-4o-mini"""
    try:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"Error getting completion: {str(e)}")


async def get_completion_stream(prompt: str, system_prompt: str = None):
    """Get streaming completion from GPT-4o-mini"""
    try:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        stream = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            stream=True
        )
        
        async for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                yield chunk.choices[0].delta.content
    except Exception as e:
        raise Exception(f"Error getting streaming completion: {str(e)}")