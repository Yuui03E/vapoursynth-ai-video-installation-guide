# Contributing

Thank you for helping improve the VapourSynth AI Video Guide. The priority is reproducible instructions, accurate version information and examples that fail clearly when a required file or API is missing.

## Before opening an issue

Include the following details whenever they are relevant:

- Windows edition and build
- Python version, architecture and executable path
- VapourSynth core and API versions
- `vsjetpack` and relevant MLRT package versions
- GPU model and NVIDIA driver version
- Model filename and SHA-256
- Backend (`TRT`, `TRT_RTX`, ORT, NCNN, etc.)
- The complete error output and the smallest reproducible `.vpy` script

Do not include private source videos, API keys, personal directories or unredacted machine audit reports.

## Documentation changes

1. Edit Markdown files under `docs/`.
2. Keep commands copyable and identify the shell (`powershell`, `cmd`, or `bash`).
3. Use version-pinned commands when documenting the tested reference environment.
4. Mark a workflow as inference-tested only after a real short render succeeds.
5. Distinguish installed packages, import success, loaded plugin namespaces, graph construction and successful inference.
6. Do not commit ONNX model weights, videos, TensorRT engine caches or generated environment manifests.

## Validate locally

Use a separate documentation virtual environment (not the VapourSynth runtime environment):

```powershell
py -3.14 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-docs.txt
zensical serve
```

Before submitting, run:

```powershell
zensical build --clean
```

Also check local Markdown links and compile any changed Python examples. The GitHub Actions workflow builds the site on pushes to `main`.

## Reporting a model as tested

A model/backend combination should be called tested only after recording:

- Exact model and wrapper versions
- Backend and GPU/driver versions
- Input dimensions, frame rate, pixel format and color metadata
- The short-render command and successful exit status
- Output dimensions, frame rate and pixel format
- A visual inspection for artifacts, halos, detail loss and scene-cut issues

A package import or `hasattr(vs.core, "trt")` check alone is not an inference test.
