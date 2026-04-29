import asyncio
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv

load_dotenv()

async def main():
    client = AsyncOpenAI()
    models = await client.models.list()
    realtime_models = [model.id for model in models.data if 'realtime' in model.id]
    print("Available realtime models:", realtime_models)

if __name__ == "__main__":
    asyncio.run(main())
