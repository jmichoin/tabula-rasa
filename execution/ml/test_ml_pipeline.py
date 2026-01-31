
import os
import time
import argparse
import logging
import psutil
import torch
import numpy as np
import librosa
from memory_profiler import profile
from demucs.pretrained import get_model
from demucs.apply import apply_model
from basic_pitch.inference import predict
import warnings
import gc
import soundfile as sf

# Suppress warnings for clearer output
warnings.filterwarnings("ignore")

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_and_trim_audio(file_path, duration=15):
    """
    Loads an audio file and trims it to the specified duration.
    """
    start_time = time.time()
    try:
        y, sr = librosa.load(file_path, duration=duration)
        logger.info(f"Loaded and trimmed {file_path} to {duration}s. Shape: {y.shape}, SR: {sr}")
        return y, sr, time.time() - start_time
    except Exception as e:
        logger.error(f"Error loading {file_path}: {e}")
        return None, None, time.time() - start_time

def detect_key(y, sr):
    """
    Detects the key of the audio using Librosa.
    """
    start_time = time.time()
    try:
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        chroma_avg = np.mean(chroma, axis=1)
        
        # Major and Minor profiles (Krumhansl-Schmuckler)
        major_profile = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
        minor_profile = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
        
        # Normalize profiles
        major_profile /= np.linalg.norm(major_profile)
        minor_profile /= np.linalg.norm(minor_profile)
        chroma_avg /= np.linalg.norm(chroma_avg)

        # Calculate correlations
        keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        correlations = {}
        
        for i, key in enumerate(keys):
            # Rotate profiles to match current key
            maj_temp = np.roll(major_profile, i)
            min_temp = np.roll(minor_profile, i)
            
            correlations[f"{key} Major"] = np.corrcoef(chroma_avg, maj_temp)[0, 1]
            correlations[f"{key} Minor"] = np.corrcoef(chroma_avg, min_temp)[0, 1]
            
        best_key = max(correlations, key=correlations.get)
        confidence = correlations[best_key]
        
        logger.info(f"Detected Key: {best_key} (Confidence: {confidence:.2f})")
        return best_key, confidence, time.time() - start_time
    except Exception as e:
        logger.error(f"Error in key detection: {e}")
        return None, 0.0, time.time() - start_time

def separate_source(file_path, duration=15, device='cpu'):
    """
    Separates the guitar track using Demucs.
    """
    start_time = time.time()
    try:
        # Load model
        model = get_model('htdemucs')
        model.to(device)
        
        y, sr = librosa.load(file_path, duration=duration, mono=False) 
        if y.ndim == 1:
            y = np.stack([y, y]) 
        
        wav = torch.tensor(y, dtype=torch.float32).to(device)
        ref = wav.mean(0)
        wav = (wav - ref.mean()) / ref.std()
        wav = wav.unsqueeze(0)

        sources = apply_model(model, wav, shifts=0, split=True, overlap=0.25, progress=False)
        
        guitar_source = sources[0, 2] # 3rd source is 'other' (htdemucs: drums, bass, other, vocals)
        
        guitar_audio = guitar_source.cpu().numpy()
        
        # Cleanup torch tensors
        del model
        del wav
        del sources
        del guitar_source
        gc.collect()
        if device == 'cuda':
            torch.cuda.empty_cache()
            
        logger.info("Source separation completed.")
        return guitar_audio, time.time() - start_time

    except Exception as e:
        logger.error(f"Error in source separation: {e}")
        return None, time.time() - start_time

def estimate_tuning(y, sr):
    """
    Estimates tuning based on matching detected pitches to common guitar tuning templates.
    """
    start_time = time.time()
    try:
        # Use pyin for pitch tracking
        f0, voiced_flag, voiced_probs = librosa.pyin(y.mean(0) if y.ndim > 1 else y, 
                                                     fmin=librosa.note_to_hz('A1'), # Go lower for C/B tunings
                                                     fmax=librosa.note_to_hz('C6'))
        
        # Only consider voiced segments with high confidence
        confident_f0 = f0[voiced_probs > 0.9]
        if len(confident_f0) == 0:
            return "Unknown", 0.0, time.time() - start_time

        # Convert to MIDI notes
        midi_notes = librosa.hz_to_midi(confident_f0)
        midi_notes = np.round(midi_notes).astype(int)
        
        # Create histogram of detected notes
        note_counts = {}
        for note in midi_notes:
            note_counts[note] = note_counts.get(note, 0) + 1
            
        # Filter to significant notes (e.g. appearing in > 1% of frames)
        total_frames = len(midi_notes)
        significant_notes = {k for k, v in note_counts.items() if v > total_frames * 0.01}
        
        # Tuning Templates (MIDI numbers for open strings)
        tunings = {
            "Standard E":  {40, 45, 50, 55, 59, 64}, # E2 A2 D3 G3 B3 E4
            "Drop D":      {38, 45, 50, 55, 59, 64}, # D2 A2 D3 G3 B3 E4
            "Eb Standard": {39, 44, 49, 54, 58, 63}, # Eb2 Ab2 Db3 Gb3 Bb3 Eb4
            "D Standard":  {38, 43, 48, 53, 57, 62}, # D2 G2 C3 F3 A3 D4
            "C# Standard": {37, 42, 47, 52, 56, 61}, # C#2 F#2 B2 E3 G#3 C#4
            "C Standard":  {36, 41, 46, 51, 55, 60}, # C2 F2 Bb2 Eb3 G3 C4
            "B Standard":  {35, 40, 45, 50, 54, 59}, # B1 E2 A2 D3 F#3 B3
        }
        
        best_tuning = "Unknown"
        best_score = -1
        
        # Score each tuning
        for name, template in tunings.items():
            score = 0
            # 1. Open String Hits: How many open strings correspond to significant notes?
            matches = template.intersection(significant_notes)
            score += len(matches) * 2
            
            # 2. Key range penalty: If we detect notes LOWER than the lowest string, penalty.
            lowest_string = min(template)
            lower_notes = [n for n in significant_notes if n < lowest_string]
            if lower_notes:
                 # Calculate how far below. Occasional spurious low note might happen, but systematic is bad.
                 # Let's just penalize count.
                 score -= len(lower_notes) * 3
            
            if score > best_score:
                best_score = score
                best_tuning = name
        
        # Fallback/Reality check: If the lowest significant note is > 40 (E2), it's basically Standard E compatible
        # unless we specifically matched a higher tuning (not implementing Capo logic yet).
        
        min_note = min(significant_notes) if significant_notes else 0
        min_note_name = librosa.midi_to_note(min_note)
        
        result_string = f"{best_tuning} (Score: {best_score}, Lowest: {min_note_name})"
        
        logger.info(f"Estimated Tuning: {result_string}")
        return result_string, 0.5, time.time() - start_time
    except Exception as e:
        logger.error(f"Error in tuning estimation: {e}")
        return "Standard E (Error)", 0.0, time.time() - start_time

def transcribe_audio(file_path, duration=15):
    """
    Transcribes audio to MIDI using Basic Pitch.
    """
    start_time = time.time()
    try:
        y, sr = librosa.load(file_path, duration=duration)
        temp_file = f"temp_{duration}s.wav"
        sf.write(temp_file, y, sr)
        
        model_output, midi_data, note_events = predict(temp_file)
        
        # Basic validation: check number of notes
        num_notes = 0
        if len(midi_data.instruments) > 0:
            num_notes = len(midi_data.instruments[0].notes)
            
        logger.info(f"Transcription complete. Detected {num_notes} notes.")
        
        if os.path.exists(temp_file):
            os.remove(temp_file)
            
        del y
        del model_output
        gc.collect()
            
        return num_notes, midi_data, time.time() - start_time
    except Exception as e:
        logger.error(f"Error in transcription: {e}")
        return 0, None, time.time() - start_time

def process_file(file_path):
    logger.info(f"Processing {file_path}...")
    metrics = {}
    
    # 1. Load & Trim
    y, sr, t_load = load_and_trim_audio(file_path, duration=15)
    metrics['load_time'] = t_load
    if y is None: return
    
    # 2. Key Detection
    key, conf, t_key = detect_key(y, sr)
    metrics['key'] = key
    metrics['key_conf'] = conf
    metrics['key_time'] = t_key
    
    gc.collect() 
    
    # 3. Source Separation
    sep_audio, t_sep = separate_source(file_path, duration=15)
    metrics['sep_time'] = t_sep
    
    # 4. Tuning Estimation 
    if sep_audio is not None:
        tuning_input = sep_audio.mean(0)
    else:
        tuning_input = y
        
    tuning, t_conf, t_tuning = estimate_tuning(tuning_input, sr)
    metrics['tuning'] = tuning
    metrics['tuning_time'] = t_tuning
    
    del sep_audio
    del tuning_input
    gc.collect()
    
    # 5. Transcription
    num_notes, midi, t_trans = transcribe_audio(file_path, duration=15)
    metrics['notes_count'] = num_notes
    metrics['trans_time'] = t_trans
    
    del y
    gc.collect()
    
    total_time = t_load + t_key + t_sep + t_tuning + t_trans
    metrics['total_time'] = total_time
    
    logger.info(f"Finished {file_path}. Total time: {total_time:.2f}s")
    return metrics

@profile
def main():
    parser = argparse.ArgumentParser(description="Validate Guitar Tab ML Pipeline")
    parser.add_argument("--input_dir", type=str, help="Directory containing MP3 files")
    parser.add_argument("--input_file", type=str, help="Single MP3 file to test")
    
    args = parser.parse_args()
    
    files = []
    if args.input_file:
        files.append(args.input_file)
    elif args.input_dir:
        for f in os.listdir(args.input_dir):
            if f.endswith(".mp3"):
                files.append(os.path.join(args.input_dir, f))
                
    if not files:
        logger.warning("No files found to process.")
        return

    results = {}
    files = files[:10]
    
    for f in files:
        res = process_file(f)
        results[f] = res
        
    print("\n\n=== FINAL REPORT ===")
    for f, m in results.items():
        if m:
            print(f"File: {os.path.basename(f)}")
            print(f"  Total Time: {m['total_time']:.2f}s")
            print(f"  Key: {m['key']} ({m['key_conf']:.2f})")
            print(f"  Tuning: {m['tuning']}")
            print(f"  Notes Detected: {m['notes_count']}")
            print(f"  Breakdown: Load={m['load_time']:.1f}s, Key={m['key_time']:.1f}s, Sep={m['sep_time']:.1f}s, Tuning={m['tuning_time']:.1f}s, Trans={m['trans_time']:.1f}s")
            print("-" * 30)

if __name__ == "__main__":
    main()
