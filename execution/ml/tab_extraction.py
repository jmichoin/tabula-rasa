import os
import sys
import asyncio
import soundfile as sf
import librosa
from basic_pitch.inference import predict
from fretboard_mapper import FretboardMapper

class TabExtractor:
    def __init__(self, tuning="Standard E"):
        self.mapper = FretboardMapper(tuning)

    async def extract_tabs_async(self, file_path):
        """
        Runs the full tab extraction pipeline:
        1. Audio Cleaning (filtering)
        2. Pitch Detection (Basic Pitch)
        3. Fretboard Mapping
        """
        def _run():
            temp_clean_file = f"temp_clean_{os.getpid()}.wav"
            try:
                # 1. Cleaning Layer
                print(f"DEBUG: Cleaning audio for tab extraction...", file=sys.stderr)
                y, sr = librosa.load(file_path, sr=22050, mono=True) # Downsample slightly
                
                # High-pass filter to remove mud/bass bleed
                import scipy.signal
                sos = scipy.signal.butter(10, 80, 'hp', fs=sr, output='sos')
                y_clean = scipy.signal.sosfilt(sos, y)
                
                # Save temp cleaned file for Basic Pitch
                sf.write(temp_clean_file, y_clean, sr)
                
                # 2. Pitch Detection
                print(f"DEBUG: Running Basic Pitch...", file=sys.stderr)
                # Ensure stdout is suppressed from Basic Pitch if needed (can be verbose)
                with open(os.devnull, "w") as devnull:
                    old_stdout = sys.stdout
                    sys.stdout = devnull
                    try:
                        _, midi_data, _ = predict(temp_clean_file, onset_threshold=0.5, frame_threshold=0.3)
                    finally:
                        sys.stdout = old_stdout

                raw_notes = []
                if len(midi_data.instruments) > 0:
                    for n in midi_data.instruments[0].notes:
                        raw_notes.append({
                            "start": float(n.start),
                            "end": float(n.end),
                            "pitch": int(n.pitch),
                            "velocity": int(n.velocity),
                            "confidence": round(n.velocity / 127.0, 2)
                        })
                
                # 3. Fretboard Mapping
                print(f"DEBUG: Mapping to fretboard...", file=sys.stderr)
                mapped_notes = self.mapper.map_sequence(raw_notes)
                
                return mapped_notes

            except Exception as e:
                print(f"ERROR: Tab Extraction Failed: {e}", file=sys.stderr)
                return []
            finally:
                if os.path.exists(temp_clean_file):
                    os.remove(temp_clean_file)

        return await asyncio.to_thread(_run)
