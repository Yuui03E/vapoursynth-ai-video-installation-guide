"""RIFE v4.26 frame interpolation example using the local vsmlrt.py wrapper.

Before use, verify that your installed wrapper exposes RIFEModel.v4_26.
Edit SOURCE before running. RIFE changes frame cadence, not resolution.
"""
import vapoursynth as vs
from pathlib import Path

from vssource import BestSource
from vstools import initialize_clip, finalize_clip
from vsmlrt import RIFE, RIFEModel, Backend

core = vs.core
SOURCE = Path(r"D:\Video\input.mkv")

if not SOURCE.is_file():
    raise FileNotFoundError(f"Source video not found: {SOURCE}")

# Check this member with dir(RIFEModel) on the installed wrapper version.
model = RIFEModel.v4_26

src = BestSource.source(str(SOURCE))
clip = initialize_clip(src)

# Assumption: the source uses the BT.709 YUV matrix.
clip_rgb = core.resize.Bicubic(
    clip,
    format=vs.RGBS,
    matrix_in_s="709",
)

backend = Backend.TRT(
    fp16=True,
    device_id=0,
    num_streams=2,
)

interpolated_rgb = RIFE(
    clip_rgb,
    model=model,
    backend=backend,
)

out = core.resize.Bicubic(
    interpolated_rgb,
    format=vs.YUV420P10,
    matrix_s="709",
)
out = finalize_clip(out)

src.set_output(0)
out.set_output(1)
