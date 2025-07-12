from fastapi import FastAPI
from app.routes import job_routes, swipe_routes, user_routes
from app.database import connect_to_mongo



app = FastAPI()

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

app.include_router(job_routes.router, prefix="/api/jobs")
app.include_router(swipe_routes.router, prefix="/api/swipes")
app.include_router(user_routes.router, prefix="/api/users")

@app.get("/")
async def root():
    return {"message": "JobSwipe API"}