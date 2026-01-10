from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.database import Base


class User(Base):
    """User model for both buyers and sellers"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    user_type = Column(String(50), nullable=False)  # 'buyer' or 'seller'
    company_name = Column(String(255), nullable=False)
    sector = Column(String(100))  # For buyers
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    listings = relationship("CreditListing", back_populates="seller", foreign_keys="CreditListing.seller_id")
    emissions = relationship("EmissionCalculation", back_populates="user")


class CreditListing(Base):
    """Credit listing model"""
    __tablename__ = "credit_listings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_per_credit = Column(Float, nullable=False)
    vintage = Column(Integer)  # Year
    project_type = Column(String(100))  # e.g., 'Renewable Energy', 'Forestry'
    verification_status = Column(String(50), default='verified')
    is_active = Column(Boolean, default=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    seller = relationship("User", back_populates="listings", foreign_keys=[seller_id])


class EmissionCalculation(Base):
    """Emission calculation results"""
    __tablename__ = "emission_calculations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    sector = Column(String(100), nullable=False)
    total_emissions = Column(Float, nullable=False)  # tCO2e
    scope1_emissions = Column(Float)
    scope2_emissions = Column(Float)
    scope3_emissions = Column(Float)
    credits_needed = Column(Integer)
    questionnaire_data = Column(Text)  # JSON stored as text
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="emissions")
