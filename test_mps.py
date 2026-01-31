
import torch
import sys
import time

print(f"Python: {sys.version}")
print(f"MPS Available: {torch.backends.mps.is_available()}")
print(f"CUDA Available: {torch.cuda.is_available()}")

if torch.backends.mps.is_available():
    try:
        x = torch.ones(1).to("mps")
        print("Moved tensor to MPS successfully")
    except Exception as e:
        print(f"Failed to use MPS: {e}")
