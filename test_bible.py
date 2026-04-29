import httpx
import asyncio

async def test():
    try:
        r = await httpx.AsyncClient().get('https://bible-api.com/john.3?translation=kjv')
        print(r.status_code, r.text[:100])
        r2 = await httpx.AsyncClient().get('https://bible-api.com/john+3?translation=kjv')
        print(r2.status_code, r2.text[:100])
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    asyncio.run(test())
