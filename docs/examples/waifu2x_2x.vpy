"""Waifu2x 2x anime upscaling example using the local vsmlrt.py wrapper.

Before use, verify that your installed wrapper exposes the selected enum member.
Edit SOURCE before running. This example has not been inference-validated by the
reference environment audit.
"""
import vapoursynth as vs
from pathlib import Path

from vssource import BestSource
from vstools import initialize_clip, finalize_clip
from vsmlrt import Waifu2x, Waifu2xModel, Backend

core = vs.core
SOURCE = Path(r"D:\Video\input.mkv")

if not SOURCE.is_file():
    raise FileNotFoundError(f"Source video not found: {SOURCE}")

# Check this member with dir(Waifu2xModel) on the installed wrapper version.
model = Waifu2xModel.upconv_7_anime_style_art_rgb

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

scaled_rgb = Waifu2x(
    clip_rgb,
    noise=-1,  # no additional denoising
    scale=2,
    model=model,
    backend=backend,
)

out = core.resize.Bicubic(
    scaled_rgb,
    format=vs.YUV420P10,
    matrix_s="709",
)
out = finalize_clip(out)

src.set_output(0)
out.set_output(1)
