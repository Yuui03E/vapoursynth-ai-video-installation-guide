# AnimeJaNai · 2× anime upscaling

<figure markdown>
  <div class="status-row">
    <span class="status-chip info">Spatial upscaling</span>
    <span class="status-chip good">Model file present in reference audit</span>
    <span class="status-chip warn">Full inference not part of audit</span>
  </div>
</figure>

AnimeJaNai is the first model workflow to try in this guide. The reference model file is `2x_AnimeJaNai_HD_V3_Compact.onnx`, stored under `models\animejanai`.

## Reference model asset

| Property | Audited value |
|---|---|
| Relative path | `animejanai/2x_AnimeJaNai_HD_V3_Compact.onnx` |
| File size | 2,410,129 bytes (about 2.30 MiB) |
| SHA-256 | `053178394c0962bab3c2a6d3262d6d96a1a944eee2fcad31cad7ec22034a8898` |
| Expected spatial scale | 2× |

Verify it exists:

```powershell
$pluginDir = (py -3.14 -c "import vapoursynth as vs; print(vs.get_plugin_dir())").Trim()
$model = Join-Path $pluginDir "models\animejanai\2x_AnimeJaNai_HD_V3_Compact.onnx"
Test-Path $model
Get-FileHash $model -Algorithm SHA256
```

## Example script

The script uses JET's `GenericOnnxScaler` and `Backend.TRT`. It uses a dynamic model path, so it does not depend on a specific Windows username or Python install location.

[View or copy `examples/animejanai_2x.vpy`](../examples/animejanai_2x.vpy)

```python
import vapoursynth as vs
from pathlib import Path

from vssource import BestSource
from vstools import initialize_clip, finalize_clip
from vsscale import GenericOnnxScaler
from vsscale.mlrt import Backend

core = vs.core

# Change this path to your source video.
SOURCE = Path(r"D:\Video\input.mkv")

# Resolve the model folder from this Python/VapourSynth installation.
MODEL = (
    Path(vs.get_plugin_dir())
    / "models"
    / "animejanai"
    / "2x_AnimeJaNai_HD_V3_Compact.onnx"
)

if not SOURCE.is_file():
    raise FileNotFoundError(f"Source video not found: {SOURCE}")
if not MODEL.is_file():
    raise FileNotFoundError(f"ONNX model not found: {MODEL}")

src = BestSource.source(str(SOURCE))
clip = initialize_clip(src)

backend = Backend.TRT(
    fp16=True,
    device_id=0,
    num_streams=2,
    use_cuda_graph=True,
)

# This matrix setting assumes the source is BT.709.
# Inspect and change it for other color spaces.
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

# Convert to 10-bit YUV 4:2:0 for a typical video encode.
# Set matrix_s to match the intended output color metadata.
out = core.resize.Bicubic(
    upscaled_rgb,
    format=vs.YUV420P10,
    matrix_s="709",
)
out = finalize_clip(out)

# Output 0 = source; Output 1 = upscaled result.
src.set_output(0)
out.set_output(1)
```

!!! note "Color matrix is a source-dependent choice"
    `matrix_in_s="709"` is suitable only when the source's matrix is BT.709. Do not blindly apply it to every DVD, SD anime, HDR source or file with different color metadata. Read [Color and frame formats](../workflows/color-and-formats.md).

## Preview the result

Use VSView and select output index 1, or ask VSPipe for script information:

```powershell
vspipe --info .\docs\examples\animejanai_2x.vpy
```

Render a small frame range before processing the entire source:

```powershell
vspipe --start 0 --end 95 --outputindex 1 --container y4m `
  .\docs\examples\animejanai_2x.vpy .\animejanai_test.y4m
```

The frame range is inclusive. This command writes 96 frames to a test Y4M file; it does not encode or mux audio.

## Expected result

For a compatible 2× model contract, a 1920 × 1080 input should produce a 3840 × 2160 image. Confirm the actual output dimensions with `vspipe --info` or the previewer rather than assuming the graph succeeded merely because the script imported.

## Troubleshooting

- **Model not found:** check the model path and avoid `models\models\...` double nesting.
- **TensorRT engine/build error:** capture the complete error; test a short clip and verify the model/backend pairing.
- **Out of memory:** close other GPU applications and reduce tile size only if the scaler API exposes an appropriate tiling option.
- **Unexpected colors:** verify source matrix, transfer, primaries and range before changing conversion settings.
