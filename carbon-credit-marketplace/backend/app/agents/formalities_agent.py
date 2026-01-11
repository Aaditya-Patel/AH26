"""
Formalities Advisor Agent - Interactive guide through government procedures
"""
from typing import Dict, Any, Optional, List
from app.agents.formalities_qdrant import search_formalities_documents
from app.agents.llm_client import get_completion, get_completion_stream
import json
import re


# Workflow definitions (same as in formalities.py API)
WORKFLOWS = {
    "buyer_registration": {
        "steps": [
            {"step": 1, "title": "Company Registration", "description": "Register your company with BEE", "documents": ["Company Registration Certificate", "PAN Card"]},
            {"step": 2, "title": "GCI Registry Account", "description": "Create an account on GCI registry", "documents": ["Company Details", "Contact Information"]},
            {"step": 3, "title": "Document Verification", "description": "Upload and verify required documents", "documents": ["GST Certificate", "Address Proof"]},
            {"step": 4, "title": "Bank Details", "description": "Link your bank account for transactions", "documents": ["Cancelled Cheque", "Bank Statement"]},
            {"step": 5, "title": "Final Approval", "description": "Wait for admin approval to start trading", "documents": []},
        ]
    },
    "seller_registration": {
        "steps": [
            {"step": 1, "title": "Project Registration", "description": "Register your carbon credit project with BEE", "documents": ["Project Proposal", "Methodology Document"]},
            {"step": 2, "title": "Methodology Selection", "description": "Choose from 8 approved offset methodologies", "documents": ["Methodology Selection Form"]},
            {"step": 3, "title": "Verification Agency", "description": "Select an accredited verification agency", "documents": ["Agency Agreement"]},
            {"step": 4, "title": "Document Submission", "description": "Submit all required project documents", "documents": ["MRV Plan", "Baseline Study", "Financial Documents"]},
            {"step": 5, "title": "BEE Approval", "description": "Wait for BEE project approval", "documents": []},
        ]
    },
    "mrv_compliance": {
        "steps": [
            {"step": 1, "title": "Monitoring Plan", "description": "Prepare and submit monitoring plan", "documents": ["Monitoring Plan Document"]},
            {"step": 2, "title": "Data Collection", "description": "Collect emissions data for reporting period", "documents": ["Data Collection Forms", "Measurement Records"]},
            {"step": 3, "title": "Report Preparation", "description": "Prepare GHG emissions report", "documents": ["Emissions Report", "Supporting Data"]},
            {"step": 4, "title": "Third-Party Verification", "description": "Get report verified by accredited agency", "documents": ["Verification Report"]},
            {"step": 5, "title": "BEE Submission", "description": "Submit verified report to BEE", "documents": ["Final Report", "Verification Certificate"]},
            {"step": 6, "title": "Credit Surrender", "description": "Surrender required credits for compliance", "documents": []},
        ]
    }
}


def get_initial_state() -> Dict[str, Any]:
    """Get initial conversation state"""
    return {
        "user_type": None,  # "buyer" or "seller"
        "current_workflow": None,  # "buyer_registration", "seller_registration", "mrv_compliance"
        "current_step": None,  # Step number (1-indexed)
        "completed_steps": [],
        "conversation_history": [],
        "context": {}
    }


def update_state_from_message(state: Dict[str, Any], user_message: str) -> Dict[str, Any]:
    """Update conversation state based on user message"""
    user_message_lower = user_message.lower().strip()
    
    # Detect user type
    if not state.get("user_type"):
        if any(word in user_message_lower for word in ["buyer", "i'm a buyer", "i am a buyer", "buy"]):
            state["user_type"] = "buyer"
        elif any(word in user_message_lower for word in ["seller", "i'm a seller", "i am a seller", "sell"]):
            state["user_type"] = "seller"
    
    # Detect workflow selection
    if state.get("user_type") and not state.get("current_workflow"):
        if "registration" in user_message_lower or "register" in user_message_lower:
            if state["user_type"] == "buyer":
                state["current_workflow"] = "buyer_registration"
            else:
                state["current_workflow"] = "seller_registration"
        elif "compliance" in user_message_lower or "mrv" in user_message_lower:
            state["current_workflow"] = "mrv_compliance"
    
    # Detect step navigation
    if state.get("current_workflow"):
        workflow_steps = WORKFLOWS.get(state["current_workflow"], {}).get("steps", [])
        for step in workflow_steps:
            step_num = step["step"]
            if f"step {step_num}" in user_message_lower or f"step {step_num}" in user_message_lower:
                state["current_step"] = step_num
                break
        
        # Detect step completion
        if any(word in user_message_lower for word in ["complete", "done", "finished", "ready for next"]):
            if state.get("current_step") and state["current_step"] not in state["completed_steps"]:
                state["completed_steps"].append(state["current_step"])
                # Move to next step
                if state["current_step"] < len(workflow_steps):
                    state["current_step"] = state["current_step"] + 1
                else:
                    state["current_step"] = None
    
    # Add to conversation history
    state["conversation_history"].append({"role": "user", "content": user_message})
    
    return state


def get_next_question(state: Dict[str, Any]) -> Optional[str]:
    """Determine next question based on conversation state"""
    if not state.get("user_type"):
        return "Are you a buyer or a seller? (Please say 'buyer' or 'seller')"
    
    if not state.get("current_workflow"):
        if state["user_type"] == "buyer":
            return "Would you like help with buyer registration or MRV compliance? (Please say 'registration' or 'compliance')"
        else:
            return "Would you like help with seller registration or MRV compliance? (Please say 'registration' or 'compliance')"
    
    workflow_steps = WORKFLOWS.get(state["current_workflow"], {}).get("steps", [])
    if not workflow_steps:
        return None
    
    if state.get("current_step") is None:
        # Start with step 1
        state["current_step"] = 1
    
    current_step_num = state["current_step"]
    if current_step_num > len(workflow_steps):
        return "Congratulations! You've completed all steps. Is there anything else you'd like to know?"
    
    return None  # No question needed, will provide step guidance


async def get_step_guidance(state: Dict[str, Any], use_rag: bool = True) -> str:
    """Get guidance for current step"""
    workflow = WORKFLOWS.get(state.get("current_workflow"))
    if not workflow:
        return "I need to know which workflow you're working on. Please let me know if you're a buyer or seller."
    
    steps = workflow.get("steps", [])
    current_step_num = state.get("current_step")
    
    if current_step_num is None or current_step_num > len(steps):
        return "Please let me know which step you'd like help with."
    
    step = steps[current_step_num - 1]
    
    # Build step guidance with proper formatting
    guidance = f"## Step {step['step']}: {step['title']}\n\n"
    guidance += f"{step['description']}\n\n"
    
    if step.get("documents"):
        guidance += "**Required Documents:**\n\n"
        for doc in step["documents"]:
            guidance += f"- {doc}\n"
        guidance += "\n"
        
        # Use RAG to get information about how to obtain documents
        if use_rag:
            try:
                doc_query = f"How to obtain {', '.join(step['documents'])} for {step['title']}"
                relevant_docs = await search_formalities_documents(doc_query, limit=3)
                
                if relevant_docs:
                    context = "\n\n".join([f"[{doc['section']}]\n{doc['text']}" for doc in relevant_docs[:2]])
                    
                    rag_prompt = f"""Based on the following context documents, provide a brief explanation of how to obtain the required documents for {step['title']}.

Required Documents: {', '.join(step['documents'])}

Context:
{context}

Provide a concise answer (2-3 sentences) on how to obtain these documents."""
                    
                    rag_response = await get_completion(rag_prompt, "You are a helpful assistant providing guidance on obtaining government documents.")
                    guidance += f"**How to Obtain Documents:**\n\n{rag_response}\n\n"
            except Exception as e:
                # If RAG fails, continue without it
                pass
    
    guidance += "When you're ready to move to the next step, let me know by saying 'ready for next step' or 'complete this step'."
    
    return guidance


async def chat_with_formalities_agent(question: str, conversation_state: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Chat with formalities agent using RAG and conversation state
    
    Args:
        question: User's question or message
        conversation_state: Current conversation state (if None, starts new conversation)
    
    Returns:
        Dictionary with answer and updated conversation_state
    """
    try:
        # Initialize or use provided state
        if conversation_state is None:
            state = get_initial_state()
        else:
            state = conversation_state.copy()
        
        # Update state based on user message
        state = update_state_from_message(state, question)
        
        # Ensure current_step is set if workflow is selected
        if state.get("current_workflow") and state.get("current_step") is None:
            state["current_step"] = 1
        
        # Check if we need to ask a question
        next_question = get_next_question(state)
        
        if next_question:
            # Simple question response
            answer = next_question
            state["conversation_history"].append({"role": "assistant", "content": answer})
            return {
                "answer": answer,
                "conversation_state": state
            }
        
        # If we have a workflow and step, always provide guidance
        if state.get("current_workflow") and state.get("current_step"):
            step_guidance = await get_step_guidance(state, use_rag=True)
            state["conversation_history"].append({"role": "assistant", "content": step_guidance})
            return {
                "answer": step_guidance,
                "conversation_state": state
            }
        
        # General question - use RAG
        try:
            relevant_docs = await search_formalities_documents(question, limit=5)
        except:
            relevant_docs = []
        
        # Build context
        context = ""
        if relevant_docs:
            context = "\n\n".join([
                f"[Section: {doc['section']}]\n{doc['text']}"
                for doc in relevant_docs
            ])
        
        # Build conversation history context
        conversation_context = ""
        if len(state["conversation_history"]) > 0:
            recent_history = state["conversation_history"][-5:]  # Last 5 messages
            conversation_context = "\n".join([
                f"{msg['role']}: {msg['content']}"
                for msg in recent_history
            ])
        
        # System prompt
        system_prompt = """You are a Formalities Advisor helping users navigate government procedures for carbon credit registration and compliance.
You guide users step-by-step through workflows (buyer registration, seller registration, MRV compliance).
You provide clear, helpful information about required documents and processes.
You maintain conversation context and guide users through each step of the process.
Keep answers concise but informative."""
        
        # User prompt
        user_context = ""
        if state.get("user_type"):
            user_context += f"\n\nUser is a {state['user_type']}."
        if state.get("current_workflow"):
            user_context += f" Current workflow: {state['current_workflow']}."
        if state.get("current_step"):
            user_context += f" Current step: {state['current_step']}."
        
        # Build context strings outside f-string to avoid backslash issues
        context_section = f"Context Documents:\n{context}\n" if context else ""
        conversation_section = f"Recent Conversation:\n{conversation_context}\n" if conversation_context else ""
        
        user_prompt = f"""Based on the following context documents and conversation history, answer the user's question about formalities.

{context_section}
{conversation_section}
User Question: {question}
{user_context}

Provide a clear, helpful answer. If the user needs guidance on a specific step, provide step-by-step instructions."""
        
        answer = await get_completion(user_prompt, system_prompt)
        
        state["conversation_history"].append({"role": "assistant", "content": answer})
        
        return {
            "answer": answer,
            "conversation_state": state
        }
    except Exception as e:
        error_answer = f"I encountered an error: {str(e)}. Please try again or rephrase your question."
        if conversation_state:
            state = conversation_state.copy()
            state["conversation_history"].append({"role": "assistant", "content": error_answer})
            return {
                "answer": error_answer,
                "conversation_state": state
            }
        return {
            "answer": error_answer,
            "conversation_state": get_initial_state()
        }


async def chat_with_formalities_agent_stream(question: str, conversation_state: Optional[Dict[str, Any]] = None):
    """
    Chat with formalities agent with streaming response
    
    Yields:
        str: Text chunks from LLM response, then a final JSON string with conversation_state
    """
    try:
        # Initialize or use provided state
        if conversation_state is None:
            state = get_initial_state()
        else:
            state = conversation_state.copy()
        
        # Update state based on user message
        state = update_state_from_message(state, question)
        
        # Ensure current_step is set if workflow is selected
        if state.get("current_workflow") and state.get("current_step") is None:
            state["current_step"] = 1
        
        # Check if we need to ask a question
        next_question = get_next_question(state)
        
        if next_question:
            # Simple question response - yield immediately
            for char in next_question:
                yield char
            state["conversation_history"].append({"role": "assistant", "content": next_question})
            yield json.dumps({"type": "state", "conversation_state": state})
            return
        
        # If we have a workflow and step, always provide guidance
        if state.get("current_workflow") and state.get("current_step"):
            step_guidance = await get_step_guidance(state, use_rag=True)
            # Yield complete guidance as a single chunk to preserve markdown formatting
            # This ensures newlines and markdown syntax are preserved for proper rendering
            yield step_guidance
            state["conversation_history"].append({"role": "assistant", "content": step_guidance})
            yield json.dumps({"type": "state", "conversation_state": state})
            return
        
        # General question - use RAG with streaming
        try:
            relevant_docs = await search_formalities_documents(question, limit=5)
        except:
            relevant_docs = []
        
        # Build context
        context = ""
        if relevant_docs:
            context = "\n\n".join([
                f"[Section: {doc['section']}]\n{doc['text']}"
                for doc in relevant_docs
            ])
        
        # Build conversation history context
        conversation_context = ""
        if len(state["conversation_history"]) > 0:
            recent_history = state["conversation_history"][-5:]
            conversation_context = "\n".join([
                f"{msg['role']}: {msg['content']}"
                for msg in recent_history
            ])
        
        # System prompt
        system_prompt = """You are a Formalities Advisor helping users navigate government procedures for carbon credit registration and compliance.
You guide users step-by-step through workflows (buyer registration, seller registration, MRV compliance).
You provide clear, helpful information about required documents and processes.
You maintain conversation context and guide users through each step of the process.
Keep answers concise but informative."""
        
        # User context
        user_context = ""
        if state.get("user_type"):
            user_context += f"\n\nUser is a {state['user_type']}."
        if state.get("current_workflow"):
            user_context += f" Current workflow: {state['current_workflow']}."
        if state.get("current_step"):
            user_context += f" Current step: {state['current_step']}."
        
        # Build context strings outside f-string to avoid backslash issues
        context_section = f"Context Documents:\n{context}\n" if context else ""
        conversation_section = f"Recent Conversation:\n{conversation_context}\n" if conversation_context else ""
        
        user_prompt = f"""Based on the following context documents and conversation history, answer the user's question about formalities.

{context_section}
{conversation_section}
User Question: {question}
{user_context}

Provide a clear, helpful answer. If the user needs guidance on a specific step, provide step-by-step instructions."""
        
        # Stream response
        accumulated_content = ""
        async for chunk in get_completion_stream(user_prompt, system_prompt):
            accumulated_content += chunk
            yield chunk
        
        state["conversation_history"].append({"role": "assistant", "content": accumulated_content})
        yield json.dumps({"type": "state", "conversation_state": state})
        
    except Exception as e:
        error_msg = f"I encountered an error: {str(e)}. Please try again."
        yield error_msg
        if conversation_state:
            state = conversation_state.copy()
            state["conversation_history"].append({"role": "assistant", "content": error_msg})
            yield json.dumps({"type": "state", "conversation_state": state})
        else:
            yield json.dumps({"type": "state", "conversation_state": get_initial_state()})
