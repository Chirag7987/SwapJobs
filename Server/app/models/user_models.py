from pydantic import BaseModel
from typing import List, Optional

class UserPreferences(BaseModel):
    jobTypes: List[str] = ["full-time", "remote"]
    minSalary: int = 50000
    locationType: str = "remote"  # "remote", "hybrid", "onsite"

class UserBase(BaseModel):
    email: str
    name: str
    skills: List[str] = []
    preferences: UserPreferences = UserPreferences()
    swipedJobs: List[dict] = []  # [{"jobId": str, "action": str}]

class UserDB(UserBase):
    id: str