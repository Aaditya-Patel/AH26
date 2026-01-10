from fastapi import APIRouter, Path
from app.schemas.schemas import WorkflowResponse, WorkflowStep

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
