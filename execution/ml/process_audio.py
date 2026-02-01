import sys
import os
import json
import time
import asyncio
import numpy as np
import warnings

# Set before other imports
os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"

# Suppress warnings
warnings.filterwarnings("ignore")
import logging
logging.getLogger().setLevel(logging.ERROR)

import static_ffmpeg
# Ensure ffmpeg is in the PATH as early as possible
static_ffmpeg.add_paths()

# Internal Modules
from metadata import recognize_audio
from source_separation import separate_sources_async
from chord_recognition import detect_chords_async
from tab_extraction import TabExtractor

def download_youtube(url, output_dir):
    import yt_dlp
    ydl_opts = {
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': os.path.join(output_dir, '%(title)s.%(ext)s'),
        'quiet': True,
        'no_warnings': True,
        'restrictfilenames': True,
        'nocheckcertificate': True,
        'noplaylist': True,
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-us,en;q=0.5',
            'Referer': 'https://www.google.com/',
        }
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        abs_path = ydl.prepare_filename(info)
        
        base, _ = os.path.splitext(abs_path)
        final_path = base + ".mp3"
        
        # Check if the file exists (post-processor should have created it)
        if not os.path.exists(final_path):
            # Fallback scan for common extensions if prepare_filename doesn't match
            for ext in [".m4a", ".webm", ".opus", ".mp3", ".wav"]:
                possible_file = base + ext
                if os.path.exists(possible_file):
                    if ext != ".mp3":
                        os.rename(possible_file, final_path)
                    break
                    
        return final_path, info.get('title', 'Unknown'), info.get('uploader', 'Unknown')

async def process_async(file_path_or_url, song_hint="Unknown", artist_hint="Unknown", stems_output_root=None, user_tuning=None):
    start_time = time.time()
    print("DEBUG: process_async START (Decoupled Pipeline)", file=sys.stderr)
    
    file_path = file_path_or_url
    # If it's a URL, download it first
    if file_path_or_url.startswith("http"):
        print(f"DEBUG: Downloading from YouTube: {file_path_or_url}", file=sys.stderr)
        upload_dir = os.path.dirname(stems_output_root) if stems_output_root else "/tmp"
        if "public" in upload_dir:
            upload_dir = os.path.join(os.path.dirname(stems_output_root), "uploads")
        
        try:
            file_path, yt_title, yt_artist = download_youtube(file_path_or_url, upload_dir)
            if song_hint == "Unknown": song_hint = yt_title
            if artist_hint == "Unknown": artist_hint = yt_artist
        except Exception as e:
            print(f"DEBUG: YouTube download failed: {e}", file=sys.stderr)
            raise e
    result = {
        "key": "Unknown", "tuning": user_tuning if user_tuning else "Standard E", "chords": [], "notes": [],
        "pro_tab": None, "stems": None, "tempo": 120, "song_info": None,
        "success": False, "error": None
    }
    
    try:
        # 1. Identification
        identity = await recognize_audio(file_path)
        
        final_info = identity if identity else {
            "title": song_hint if song_hint != "Unknown" else "Unknown Track",
            "artist": artist_hint if artist_hint != "Unknown" else "Unknown Artist",
            "method": "manual", "images": {}
        }
        # Merge hints if Shazam failed or provided incomplete data
        if song_hint != "Unknown" and final_info["title"] == "Unknown Track": final_info["title"] = song_hint
        if artist_hint != "Unknown" and final_info["artist"] == "Unknown Artist": final_info["artist"] = artist_hint

        result["song_info"] = final_info

        # 2. Source Separation (Critical First Step)
        if not stems_output_root:
            raise ValueError("Stems output root is required for this pipeline")

        print("DEBUG: Starting Source Separation...", file=sys.stderr)
        stems = await separate_sources_async(file_path, stems_output_root)
        if not stems:
            raise RuntimeError("Source separation failed")
        
        result["stems"] = stems
        
        # 3. Parallel Analysis (Chords & Tabs)
        # We need absolute paths for the processing modules
        # stems dict paths are relative URL paths like /stems/..., we need file system paths
        # separate_sources_async saves to {output_root}/{base_folder}/{stem}.wav
        
        # Reconstruct absolute paths
        base_folder = os.path.basename(file_path).replace(" ", "_").replace(".", "_")
        stem_dir = os.path.join(stems_output_root, base_folder)
        
        guitar_stem_path = os.path.join(stem_dir, "guitar.wav") # 'other' stem
        bass_stem_path = os.path.join(stem_dir, "bass.wav")
        # For chords, we might want to use the full mix or a harmonic mix. 
        # Let's use the original file for Chords for now as it contains everything (rhythm guitar + bass + keys)
        # effectively giving the "Tonal center".
        chord_audio_source = file_path 
        
        print("DEBUG: Starting Parallel Analysis (Chords & Tabs)...", file=sys.stderr)
        
        tab_extractor = TabExtractor(tuning=result["tuning"])
        
        chord_task = detect_chords_async(chord_audio_source)
        tab_task = tab_extractor.extract_tabs_async(guitar_stem_path)
        
        chords, notes = await asyncio.gather(chord_task, tab_task)
        
        result["chords"] = chords
        result["notes"] = notes
        
        # TODO: Pro Tab generation from chords (legacy feature) - keeping it null for now or implementing if needed
        # The prompt said "Tab Pipeline... Extract Riffs... Must not be used as input for chord detection".
        # It didn't explicitly say we need to generate the "rhythm guide" text block anymore, 
        # but the UI might expect it. Let's leave it as None or simple placeholder if needed.
        # existing frontend might expect 'pro_tab' string.
        result["pro_tab"] = None  # Frontend will use guitarTab instead 

        result["success"] = True
        print(f"DEBUG: Pipeline completed in {time.time() - start_time:.2f} seconds", file=sys.stderr)

    except Exception as e:
        print(f"DEBUG: EXCEPTION in process_async: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        result["error"] = str(e)

    # Output JSON
    class NpEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, np.integer): return int(obj)
            if isinstance(obj, np.floating): return float(obj)
            return super(NpEncoder, self).default(obj)
    print(json.dumps(result, cls=NpEncoder))

if __name__ == "__main__":
    if len(sys.argv) < 2: sys.exit(1)
    file = sys.argv[1]
    song = sys.argv[2] if len(sys.argv) > 2 else "Unknown"
    artist = sys.argv[3] if len(sys.argv) > 3 else "Unknown"
    stems = sys.argv[4] if len(sys.argv) > 4 else None
    tuning = sys.argv[5] if len(sys.argv) > 5 else None
    
    asyncio.run(process_async(file, song, artist, stems, tuning))
