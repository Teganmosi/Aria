from openai import AsyncOpenAI
import asyncio

async def check():
    client = AsyncOpenAI(api_key="sk-...")
    print(f"Beta: {client.beta}")
    print(f"Beta dir: {dir(client.beta)}")
    if hasattr(client.beta, 'realtime'):
        print("Realtime found!")
    else:
        print("Realtime NOT found!")

if __name__ == "__main__":
    asyncio.run(check())
