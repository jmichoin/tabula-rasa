import numpy as np
import librosa
import scipy.ndimage
import asyncio

async def detect_chords_async(file_path):
    """
    Detects chords from an audio file using Librosa chroma features.
    Returns a list of chords with start/end times.
    """
    def _run():
        detected_chords = []  # Initialize the list!
        try:
            # Load audio (mono)
            y, sr = librosa.load(file_path, mono=True)
            
            # 1. Harmonic-Percussive Separation (Optional improvement for chords)
            # y_harmonic, y_percussive = librosa.effects.hpss(y)
            # We use full audio for now as in original, but could switch to harmonic only
            
            # 2. Chroma Feature Extraction
            chroma = librosa.feature.chroma_cens(y=y, sr=sr, hop_length=512)
            
            # 3. Smoothing (Temporal)
            chroma = scipy.ndimage.median_filter(chroma, size=(1, 31))
            
            # 4. Template Matching
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
            
            if len(idx_in_palette) > 0:
                cur, start = palette[idx_in_palette[0]], times[0]
                # approximate confidence as the mean match value for the duration
                current_confidences = [match[idx_in_palette[0], 0]]
                
                for i in range(1, len(idx_in_palette)):
                    if palette[idx_in_palette[i]] != cur:
                        if (times[i] - start) >= 0.5: # Minimum chord duration 0.5s
                            avg_conf = float(np.mean(current_confidences))
                            detected_chords.append({
                                "chord": cur, 
                                "start": float(start), 
                                "end": float(times[i]),
                                "confidence": avg_conf
                            })
                            cur, start = palette[idx_in_palette[i]], times[i]
                            current_confidences = []
                    current_confidences.append(match[idx_in_palette[i], i])
                
                if current_confidences:
                    avg_conf = float(np.mean(current_confidences))
                    detected_chords.append({
                        "chord": cur, 
                        "start": float(start), 
                        "end": float(times[-1]),
                        "confidence": avg_conf
                    })
                
            return detected_chords
            
        except Exception as e:
            print(f"Chord Detection Failed: {e}")
            import traceback
            traceback.print_exc()
            return []

    return await asyncio.to_thread(_run)

