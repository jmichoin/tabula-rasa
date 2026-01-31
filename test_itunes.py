import requests
import json

def test_itunes(title, artist):
    search_term = f"{artist} {title}".strip()
    itunes_url = f"https://itunes.apple.com/search?term={search_term}&limit=1&entity=song"
    resp = requests.get(itunes_url, timeout=5)
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"Count: {data.get('resultCount')}")
        if data.get("resultCount", 0) > 0:
            result = data["results"][0]
            print(f"Found: {result.get('trackName')} - {result.get('artistName')}")
            print(f"Art: {result.get('artworkUrl100')}")

if __name__ == "__main__":
    test_itunes("Pity the Weak", "Fall Of Efrafa")
    test_itunes("Wonderwall", "Oasis")
