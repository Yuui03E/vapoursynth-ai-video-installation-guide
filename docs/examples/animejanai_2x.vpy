"""AnimeJaNai Compact ONNX 2x upscaling example.

Edit SOURCE before running. This example uses the JET vsscale API.
"""
import vapoursynth as vs
from pathlib import Path

from vssource import BestSource
from vstools import initialize_clip, finalize_clip
from vsscale import GenericOnnxScaler
from vsscale.mlrt import Backend

core = vs.core

SOURCE = Path(r"D:\Video\input.mkv")
MODEL = (
    Path(vs.get_plugin_dir())
    / "models"
    / "animejanai"
    / "2x_AnimeJaNai_HD_V3_Compact.onnx"
)

if not SOURCE.is_file():
    raise FileNotFoundError(f"Source video not found: {SOURCE}")
if not MODEL.is_file():
    raise FileNotFoundError(f"AnimeJaNai ONNX model not found: {MODEL}")

src = BestSource.source(str(SOURCE))
clip = initialize_clip(src)

backend = Backend.TRT(
    fp16=True,
    device_id=0,
    num_streams=2,
    use_cuda_graph=True,
)

# Assumption: the source uses the BT.709 YUV matrix.
# Inspect the source metadata and change this for non-BT.709 content.
clip_rgb = core.resize.Bicubic(
    clip,
    format=vs.RGBS,
    matrix_in_s="709",
)

scaler = GenericOnnxScaler(
    model=str(MODEL),
    backend=backend,
)
upscaled_rgb = scaler.scale(clip_rgb)

out = core.resize.Bicubic(
    upscaled_rgb,
    format=vs.YUV420P10,
    matrix_s="709",
)
out = finalize_clip(out)

# Output 0: original. Output 1: processed.
src.set_output(0)
out.set_output(1)
