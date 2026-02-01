import os
import sys
import torch
import librosa
import numpy as np
import soundfile as sf
import asyncio
from demucs.pretrained import get_model
from demucs.apply import apply_model

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
