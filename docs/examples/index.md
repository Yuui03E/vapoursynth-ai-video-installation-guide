# Ready-to-Use VapourSynth Scripts

This section provides complete, tested, and copy-paste-ready `.vpy` script templates for AI upscaling and frame interpolation.

Each script configures two output clips:
- **Output 0 (`src.set_output(0)`):** Original source video (unprocessed).
- **Output 1 (`out.set_output(1)`):** AI-processed video.

When previewing in **VSView**, you can simply press `1` and `2` on your keyboard to instantly compare before and after frames.

---

## 1. Test Script: AnimeJaNai 2× Upscaling (`test.vpy`)

This is the primary test script recommended for verifying your setup. It uses the high-performance **AnimeJaNai HD V3 Compact** ONNX model powered by **TensorRT FP16**.

Save this as `test.vpy`:

```python
import vapoursynth as vs
from pathlib import Path
from vssource import BestSource
from vstools import initialize_clip, finalize_clip
from vsscale import GenericOnnxScaler
from vsscale.mlrt import Backend

core = vs.core

# -------------------------------------------------------------------------
# 1. Configuration & File Paths
# -------------------------------------------------------------------------
# Path to your input video:
SOURCE_PATH = r"C:\path\to\your\input_video.mp4"

# Dynamically find the model in your VapourSynth plugins folder:
MODEL_PATH = (
    Path(vs.get_plugin_dir())
    / "models"
    / "animejanai"
    / "2x_AnimeJaNai_HD_V3_Compact.onnx"
)

# -------------------------------------------------------------------------
# 2. Load the source clip with BestSource
# -------------------------------------------------------------------------
src = BestSource.source(SOURCE_PATH)
clip = initialize_clip(src)

# -------------------------------------------------------------------------
# 3. Configure the TensorRT GPU Backend
# -------------------------------------------------------------------------
trt_backend = Backend.TRT(
    fp16=True,             # Half-precision for massive speedup & lower VRAM
    device_id=0,           # First NVIDIA GPU
    num_streams=2,         # Concurrent CUDA streams for optimal throughput
    use_cuda_graph=True    # Minimizes CPU launch latency
)

# -------------------------------------------------------------------------
# 4. Color conversion: RGBS float for neural network input
# -------------------------------------------------------------------------
# Neural networks expect normalized RGB (RGBS format)
clip_rgb = core.resize.Bicubic(clip, format=vs.RGBS, matrix_in_s="709")

# -------------------------------------------------------------------------
# 5. Run AI Upscaling (2x)
# -------------------------------------------------------------------------
upscaled_rgb = GenericOnnxScaler(
    model=str(MODEL_PATH),
    backend=trt_backend
).scale(clip_rgb)

# -------------------------------------------------------------------------
# 6. Convert back to YUV420P10 (10-bit YUV) for video encoding
# -------------------------------------------------------------------------
out = core.resize.Bicubic(upscaled_rgb, format=vs.YUV420P10, matrix_s="709")
out = finalize_clip(out)

# -------------------------------------------------------------------------
# 7. Set Dual Outputs for comparison
# -------------------------------------------------------------------------
src.set_output(0)   # Press 1 in VSView to view original
out.set_output(1)   # Press 2 in VSView to view upscaled result
```

---

## 2. Frame Interpolation: RIFE v4.26 (`rife.vpy`)

RIFE interpolates motion between existing frames, doubling the framerate (e.g., 23.976 fps → 47.952 fps or 30 fps → 60 fps).

Save this as `rife.vpy`:

```python
import vapoursynth as vs
from pathlib import Path
from vssource import BestSource
from vstools import initialize_clip, finalize_clip
from vsmlrt import RIFE, RIFEModel, Backend

core = vs.core

SOURCE_PATH = r"C:\path\to\your\input_video.mp4"

# 1. Load source video
src = BestSource.source(SOURCE_PATH)
clip = initialize_clip(src)

# 2. Convert to RGBS float
clip_rgb = core.resize.Bicubic(clip, format=vs.RGBS, matrix_in_s="709")

# 3. Configure TensorRT backend
trt_backend = Backend.TRT(
    fp16=True,
    device_id=0,
    num_streams=2
)

# 4. Run RIFE v4.26 motion interpolation
interpolated_rgb = RIFE(
    clip_rgb,
    model=RIFEModel.v4_26,
    backend=trt_backend
)

# 5. Convert back to 10-bit YUV
out = core.resize.Bicubic(interpolated_rgb, format=vs.YUV420P10, matrix_s="709")
out = finalize_clip(out)

src.set_output(0)
out.set_output(1)
```

---

## 3. Denoising & Upscaling: Waifu2x (`waifu2x.vpy`)

Ideal for restoring older compressed anime or reducing heavy JPEG/MPEG compression artifacts.

Save this as `waifu2x.vpy`:

```python
import vapoursynth as vs
from pathlib import Path
from vssource import BestSource
from vstools import initialize_clip, finalize_clip
from vsmlrt import Waifu2x, Waifu2xModel, Backend

core = vs.core

SOURCE_PATH = r"C:\path\to\your\input_video.mp4"

src = BestSource.source(SOURCE_PATH)
clip = initialize_clip(src)

clip_rgb = core.resize.Bicubic(clip, format=vs.RGBS, matrix_in_s="709")

trt_backend = Backend.TRT(
    fp16=True,
    device_id=0,
    num_streams=2
)

# Scale by 2x with mild denoising (noise levels: -1=none, 0=weak, 1=medium, 2=strong, 3=maximum)
scaled_rgb = Waifu2x(
    clip_rgb,
    noise=1,
    scale=2,
    model=Waifu2xModel.upconv_7_anime_style_art_rgb,
    backend=trt_backend
)

out = core.resize.Bicubic(scaled_rgb, format=vs.YUV420P10, matrix_s="709")
out = finalize_clip(out)

src.set_output(0)
out.set_output(1)
```

---

## 4. How to Run & Preview Scripts

### Quick Evaluation (Check for errors)
Verify the script syntax and inspect output dimensions without rendering:

```powershell
vspipe --info test.vpy
```

### Interactive Preview (VSView)
Open the script in VSView to inspect frames and zoom in on details:

```powershell
vsview test.vpy
```

- Press `1`: Switch to Output 0 (Original clip).
- Press `2`: Switch to Output 1 (AI Processed clip).
- Press `Space`: Play/Pause playback.

### Render & Encode to MP4 (FFmpeg NVENC)
Stream the output from `vspipe` directly into FFmpeg for hardware-accelerated HEVC encoding:

```powershell
vspipe -c y4m test.vpy - | ffmpeg -i - -c:v hevc_nvenc -preset p7 -cq 18 -c:a copy output_upscaled.mp4
```
