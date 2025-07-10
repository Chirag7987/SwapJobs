from pymongo import ReturnDocument
from app.database import get_mongo_db
from app.models.job_models import JobCreate, JobDB
from datetime import datetime
from typing import List, Dict, Any

async def create_job(job: JobCreate) -> JobDB:
    db = await get_mongo_db()
    job_data = job.model_dump()
    job_data["createdAt"] = datetime.utcnow()
    
    result = await db["jobs"].insert_one(job_data)
    created_job = await db["jobs"].find_one({"_id": result.inserted_id})
    return JobDB(**created_job, id=str(created_job["_id"]))

async def get_job(job_id: str) -> JobDB | None:
    db = await get_mongo_db()
    job = await db["jobs"].find_one({"_id": job_id})
    return JobDB(**job, id=str(job["_id"])) if job else None

async def get_jobs(skip: int = 0, limit: int = 100) -> List[JobDB]:
    db = await get_mongo_db()
    return [
        JobDB(**job, id=str(job["_id"]))
        async for job in db["jobs"].find().skip(skip).limit(limit)
    ]

async def update_job(job_id: str, update_data: Dict[str, Any]) -> JobDB | None:
    db = await get_mongo_db()
    
    # Exclude unset fields and None values
    clean_data = {k: v for k, v in update_data.items() if v is not None}
    
    updated_job = await db["jobs"].find_one_and_update(
        {"_id": job_id},
        {"$set": clean_data},
        return_document=ReturnDocument.AFTER
    )
    return JobDB(**updated_job, id=str(updated_job["_id"])) if updated_job else None

async def delete_job(job_id: str) -> bool:
    db = await get_mongo_db()
    result = await db["jobs"].delete_one({"_id": job_id})
    return result.deleted_count > 0