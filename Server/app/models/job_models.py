from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, Optional
from enum import Enum


# Enums for constrained values
class JobType(str, Enum):
    FULL_TIME = "full-time"
    PART_TIME = "part-time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"

class LocationType(str, Enum):
    REMOTE = "remote"
    HYBRID = "hybrid"
    ONSITE = "onsite"

# Sub-models
class SalaryRange(BaseModel):
    min: int = Field(default=0, ge=0)
    max: int = Field(default=0, ge=0)
    currency: Optional[str] = None

# Main Job model
class JobBase(BaseModel):
    postedBy: str  # Company/Recruiter ID
    title: str
    description: str
    requirements: List[str] = Field(default_factory=list)
    skillsRequired: List[str] = Field(default_factory=list)
    locationType: Optional[LocationType] = None
    jobType: JobType
    salaryRange: SalaryRange = Field(default_factory=SalaryRange)
    isRemote: bool = False

class JobCreate(JobBase):
    pass

class JobDB(JobBase):
    id: str = Field(alias="_id")
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True  # Allows using field name instead of alias
        from_attributes = True  # ORM mode for ODM compatibility
        json_schema_extra = {
            "indexes": [
                {"fields": ["isRemote", "jobType"]},  # Compound index
                {"fields": ["skillsRequired"]},  # For Phase 2
                {"fields": ["createdAt"]},  # CreatedAt index
                {"fields": ["locationType"]}  # LocationType index
            ]
        }

