# Waifu2x · anime upscaling and denoising

<figure markdown>
  <div class="status-row">
    <span class="status-chip info">Spatial upscaling</span>
    <span class="status-chip info">Optional denoising</span>
    <span class="status-chip warn">Wrapper API must be checked</span>
  </div>
</figure>

Waifu2x is a family of models commonly used for anime and illustration upscaling, with model choices and noise-reduction levels. Its behavior depends on the selected architecture, scale and noise setting. Stronger denoising can remove grain and compression artifacts, but it can also erase thin lines and texture.

## Reference model inventory

The audited model pack contained 39 Waifu2x ONNX files, including model families such as `anime_style_art`, `cunet`, `photo`, `ukbench`, `upconv_7` and `upresnet10`.

The AmusementClub wrapper is model-aware. Prefer its `Waifu2x` function over feeding a Waifu2x ONNX file to a generic scaler without checking the model's input/output contract.

## Check the local wrapper first

The reference machine has `vsmlrt.py` version `4.1.1+api4.jetfix2`. The upstream wrapper evolves independently, so inspect the installed enum and function signature:

```powershell
@'
import inspect
from vsmlrt import Waifu2x, Waifu2xModel, Backend

print("Waifu2x signature:", inspect.signature(Waifu2x))
print("Available models:")
for name in dir(Waifu2xModel):
    if not name.startswith("_"):
        print(" ", name)
print("TRT backend:", inspect.signature(Backend.TRT))
'@ | py -3.14 -
```

Confirm that `Waifu2xModel.upconv_7_anime_style_art_rgb` exists before using the example below. If your wrapper exposes a different name, use a model identifier that is present in the local enum; do not copy an enum name from another version.

## Example script

[View or copy `examples/waifu2x_2x.vpy`](../examples/waifu2x_2x.vpy)

```python
import vapoursynth as vs
from pathlib import Path

from vssource import BestSource
from vstools import initialize_clip, finalize_clip
from vsmlrt import Waifu2x, Waifu2xModel, Backend

core = vs.core
SOURCE = Path(r"D:\Video\input.mkv")

if not SOURCE.is_file():
    raise FileNotFoundError(f"Source video not found: {SOURCE}")

# Confirm this enum member exists in your local vsmlrt.py first.
MODEL = Waifu2xModel.upconv_7_anime_style_art_rgb

src = BestSource.source(str(SOURCE))
clip = initialize_clip(src)

# Assumes BT.709 input; adapt to the source's actual color metadata.
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
    model=MODEL,
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
```

## Tune denoising conservatively

The example uses `noise=-1`, which requests no additional denoising. If the source is noisy, the wrapper may expose levels such as `0`, `1`, `2` and `3`; check the local function signature and model docs before changing it.

| Source condition | Starting point | What to inspect |
|---|---|---|
| Clean digital source | `noise=-1` | Line fidelity and edge halos. |
| Mild compression noise | A low denoise setting | Fine hair, eyelashes, subtitles and thin lines. |
| Heavy noise / damaged source | Test a stronger setting on crops | Texture loss, waxy surfaces and lost grain. |

## Render a short test

```powershell
vspipe --start 0 --end 95 --outputindex 1 --container y4m `
  .\docs\examples\waifu2x_2x.vpy .\waifu2x_test.y4m
```

The example is an API-aligned template based on the wrapper interface recorded in the guide. The environment audit did not execute Waifu2x inference; validate the selected model enum and run a short render on the target machine.
