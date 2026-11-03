# AI Models & Directory Setup

VapourSynth leverages ONNX-based neural networks for video upscaling, denoising, and motion frame interpolation.

---

## 1. Where to Download Models

Models are distributed as `.onnx` files by the AmusementClub / vs-mlrt project:

| Package | Contents | Download Link |
|---|---|---|
| **Base Model Pack** | AnimeJaNai, Waifu2x, CUGAN, DPIR, RealESRGAN | [:material-download: **models.v15.16.7z**](https://github.com/AmusementClub/vs-mlrt/releases/download/v15.16/models.v15.16.7z) |
| **External Models** | RIFE v4.26, AnimeJaNai Compact HD V3 | [:material-download: **vs-mlrt External Models**](https://github.com/AmusementClub/vs-mlrt/releases/tag/external-models) |

---

## 2. Model Directory Structure

VapourSynth plugins automatically resolve model paths relative to the `models/` directory inside your plugin folder.

Find and create the directory in PowerShell:

```powershell
$pluginDir = (py -3.14 -c "import vapoursynth as vs; print(vs.get_plugin_dir())").Trim()
$modelsDir = Join-Path $pluginDir "models"
New-Item -ItemType Directory -Force -Path $modelsDir | Out-Null
Write-Host "Model root directory: $modelsDir"
```

Extract your downloaded archives so the directory tree looks like this:

```text
.../vapoursynth/plugins/models/
├── animejanai/
│   ├── 2x_AnimeJaNai_HD_V3_Compact.onnx
│   └── 2x_AnimeJaNai_HD_V3_UltraCompact.onnx
├── rife_v2/
│   └── rife_v4.26.onnx
├── waifu2x/
│   ├── anime_style_art/
│   └── photo/
├── cugan/
│   └── up2x-conservative.onnx
└── dpir/
    └── dpir.onnx
```

!!! tip "Prevent Duplicate Subdirectories"
    Make sure you do **not** accidentally extract into a nested folder like `models/models/animejanai`. The files should sit directly in `models/<model_family>/`.

---

## 3. Which Model Should You Use?

| Model Family | Primary Purpose | Scaling Factor | Best For | Recommended Backend |
|---|---|:---:|---|---|
| **[AnimeJaNai](animejanai.md)** | Line art & animation upscaling | 2× | Modern anime, animated web videos | `Backend.TRT(fp16=True)` |
| **[RIFE v4.26](rife.md)** | Motion frame interpolation | 1× (temporal 2×/etc) | Smooth 60fps/120fps playback | `Backend.TRT(fp16=True)` |
| **[Waifu2x](waifu2x.md)** | Denoising + upscaling | 1× / 2× | Older animated content, compressed video | `Backend.TRT()` / `Backend.ORT()` |
| **Real-CUGAN** | Heavy noise & artifact reduction | 2× | Highly compressed anime streams | `Backend.TRT()` |

---

## 4. Hardware Backends Explained

When calling an ONNX model in VapourSynth, you specify a backend:

### TensorRT (`Backend.TRT`)
- **Recommended for NVIDIA RTX GPUs:** Delivers the highest FPS.
- Supports **FP16** precision (`fp16=True`), halving VRAM consumption while doubling speed on Tensor Core GPUs.
- Supports CUDA Graph acceleration (`use_cuda_graph=True`).
- *Note:* TensorRT generates an optimized engine during the first run. The first few seconds of inference will compile the model; subsequent runs start instantly.

### TensorRT RTX (`Backend.TRT_RTX`)
- Optimized for newer Ada Lovelace (RTX 40-series) and Blackwell (RTX 50-series) architectures.
- Low latency and efficient memory footprint.

### ONNX Runtime (`Backend.ORT`)
- Standard ONNX execution engine with CUDA EP (Execution Provider).
- Does not require TensorRT engine compilation ahead of time.
- Great compatibility fallback if a custom ONNX model contains unsupported TensorRT operators.
