
import numpy as np
import soundfile as sf

def create_sine_wave(file_path, duration=30, sr=44100, freq=440.0):
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    # A4 note (440Hz)
    audio = 0.5 * np.sin(2 * np.pi * freq * t)
    
    # Add some harmonics to make it interesting for key detection (major chord-ish)
    # C# (554.37), E (659.25) to make A Major
    audio += 0.3 * np.sin(2 * np.pi * 554.37 * t)
    audio += 0.3 * np.sin(2 * np.pi * 659.25 * t)
    
    # Normalize
    audio /= np.max(np.abs(audio))
    
    sf.write(file_path, audio, sr)
    print(f"Created {file_path}")

if __name__ == "__main__":
    create_sine_wave("dummy_audio.wav")
