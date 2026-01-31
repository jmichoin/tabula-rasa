
import os
import sys
import json
import time
import subprocess

def run_test():
    ml_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(ml_dir)
    venv_python = os.path.join(root_dir, ".venv", "bin", "python")
    process_script = os.path.join(ml_dir, "process_audio.py")
    test_file = os.path.join(ml_dir, "dummy_audio.wav")

    if not os.path.exists(test_file):
        print(f"Error: Test file not found at {test_file}")
        return

    print(f"🚀 Starting accuracy test on: {os.path.basename(test_file)}")
    print("This will run source separation and transcription. Please wait...")
    
    start_time = time.time()
    try:
        result = subprocess.run(
            [venv_python, process_script, test_file],
            capture_output=True,
            text=True
        )
        
        duration = time.time() - start_time
        
        if result.returncode != 0:
            print("❌ Test Failed!")
            print("Error stream:", result.stderr)
            return

        # Parse JSON from stdout
        output = result.stdout
        json_start = output.find('{')
        json_end = output.rfind('}')
        if json_start == -1:
            print("❌ Error: No JSON output found.")
            print("Raw output:", output)
            return
            
        data = json.loads(output[json_start:json_end+1])
        
        print(f"\n✅ Test Completed in {duration:.2f}s")
        print("-" * 40)
        print(f"Key:    {data.get('key')}")
        print(f"Tuning: {data.get('tuning')}")
        print(f"Notes:  {len(data.get('notes', []))} detected")
        print("-" * 40)
        
        # Show first 10 notes
        print("First 10 notes detected:")
        for i, note in enumerate(data.get('notes', [])[:10]):
            note_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
            pitch_name = note_names[note['pitch'] % 12] + str(note['pitch'] // 12 - 1)
            print(f"  {i+1}. {pitch_name:4} at {note['start']:5.2f}s (len: {note['end']-note['start']:.2f}s)")
            
    except Exception as e:
        print(f"❌ Execution Error: {e}")

if __name__ == "__main__":
    run_test()
