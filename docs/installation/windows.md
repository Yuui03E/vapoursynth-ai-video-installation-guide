# Complete Windows Installation Guide

This guide walks through every step needed to set up a complete, modern VapourSynth environment on Windows 10/11 with NVIDIA GPU acceleration (TensorRT and ONNX Runtime).

---

## Prerequisites

Before starting, verify that your system meets these basic requirements:

- **Operating System:** Windows 10 or Windows 11 (64-bit).
- **GPU:** NVIDIA GPU (GTX 10-series or newer; RTX 20/30/40/50 series strongly recommended for TensorRT FP16 acceleration).
- **NVIDIA Driver:** Recent standard Game Ready or Studio Driver installed from NVIDIA.
- **No standalone CUDA Toolkit needed:** All necessary CUDA and TensorRT runtime binaries are installed automatically as Python wheels.

---

## 1. Install Python 3.14.10 (64-bit)

Download the official 64-bit installer for Python 3.14.10:

[:material-download: **python-3.14.10-amd64.exe**](https://www.python.org/ftp/python/3.14.10/python-3.14.10-amd64.exe){ .md-button .md-button--primary }

1. Run the installer.
2. **Check the box:** `Add python.exe to PATH` (at the bottom of the first setup screen).
3. Click **Install Now**.
4. Once completed, close any open terminal windows and launch a fresh **PowerShell**.

Verify your Python interpreter:

```powershell
python --version
py -3.14 --version
```

Expected output:
```text
Python 3.14.10
```

---

## 2. Upgrade pip

Update `pip` to the latest version within your Python 3.14 environment:

```powershell
py -3.14 -m pip install --upgrade pip
```

---

## 3. Install VapourSynth

In modern VapourSynth (R80+), VapourSynth is packaged as a standard wheel on PyPI. Install it directly:

```powershell
pip install VapourSynth
```

### Initialize the VapourSynth Core

Run the configuration command to generate core settings and register VapourSynth in your system:

```powershell
vapoursynth config
```

Expected output:
```text
Configuring VapourSynth...
Core configuration successful.
```

!!! tip "Missing Visual C++ Redistributable Error"
    If `vapoursynth config` throws an error about `MSVCP140.dll` or `VCRUNTIME140.dll` being missing, download and install the official [Visual C++ 2015–2022 Redistributable (x64)](https://aka.ms/vs/17/release/vc_redist.x64.exe).

---

## 4. Install JET Pack with NVIDIA Runtime

[**JET (Jaded Encoding Thaumaturgy)**](https://jaded-encoding-thaumaturgy.github.io/vs-jetpack/) bundles modern VapourSynth filters, source loaders, and model-inference engines.

Run the following command in PowerShell:

```powershell
pip install vsjetpack[full,nvidia] `
  --extra-index-url https://pypi.nvidia.com/ `
  --extra-index-url https://jaded-encoding-thaumaturgy.github.io/vs-wheels/simple
```

### Why are the extra index URLs needed?

- **`https://pypi.nvidia.com/`**: Hosts official NVIDIA prebuilt binary wheels including `tensorrt_cu13`, `tensorrt_rtx_cu13`, and CUDA runtime libraries.
- **`https://jaded-encoding-thaumaturgy.github.io/vs-wheels/simple`**: Hosts specialized VapourSynth plugin wheels such as `vapoursynth-mlrt` (TRT, TRT-RTX, ORT backends) and `vapoursynth-bestsource`.

---

## 5. Install VSView (Previewer) & VSRepo

**VSView** is an essential GUI tool to preview `.vpy` scripts in real-time, inspect individual frames, and compare before/after clips.

```powershell
pip install vsview vsrepo --extra-index-url https://jaded-encoding-thaumaturgy.github.io/vs-wheels/simple
```

Test that VSView launches:
```powershell
vsview --version
```

---

## 6. Verify Plugins & Clean Legacy API 3 DLLs

Modern VapourSynth uses **API 4**. Some legacy packages install old API 3 plugins that trigger deprecation warnings or crashes.

### Check Active Backends

```powershell
py -3.14 -c "import vapoursynth as vs; c=vs.core; print('VapourSynth:', vs.__version__); print('TRT:', hasattr(c,'trt')); print('TRT RTX:', hasattr(c,'trt_rtx')); print('ORT:', hasattr(c,'ort')); print('BS:', hasattr(c,'bs'))"
```

Expected output:
```text
VapourSynth: R81
TRT: True
TRT RTX: True
ORT: True
BS: True
```

### Removing Legacy API 3 Plugins

If the check output printed lines like:
```text
Plugin ...\bilateralgpu.dll uses API 3, which is no longer supported.
Plugin ...\bm3dcuda.dll uses API 3, which is no longer supported.
```

Remove them automatically with this PowerShell snippet:

```powershell
$pluginBase = (py -3.14 -c "import vapoursynth as vs; print(vs.get_plugin_dir())").Trim()
$oldPlugins = @("bilateralgpu", "bm3dcpu", "bm3dcuda")
foreach ($p in $oldPlugins) {
    $dir = Join-Path $pluginBase $p
    if (Test-Path $dir) {
        Remove-Item -Recurse -Force $dir
        Write-Host "Removed incompatible API 3 plugin directory: $dir"
    }
}
```

---

## 7. Setup AI Models Directory

VapourSynth looks for ONNX models inside the `models` subfolder of its plugin directory.

Create the folder using PowerShell:

```powershell
$pluginDir = (py -3.14 -c "import vapoursynth as vs; print(vs.get_plugin_dir())").Trim()
$modelsDir = Join-Path $pluginDir "models"
New-Item -ItemType Directory -Force -Path $modelsDir | Out-Null
Write-Host "Your models folder is: $modelsDir"
```

Download model packages:
1. [:material-download: **models.v15.16.7z (vs-mlrt base model pack)**](https://github.com/AmusementClub/vs-mlrt/releases/download/v15.16/models.v15.16.7z)
2. [:material-link: **External Models Release (AnimeJaNai, RIFE v4.26, etc.)**](https://github.com/AmusementClub/vs-mlrt/releases/tag/external-models)

Extract them so the folder hierarchy is organized as follows:

```text
vapoursynth/plugins/models/
├── animejanai/
│   ├── 2x_AnimeJaNai_HD_V3_Compact.onnx
│   └── 2x_AnimeJaNai_HD_V3_UltraCompact.onnx
├── rife_v2/
│   └── rife_v4.26.onnx
├── waifu2x/
│   ├── anime_style_art/
│   └── photo/
├── cugan/
└── dpir/
```

---

## 8. Install API 4 `vsmlrt.py` Wrapper

The original `vsmlrt.py` script from upstream AmusementClub was designed for older VapourSynth API versions. To ensure complete compatibility with VapourSynth R80+ and TensorRT, install the patched wrapper directly into Python's `site-packages`:

```powershell
$sitePackages = (py -3.14 -c "import site; print(site.getsitepackages()[0])").Trim()
$wrapperPath = Join-Path $sitePackages "vsmlrt.py"

Invoke-WebRequest `
  -Uri "https://gist.githubusercontent.com/Yuui03E/f5d41b3991954b8c867c02c9751d9bcb/raw/14a43646eb956c52be3622a2829ad4941a68668e/vsmlrt.py" `
  -OutFile $wrapperPath

Write-Host "vsmlrt.py installed to: $wrapperPath"
```

Verify that the wrapper loads:

```powershell
python -c "import vsmlrt; print('vsmlrt wrapper version:', vsmlrt.__version__ if hasattr(vsmlrt, '__version__') else 'Loaded')"
```

---

## 9. Quick Copy-Paste Summary

For subsequent machines or quick reinstallations, here is the full PowerShell script:

```powershell
# 1. Update pip & install core VapourSynth
py -3.14 -m pip install --upgrade pip
pip install VapourSynth
vapoursynth config

# 2. Install JET with NVIDIA runtimes + VSView
pip install vsjetpack[full,nvidia] `
  --extra-index-url https://pypi.nvidia.com/ `
  --extra-index-url https://jaded-encoding-thaumaturgy.github.io/vs-wheels/simple

pip install vsview vsrepo `
  --extra-index-url https://jaded-encoding-thaumaturgy.github.io/vs-wheels/simple

# 3. Clean legacy API 3 plugins
$pluginBase = (py -3.14 -c "import vapoursynth as vs; print(vs.get_plugin_dir())").Trim()
@("bilateralgpu", "bm3dcpu", "bm3dcuda") | ForEach-Object {
    $dir = Join-Path $pluginBase $_
    if (Test-Path $dir) { Remove-Item -Recurse -Force $dir }
}

# 4. Install patched vsmlrt.py wrapper
$sitePackages = (py -3.14 -c "import site; print(site.getsitepackages()[0])").Trim()
Invoke-WebRequest `
  -Uri "https://gist.githubusercontent.com/Yuui03E/f5d41b3991954b8c867c02c9751d9bcb/raw/14a43646eb956c52be3622a2829ad4941a68668e/vsmlrt.py" `
  -OutFile (Join-Path $sitePackages "vsmlrt.py")
```
