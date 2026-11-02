# Validation status

A useful installation guide must say exactly what has been proven. This project does not use “installed”, “loaded” and “working” as interchangeable terms.

## Reference audit results

| Item | Evidence from audit | Status |
|---|---|---|
| Python 3.14.10 x64 | Executable and architecture inspected | Verified |
| VapourSynth R81 / API R4.3 | Import and core initialization succeeded | Verified |
| `vspipe` | Version output captured | Verified |
| JET imports | `BestSource`, `initialize_clip`, `finalize_clip`, `GenericOnnxScaler`, `Backend` imported | Verified |
| `pip check` | `No broken requirements found` | Verified |
| `core.trt` | Namespace available | Verified loaded |
| `core.trt_rtx` | Namespace available | Verified loaded |
| `core.ort` | Namespace available | Verified loaded |
| `core.bs` | Namespace available | Verified loaded |
| `vsmlrt.py` | Exact file path, version, size and SHA-256 inspected | Verified present |
| AnimeJaNai ONNX | File, size and SHA-256 inspected | Verified present |
| RIFE v4.26 ONNX | File, size and SHA-256 inspected | Verified present |
| All 76 ONNX files | Directory inventory completed | Files inventoried |
| AnimeJaNai inference | Not executed in the audit | Not yet validated by audit |
| Waifu2x inference | Not executed in the audit | Not yet validated by audit |
| RIFE inference | Not executed in the audit | Not yet validated by audit |
| Full encode and output review | Not executed in the audit | Not yet validated by audit |

## Why namespace checks are not enough

A `True` result from `hasattr(vs.core, "trt")` establishes that VapourSynth exposes the TensorRT plugin namespace. It does not prove that:

- the selected ONNX model is supported by the runtime;
- every required model operator is implemented;
- the model's input dimensions and dynamic shape profile are accepted;
- TensorRT can build an engine for the target GPU and driver;
- the model wrapper uses the correct color format and normalization;
- the available VRAM is sufficient for the requested frame size and tile configuration.

These checks require a short inference run.

## Model validation record template

When a client verifies a model, record the details below in the issue, project notes or a private deployment manifest.

| Field | Value to record |
|---|---|
| Model name / variant | e.g. AnimeJaNai Compact 2× |
| Model file | Relative path under `models/` |
| SHA-256 | File hash |
| Wrapper | `vsscale` or `vsmlrt.py` plus version |
| Backend | `TRT`, `TRT_RTX`, ORT CUDA, etc. |
| GPU and driver | Exact device and driver |
| Input sample | Codec, dimensions, FPS, color metadata, frame range |
| Output | Dimensions, FPS, format, bit depth |
| Inference result | Pass / fail and full error text |
| Visual QA | Line fidelity, texture, artifacts, scene cuts |

## Update policy

Do not change the reference version matrix after a package upgrade until the following are rechecked:

1. The package imports.
2. The plugin namespace loads without warnings/errors.
3. The relevant model file exists and has a recorded hash.
4. A short inference test completes.
5. Output properties and visual quality are checked.

Only then should the new combination be called a tested baseline.
