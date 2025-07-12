# app/database.py (optimized)
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()  


MONGO_URI = os.getenv("MONGO_URI")

client = None
db = None

async def connect_to_mongo():
    global client, db
    client = AsyncIOMotorClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=10000
    )
    db = client["swapjobs"]
    try:
        await client.server_info()
        print("✅ MongoDB connection established")
    except Exception as e:
        print("❌ Failed to connect to MongoDB:", e)
        raise

async def get_mongo_db():
    global db
    if db is None:  
        await connect_to_mongo()
    return db

async def ensure_indexes():
    db = await get_mongo_db()
    
    # User collection indexes
    await db.users.create_index([("email", 1)], unique=True)
    await db.users.create_index([("skills", 1)])  # For skill-based recommendations
    
    # Job collection indexes
    await db.jobs.create_index([("skillsRequired", 1)])
    await db.jobs.create_index([("jobType", 1)])
    await db.jobs.create_index([("isRemote", 1)])
    await db.jobs.create_index([("createdAt", -1)])  # For new job recommendations
    
    # Swipe collection indexes
    await db.swipes.create_index([("user", 1), ("job", 1)], unique=True)  # Prevent duplicate swipes
    await db.swipes.create_index([("job", 1), ("action", 1)])  # For popularity scores
    await db.swipes.create_index([("user", 1), ("timestamp", -1)])  # For user swipe history
    
    print("✅ Database indexes ensured")