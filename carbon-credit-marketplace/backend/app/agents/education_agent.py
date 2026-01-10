"""
Education Agent - RAG-based Q&A about carbon credits
"""

from app.agents.qdrant_client import search_documents
from app.agents.llm_client import get_completion, get_completion_stream
import json


async def chat_with_education_agent(question: str) -> dict:
    """
    Chat with education agent using RAG (Retrieval-Augmented Generation)
    
    Returns:
        dict: {"answer": str, "sources": List[str]}
    """
    try:
        # Step 1: Search for relevant document chunks
        relevant_docs = await search_documents(question, limit=5)
        
        if not relevant_docs:
            return {
                "answer": "I apologize, but I couldn't find relevant information to answer your question. Please try rephrasing your question or ask about carbon credits, Indian regulations, or marketplace operations.",
                "sources": []
            }
        
        # Step 2: Build context from retrieved documents
        context = "\n\n".join([
            f"[Section: {doc['section']}]\n{doc['text']}"
            for doc in relevant_docs
        ])
        
        # Step 3: Build prompt with context
        system_prompt = """You are an expert on carbon credits, Indian government regulations, and carbon credit marketplaces. 
Your role is to provide accurate, helpful information based on the provided context documents.
Always cite your sources when answering questions.
If the context doesn't contain enough information, say so clearly.
Keep answers concise but informative."""
        
        user_prompt = f"""Based on the following context documents about carbon credits in India, please answer the user's question.

Context Documents:
{context}

User Question: {question}

Please provide a clear, accurate answer based on the context. If relevant, mention which sections or topics your answer is based on."""
        
        # Step 4: Get LLM completion
        answer = await get_completion(user_prompt, system_prompt)
        
        # Step 5: Extract sources
        sources = list(set([
            doc['section'] for doc in relevant_docs
        ]))
        
        return {
            "answer": answer,
            "sources": sources
        }
    except Exception as e:
        return {
            "answer": f"I encountered an error while processing your question: {str(e)}. Please try again.",
            "sources": []
        }


async def chat_with_education_agent_stream(question: str):
    """
    Chat with education agent using RAG with streaming response
    
    Yields:
        str: Text chunks from LLM response, then a final JSON string with sources
    """
    try:
        # Step 1: Search for relevant document chunks
        relevant_docs = await search_documents(question, limit=5)
        
        if not relevant_docs:
            yield "I apologize, but I couldn't find relevant information to answer your question. Please try rephrasing your question or ask about carbon credits, Indian regulations, or marketplace operations."
            yield json.dumps({"type": "sources", "sources": []})
            return
        
        # Step 2: Build context from retrieved documents
        context = "\n\n".join([
            f"[Section: {doc['section']}]\n{doc['text']}"
            for doc in relevant_docs
        ])
        
        # Step 3: Build prompt with context
        system_prompt = """You are an expert on carbon credits, Indian government regulations, and carbon credit marketplaces. 
Your role is to provide accurate, helpful information based on the provided context documents.
Always cite your sources when answering questions.
If the context doesn't contain enough information, say so clearly.
Keep answers concise but informative."""
        
        user_prompt = f"""Based on the following context documents about carbon credits in India, please answer the user's question.

Context Documents:
{context}

User Question: {question}

Please provide a clear, accurate answer based on the context. If relevant, mention which sections or topics your answer is based on."""
        
        # Step 4: Stream LLM completion
        async for chunk in get_completion_stream(user_prompt, system_prompt):
            yield chunk
        
        # Step 5: Extract sources and send as final event
        sources = list(set([
            doc['section'] for doc in relevant_docs
        ]))
        yield json.dumps({"type": "sources", "sources": sources})
        
    except Exception as e:
        yield f"I encountered an error while processing your question: {str(e)}. Please try again."
        yield json.dumps({"type": "sources", "sources": []})
