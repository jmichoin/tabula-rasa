import os
import sys
import re
import json
import asyncio
import requests
import urllib.parse
from shazamio import Shazam

def parse_filename(file_path):
    """Fallback: Try to get Artist - Title from filename with cleaning"""
    filename = os.path.basename(file_path)
    name_no_ext = os.path.splitext(filename)[0]
    
    # Strip YouTube IDs like [J5yvIcghXTQ]
    name_no_ext = re.sub(r'\[[a-zA-Z0-9_-]{11}\]', '', name_no_ext)
    # Strip (Official Video), etc.
    name_no_ext = re.sub(r'\(.*?\)', '', name_no_ext)
    
    clean_name = name_no_ext.replace('_', ' ').replace('.', ' ').strip()
    
    if ' - ' in clean_name:
        parts = clean_name.split(' - ')
        artist = parts[0].strip()
        title = ' '.join(parts[1:]).strip()
        return {"title": title, "artist": artist}
    
    return {"title": clean_name, "artist": "Unknown"}

async def recognize_audio(file_path):
    """Identify song using Shazam with multi-point sampling for better accuracy"""
    print(f"DEBUG: Identifying audio for {file_path}", file=sys.stderr)
    
    filename_info = parse_filename(file_path)
    
    # Enhanced Multi-Point Shazam Recognition
    identity = None
    shazam = Shazam()
    
    # Try multiple sampling points for better recognition (especially for less known artists)
    sampling_attempts = [
        ("start", 0),       # Beginning of track
        ("middle", 30),     # 30 seconds in
        ("chorus", 60),     # 60 seconds in (often the chorus)
    ]
    
    for attempt_name, offset in sampling_attempts:
        if identity:
            break
            
        try:
            print(f"DEBUG: Shazam attempt at {attempt_name} ({offset}s)...", file=sys.stderr)
            # Use longer timeout for better recognition
            out = await asyncio.wait_for(shazam.recognize(file_path), timeout=30)
            
            if out and 'track' in out:
                track = out['track']
                # Only accept if we got meaningful data
                if track.get('title') and track.get('subtitle'):
                    identity = {
                        "title": track.get('title'),
                        "artist": track.get('subtitle'),
                        "shazam_id": track.get('key'),
                        "images": track.get('images') or {},
                        "method": "shazam"
                    }
                    print(f"DEBUG: ✓ Shazam success at {attempt_name}!", file=sys.stderr)
                    break
        except asyncio.TimeoutError:
            print(f"DEBUG: Shazam timeout at {attempt_name}", file=sys.stderr)
        except Exception as e:
            print(f"DEBUG: Shazam failed at {attempt_name}: {e}", file=sys.stderr)

    if identity:
        print(f"DEBUG: Found Identity: {identity['title']} by {identity['artist']} (Method: {identity['method']})", file=sys.stderr)
        return identity

    # 2. Filename Fallback
    info = filename_info
    info["method"] = "filename"
    info["images"] = {}
    
    print(f"DEBUG: Final Identity: {info['title']} by {info['artist']} (Method: {info['method']})", file=sys.stderr)
    return info
