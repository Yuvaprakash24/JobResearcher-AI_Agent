"""
Data models for Job Research AI Agent
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum

class JobType(str, Enum):
    """Job type enumeration"""
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"
    REMOTE = "remote"
    HYBRID = "hybrid"

class ExperienceLevel(str, Enum):
    """Experience level enumeration"""
    ENTRY_LEVEL = "entry_level"
    MID_LEVEL = "mid_level"
    SENIOR_LEVEL = "senior_level"
    EXECUTIVE = "executive"

class JobResearchRequest(BaseModel):
    """Request model for job research"""
    job_title: str = Field(..., description="Job title to search for")
    location: Optional[str] = Field(None, description="Location to search in")
    job_type: Optional[JobType] = Field(None, description="Type of job")
    experience_level: Optional[ExperienceLevel] = Field(None, description="Experience level")
    skills: Optional[List[str]] = Field([], description="Required skills")
    salary_min: Optional[int] = Field(None, description="Minimum salary")
    salary_max: Optional[int] = Field(None, description="Maximum salary")
    company_size: Optional[str] = Field(None, description="Company size preference")
    remote_friendly: Optional[bool] = Field(None, description="Remote work preference")
    max_results: Optional[int] = Field(50, description="Maximum number of results")
    
    class Config:
        use_enum_values = True

class JobPosting(BaseModel):
    """Individual job posting model"""
    title: str
    company: str
    location: str
    salary: Optional[str] = None
    description: str
    requirements: List[str] = []
    benefits: List[str] = []
    job_type: Optional[str] = None
    experience_level: Optional[str] = None
    posted_date: Optional[str] = None
    apply_url: Optional[str] = None
    company_rating: Optional[float] = None
    
class CompanyInsight(BaseModel):
    """Company analysis model"""
    name: str
    industry: str
    size: Optional[str] = None
    rating: Optional[float] = None
    culture_score: Optional[float] = None
    work_life_balance: Optional[float] = None
    growth_opportunities: Optional[float] = None
    key_benefits: List[str] = []
    recent_news: List[str] = []

class JobResearchResponse(BaseModel):
    """Response model for job research results"""
    request_summary: Dict[str, Any]
    job_postings: List[JobPosting]
    company_insights: List[CompanyInsight]
    ai_recommendations: List[str]
    generated_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class ResearchStatus(BaseModel):
    """Research task status model"""
    research_id: str
    status: str  # started, running, completed, failed
    progress: Optional[int] = None
    current_step: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    estimated_completion: Optional[datetime] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        } 