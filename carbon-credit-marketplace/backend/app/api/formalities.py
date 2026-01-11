from fastapi import APIRouter, Path
from fastapi.responses import StreamingResponse
from app.schemas.schemas import (
    WorkflowResponse, WorkflowStep,
    FormalitiesChatRequest, FormalitiesChatResponse, ConversationState
)
from app.agents.formalities_agent import (
    chat_with_formalities_agent, chat_with_formalities_agent_stream,
    get_initial_state
)
import json

router = APIRouter()


@router.get("/steps/{workflow_type}", response_model=WorkflowResponse)
async def get_workflow_steps(
    workflow_type: str = Path(..., regex="^(buyer_registration|seller_registration|mrv_compliance)$")
):
    """
    Get workflow steps for government formalities
    
    TODO: Implement formalities agent logic
    - Developer 2 will implement workflow templates
    - Can add LLM-powered Q&A for formality questions
    """
    
    # Placeholder workflows
    workflows = {
        "buyer_registration": [
            WorkflowStep(
                step=1,
                title="Company Registration",
                description="Register your company with BEE",
                documents=["Company Registration Certificate", "PAN Card"]
            ),
            WorkflowStep(
                step=2,
                title="GCI Registry Account",
                description="Create an account on GCI registry",
                documents=["Company Details", "Contact Information"]
            ),
            WorkflowStep(
                step=3,
                title="Document Verification",
                description="Upload and verify required documents",
                documents=["GST Certificate", "Address Proof"]
            ),
            WorkflowStep(
                step=4,
                title="Bank Details",
                description="Link your bank account for transactions",
                documents=["Cancelled Cheque", "Bank Statement"]
            ),
            WorkflowStep(
                step=5,
                title="Final Approval",
                description="Wait for admin approval to start trading",
                documents=[]
            ),
        ],
        "seller_registration": [
            WorkflowStep(
                step=1,
                title="Project Registration",
                description="Register your carbon credit project with BEE",
                documents=["Project Proposal", "Methodology Document"]
            ),
            WorkflowStep(
                step=2,
                title="Methodology Selection",
                description="Choose from 8 approved offset methodologies",
                documents=["Methodology Selection Form"]
            ),
            WorkflowStep(
                step=3,
                title="Verification Agency",
                description="Select an accredited verification agency",
                documents=["Agency Agreement"]
            ),
            WorkflowStep(
                step=4,
                title="Document Submission",
                description="Submit all required project documents",
                documents=["MRV Plan", "Baseline Study", "Financial Documents"]
            ),
            WorkflowStep(
                step=5,
                title="BEE Approval",
                description="Wait for BEE project approval",
                documents=[]
            ),
        ],
        "mrv_compliance": [
            WorkflowStep(
                step=1,
                title="Monitoring Plan",
                description="Prepare and submit monitoring plan",
                documents=["Monitoring Plan Document"]
            ),
            WorkflowStep(
                step=2,
                title="Data Collection",
                description="Collect emissions data for reporting period",
                documents=["Data Collection Forms", "Measurement Records"]
            ),
            WorkflowStep(
                step=3,
                title="Report Preparation",
                description="Prepare GHG emissions report",
                documents=["Emissions Report", "Supporting Data"]
            ),
            WorkflowStep(
                step=4,
                title="Third-Party Verification",
                description="Get report verified by accredited agency",
                documents=["Verification Report"]
            ),
            WorkflowStep(
                step=5,
                title="BEE Submission",
                description="Submit verified report to BEE",
                documents=["Final Report", "Verification Certificate"]
            ),
            WorkflowStep(
                step=6,
                title="Credit Surrender",
                description="Surrender required credits for compliance",
                documents=[]
            ),
        ]
    }
    
    return WorkflowResponse(
        workflow_type=workflow_type,
        steps=workflows.get(workflow_type, [])
    )


# ==================== FORMALITIES CHAT ENDPOINTS ====================

@router.post("/chat", response_model=FormalitiesChatResponse)
async def chat_formalities(request: FormalitiesChatRequest):
    """
    Chat with formalities agent (non-streaming)
    
    Uses conversation state to guide users through workflows step-by-step.
    """
    conversation_state = None
    if request.conversation_state:
        conversation_state = request.conversation_state.model_dump()
    
    result = await chat_with_formalities_agent(request.question, conversation_state)
    
    return FormalitiesChatResponse(
        answer=result["answer"],
        conversation_state=ConversationState(**result["conversation_state"])
    )


@router.post("/chat/stream")
async def chat_formalities_stream(request: FormalitiesChatRequest):
    """
    Chat with formalities agent using streaming responses
    
    Uses Server-Sent Events (SSE) to stream responses in real-time.
    Returns conversation state updates as final event.
    """
    conversation_state = None
    if request.conversation_state:
        conversation_state = request.conversation_state.model_dump()
    
    async def generate():
        try:
            async for chunk in chat_with_formalities_agent_stream(request.question, conversation_state):
                # Check if it's a JSON string (state update) or text chunk
                if chunk.startswith("{") and '"type"' in chunk:
                    # State update event
                    yield f"data: {chunk}\n\n"
                else:
                    # Text chunk - for multiline content, prefix each line with "data: "
                    if "\n" in chunk:
                        # Split by newlines and prefix each line
                        lines = chunk.split("\n")
                        for line in lines:
                            yield f"data: {line}\n"
                        yield "\n"  # Empty line to end the event
                    else:
                        # Single line - normal format
                        yield f"data: {chunk}\n\n"
        except Exception as e:
            error_data = json.dumps({"type": "error", "message": str(e)})
            yield f"data: {error_data}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")
