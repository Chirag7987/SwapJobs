from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import List, Optional
from enum import Enum

# Enums for constrained values
class ExperienceLevel(str, Enum):
    ENTRY = "entry"
    MID = "mid"
    SENIOR = "senior"
    EXECUTIVE = "executive"

class LocationType(str, Enum):
    REMOTE = "remote"
    HYBRID = "hybrid"
    ONSITE = "onsite"

# Sub-models
class UserProfile(BaseModel):
    skills: List[str] = Field(default_factory=list)
    experience: Optional[ExperienceLevel] = None
    education: Optional[str] = None
    location: Optional[str] = None

class UserPreferences(BaseModel):
    jobTypes: List[str] = Field(default=["full-time", "remote"])
    locationType: LocationType = Field(default=LocationType.REMOTE)
    minSalary: Optional[int] = None

# Main User model
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: int
    profile: UserProfile = Field(default_factory=UserProfile)
    preferences: UserPreferences = Field(default_factory=UserPreferences)
    skills: List[str] = Field(default_factory=list)

class UserCreate(UserBase):
    pass

class UserDB(UserBase):
    id: str = Field(alias="_id")
    swipedJobs: List[str] = Field(default_factory=list)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True  # Allows using field name instead of alias
        from_attributes = True  # ORM mode for ODM compatibility
        
    # Example method to update timestamps
    def update_timestamps(self):
        self.updatedAt = datetime.utcnow()