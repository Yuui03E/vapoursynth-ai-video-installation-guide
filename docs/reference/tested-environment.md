# Tested reference environment

This page records the environment audit generated on **2 November 2026**. It is a snapshot of one Windows PC, not a universal compatibility promise.

## Hardware

| Component | Audited value |
|---|---|
| Operating system | Windows 11 x64 |
| CPU | AMD Ryzen 9 9950X · 16 cores / 32 threads |
| GPU | NVIDIA GeForce RTX 5070 |
| GPU memory | 12,227 MiB (about 12 GB) |
| NVIDIA driver | 617.14 |
| Driver-reported CUDA UMD version | 13.4 |

## Python and VapourSynth

| Component | Audited value | Status |
|---|---:|---|
| CPython | 3.14.10 · 64-bit | Import verified |
| pip | 26.2.2 | Available |
| VapourSynth | R81 | Import verified |
| VapourSynth API | R4.3 | Detected |
| Plugin directory | `<Python314>\Lib\site-packages\vapoursynth\plugins` | Resolved dynamically |
| VSPipe | R81 / API R4.3 | Version command verified |

## JET packages and filtering ecosystem

| Component | Audited value | Status / notes |
|---|---:|---|
| `vsjetpack` | 2.2.6 | Installed |
| `vstools` | 3.2.0 (module version) | Imported |
| BestSource | 23 | `core.bs` available |
| VSView | 0.14.0 | Installed |
| VSRepo | 2.0.0 | Installed; optional utility |
| vsjetengine | 2.0.0 | Installed |
| vsnoise | 1.3 | Installed |
| vspackrgb | 2.0.0 | Installed |
| vsstubs | 3.0.1 | Installed |
| vs-placebo | 2.0.4 | Installed |
| `vapoursynth-bm3d` | 12.0 | `core.bm3d` available |

JET provides the higher-level Python modules used by the examples, including `vssource`, `vstools` and `vsscale`.

## NVIDIA and MLRT runtime components

| Component | Audited value | Delivery / status |
|---|---:|---|
| MLRT TensorRT plugin | 17.1 | `core.trt` available |
| MLRT TensorRT-RTX plugin | 17.1 | `core.trt_rtx` available |
| MLRT ONNX Runtime plugin | 17.1.1 | `core.ort` available |
| MLRT OpenVINO plugin | 17.1 | `core.ov` available |
| MLRT NCNN plugin | 17.1 | `core.ncnn` available |
| TensorRT Python wheel | 11.4.0.106 | `tensorrt_cu13` |
| TensorRT-RTX Python wheel | 1.7.1.116 | `tensorrt_rtx_cu13` |
| CUDA runtime wheel | 13.4.92 | Python package |
| cuBLAS | 13.8.0.4 | Python package |
| cuDNN cu13 | 9.27.0.42 | Python package |
| ONNX Runtime bundled with MLRT | 1.31.0 | Plugin-local native runtime |
| DirectML bundled with MLRT | 1.15.4 | Plugin-local native runtime |
| CUDA Python bindings | 13.4.4 | Python packages |

### What was not installed

- No standalone CUDA Toolkit or `nvcc` was found.
- No `CUDA_PATH` environment configuration was found.
- No separate `onnxruntime` / `onnxruntime-gpu` Python package was used by the audited MLRT route.

This is intentional for this wheel-based installation path. The NVIDIA display driver remains a required system prerequisite. Do not equate driver-reported CUDA support with a system-wide CUDA Toolkit installation.

## MLRT namespace test

The audit ran the following test successfully:

```python
import vapoursynth as vs
core = vs.core

print("TRT:", hasattr(core, "trt"))
print("TRT RTX:", hasattr(core, "trt_rtx"))
print("ORT:", hasattr(core, "ort"))
print("BestSource:", hasattr(core, "bs"))
```

All four returned `True`.

## Plugin inventory summary

| Audit item | Result |
|---|---:|
| Loaded plugin namespaces | 42 |
| Plugin DLL files on disk | 62 |
| Loaded plugin DLLs exporting API 4 initialization | 42 / 42 |
| Legacy API 3 plugin DLLs | 0 |
| Plugin load errors in captured VapourSynth log | 0 |

The audit found package metadata for three optional plugins whose payload DLLs were absent:

- `vapoursynth-bilateralgpu` 15
- `vapoursynth-bm3dcpu` 2.17
- `vapoursynth-bm3dcuda` 2.17

Their absence did not prevent the audited environment from loading its active plugin set. BM3D functionality is provided by the separate `vapoursynth-bm3d` 12.0 package (`core.bm3d`). Do not delete random DLLs or attempt to repair these packages unless a workflow actually needs them.

## Wrapper file

| Property | Audited value |
|---|---|
| Module | `vsmlrt.py` |
| Version string | `4.1.1+api4.jetfix2` |
| Location | `<Python314>\Lib\site-packages\vsmlrt.py` |
| Size | 125,155 bytes |
| SHA-256 | `a22b428f316c33574ee74b7687d1b77398ed79d56d7bba6e257c8ae5c2199903` |
| Second copy in `<Python314>\Lib` | Not present |

The module is a Python wrapper; it is not a driver, model, TensorRT engine or plugin DLL. Keep the exact revision aligned with scripts that import it.

## Reproducibility caveat

The audit reported 120 installed Python distributions and verified `pip check`, but the report does not include a complete `pip freeze` list for all 120 distributions. Therefore, this page is a verified **version summary**, not a complete lock file. To generate a full package snapshot on the reference machine, run:

```powershell
py -3.14 -m pip freeze --all > requirements-tested.txt
py -3.14 -m pip list --format=json > packages-tested.json
py -3.14 -m pip check > pip-check.txt
```

Review those files for local paths or identifying information before publishing them.
