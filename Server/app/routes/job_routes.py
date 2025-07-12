from fastapi import APIRouter, HTTPException
from app.models.job_models import JobDB, JobCreate
from app.database import get_mongo_db
from datetime import datetime
from app.controllers.crud_job import create_job, get_job, update_job, delete_job

router = APIRouter()

@router.get("/alljobs", response_model=list[JobDB])
async def get_jobs_endpoint(page: int = 1, limit: int = 10):
    jobs = await get_job(skip=(page - 1) * limit, limit=limit)
    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs found")
    return jobs

@router.get("/recommended", response_model=list[JobDB])
async def get_recommended_jobs(userId: str, page: int = 1, limit: int = 10):
    db = await get_mongo_db()
    
    # 1. Get user preferences
    user = await db.users.find_one({"_id": userId})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # 2. Build query (matches JS logic)
    query = {
        "jobType": {"$in": user["preferences"]["jobTypes"]},
        "isRemote": user["preferences"]["locationType"] == "remote",
        "_id": {"$nin": [s["jobId"] for s in user["swipedJobs"]]}
    }
    
    # 3. Fetch jobs
    jobs = await db.jobs.find(query).sort("createdAt", -1).to_list(limit)
    return [{"id": str(j["_id"]), **j} for j in jobs]

@router.patch("/jobs/{job_id}", response_model=JobDB)
async def update_job_endpoint(job_id: str, update_data: dict):
    updated_job = await update_job(job_id, update_data)
    if not updated_job:
        raise HTTPException(status_code=404, detail="Job not found")
    return updated_job

@router.delete("/jobs/{job_id}", response_model=dict)
async def delete_job_endpoint(job_id: str):
    deleted_job = await delete_job(job_id)
    if not deleted_job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"message": "Job deleted successfully"}

@router.post("/jobs", response_model=JobDB)
async def create_job_endpoint(job: JobCreate):
    created_job = await create_job(job)
    if not created_job:
        raise HTTPException(status_code=400, detail="Job creation failed")
    return created_job