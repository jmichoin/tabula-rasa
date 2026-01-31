import asyncio
from shazamio import Shazam
import sys
import json

async def test():
    file_path = "/Users/micoun/Documents/hokna/crursor/tabula rasa/web/public/uploads/Pity the Weak [J5yvIcghXTQ].mp3"
    shazam = Shazam()
    try:
        out = await shazam.recognize(file_path)
        print(json.dumps(out, indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
