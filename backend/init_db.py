import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
import asyncio
from app.database import engine, Base, AsyncSessionLocal
from app.services.seed_service import seed_initial_data

async def main():
    print("1. Creating tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("2. Tables created successfully.")
    
    print("3. Seeding data...")
    async with AsyncSessionLocal() as session:
        await seed_initial_data(session)
    print("4. Seeding completed successfully.")

if __name__ == "__main__":
    asyncio.run(main())
