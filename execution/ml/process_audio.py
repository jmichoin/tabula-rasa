import sys
import os
# Set before other imports
os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"

import static_ffmpeg
# Ensure ffmpeg is in the PATH as early as possible
static_ffmpeg.add_paths()

import shutil
FFMPEG_PATH = shutil.which("ffmpeg")
if not FFMPEG_PATH:
    print("DEBUG: ffmpeg NOT FOUND in PATH yet.", file=sys.stderr)
else:
    print(f"DEBUG: ffmpeg found at {FFMPEG_PATH}", file=sys.stderr)

import json
import torch
import numpy as np
import librosa
import soundfile as sf
import warnings
import gc
import asyncio
import contextlib
import time

@contextlib.contextmanager
def suppress_stdout():
    with open(os.devnull, "w") as devnull:
        old_stdout = sys.stdout
        sys.stdout = devnull
        try:
            yield
        finally:
            sys.stdout = old_stdout

from shazamio import Shazam
from basic_pitch.inference import predict
from demucs.pretrained import get_model
from demucs.apply import apply_model

# Suppress warnings
warnings.filterwarnings("ignore")
import logging
logging.getLogger().setLevel(logging.ERROR)

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

import re
import requests
import urllib.parse

async def search_metadata(title, artist="Unknown"):
    """Attempt to find metadata via iTunes API and DuckDuckGo fallback"""
    try:
        # 1. Try iTunes Search API (Very reliable for metadata/art)
        search_term = f"{artist} {title}".strip()
        itunes_url = f"https://itunes.apple.com/search?term={urllib.parse.quote(search_term)}&limit=1&entity=song"
        resp = requests.get(itunes_url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("resultCount", 0) > 0:
                result = data["results"][0]
                return {
                    "title": result.get("trackName"),
                    "artist": result.get("artistName"),
                    "image": result.get("artworkUrl100", "").replace("100x100", "600x600"),
                    "method": "itunes"
                }

        # 2. Fallback to DuckDuckGo/Scraping (already existing logic simplified)
        query = f"{title} {artist if artist != 'Unknown' else ''} album art".strip()
        url = f"https://duckduckgo.com/html/?q={urllib.parse.quote(query)}"
        headers = {'User-Agent': 'Mozilla/5.0'}
        resp = requests.get(url, headers=headers, timeout=5)
        
        image_url = None
        if artist == "Unknown":
            match = re.search(r'ultimate-guitar\.com/tabs/([\w-]+)/', resp.text)
            if match:
                artist = match.group(1).replace("-", " ").title()
        
        img_match = re.search(r'https?://[^"\s>]+\.(?:jpg|jpeg|png)', resp.text)
        if img_match:
            image_url = img_match.group(0)
        
        return {"artist": artist, "title": title, "image": image_url, "method": "search"}
    except Exception as e:
        print(f"DEBUG: Search Metadata Exception: {e}", file=sys.stderr)
        return {"artist": artist, "title": title, "image": None, "method": "failed"}

async def recognize_audio(file_path):
    """Identify song using Shazam with multi-point sampling for accuracy"""
    print(f"DEBUG: Identifying audio for {file_path}", file=sys.stderr)
    
    filename_info = parse_filename(file_path)
    
    # 1. Shazam Step
    identity = None
    try:
        shazam = Shazam()
        # Try 1: Start of file (standard)
        out = await asyncio.wait_for(shazam.recognize(file_path), timeout=15)
        if out and 'track' in out:
            track = out['track']
            identity = {
                "title": track.get('title') or filename_info.get("title"),
                "artist": track.get('subtitle') or filename_info.get("artist"),
                "shazam_id": track.get('key'),
                "images": track.get('images') or {},
                "method": "shazam"
            }
    except Exception as e:
        print(f"DEBUG: Shazam primary identification failed: {e}", file=sys.stderr)
    if not identity:
        try:
            print("DEBUG: Shazam Try 2", file=sys.stderr)
            out = await asyncio.wait_for(shazam.recognize(file_path), timeout=15) 
            if out and 'track' in out:
                track = out['track']
                identity = {
                    "title": track.get('title') or filename_info.get("title"),
                    "artist": track.get('subtitle') or filename_info.get("artist"),
                    "shazam_id": track.get('key'),
                    "images": track.get('images') or {},
                    "method": "shazam"
                }
        except: pass

    if identity:
        print(f"DEBUG: Found Identity: {identity['title']} by {identity['artist']} (Method: {identity['method']})", file=sys.stderr)
        return identity

    # 2. Filename Fallback
    info = filename_info
    info["method"] = "filename"
    info["images"] = {}
    
    print(f"DEBUG: Final Identity: {info['title']} by {info['artist']} (Method: {info['method']})", file=sys.stderr)
    return info
    # Final safety cleanup for no nulls or generic 'Unknown' if hints exist
    if not info.get("title") or info["title"] == "Unknown":
        info["title"] = "Unknown Track"
    if not info.get("artist") or info["artist"] == "Unknown":
        info["artist"] = "Unknown Artist"
    if "images" not in info:
        info["images"] = {}
            
    print(f"DEBUG: Final Identity: {info['title']} by {info['artist']} (Method: {info['method']})", file=sys.stderr)
    return info

CHORD_FINGERINGS = {
    'C':  {'A': '3', 'D': '2', 'G': '0', 'B': '1', 'e': '0'},
    'Cm': {'A': '3', 'D': '5', 'G': '5', 'B': '4', 'e': '3'},
    'C7': {'A': '3', 'D': '2', 'G': '3', 'B': '1', 'e': '0'},
    'D':  {'D': '0', 'G': '2', 'B': '3', 'e': '2'},
    'Dm': {'D': '0', 'G': '2', 'B': '3', 'e': '1'},
    'D7': {'D': '0', 'G': '2', 'B': '1', 'e': '2'},
    'E':  {'E': '0', 'A': '2', 'D': '2', 'G': '1', 'B': '0', 'e': '0'},
    'Em': {'E': '0', 'A': '2', 'D': '2', 'G': '0', 'B': '0', 'e': '0'},
    'E7': {'E': '0', 'A': '2', 'D': '0', 'G': '1', 'B': '0', 'e': '0'},
    'F':  {'E': '1', 'A': '3', 'D': '3', 'G': '2', 'B': '1', 'e': '1'},
    'Fm': {'E': '1', 'A': '3', 'D': '3', 'G': '1', 'B': '1', 'e': '1'},
    'G':  {'E': '3', 'A': '2', 'D': '0', 'G': '0', 'B': '0', 'e': '3'},
    'Gm': {'E': '3', 'A': '5', 'D': '5', 'G': '3', 'B': '3', 'e': '3'},
    'G7': {'E': '3', 'A': '2', 'D': '0', 'G': '0', 'B': '0', 'e': '1'},
    'A':  {'A': '0', 'D': '2', 'G': '2', 'B': '2', 'e': '0'},
    'Am': {'A': '0', 'D': '2', 'G': '2', 'B': '1', 'e': '0'},
    'A7': {'A': '0', 'D': '2', 'G': '0', 'B': '2', 'e': '0'},
    'B':  {'A': '2', 'D': '4', 'G': '4', 'B': '4', 'e': '2'},
    'Bm': {'A': '2', 'D': '4', 'G': '4', 'B': '3', 'e': '2'},
    'B7': {'A': '2', 'D': '1', 'G': '2', 'B': '0', 'e': '2'},
    'C#': {'A': '4', 'D': '6', 'G': '6', 'B': '6', 'e': '4'},
    'C#m': {'A': '4', 'D': '6', 'G': '6', 'B': '5', 'e': '4'},
    'Eb': {'A': '6', 'D': '8', 'G': '8', 'B': '8', 'e': '6'},
    'Ebm': {'A': '6', 'D': '8', 'G': '8', 'B': '7', 'e': '6'},
    'F#': {'E': '2', 'A': '4', 'D': '4', 'G': '3', 'B': '2', 'e': '2'},
    'F#m': {'E': '2', 'A': '4', 'D': '4', 'G': '2', 'B': '2', 'e': '2'},
    'Ab': {'E': '4', 'A': '6', 'D': '6', 'G': '5', 'B': '4', 'e': '4'},
    'G#m': {'E': '4', 'A': '6', 'D': '6', 'G': '4', 'B': '4', 'e': '4'},
    'Bb': {'A': '1', 'D': '3', 'G': '3', 'B': '3', 'e': '1'},
    'Bbm': {'A': '1', 'D': '3', 'G': '3', 'B': '2', 'e': '1'},
}

def generate_pro_tab_from_chords(chords, tuning="Standard E"):
    if not chords: return None
    unique_sections = []
    seen = set()
    for c in chords:
        if c['chord'] not in seen:
            unique_sections.append(c['chord'])
            seen.add(c['chord'])
        if len(unique_sections) >= 8: break
    lines = {s: f"{s}|" for s in ['e', 'B', 'G', 'D', 'A', 'E']}
    chord_label_line = "  "
    for chord in unique_sections:
        clean_chord = chord.replace(' Major', '').replace(' Minor', 'm')
        fingering = CHORD_FINGERINGS.get(clean_chord, {}).copy()
        
        shift = 0
        t_lower = tuning.lower()
        if "eb" in t_lower or "half step" in t_lower: shift = 1
        elif "d standard" in t_lower: shift = 2
        elif "db" in t_lower or "c#" in t_lower: shift = 3
        elif "c standard" in t_lower: shift = 4
        
        chord_label_line += f"  {clean_chord}".ljust(10)
        for s in ['e', 'B', 'G', 'D', 'A', 'E']:
            fret = fingering.get(s, '-')
            if fret != '-' and shift > 0:
                fret = str(int(fret) + shift)
            lines[s] += f"-{fret}-".ljust(10, '-')
    res = f"[Synthesized Rhythm Guide]\n\n{chord_label_line}\n"
    for s in ['e', 'B', 'G', 'D', 'A', 'E']:
        res += lines[s] + "|\n"
    return res

async def separate_sources_async(file_path, output_root):
    """Run Demucs source separation with robust error handling"""
    def _run():
        try:
            print(f"DEBUG: Loading model htdemucs...", file=sys.stderr)
            model = get_model('htdemucs')
            device = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
            model.to(device)
            model.eval()
            
            print(f"DEBUG: Loading audio file {file_path} (limit 120s)...", file=sys.stderr)
            # Increased duration to 120s for better user experience
            wav, sr = librosa.load(file_path, sr=model.samplerate, mono=False, duration=120)
            if wav.ndim == 1: wav = wav[None, :]
            
            # Convert mono to stereo if needed for Demucs
            if wav.shape[0] == 1:
                wav = np.concatenate([wav, wav], axis=0)
                
            wav = torch.tensor(wav).to(device)
            
            print(f"DEBUG: Applying Demucs model on {device}...", file=sys.stderr)
            try:
                with torch.no_grad():
                    # shifts=0 for speed
                    sources = apply_model(model, wav[None], device=device, shifts=0, split=True)[0]
            except Exception as e:
                # Fallback to CPU if MPS fails (common with some FFT ops)
                if device == "mps":
                    print(f"WARNING: MPS extraction failed ({e}), falling back to CPU", file=sys.stderr)
                    device = "cpu"
                    model.to(device)
                    wav = wav.to(device)
                    with torch.no_grad():
                        sources = apply_model(model, wav[None], device=device, shifts=0, split=True)[0]
                else:
                    raise e
            
            stem_names = ['drums', 'bass', 'other', 'vocals']
            stems = {}
            # Use a sanitized base folder name
            base_folder = os.path.basename(file_path).replace(" ", "_").replace(".", "_")
            stem_dir = os.path.join(output_root, base_folder)
            os.makedirs(stem_dir, exist_ok=True)
            
            print(f"DEBUG: Writing stems to {stem_dir}...", file=sys.stderr)
            for i, name in enumerate(stem_names):
                display_name = 'guitar' if name == 'other' else name
                out_filename = f"{display_name}.wav"
                out_path = os.path.join(stem_dir, out_filename)
                audio_data = sources[i].cpu().numpy().T
                sf.write(out_path, audio_data, model.samplerate)
                stems[display_name] = f"/stems/{base_folder}/{out_filename}"
            
            return stems
        except Exception as e:
            print(f"ERROR: Separation Failed: {e}", file=sys.stderr)
            import traceback
            traceback.print_exc(file=sys.stderr)
            return None
    
    return await asyncio.to_thread(_run)

async def analyze_audio_async(file_path, result_dict, learned=False):
    """Run Librosa and Basic Pitch analysis in a thread"""
    def _run():
        try:
            # Load 60s snippet for analysis
            y, sr = librosa.load(file_path, duration=60)
            y_mono = librosa.to_mono(y)
            
            # 1. Tempo Detection
            tempo, _ = librosa.beat.beat_track(y=y_mono, sr=sr)
            result_dict["tempo"] = float(tempo)
            
            # 2. Chord Detection (if not learned)
            if not learned:
                chroma = librosa.feature.chroma_cens(y=y_mono, sr=sr, hop_length=512)
                import scipy.ndimage
                chroma = scipy.ndimage.median_filter(chroma, size=(1, 31))
                
                chord_names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B','Cm','C#m','Dm','D#m','Em','Fm','F#m','Gm','G#m','Am','A#m','Bm','C7','C#7','D7','D#7','E7','F7','F#7','G7','G#7','A7','A#7','B7']
                palette = chord_names
                
                root_map = {'C':0,'C#':1,'D':2,'D#':3,'E':4,'F':5,'F#':6,'G':7,'G#':8,'A':9,'A#':10,'B':11}
                templates = []
                for name in palette:
                    root = name[:2] if len(name)>1 and name[1] in ['#','b'] else name[0]
                    if 'b' in root: root = {'Db':'C#','Eb':'D#','Gb':'F#','Ab':'G#','Bb':'A#'}.get(root, root)
                    idx = root_map.get(root, 0)
                    t = np.zeros(12)
                    if 'm' in name and 'maj' not in name: t[[idx, (idx+3)%12, (idx+7)%12]] = 1
                    elif '7' in name: t[[idx, (idx+4)%12, (idx+7)%12, (idx+10)%12]] = 1
                    else: t[[idx, (idx+4)%12, (idx+7)%12]] = 1
                    templates.append(t)
                
                templates = np.array(templates)
                templates /= np.maximum(1e-6, np.linalg.norm(templates, axis=1, keepdims=True))
                match = np.dot(templates, chroma)
                idx_in_palette = np.argmax(match, axis=0)
                times = librosa.frames_to_time(np.arange(len(idx_in_palette)), sr=sr, hop_length=512)
                
                detected_chords = []
                if len(idx_in_palette) > 0:
                    cur, start = palette[idx_in_palette[0]], times[0]
                    for i in range(1, len(idx_in_palette)):
                        if palette[idx_in_palette[i]] != cur:
                            if (times[i] - start) >= 0.5:
                                detected_chords.append({"chord": cur, "start": float(start), "end": float(times[i])})
                                cur, start = palette[idx_in_palette[i]], times[i]
                    detected_chords.append({"chord": cur, "start": float(start), "end": float(times[-1])})
                result_dict["chords"] = detected_chords
            
            # 3. Basic Pitch (Notes)
            temp_file = f"temp_notes_{os.getpid()}.wav"
            try:
                sf.write(temp_file, y_mono, sr)
                with suppress_stdout():
                    # Reduced threshold for better sensitivity during 30-60s limit
                    _, midi_data, _ = predict(temp_file, onset_threshold=0.4)
                if len(midi_data.instruments) > 0:
                    for n in midi_data.instruments[0].notes:
                        result_dict["notes"].append({"start": float(n.start), "end": float(n.end), "pitch": int(n.pitch), "velocity": int(n.velocity)})
            finally:
                if os.path.exists(temp_file): os.remove(temp_file)
                
        except Exception as e:
            print(f"Analysis error: {e}", file=sys.stderr)
            
    return await asyncio.to_thread(_run)

async def process_async(file_path, song_hint="Unknown", artist_hint="Unknown", stems_output_root=None, user_tuning=None):
    start_time = time.time()
    print("DEBUG: process_async START", file=sys.stderr)
    result = {
        "key": "Unknown", "tuning": user_tuning if user_tuning else "Standard E", "chords": [], "notes": [],
        "pro_tab": None, "stems": None, "tempo": 120, "song_info": None,
        "success": False, "error": None
    }
    
    try:
        # 1. Primary Identification via Shazam (The Gold Standard)
        print("DEBUG: Identifying song via Shazam...", file=sys.stderr)
        identity = await recognize_audio(file_path)
        
        final_info = {
            "title": "Unknown Track",
            "artist": "Unknown Artist",
            "method": "manual",
            "images": {}
        }
        
        # Priority 1: Shazam (If it found professional data)
        if identity and identity.get("method") == "shazam":
            final_info = identity
            print(f"DEBUG: Using Verified Shazam Data: {identity['title']}", file=sys.stderr)
        
        # Priority 2: User Hint (If Shazam failed)
        elif song_hint and song_hint != "Unknown":
            final_info["title"] = song_hint
            final_info["method"] = "manual"
            if artist_hint and artist_hint != "Unknown":
                final_info["artist"] = artist_hint
            # Fallback artist from filename if hint missing
            elif identity and identity.get("artist") != "Unknown":
                final_info["artist"] = identity["artist"]
                
        # Priority 3: Filename/Basic (Last Resort)
        elif identity:
             final_info = identity

        # Ensure no nulls in critical UI fields
        if not final_info.get("title"): final_info["title"] = "Unknown Track"
        if not final_info.get("artist"): final_info["artist"] = "Unknown Artist"
        if not final_info.get("images"): final_info["images"] = {}

        result["song_info"] = final_info
        song_name, artist_name = final_info["title"], final_info["artist"]

        # 2. Parallel Knowledge Base Check
        learned_data = None
        knowledge_dir = os.path.join(os.path.dirname(__file__), "..", "..", "data", "knowledge")
        # Use shazam_id or a slug
        song_key = final_info.get("shazam_id") or f"{artist_name}_{song_name}".lower().replace(" ", "_").replace("/", "_")
        knowledge_path = os.path.join(knowledge_dir, f"{song_key}.json")
        
        if os.path.exists(knowledge_path):
            print(f"DEBUG: Found Ground Truth Knowledge for {song_key}", file=sys.stderr)
            try:
                with open(knowledge_path, 'r') as f:
                    learned_data = json.load(f)
                    if learned_data.get("chords"): result["chords"] = learned_data["chords"]
                    if learned_data.get("pro_tab"): result["pro_tab"] = learned_data["pro_tab"]
                    if learned_data.get("tuning"): result["tuning"] = learned_data["tuning"]
                    result["learned"] = True
            except: pass

        # 2. Parallel Core Heavy Tasks (Stems & Analysis)
        tasks = []
        if stems_output_root:
            print("DEBUG: Starting Stems Task", file=sys.stderr)
            tasks.append(separate_sources_async(file_path, stems_output_root))
        
        print("DEBUG: Starting Analysis Task", file=sys.stderr)
        tasks.append(analyze_audio_async(file_path, result, learned=result.get("learned", False)))
        
        # Wait for both heavy tasks to completed
        results = await asyncio.gather(*tasks)
        
        # Stems will be the first result if stems_output_root was provided
        if stems_output_root:
            result["stems"] = results[0]

        # 3. Post-Analysis Processing
        if not result["pro_tab"] and result["chords"]:
            result["pro_tab"] = generate_pro_tab_from_chords(result["chords"], result["tuning"])

        result["success"] = True
        print(f"DEBUG: Process completed in {time.time() - start_time:.2f} seconds", file=sys.stderr)

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
