# RIFE / Frame Interpolation (60fps / 120fps)

RIFE (Real-Time Intermediate Flow Estimation) calculates motion vectors between adjacent frames and synthesizes intermediate frames to produce ultra-smooth motion.

!!! important "RIFE is not an Upscaler"
    RIFE does **not** increase image resolution (e.g. 1080p → 4K). It doubles or multiplies temporal framerate (e.g. 24 fps → 48 fps or 60 fps). If you want spatial upscaling, use [AnimeJaNai](animejanai.md) or [Waifu2x](waifu2x.md).

---

## 1. Model Asset & Location

| Model Variant | Relative Path inside `plugins/models/` | Download |
|---|---|:---:|
| **RIFE v4.26 (Recommended)** | `rife_v2/rife_v4.26.onnx` | [:material-download: Download](https://github.com/AmusementClub/vs-mlrt/releases/tag/external-models) |

Confirm that the model file exists on your system:

```powershell
$pluginDir = (py -3.14 -c "import vapoursynth as vs; print(vs.get_plugin_dir())").Trim()
$modelPath = Join-Path $pluginDir "models\rife_v2\rife_v4.26.onnx"
Test-Path $modelPath
```

---

## 2. Complete Python Script (`rife_v4_26.vpy`)

Save this as `rife_v4_26.vpy`:

```python
import vapoursynth as vs
from pathlib import Path
from vssource import BestSource
from vstools import initialize_clip, finalize_clip
from vsmlrt import RIFE, RIFEModel, Backend

core = vs.core

SOURCE = r"C:\path\to\your\input.mp4"

# 1. Load Source Clip
src = BestSource.source(SOURCE)
clip = initialize_clip(src)

# 2. Convert to RGBS Float for Neural Network
clip_rgb = core.resize.Bicubic(clip, format=vs.RGBS, matrix_in_s="709")

# 3. Configure TensorRT GPU Backend
backend = Backend.TRT(
    fp16=True,      # Enables FP16 Tensor Cores
    device_id=0,
    num_streams=2
)

# 4. Run RIFE Frame Interpolation (2x Framerate)
interpolated_rgb = RIFE(
    clip_rgb,
    model=RIFEModel.v4_26,
    backend=backend
)

# 5. Convert back to YUV420P10 (10-bit YUV)
out = core.resize.Bicubic(interpolated_rgb, format=vs.YUV420P10, matrix_s="709")
out = finalize_clip(out)

# 6. Outputs
src.set_output(0)  # Original Framerate (e.g. 23.976 fps)
out.set_output(1)  # Interpolated Framerate (e.g. 47.952 fps)
```

---

## 3. Preview & Render

Verify the doubled frame rate and frame count:

```powershell
vspipe --info rife_v4_26.vpy
```

Preview in VSView:

```powershell
vsview rife_v4_26.vpy
```

Render a test segment (first 100 frames):

```powershell
vspipe --start 0 --end 99 --outputindex 1 --container y4m rife_v4_26.vpy rife_test.y4m
```

---

## 4. Tuning & What to Watch For

- **Scene Cuts:** RIFE v4.26 automatically detects dramatic scene changes to avoid blending two completely different scenes together.
- **Fast Motion & Action:** Review high-speed panning shots and character animation in VSView to verify that thin lines and hands don't exhibit warping artifacts.
- **VRAM Usage:** If VRAM is limited on a 6GB or 8GB GPU, set `num_streams=1` in `Backend.TRT`.
