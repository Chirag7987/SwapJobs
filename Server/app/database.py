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
    db = client["jobswipe"]
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