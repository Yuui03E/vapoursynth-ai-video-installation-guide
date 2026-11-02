"""Inspect the local vsmlrt.py wrapper without running model inference."""
from __future__ import annotations

import inspect
import vsmlrt

print("Wrapper path:", vsmlrt.__file__)
print("Wrapper version:", getattr(vsmlrt, "__version__", "unknown"))

for name in (
    "Backend", "RIFE", "RIFEModel", "Waifu2x", "Waifu2xModel",
    "RealESRGAN", "RealESRGANModel", "RealESRGANv2", "RealESRGANv2Model",
    "CUGAN", "DPIR", "DPIRModel", "SCUNet", "SCUNetModel", "ArtCNN", "ArtCNNModel",
):
    obj = getattr(vsmlrt, name, None)
    if obj is None:
        continue
    print(f"\n{name}: {obj}")
    try:
        print("Signature:", inspect.signature(obj))
    except (TypeError, ValueError):
        pass
    if name.endswith("Model"):
        print("Members:", [member for member in dir(obj) if not member.startswith("_")])
