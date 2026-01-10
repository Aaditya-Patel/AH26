"""
Project Registration API endpoints for voluntary offset projects
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
from uuid import UUID
from datetime import datetime, date
import secrets

from app.database import get_db
from app.models.models import (
    User, Project, CreditListing, Document, Notification
)
from app.schemas.schemas import (
    ProjectCreate, ProjectResponse, ProjectUpdate
)
from app.core.security import get_current_user_id

router = APIRouter()


# Approved methodologies as per CCTS
APPROVED_METHODOLOGIES = [
    {
        "id": "renewable_energy",
        "name": "Renewable Energy (including hydro and pumped storage)",
        "category": "Energy",
        "description": "Projects that generate electricity from renewable sources"
    },
    {
        "id": "green_hydrogen",
        "name": "Green Hydrogen Production",
        "category": "Energy",
        "description": "Production of hydrogen using renewable energy"
    },
    {
        "id": "industrial_efficiency",
        "name": "Industrial Energy Efficiency",
        "category": "Energy Efficiency",
        "description": "Improving energy efficiency in industrial processes"
    },
    {
        "id": "landfill_methane",
        "name": "Landfill Methane Recovery",
        "category": "Waste",
        "description": "Capture and destruction of methane from landfills"
    },
    {
        "id": "mangrove",
        "name": "Mangrove Afforestation and Reforestation",
        "category": "Nature-Based",
        "description": "Planting and restoring mangrove ecosystems"
    },
    {
        "id": "renewable_storage",
        "name": "Renewable Energy with Storage",
        "category": "Energy",
        "description": "Renewable energy projects with battery storage"
    },
    {
        "id": "offshore_wind",
        "name": "Offshore Wind",
        "category": "Energy",
        "description": "Wind power generation from offshore installations"
    },
    {
        "id": "biogas",
        "name": "Compressed Biogas",
        "category": "Bioenergy",
        "description": "Production of compressed biogas from organic waste"
    }
]


def generate_project_id() -> str:
    """Generate a unique project ID number"""
    timestamp = datetime.now().strftime("%Y%m%d")
    random_suffix = secrets.token_hex(4).upper()
    return f"PRJ-{timestamp}-{random_suffix}"


async def create_notification(
    db: AsyncSession,
    user_id: UUID,
    notification_type: str,
    title: str,
    message: str,
    reference_type: str = None,
    reference_id: UUID = None
):
    """Create a notification for a user"""
    notification = Notification(
        user_id=user_id,
        notification_type=notification_type,
        title=title,
        message=message,
        reference_type=reference_type,
        reference_id=reference_id
    )
    db.add(notification)


# ==================== PROJECT ENDPOINTS ====================

@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Create a new project for voluntary offset registration"""
    user_uuid = UUID(user_id)
    
    # Verify user is a seller
    result = await db.execute(select(User).where(User.id == user_uuid))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.user_type != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can register projects"
        )
    
    # Validate methodology
    valid_methodologies = [m["name"] for m in APPROVED_METHODOLOGIES]
    if project_data.methodology not in valid_methodologies:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid methodology. Must be one of: {', '.join(valid_methodologies)}"
        )
    
    # Create project
    project = Project(
        owner_id=user_uuid,
        project_name=project_data.project_name,
        project_id_number=generate_project_id(),
        project_type=project_data.project_type,
        methodology=project_data.methodology,
        description=project_data.description,
        location=project_data.location,
        state=project_data.state,
        coordinates=project_data.coordinates,
        start_date=project_data.start_date,
        crediting_period_start=project_data.crediting_period_start,
        crediting_period_end=project_data.crediting_period_end,
        expected_annual_credits=project_data.expected_annual_credits,
        status="draft"
    )
    
    db.add(project)
    await db.commit()
    await db.refresh(project)
    
    return ProjectResponse(
        id=project.id,
        owner_id=project.owner_id,
        project_name=project.project_name,
        project_id_number=project.project_id_number,
        project_type=project.project_type,
        methodology=project.methodology,
        description=project.description,
        location=project.location,
        state=project.state,
        country=project.country,
        coordinates=project.coordinates,
        start_date=project.start_date,
        crediting_period_start=project.crediting_period_start,
        crediting_period_end=project.crediting_period_end,
        expected_annual_credits=project.expected_annual_credits,
        total_credits_issued=project.total_credits_issued,
        status=project.status,
        validator_agency=project.validator_agency,
        validation_date=project.validation_date,
        registration_date=project.registration_date,
        created_at=project.created_at
    )


@router.get("/", response_model=List[ProjectResponse])
async def get_my_projects(
    status: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get all projects for the current user"""
    query = select(Project).where(Project.owner_id == user_id)
    
    if status:
        query = query.where(Project.status == status)
    
    query = query.order_by(Project.created_at.desc())
    
    result = await db.execute(query)
    projects = result.scalars().all()
    
    return [
        ProjectResponse(
            id=proj.id,
            owner_id=proj.owner_id,
            project_name=proj.project_name,
            project_id_number=proj.project_id_number,
            project_type=proj.project_type,
            methodology=proj.methodology,
            description=proj.description,
            location=proj.location,
            state=proj.state,
            country=proj.country,
            coordinates=proj.coordinates,
            start_date=proj.start_date,
            crediting_period_start=proj.crediting_period_start,
            crediting_period_end=proj.crediting_period_end,
            expected_annual_credits=proj.expected_annual_credits,
            total_credits_issued=proj.total_credits_issued,
            status=proj.status,
            validator_agency=proj.validator_agency,
            validation_date=proj.validation_date,
            registration_date=proj.registration_date,
            created_at=proj.created_at
        )
        for proj in projects
    ]


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific project"""
    result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return ProjectResponse(
        id=project.id,
        owner_id=project.owner_id,
        project_name=project.project_name,
        project_id_number=project.project_id_number,
        project_type=project.project_type,
        methodology=project.methodology,
        description=project.description,
        location=project.location,
        state=project.state,
        country=project.country,
        coordinates=project.coordinates,
        start_date=project.start_date,
        crediting_period_start=project.crediting_period_start,
        crediting_period_end=project.crediting_period_end,
        expected_annual_credits=project.expected_annual_credits,
        total_credits_issued=project.total_credits_issued,
        status=project.status,
        validator_agency=project.validator_agency,
        validation_date=project.validation_date,
        registration_date=project.registration_date,
        created_at=project.created_at
    )


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    update_data: ProjectUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Update a project (owner only, draft status only)"""
    result = await db.execute(
        select(Project).where(
            and_(
                Project.id == project_id,
                Project.owner_id == user_id
            )
        )
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or you don't have permission"
        )
    
    if project.status != "draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot update project with status: {project.status}"
        )
    
    # Update fields
    if update_data.project_name:
        project.project_name = update_data.project_name
    if update_data.description:
        project.description = update_data.description
    if update_data.expected_annual_credits is not None:
        project.expected_annual_credits = update_data.expected_annual_credits
    
    project.updated_at = datetime.now()
    
    await db.commit()
    await db.refresh(project)
    
    return ProjectResponse(
        id=project.id,
        owner_id=project.owner_id,
        project_name=project.project_name,
        project_id_number=project.project_id_number,
        project_type=project.project_type,
        methodology=project.methodology,
        description=project.description,
        location=project.location,
        state=project.state,
        country=project.country,
        coordinates=project.coordinates,
        start_date=project.start_date,
        crediting_period_start=project.crediting_period_start,
        crediting_period_end=project.crediting_period_end,
        expected_annual_credits=project.expected_annual_credits,
        total_credits_issued=project.total_credits_issued,
        status=project.status,
        validator_agency=project.validator_agency,
        validation_date=project.validation_date,
        registration_date=project.registration_date,
        created_at=project.created_at
    )


@router.post("/{project_id}/submit")
async def submit_project(
    project_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Submit a project for validation"""
    result = await db.execute(
        select(Project).where(
            and_(
                Project.id == project_id,
                Project.owner_id == user_id
            )
        )
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or you don't have permission"
        )
    
    if project.status != "draft":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot submit project with status: {project.status}"
        )
    
    project.status = "submitted"
    project.updated_at = datetime.now()
    
    await create_notification(
        db,
        UUID(user_id),
        "project",
        "Project Submitted",
        f"Your project '{project.project_name}' has been submitted for validation.",
        "project",
        project.id
    )
    
    await db.commit()
    
    return {"message": "Project submitted for validation", "status": "submitted"}


@router.post("/demo/validate/{project_id}", response_model=ProjectResponse)
async def demo_validate_project(
    project_id: UUID,
    validator_agency: str = "Demo Validation Agency",
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    """Demo endpoint to validate and register a project"""
    result = await db.execute(
        select(Project).where(Project.id == project_id)
    )
    project = result.scalar_one_or_none()
    
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Update project status
    project.status = "registered"
    project.validator_agency = validator_agency
    project.validation_date = datetime.now()
    project.registration_date = datetime.now()
    project.updated_at = datetime.now()
    
    # Create notification
    await create_notification(
        db,
        project.owner_id,
        "project",
        "Project Registered",
        f"Your project '{project.project_name}' has been validated and registered!",
        "project",
        project.id
    )
    
    await db.commit()
    await db.refresh(project)
    
    return ProjectResponse(
        id=project.id,
        owner_id=project.owner_id,
        project_name=project.project_name,
        project_id_number=project.project_id_number,
        project_type=project.project_type,
        methodology=project.methodology,
        description=project.description,
        location=project.location,
        state=project.state,
        country=project.country,
        coordinates=project.coordinates,
        start_date=project.start_date,
        crediting_period_start=project.crediting_period_start,
        crediting_period_end=project.crediting_period_end,
        expected_annual_credits=project.expected_annual_credits,
        total_credits_issued=project.total_credits_issued,
        status=project.status,
        validator_agency=project.validator_agency,
        validation_date=project.validation_date,
        registration_date=project.registration_date,
        created_at=project.created_at
    )


@router.get("/methodologies/list")
async def get_approved_methodologies():
    """Get list of approved methodologies for projects"""
    return APPROVED_METHODOLOGIES
