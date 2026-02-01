import sys
import os
import asyncio
import numpy as np

# Add local directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fretboard_mapper import FretboardMapper
from chord_recognition import detect_chords_async
from tab_extraction import TabExtractor
from source_separation import separate_sources_async
from metadata import parse_filename

def test_fretboard_mapper():
    print("Testing Fretboard Mapper...")
    mapper = FretboardMapper()
    
    # Test C Major scale notes (approx)
    notes = [
        {'pitch': 60, 'start': 0, 'end': 1, 'velocity': 100}, # C4
        {'pitch': 62, 'start': 1, 'end': 2, 'velocity': 100}, # D4
        {'pitch': 64, 'start': 2, 'end': 3, 'velocity': 100}, # E4
    ]
    
    mapped = mapper.map_sequence(notes)
    for m in mapped:
        print(f"Pitch {m['pitch']} -> String {m['string']} Fret {m['fret']}")
        assert m['string'] > 0 and m['string'] <= 6
        assert m['fret'] >= 0
    print("Fretboard Mapper OK")

def test_metadata_parsing():
    print("Testing Metadata Parsing...")
    res = parse_filename("/path/to/The Beatles - Let It Be.mp3")
    assert res['artist'] == "The Beatles"
    assert res['title'] == "Let It Be"
    print("Metadata Parsing OK")

async def main():
    test_fretboard_mapper()
    test_metadata_parsing()
    
    # We can't easily test heavy ML models without audio files and GPU/CPU time,
    # but we can verify imports and lightweight logic.
    print("All lightweight tests passed.")

if __name__ == "__main__":
    asyncio.run(main())
