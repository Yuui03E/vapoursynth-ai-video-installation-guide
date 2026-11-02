# Example scripts

These are starter `.vpy` scripts that can be opened in VSView or evaluated with VSPipe. Each script sets two outputs: output 0 is the original clip, and output 1 is the processed clip.

| Script | Purpose | API |
|---|---|---|
| [AnimeJaNai 2×](animejanai_2x.vpy) | Upscale anime frames by 2× using the audited AnimeJaNai Compact ONNX file. | JET `vsscale.GenericOnnxScaler` |
| [Waifu2x 2×](waifu2x_2x.vpy) | Anime-oriented upscaling with optional denoising. | Local `vsmlrt.py` wrapper |
| [RIFE v4.26](rife_v4_26.vpy) | Frame interpolation with RIFE v4.26. | Local `vsmlrt.py` wrapper |
| [Inspect `vsmlrt.py`](inspect_vsmlrt_api.py) | Print installed wrapper version, signatures and model enums. | Python diagnostic |

## Before running

1. Open the script and change `SOURCE` to an existing video path.
2. Confirm the required model file exists under the plugin `models` directory.
3. Confirm the local wrapper exposes the model enum used by the Waifu2x/RIFE scripts.
4. Run `vspipe --info` against the script.
5. Render a short range before processing the full video.

!!! warning "Templates are not universal presets"
    The examples assume BT.709 input matrix coefficients. Adapt color conversion to the actual source metadata. Waifu2x and RIFE model-enum names must exist in the installed `vsmlrt.py` version. The 2 November 2026 audit verified imports and assets, but did not run full model inference.
