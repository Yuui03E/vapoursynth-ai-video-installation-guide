# AnimeJaNai / 2× Anime Upscaling

AnimeJaNai is an ultra-fast, high-quality neural network designed specifically for anime line-art upscaling. The **Compact** variant delivers near-instant inference when paired with TensorRT FP16.

---

## 1. Model Asset & Location

| Model Variant | Relative Path inside `plugins/models/` | Download |
|---|---|:---:|
| **Compact HD V3 (Recommended)** | `animejanai/2x_AnimeJaNai_HD_V3_Compact.onnx` | [:material-download: Download](https://github.com/AmusementClub/vs-mlrt/releases/tag/external-models) |
| **UltraCompact HD V3** | `animejanai/2x_AnimeJaNai_HD_V3_UltraCompact.onnx` | [:material-download: Download](https://github.com/AmusementClub/vs-mlrt/releases/tag/external-models) |

Verify the model file exists on your system:

```powershell
$pluginDir = (py -3.14 -c "import vapoursynth as vs; print(vs.get_plugin_dir())").Trim()
$modelPath = Join-Path $pluginDir "models\animejanai\2x_AnimeJaNai_HD_V3_Compact.onnx"
Test-Path $modelPath
```

---

## 2. Complete Python Script (`animejanai_2x.vpy`)

Save this as `animejanai_2x.vpy`:

```python
import vapoursynth as vs
from pathlib import Path
from vssource import BestSource
from vstools import initialize_clip, finalize_clip
from vsscale import GenericOnnxScaler
from vsscale.mlrt import Backend

core = vs.core

# 1. Paths
SOURCE = r"C:\path\to\your\input.mp4"
MODEL = (
    Path(vs.get_plugin_dir())
    / "models"
    / "animejanai"
    / "2x_AnimeJaNai_HD_V3_Compact.onnx"
)

# 2. Source Loading with BestSource
src = BestSource.source(SOURCE)
clip = initialize_clip(src)

# 3. Configure TensorRT GPU Backend
backend = Backend.TRT(
    fp16=True,             # Half precision for maximum FPS & lower VRAM
    device_id=0,           # Target NVIDIA GPU
    num_streams=2,         # Concurrent CUDA streams
    use_cuda_graph=True    # Accelerates kernel launches
)

# 4. Color Conversion (RGBS 32-bit Float)
# Note: For BT.709 HD video, use matrix_in_s="709". For SD/DVD (BT.601), use matrix_in_s="170m".
clip_rgb = core.resize.Bicubic(clip, format=vs.RGBS, matrix_in_s="709")

# 5. Run 2x Upscaler
scaler = GenericOnnxScaler(
    model=str(MODEL),
    backend=backend
)
upscaled_rgb = scaler.scale(clip_rgb)

# 6. Convert back to 10-bit YUV for output
out = core.resize.Bicubic(upscaled_rgb, format=vs.YUV420P10, matrix_s="709")
out = finalize_clip(out)

# 7. Outputs
src.set_output(0)  # Original
out.set_output(1)  # Upscaled
```

!!! note "Color Matrix Handling"
    `matrix_in_s="709"` is designed for HD (720p/1080p) web and Blu-ray content. If upscaling standard definition (480p/576p DVD) content, use `matrix_in_s="170m"`. See [Troubleshooting: Washed-Out Colors](../troubleshooting/index.md#7-washed-out-colors-or-inaccurate-saturation).

---

## 3. Preview & Benchmark

Preview in VSView:

```powershell
vsview animejanai_2x.vpy
```

Check output resolution with `vspipe`:

```powershell
vspipe --info animejanai_2x.vpy
```

Render a test segment (first 100 frames):

```powershell
vspipe --start 0 --end 99 --outputindex 1 --container y4m animejanai_2x.vpy test_out.y4m
```
