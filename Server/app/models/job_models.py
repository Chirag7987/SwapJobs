from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class JobBase(BaseModel):
    title: str
    company: str
    logoUrl: Optional[str] = None
    salaryRange: dict  # {"min": int, "max": int, "currency": str}
    jobType: str  # "full-time", "part-time", etc.
    isRemote: bool
    location: Optional[str] = None
    skillsRequired: List[str] = []
    createdAt: datetime = datetime.utcnow()

class JobCreate(JobBase):
    pass

class JobDB(JobBase):
    id: str

    class Config:
        from_attributes = True