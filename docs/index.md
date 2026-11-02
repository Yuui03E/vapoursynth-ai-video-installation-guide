<div class="hero-panel">
  <span class="hero-kicker">Windows · VapourSynth · AI inference</span>
  <h1>A reliable VapourSynth setup for AI video processing.</h1>
  <p class="hero-lede">A practical, version-aware guide to installing VapourSynth, enabling NVIDIA ML runtimes, organizing ONNX models, and building repeatable video-processing scripts.</p>
  <div class="hero-meta">
    <span>Python 3.14.10</span>
    <span>VapourSynth R81</span>
    <span>JET 2.2.6</span>
    <span>MLRT · TensorRT</span>
  </div>
</div>

This guide is designed for people who want to install VapourSynth once, understand what they installed, and use model-driven filters without repeatedly rebuilding their environment.

<div class="card-grid" markdown>
<div class="doc-card" markdown>
<span class="card-index">01 · START</span>
### [Understand the pipeline](start-here/)
Learn what VapourSynth, JET, MLRT, ONNX models and VSPipe each do.
</div>
<div class="doc-card" markdown>
<span class="card-index">02 · INSTALL</span>
### [Build the Windows environment](installation/windows.md)
Follow one consistent Python interpreter and install the tested package stack.
</div>
<div class="doc-card" markdown>
<span class="card-index">03 · VERIFY</span>
### [Check every layer](installation/verification.md)
Verify imports, plugins, GPU backends, model files and dependencies.
</div>
<div class="doc-card" markdown>
<span class="card-index">04 · USE MODELS</span>
### [Run AI video models](models/)
Separate guides for AnimeJaNai, Waifu2x, RIFE and related model families.
</div>
</div>

## Choose the operation you actually need

| Goal | Start with | Important distinction |
|---|---|---|
| Enlarge anime frames | [AnimeJaNai](models/animejanai.md) or [Waifu2x](models/waifu2x.md) | Changes frame width and height. |
| Remove noise while scaling | [Waifu2x](models/waifu2x.md) | Denoising can erase fine lines when set too aggressively. |
| Create smoother motion | [RIFE](models/rife.md) | Generates intermediate frames; does not upscale the picture. |
| Restore or denoise | [Other models](models/other-models.md) | Select a model designed for the specific degradation. |
| Inspect output or export frames | [Preview and render](workflows/preview-and-render.md) | Preview first; render a short range before the full video. |

## Reference configuration

The documented baseline is the audited Windows 11 machine described in [Tested environment](reference/tested-environment.md). It uses Python 3.14.10 x64, VapourSynth R81/API R4.3, `vsjetpack` 2.2.6 and the NVIDIA MLRT plugins.

<div class="status-row">
  <span class="status-chip good">● Core imports verified</span>
  <span class="status-chip good">● Plugin namespaces available</span>
  <span class="status-chip good">● pip check clean</span>
  <span class="status-chip warn">! Model inference not fully validated</span>
</div>

!!! warning "Read this before copying commands"
    Package versions and APIs change. The audit is a dated reference snapshot, not a guarantee for every GPU, driver or future package release. Follow the installation guide, then run the verification steps on the target computer. Do not skip the short-clip inference test.

## Documentation principles

- **One interpreter:** every installation command uses `py -3.14 -m pip` so packages do not silently land in another Python environment.
- **No duplicate runtime installs:** the guide uses JET's NVIDIA extras. It does not ask users to separately install the CUDA Toolkit or standalone TensorRT for the audited wheel-based setup.
- **Proof over assumptions:** a package listed by pip is not necessarily a working plugin. Verify the namespace and, finally, execute an inference test.
- **Model-specific workflows:** use a model's wrapper and expected input format. A random ONNX file is not automatically compatible with a generic scaler.
- **No model weights in Git:** download ONNX assets from their maintainers and keep large model files outside the documentation repository.

## Documentation map

- [Start here](start-here/index.md)
- [Prerequisites](start-here/prerequisites.md)
- [Windows installation](installation/windows.md)
- [Verification](installation/verification.md)
- [Model selection](models/index.md)
- [Rendering and preview](workflows/preview-and-render.md)
- [Troubleshooting](troubleshooting/index.md)
- [Tested environment and version details](reference/tested-environment.md)
