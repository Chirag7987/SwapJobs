from fastapi import FastAPI
from app.routes import job_routes, swipe_routes
from app.database import connect_to_mongo
from app.controllers.crud_user import create_user, get_user, update_user_preferences
from app.controllers.crud_swipe import record_swipe, get_swipes_by_user


app = FastAPI()

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

    await connect_to_mongo()

app.include_router(job_routes.router, prefix="/api/jobs")
app.include_router(swipe_routes.router, prefix="/api/swipes")
app.include_router(swipe_routes.router, prefix="/api/users")

@app.get("/")
async def root():
    return {"message": "JobSwipe API"}