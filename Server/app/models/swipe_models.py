from pydantic import BaseModel
from datetime import datetime

class SwipeAction(BaseModel):
    user: str  # User ID
    job: str  # Job ID
    action: str  # "like", "dislike", "save"
    timestamp: datetime = datetime.utcnow()

class SwipeActionDB(SwipeAction):
    id: str