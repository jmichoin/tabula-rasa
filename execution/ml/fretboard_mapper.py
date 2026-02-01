import numpy as np

# Standard Guitar Tuning (Low to High)
TUNINGS = {
    "Standard E": [40, 45, 50, 55, 59, 64],  # E2 A2 D3 G3 B3 E4
    "Drop D": [38, 45, 50, 55, 59, 64],
    "Eb Standard": [39, 44, 49, 54, 58, 63],
    "D Standard": [38, 43, 48, 53, 57, 62],
}

def get_tuning_offsets(tuning_name="Standard E"):
    """Returns midi pitch for open strings"""
    return TUNINGS.get(tuning_name, TUNINGS["Standard E"])

class FretboardMapper:
    def __init__(self, tuning="Standard E"):
        self.open_strings = get_tuning_offsets(tuning)
        self.num_strings = len(self.open_strings)
        self.max_fret = 22  # Standard electric guitar

    def map_note(self, pitch, prev_string=None, prev_fret=None):
        """
        Maps a MIDI pitch to the best string/fret position.
        Optimizes for:
        1. Playability (not too high up the neck if possible)
        2. Proximity to previous note (if provided)
        3. Open strings (often preferred for ease)
        """
        candidates = []
        for string_idx, open_pitch in enumerate(self.open_strings):
            fret = pitch - open_pitch
            if 0 <= fret <= self.max_fret:
                candidates.append((string_idx, fret))

        if not candidates:
            return None  # Note not playable in this tuning

        # Cost Function
        best_candidate = None
        min_cost = float('inf')

        for string_idx, fret in candidates:
            cost = 0
            
            # Preference 1: Avoid very high frets unless necessary
            if fret > 15: cost += (fret - 15) * 1.5

            # Preference 2: Open strings are "cheap"
            if fret == 0: cost -= 2

            # Preference 3: Proximity to previous hand position
            if prev_string is not None and prev_fret is not None:
                # String distance (changing strings costs a bit)
                # string_dist = abs(string_idx - prev_string)
                
                # Fret distance (moving hand up/down neck costs a lot)
                fret_dist = abs(fret - prev_fret)
                
                # Hand doesn't move for same fret or close frets
                cost += fret_dist * 2.0
            else:
                 # Default preference for lower positions (frets 0-5)
                 if fret <= 5: cost -= 1

            if cost < min_cost:
                min_cost = cost
                best_candidate = {"string": string_idx, "fret": fret}

        return best_candidate

    def map_sequence(self, notes):
        """
        Maps a sequence of notes (time-ordered).
        This is a greedy approach. A Viterbi algorithm could be global optimum,
        but greedy is faster and often sufficient for simple lines.
        """
        mapped_notes = []
        prev_string = None
        prev_fret = None

        for note in notes:
            pitch = note['pitch']
            mapping = self.map_note(pitch, prev_string, prev_fret)
            
            if mapping:
                # Convert 0-indexed string (0 is low E) to standard tab (6 is low E in some formats, 
                # but usually 1 is high e, 6 is low E). 
                # Let's standardize: String 1 = High E (index 5), String 6 = Low E (index 0).
                # Actually, standard tabs in text usually go:
                # e (1)
                # B (2)
                # G (3)
                # D (4)
                # A (5)
                # E (6)
                # So index 5 is string 1, index 0 is string 6.
                
                # We will return 1-based string index from High E (standard guitar nomenclature)
                # Index 5 (high E) -> String 1
                # Index 0 (low E) -> String 6
                std_string = 6 - mapping['string']
                
                mapped_note = note.copy()
                mapped_note['string'] = std_string
                mapped_note['fret'] = mapping['fret']
                mapped_notes.append(mapped_note)
                
                # specific to basic monophonic/riff mapping: update previous pos
                # for chords this needs to be smarter, but we are doing tabs for riffs now.
                prev_string = mapping['string']
                prev_fret = mapping['fret']
            else:
                # Keep note but mark as unplayable/unknown
                mapped_note = note.copy()
                mapped_note['string'] = -1
                mapped_note['fret'] = -1
                mapped_notes.append(mapped_note)

        return mapped_notes
