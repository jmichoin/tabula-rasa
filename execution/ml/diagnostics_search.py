
import requests
import re

def test_search(song, artist):
    query = f"{song} {artist} guitar tab site:ultimate-guitar.com"
    url = f"https://duckduckgo.com/html/?q={query.replace(' ', '+')}"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
    resp = requests.get(url, headers=headers, timeout=10)
    
    links = re.findall(r'https://www\.ultimate-guitar\.com/tabs/[\w\-/]+', resp.text)
    if not links:
        encoded_links = re.findall(r'url\?q=(https://www\.ultimate-guitar\.com/tabs/[\w\-/]+)', resp.text)
        links = encoded_links
    
    print(f"Links found for {song} - {artist}:")
    for l in links:
        print(f" - {l}")
    
    if not links:
        print("DEBUG: Search for '/tabs/' in text:")
        indices = [m.start() for m in re.finditer('/tabs/', resp.text)]
        for i in indices:
            # Print more context to see the full URL
            print(f"Found at {i}: {resp.text[max(0, i-50):i+100]}")

if __name__ == "__main__":
    test_search("Pity the Weak", "Fall Of Efrafa")
