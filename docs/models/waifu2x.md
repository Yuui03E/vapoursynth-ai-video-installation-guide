# Waifu2x / Upscaling & Denoising

Waifu2x is a time-tested model family designed for 2D illustration and anime upscaling with adjustable noise-reduction levels.

---

## 1. Model Asset & Location

Waifu2x models are included in the base **`models.v15.16.7z`** archive under the `waifu2x/` subfolder.

Key model architectures included:
- `upconv_7_anime_style_art_rgb`: Classic, sharp, reliable for 2D anime.
- `cunet`: High-quality convolutional neural network with fine texture handling.

Verify the model path:

```powershell
$pluginDir = (py -3.14 -c "import vapoursynth as vs; print(vs.get_plugin_dir())").Trim()
$modelDir = Join-Path $pluginDir "models\waifu2x"
Test-Path $modelDir
```

---

## 2. Complete Python Script (`waifu2x_2x.vpy`)

Save this as `waifu2x_2x.vpy`:

```python
import vapoursynth as vs
from pathlib import Path
from vssource import BestSource
from vstools import initialize_clip, finalize_clip
from vsmlrt import Waifu2x, Waifu2xModel, Backend

core = vs.core

SOURCE = r"C:\path\to\your\input.mp4"

# 1. Load source video
src = BestSource.source(SOURCE)
clip = initialize_clip(src)

# 2. Convert to RGBS 32-bit float
clip_rgb = core.resize.Bicubic(clip, format=vs.RGBS, matrix_in_s="709")

# 3. Configure TensorRT backend
backend = Backend.TRT(
    fp16=True,
    device_id=0,
    num_streams=2
)

# 4. Run Waifu2x (2x scale, noise level 1)
# Noise levels: -1 = None, 0 = Low, 1 = Medium, 2 = High, 3 = Maximum
scaled_rgb = Waifu2x(
    clip_rgb,
    noise=1,
    scale=2,
    model=Waifu2xModel.upconv_7_anime_style_art_rgb,
    backend=backend
)

# 5. Convert back to 10-bit YUV
out = core.resize.Bicubic(scaled_rgb, format=vs.YUV420P10, matrix_s="709")
out = finalize_clip(out)

src.set_output(0)
out.set_output(1)
```

---

## 3. Recommended Noise Levels

| Noise Setting | Best For | Visual Effect |
|:---:|---|---|
| `noise = -1` | Clean digital animation | Upscaling only, preserves 100% of original texture and grain. |
| `noise = 0` / `1` | Mild compression or web streaming artifacts | Cleans up faint JPEG/MPEG macroblocking around high-contrast edges. |
| `noise = 2` / `3` | Heavy vintage compression (e.g. old 480p videos) | Aggressive artifact removal; inspect closely to avoid waxy skin texture. |

---

## 4. Preview & Test

```powershell
# Interactive preview
vsview waifu2x_2x.vpy

# Render short test clip
vspipe --start 0 --end 99 --outputindex 1 --container y4m waifu2x_2x.vpy waifu2x_test.y4m
```
