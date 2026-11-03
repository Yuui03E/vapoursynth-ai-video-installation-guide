<div align="center">
  <img src="docs/assets/vapoursynth-mark.svg" alt="VapourSynth AI Video Guide logo" width="80" height="80">
  <h1>VapourSynth AI Video Installation Guide</h1>
  <p><strong>A straight-forward, reproducible Windows installation guide for modern VapourSynth (R80+), NVIDIA TensorRT, and AI video models.</strong></p>
  <p>
    <a href="https://github.com/Yuui03E/vapoursynth-ai-video-installation-guide/actions/workflows/docs.yml"><img src="https://img.shields.io/github/actions/workflow/status/Yuui03E/vapoursynth-ai-video-installation-guide/docs.yml?branch=main&style=flat-square&label=docs%20build" alt="Documentation build"></a>
    <img src="https://img.shields.io/badge/platform-Windows%2010%20%7C%2011-2563eb?style=flat-square" alt="Windows 10/11">
    <img src="https://img.shields.io/badge/Python-3.14.10-3776AB?style=flat-square" alt="Python 3.14.10">
    <img src="https://img.shields.io/badge/VapourSynth-R81%20(API%204)-0f766e?style=flat-square" alt="VapourSynth R81">
    <img src="https://img.shields.io/badge/NVIDIA-TensorRT%20%7C%20ORT-76b900?style=flat-square" alt="NVIDIA TensorRT">
  </p>
  <p><a href="https://yuui03e.github.io/vapoursynth-ai-video-installation-guide/"><strong>Read the Full Documentation Site ↗</strong></a></p>
</div>

---

## ⚡ Quick Start (PowerShell)

```powershell
# 1. Install Python 3.14.10 (Ensure "Add python.exe to PATH" is checked)
# https://www.python.org/ftp/python/3.14.10/python-3.14.10-amd64.exe

# 2. Install VapourSynth & Initialize Core
pip install VapourSynth
vapoursynth config

# 3. Install JET Pack with NVIDIA TensorRT & CUDA Runtimes
pip install vsjetpack[full,nvidia] `
  --extra-index-url https://pypi.nvidia.com/ `
  --extra-index-url https://jaded-encoding-thaumaturgy.github.io/vs-wheels/simple

# 4. Install VSView Previewer & VSRepo
pip install vsview vsrepo `
  --extra-index-url https://jaded-encoding-thaumaturgy.github.io/vs-wheels/simple

# 5. Clean up deprecated API 3 plugins (if any)
$pluginBase = (py -3.14 -c "import vapoursynth as vs; print(vs.get_plugin_dir())").Trim()
@("bilateralgpu", "bm3dcpu", "bm3dcuda") | ForEach-Object {
    $dir = Join-Path $pluginBase $_
    if (Test-Path $dir) { Remove-Item -Recurse -Force $dir }
}

# 6. Install API 4 Patched vsmlrt.py Wrapper
$sitePackages = (py -3.14 -c "import site; print(site.getsitepackages()[0])").Trim()
Invoke-WebRequest `
  -Uri "https://gist.githubusercontent.com/Yuui03E/f5d41b3991954b8c867c02c9751d9bcb/raw/14a43646eb956c52be3622a2829ad4941a68668e/vsmlrt.py" `
  -OutFile (Join-Path $sitePackages "vsmlrt.py")
```

---

## 📖 Documentation Sections

- [**Quick Start Guide**](https://yuui03e.github.io/vapoursynth-ai-video-installation-guide/) — Complete 12-step setup workflow.
- [**Detailed Windows Installation**](https://yuui03e.github.io/vapoursynth-ai-video-installation-guide/installation/windows/) — Step-by-step breakdown of packages, index URLs, and environment variables.
- [**Verification Checklist**](https://yuui03e.github.io/vapoursynth-ai-video-installation-guide/installation/verification/) — Fast commands to audit GPU backends (`trt`, `ort`, `bs`).
- [**Model Workflows**](https://yuui03e.github.io/vapoursynth-ai-video-installation-guide/models/) — Setup guides for AnimeJaNai, RIFE v4.26, and Waifu2x.
- [**Ready-to-Use Scripts**](https://yuui03e.github.io/vapoursynth-ai-video-installation-guide/examples/) — Copy-pasteable `test.vpy` templates with BestSource and TensorRT.
- [**Previewing & Rendering**](https://yuui03e.github.io/vapoursynth-ai-video-installation-guide/workflows/preview-and-render/) — VSView controls and direct FFmpeg NVENC piping commands.
- [**Troubleshooting**](https://yuui03e.github.io/vapoursynth-ai-video-installation-guide/troubleshooting/) — Fixes for API 3 deprecations, VC++ runtime issues, and VRAM memory management.

---

## 🛠️ Local Documentation Preview

To preview the documentation locally with Zensical:

```powershell
pip install -r requirements-docs.txt
zensical serve
```

Then visit `http://127.0.0.1:8000/`.
