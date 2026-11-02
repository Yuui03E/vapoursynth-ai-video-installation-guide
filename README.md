<div align="center">
  <img src="docs/assets/vapoursynth-mark.svg" alt="VapourSynth AI Guide logo" width="92" height="92">
  <h1>VapourSynth · AI Video Guide</h1>
  <p><strong>A practical, reproducible Windows setup for VapourSynth and ONNX video models.</strong></p>
  <p>
    <a href="https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY/actions/workflows/docs.yml"><img src="https://img.shields.io/github/actions/workflow/status/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY/docs.yml?branch=main&style=flat-square&label=docs%20build" alt="Documentation build"></a>
    <img src="https://img.shields.io/badge/platform-Windows%2011-2563eb?style=flat-square" alt="Windows 11">
    <img src="https://img.shields.io/badge/Python-3.14.10-3776AB?style=flat-square" alt="Python 3.14.10">
    <img src="https://img.shields.io/badge/VapourSynth-R81-0f766e?style=flat-square" alt="VapourSynth R81">
  </p>
  <p><a href="https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY/">Read the documentation site ↗</a></p>
</div>

---

## What this project covers

This repository explains how to build a consistent VapourSynth environment on Windows, verify that the installed components actually load, and use AI models from `.vpy` scripts.

It is written around a real audited reference environment rather than an imaginary one-click installer. The guide distinguishes package installation from runtime verification and distinguishes image upscaling from frame interpolation.

| Workflow | Model examples | What it changes |
|---|---|---|
| Anime upscaling | AnimeJaNai, Waifu2x, RealESRGAN, CUGAN | Frame width and height |
| Denoising / restoration | Waifu2x, DPIR, SCUNet | Noise, compression and image detail |
| Frame interpolation | RIFE | Number and timing of frames; not resolution |
| General VapourSynth processing | JET filters and plugins | Filtering, resizing, color conversion and output |

## Start here

1. Read [the installation overview](docs/start-here/index.md).
2. Follow the [Windows installation procedure](docs/installation/windows.md).
3. Run the [verification checklist](docs/installation/verification.md).
4. Choose a [model workflow](docs/models/index.md).
5. Preview and render using [VSPipe](docs/workflows/preview-and-render.md).
6. Run the [environment audit script](scripts/audit_environment.py) when supporting a client machine.

## Tested reference environment

The current reference snapshot was audited on **2 November 2026**:

| Component | Audited reference |
|---|---|
| OS | Windows 11 x64 |
| CPU | AMD Ryzen 9 9950X |
| GPU | NVIDIA GeForce RTX 5070, 12 GB |
| NVIDIA driver | 617.14 |
| Python | 3.14.10 x64 |
| VapourSynth | R81 · API R4.3 |
| `vsjetpack` | 2.2.6 |
| MLRT TensorRT / TensorRT-RTX | 17.1 / 17.1 |
| ONNX Runtime bundled with MLRT | 1.31.0 |
| ONNX model files | 76 inventoried |

These versions describe the reference machine, not a promise that every later package release is compatible. See the [full tested environment](docs/reference/tested-environment.md) and [verification status](docs/reference/validation-status.md).

## Important design decisions

- Use one explicit interpreter: `py -3.14 -m pip ...`.
- Install NVIDIA VapourSynth plugins through the JET `nvidia` extra.
- Do **not** install a separate CUDA Toolkit or standalone TensorRT just to reproduce this audited setup. The reference uses NVIDIA runtime/TensorRT Python wheels and the system NVIDIA display driver.
- Do not treat `hasattr(core, "trt")` as proof that a model can run. It proves the namespace is present; an inference test proves much more.
- Do not treat RIFE as an upscaler. It interpolates frames to alter motion cadence.
- Do not upload ONNX weights, source videos, TensorRT engine caches or private machine paths to this documentation repository.

## Documentation site

The docs are written in Markdown and built with [Zensical](https://zensical.org/), the successor project from the maintainers of Material for MkDocs. A GitHub Actions workflow publishes the site to GitHub Pages.

To preview locally:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-docs.txt
zensical serve
```

Open `http://127.0.0.1:8000/`.

## Scope and disclaimers

This is an independent community guide, not an official VapourSynth, JET, NVIDIA or AmusementClub project. Third-party packages and model weights remain the property of their respective maintainers and authors. This repository documents installation and usage; it does not redistribute those packages or weights.

The audit verified imports, package metadata, plugin namespaces, dependency consistency and model-file presence. It did **not** execute full model inference for every model. Examples are labelled accordingly; validate a short clip before processing an entire video.

## Contributing

Corrections are welcome. Please include the exact package version, Python version, VapourSynth core/API version, GPU/driver, complete error output and the smallest reproducible script when reporting an issue. See [the troubleshooting guide](docs/troubleshooting/index.md) before opening an issue.

---

<p align="center"><sub>Documentation snapshot: 2026-11-02 · Keep the environment manifest and model hashes updated when the tested baseline changes.</sub></p>
