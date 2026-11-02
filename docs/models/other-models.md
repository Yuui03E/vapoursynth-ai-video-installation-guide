# Other ONNX model families

The model archive includes more than AnimeJaNai, Waifu2x and RIFE. This page explains how to choose the next model without pretending every ONNX file can be passed to the same function.

## Model family overview

| Family | Typical purpose | Notes |
|---|---|---|
| RealESRGANv2 | Super-resolution/restoration, including anime-oriented variants | Use the matching RealESRGANv2 wrapper and model enum. Model variants can have different scale factors and input requirements. |
| CUGAN / Real-CUGAN | Anime image upscaling and denoising | Supports model-specific scales/noise settings. Use the CUGAN wrapper and settings documented for that release. |
| DPIR | Denoising and deblocking | Restoration model; not every DPIR model is an upscaler. Choose the correct color/grayscale and deblocking variant. |
| SCUNet | Image denoising/restoration | Useful as a restoration stage when the source needs it. Check whether the wrapper expects RGB or another format. |
| ArtCNN | Anime-oriented super-resolution | Use its specific wrapper and model variant. |
| NCNN models | GPU inference through Vulkan | The audited environment exposes `core.ncnn`; availability of a plugin does not mean every model/runtime path is interchangeable. |

## Why generic ONNX scaling is not universal

`GenericOnnxScaler` can be appropriate when the model's input/output tensor layout, dimensions, normalization, color format and scale behavior match what the generic scaler expects.

Many model wrappers perform additional steps, such as:

- Choosing a named model variant.
- Converting between RGB and YUV.
- Normalizing input values.
- Splitting a frame into tiles and blending overlaps.
- Applying denoising strength or scale parameters.
- Handling output shape and padding.

For those models, use the model-aware API from the matching `vsmlrt.py` or JET module. Read the installed function signature and the model's upstream documentation before writing a `.vpy` script.

## Explore the installed wrapper

```powershell
@'
import inspect
import vsmlrt

print("Wrapper:", vsmlrt.__file__)
print("Version:", getattr(vsmlrt, "__version__", "unknown"))

names = (
    "RealESRGAN", "RealESRGANModel", "RealESRGANv2", "RealESRGANv2Model",
    "CUGAN", "DPIR", "DPIRModel", "SCUNet", "SCUNetModel", "ArtCNN", "ArtCNNModel",
)

for name in names:
    obj = getattr(vsmlrt, name, None)
    if obj is None:
        continue
    print("\n", name, ":", obj)
    try:
        print("Signature:", inspect.signature(obj))
    except (TypeError, ValueError):
        pass
    if name.endswith("Model"):
        print("Members:", [x for x in dir(obj) if not x.startswith("_")])
'@ | py -3.14 -
```

## Safe workflow for a new model

1. Confirm the ONNX file exists and record its file hash.
2. Identify the model family and intended task from the upstream project.
3. Find the wrapper function and signature in the exact installed version.
4. Confirm expected pixel format, bit depth, normalization, dimensions and scale.
5. Start with one frame or a short clip.
6. Verify graph construction, backend selection and actual inference.
7. Compare the result against the original at 100% zoom.

!!! tip "Preserve the tested baseline"
    Experiment in a separate Python virtual environment or clone of the known-good package environment when possible. Do not update all GPU packages just to test one model. Record the package versions and model hash that produced a valid result.

## Upstream references

- [AmusementClub vs-mlrt](https://github.com/AmusementClub/vs-mlrt)
- [vs-mlrt model and usage wiki](https://github.com/AmusementClub/vs-mlrt/wiki)
- [JET / vsscale documentation](https://jaded-encoding-thaumaturgy.github.io/vs-jetpack/)
