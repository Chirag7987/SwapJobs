from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from enum import Enum
from typing import Optional

# Enums for constrained values
class SwipeActionType(str, Enum):
    LIKE = "like"
    DISLIKE = "dislike"

# Main Swipe model
class SwipeAction(BaseModel):
    user: str  
    job: str  
    action: SwipeActionType


class SwipeActionCreate(SwipeAction):
    pass

class SwipeActionDB(SwipeAction):
    id: str = Field(alias="_id")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True  # Allows using field name instead of alias
        from_attributes = True  # ORM mode for ODM compatibility
        json_schema_extra = {
            "indexes": [
                {"fields": [("user", 1), ("job", 1)], "unique": True}  # Prevent duplicate swipes
            ]
        }

    def model_dump_for_db(self) -> dict:
        """Helper method to prepare data for MongoDB insertion"""
        data = self.model_dump(by_alias=True, exclude={"id"})
        if "_id" not in data:  # Only for new documents
            data["timestamp"] = self.timestamp
        return data
    
class SwipeStatsResponse(BaseModel):
    """Response model for swipe statistics"""
    job_id: str
    total_likes: int
    total_dislikes: int
    like_ratio: float