# Audio Analysis Directive

## Goal
Process an uploaded MP3 file to extract musical metadata, stems, chords, and tabs.

## Inputs
- `file_path`: Absolute path to the MP3 file.
- `song_name`: (Optional) Hint for the song title.
- `artist_name`: (Optional) Hint for the artist.
- `stems_dir`: Absolute path where separated stems should be saved.
- `tuning`: (Optional) Hint for guitar tuning.

## Tools/Scripts
- `execution/ml/process_audio.py`: The core ML script.

## Orchestration Flow
1. Receive input from the Next.js API route.
2. Execute the Python script via `child_process.exec`.
3. The script will:
   - Identify the song (Shazam) in parallel with other tasks.
   - Check local Knowledge Base (Ground Truth).
   - Separate sources (Demucs) with `shifts=0` for maximum speed.
   - Analyze Tempo, Chords (Librosa), and Notes (Basic Pitch) in parallel threads.
   - Synthesize a professional rhythm guide tab from the detected chords if no ground truth exists.
4. Parse the JSON output and return to the client.

## Edge Cases & Failures
- **Shazam failure**: Fallback to filename parsing or manual hints.
- **Resource limits**: The script is optimized to run under 60 seconds by parallelizing blocking tasks and using faster ML settings.
- **FFmpeg missing**: Script adds paths via `static_ffmpeg` early in execution.
