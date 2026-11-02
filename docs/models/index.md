# Model workflows

Use the model family that matches the job. The most common mistake is choosing a model because its filename contains “2x” or “4x” without checking what it actually does.

## Model selection matrix

| Model family | Main task | Spatial scale | Temporal effect | Best starting point |
|---|---|---:|---|---|
| AnimeJaNai | Anime line-art upscaling | 2× for the audited model | None | [AnimeJaNai workflow](animejanai.md) |
| Waifu2x | Anime/art upscaling and denoising | 1× / 2× / 4× depending on model | None | [Waifu2x workflow](waifu2x.md) |
| RealESRGAN / RealESRGANv2 | Super-resolution and restoration | Model-dependent | None | [Other models](other-models.md) |
| Real-CUGAN / CUGAN | Anime upscaling and denoising | Model-dependent | None | [Other models](other-models.md) |
| DPIR | Denoising / deblocking restoration | Usually restoration, not automatically an upscaler | None | [Other models](other-models.md) |
| SCUNet | Denoising / restoration | Depends on wrapper and model | None | [Other models](other-models.md) |
| RIFE | Frame interpolation | None | Creates intermediate frames | [RIFE workflow](rife.md) |
| ArtCNN | Anime-oriented super-resolution | Model-dependent | None | [Other models](other-models.md) |

## The model/runtime/wrapper relationship

Three independent pieces must agree:

1. **Model file:** the ONNX graph and trained weights.
2. **Runtime plugin:** for example, the MLRT TensorRT plugin exposed as `core.trt`.
3. **Wrapper:** a Python API that prepares frames, selects the model, and calls the runtime.

A model being present on disk does not prove it is compatible with every wrapper. A plugin namespace existing does not prove the model will execute. The final proof is a short inference test.

## Which backend should I choose?

| Backend | Role | Practical guidance |
|---|---|---|
| `Backend.TRT(...)` | NVIDIA TensorRT | First backend to test on the reference RTX 5070 setup. Engine building/caching may make the first run slower. |
| `Backend.TRT_RTX(...)` | TensorRT-RTX | Available in the audited environment. Test it separately; compatibility and performance can vary by model. |
| ORT CUDA | ONNX Runtime CUDA through MLRT | Useful alternative when the model and wrapper support it. |
| CPU backend | Compatibility/debug fallback | Useful to isolate GPU-specific errors, but can be much slower. |

Use the APIs and options that exist in the locally installed wrapper. See [verification](../installation/verification.md#6-check-the-wrapper-that-model-examples-import).

## Model asset directory

The reference setup keeps the external model archive under the VapourSynth plugin directory:

```text
<plugin directory>/models/
├── animejanai/
├── cugan/
├── dpir/
├── RealESRGANv2/
├── rife/
├── rife_v2/
└── waifu2x/
```

Get the directory from Python:

```powershell
py -3.14 -c "import vapoursynth as vs; print(vs.get_plugin_dir())"
```

The model archive is external to this repository. Download it from the [upstream vs-mlrt release](https://github.com/AmusementClub/vs-mlrt/releases/download/v15.16/models.v15.16.7z), then extract its model folders into `<plugin directory>\models`.

## Recommended test order

1. Run the [AnimeJaNai 2× example](animejanai.md), because it follows the JET-native `GenericOnnxScaler` interface.
2. Run [Waifu2x](waifu2x.md) after checking the local `vsmlrt.py` API and enum names.
3. Run [RIFE](rife.md) after verifying that the local wrapper exposes `RIFEModel.v4_26`.
4. Only then experiment with the other model families.

!!! warning "Short clip first"
    Run 48–120 frames before starting a full-length encode. Review image quality, scene cuts, output dimensions, frame rate, VRAM usage and model artifacts.
