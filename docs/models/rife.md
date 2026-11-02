# RIFE · frame interpolation

<figure markdown>
  <div class="status-row">
    <span class="status-chip info">Temporal processing</span>
    <span class="status-chip good">RIFE v4.26 model file present in reference audit</span>
    <span class="status-chip warn">Enum and inference require local validation</span>
  </div>
</figure>

RIFE (Real-Time Intermediate Flow Estimation) generates intermediate frames between existing frames. It is used to increase frame cadence and make motion appear smoother.

**RIFE does not increase spatial resolution.** Use AnimeJaNai, Waifu2x or another super-resolution model when the goal is 1080p → 4K.

## Reference model asset

| Property | Audited value |
|---|---|
| Relative path | `rife_v2/rife_v4.26.onnx` |
| File size | 22,748,049 bytes (about 21.69 MiB) |
| SHA-256 | `af25762dfec02a4bbb949decea63988b01fa56c46c0ff9dc66ac8e2f12cbb661` |

Verify it exists:

```powershell
$pluginDir = (py -3.14 -c "import vapoursynth as vs; print(vs.get_plugin_dir())").Trim()
$model = Join-Path $pluginDir "models\rife_v2\rife_v4.26.onnx"
Test-Path $model
Get-FileHash $model -Algorithm SHA256
```

## Check the local RIFE API

The exact model enum is wrapper-version-dependent. Inspect the local module before running the template:

```powershell
@'
import inspect
from vsmlrt import RIFE, RIFEModel, Backend

print("RIFE signature:", inspect.signature(RIFE))
print("Available RIFE models:")
print([name for name in dir(RIFEModel) if name.startswith("v4_")])
print("TRT backend:", inspect.signature(Backend.TRT))
'@ | py -3.14 -
```

For the reference script below, `RIFEModel.v4_26` must appear in that list. If it does not, do not substitute a random nearby enum. Confirm the matching model/wrapper release first.

## Example script

[View or copy `examples/rife_v4_26.vpy`](../examples/rife_v4_26.vpy)

```python
import vapoursynth as vs
from pathlib import Path

from vssource import BestSource
from vstools import initialize_clip, finalize_clip
from vsmlrt import RIFE, RIFEModel, Backend

core = vs.core
SOURCE = Path(r"D:\Video\input.mkv")

if not SOURCE.is_file():
    raise FileNotFoundError(f"Source video not found: {SOURCE}")

# Confirm RIFEModel.v4_26 exists in the installed wrapper.
model = RIFEModel.v4_26

src = BestSource.source(str(SOURCE))
clip = initialize_clip(src)

# RIFE expects RGB input in this wrapper workflow.
# This matrix assumption must match the source metadata.
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
```

## Check the actual output cadence

For a simple 2× interpolation workflow, a 23.976 fps input may produce approximately 47.952 fps output. Do not infer the final frame rate from the model name alone. Inspect the output node and render a short segment.

```powershell
vspipe --info .\docs\examples\rife_v4_26.vpy
vspipe --start 0 --end 95 --outputindex 1 --container y4m `
  .\docs\examples\rife_v4_26.vpy .\rife_test.y4m
```

## Inspect difficult scenes

Frame interpolation estimates motion; it does not know the true hidden frame. Carefully review:

- Scene cuts and flashes.
- Fast motion and motion blur.
- Occlusion (an object moving in front of another).
- Repeated animation frames and variable-frame-rate content.
- Subtitles, thin lines and high-contrast patterns.

The environment audit confirmed that the RIFE v4.26 model file exists and the MLRT namespaces are available. It did not perform RIFE inference. Treat the script as a template until the target machine successfully renders and validates a short clip.
