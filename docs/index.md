<div class="hero-panel">
  <span class="hero-kicker">Windows / VapourSynth R80+ / NVIDIA TensorRT / ONNX</span>
  <h1>Modern VapourSynth AI Video Setup Guide</h1>
  <p class="hero-lede">A clean, straight-to-the-point installation guide for modern VapourSynth (API 4), NVIDIA GPU runtimes (TensorRT & ORT), and AI video models (AnimeJaNai, RIFE v4.26, Waifu2x).</p>
  <div class="hero-meta">
    <span>Python 3.14.10</span>
    <span>VapourSynth R81 (API 4)</span>
    <span>JET Pack 2.2.6</span>
    <span>TensorRT 11.4 / RTX</span>
    <span>VSView 0.14</span>
  </div>
</div>

Starting with **VapourSynth R80+**, installation on Windows has changed significantly: VapourSynth is now distributed as a Python package via `pip` and uses the modern **API 4**. You no longer need to download old standalone executable installers, nor do you need to manually configure gigabytes of the NVIDIA CUDA Toolkit.

Follow this straight-forward guide to get everything running in minutes.

---

## ⚡ Fast-Track Installation (Step-by-Step)

Open **PowerShell** as administrator or regular user and follow each step in order:

### <span class="step-badge">1</span> Install Python 3.14.10 (x64)

Download and run the official 64-bit Python installer:

[:material-download: **Download Python 3.14.10 (Windows 64-bit)**](https://www.python.org/ftp/python/3.14.10/python-3.14.10-amd64.exe){ .md-button .md-button--primary }

!!! danger "Crucial Step"
    In the installer wizard, **check the box: `Add python.exe to PATH`**, then click **Install Now**. Close and open a new PowerShell window when done.

Verify Python in PowerShell:

```powershell
python --version
```

---

### <span class="step-badge">2</span> Install VapourSynth

Install the modern VapourSynth core directly through `pip`:

```powershell
pip install VapourSynth
```

---

### <span class="step-badge">3</span> Install JET Pack with NVIDIA Support

Install the complete filtering toolkit along with NVIDIA TensorRT, CUDA runtime, and MLRT dependencies:

```powershell
pip install vsjetpack[full,nvidia] `
  --extra-index-url https://pypi.nvidia.com/ `
  --extra-index-url https://jaded-encoding-thaumaturgy.github.io/vs-wheels/simple
```

!!! note "What this installs"
    This installs `vapoursynth-mlrt` (TRT, TRT-RTX, and ORT engines), `BestSource` (for reliable frame-accurate video decoding), `vsscale`, `vstools`, `tensorrt_cu13`, and core CUDA libraries automatically.

---

### <span class="step-badge">4</span> Initialize VapourSynth Core

Run the configuration command to register VapourSynth in your system:

```powershell
vapoursynth config
```

!!! tip "Missing VC++ Runtime?"
    If `vapoursynth config` gives an error about missing Visual C++ libraries, download and install the official [Visual C++ 2015–2022 Redistributable (x64)](https://aka.ms/vs/17/release/vc_redist.x64.exe).

---

### <span class="step-badge">5</span> Install Script Previewer & Repository CLI

Install **VSView** (lightweight graphical `.vpy` script previewer) and **VSRepo**:

```powershell
pip install vsview vsrepo --extra-index-url https://jaded-encoding-thaumaturgy.github.io/vs-wheels/simple
```

---

### <span class="step-badge">6</span> Verify Plugin Directory & VSPipe

Check where VapourSynth looks for native DLL plugins, and verify the CLI pipeline tool:

```powershell
python -c "import vapoursynth as vs; print('Plugin directory:', vs.get_plugin_dir())"
vspipe --version
```

Expected output:
```text
Plugin directory: C:\Users\<User>\AppData\Local\Programs\Python\Python314\Lib\site-packages\vapoursynth\plugins
VapourSynth Video Processing Library
Copyright (c) 2012-2026 Fredrik Mellbin
Core R81
API R4.3
```

---

### <span class="step-badge">7</span> Verify GPU Runtimes

Run this one-liner to verify that TensorRT, TensorRT RTX, ONNX Runtime (ORT), and BestSource (BS) are all active:

```powershell
py -3.14 -c "import vapoursynth as vs; c=vs.core; print('VapourSynth:', vs.__version__); print('TRT:', hasattr(c,'trt')); print('TRT RTX:', hasattr(c,'trt_rtx')); print('ORT:', hasattr(c,'ort')); print('BS:', hasattr(c,'bs'))"
```

Expected result:
```text
VapourSynth: R81
TRT: True
TRT RTX: True
ORT: True
BS: True
```

---

### <span class="step-badge">8</span> Clean Up Incompatible API 3 Plugins

!!! warning "Fixing 'Plugin uses API 3, which is no longer supported'"
    If running step 7 printed warnings about API 3 plugins (e.g. `bilateralgpu.dll`, `bm3dcuda.dll`), delete their leftover legacy DLL folders from your Python site-packages:

```powershell
$pluginBase = (py -3.14 -c "import vapoursynth as vs; print(vs.get_plugin_dir())").Trim()
$oldPlugins = @("bilateralgpu", "bm3dcpu", "bm3dcuda")
foreach ($p in $oldPlugins) {
    $target = Join-Path $pluginBase $p
    if (Test-Path $target) {
        Remove-Item -Recurse -Force $target
        Write-Host "Removed legacy API 3 plugin: $p"
    }
}
```

Rerun the check from **Step 7** to ensure clean, warning-free output.

---

### <span class="step-badge">9</span> Download & Place AI Models

1. Download the official model archive:
   [:material-download: **models.v15.16.7z (AmusementClub vs-mlrt)**](https://github.com/AmusementClub/vs-mlrt/releases/download/v15.16/models.v15.16.7z){ .md-button }
2. For specific external models (e.g., latest AnimeJaNai compact models or RIFE v4.26):
   [:material-folder-arrow-down: **vs-mlrt External Models Release**](https://github.com/AmusementClub/vs-mlrt/releases/tag/external-models){ .md-button }

3. Extract the models into your VapourSynth plugins `models` folder:

```powershell
$pluginDir = (py -3.14 -c "import vapoursynth as vs; print(vs.get_plugin_dir())").Trim()
$modelsDir = Join-Path $pluginDir "models"
New-Item -ItemType Directory -Force -Path $modelsDir | Out-Null
Write-Host "Place model folders inside: $modelsDir"
```

The directory structure inside `models` should look like this:

```text
.../vapoursynth/plugins/models/
├── animejanai/
│   └── 2x_AnimeJaNai_HD_V3_Compact.onnx
├── rife_v2/
│   └── rife_v4.26.onnx
├── waifu2x/
│   ├── anime_style_art/
│   └── ...
├── cugan/
└── dpir/
```

---

### <span class="step-badge">10</span> Install Modern `vsmlrt.py` Wrapper (API 4 Fix)

To use high-level wrappers like `RIFE()` and `Waifu2x()` under modern VapourSynth R80+, download the API 4 patched `vsmlrt.py` wrapper directly into your Python `site-packages`:

```powershell
$sitePackages = (py -3.14 -c "import site; print(site.getsitepackages()[0])").Trim()
$wrapperPath = Join-Path $sitePackages "vsmlrt.py"

Invoke-WebRequest `
  -Uri "https://gist.githubusercontent.com/Yuui03E/f5d41b3991954b8c867c02c9751d9bcb/raw/14a43646eb956c52be3622a2829ad4941a68668e/vsmlrt.py" `
  -OutFile $wrapperPath

Write-Host "Installed API 4 vsmlrt.py to: $wrapperPath"
```

Verify the wrapper import:
```powershell
python -c "import vsmlrt; print('vsmlrt loaded successfully!')"
```

---

### <span class="step-badge">11</span> Create Your First Test Script (`test.vpy`)

Create a test script `test.vpy` with AnimeJaNai Compact 2x upscaling on TensorRT:

```python
import vapoursynth as vs
from vssource import BestSource
from vstools import initialize_clip, finalize_clip
from vsscale import GenericOnnxScaler
from vsscale.mlrt import Backend
from pathlib import Path

core = vs.core

# 1. Path to your test video and model
SOURCE_PATH = r"C:\path\to\your\test_video.mp4"
MODEL_PATH = Path(vs.get_plugin_dir()) / "models" / "animejanai" / "2x_AnimeJaNai_HD_V3_Compact.onnx"

# 2. Open source video
src = BestSource.source(SOURCE_PATH)
clip = initialize_clip(src)

# 3. Configure TensorRT GPU Backend
trt_backend = Backend.TRT(
    fp16=True,
    device_id=0,
    num_streams=2,
    use_cuda_graph=True
)

# 4. Convert to RGBS (32-bit float RGB) for ONNX input
clip_rgb = core.resize.Bicubic(clip, format=vs.RGBS, matrix_in_s="709")

# 5. Upscale with AnimeJaNai ONNX
upscaled_rgb = GenericOnnxScaler(
    model=str(MODEL_PATH),
    backend=trt_backend
).scale(clip_rgb)

# 6. Convert back to YUV420P10 (10-bit YUV) for video output
out = core.resize.Bicubic(upscaled_rgb, format=vs.YUV420P10, matrix_s="709")
out = finalize_clip(out)

# 7. Outputs: [0] = Original Source, [1] = AI Upscaled
src.set_output(0)
out.set_output(1)
```

---

### <span class="step-badge">12</span> Preview & Render

Preview your script in real-time with **VSView**:

```powershell
vsview test.vpy
```

Press `1` and `2` to toggle between the original clip and the upscaled output.

To render and encode the output video using **VSPipe** and **FFmpeg** (NVIDIA NVENC):

```powershell
vspipe -c y4m test.vpy - | ffmpeg -i - -c:v hevc_nvenc -preset p7 -cq 18 output_upscaled.mp4
```

---

## 📚 Deep Dive Guides

<div class="card-grid">
  <div class="doc-card">
    <span class="card-index">01 / DETAILED SETUP</span>
    <h3><a href="installation/windows/">Step-by-Step Installation</a></h3>
    <p>Detailed explanation of package wheels, index URLs, and system environment variables.</p>
  </div>
  <div class="doc-card">
    <span class="card-index">02 / VERIFICATION</span>
    <h3><a href="installation/verification/">Verification & Diagnostics</a></h3>
    <p>Health-checks for TRT engines, CUDA drivers, and plugin namespace auditing.</p>
  </div>
  <div class="doc-card">
    <span class="card-index">03 / AI MODELS</span>
    <h3><a href="models/">Model Workflows</a></h3>
    <p>Guides for AnimeJaNai 2x upscaling, RIFE v4.26 frame interpolation, and Waifu2x.</p>
  </div>
  <div class="doc-card">
    <span class="card-index">04 / TROUBLESHOOTING</span>
    <h3><a href="troubleshooting/">Troubleshooting & Fixes</a></h3>
    <p>Straightforward fixes for API 3 deprecations, TRT initialization failures, and codec issues.</p>
  </div>
</div>
