# Verification & Diagnostics Checklist

Follow this checklist after installation to verify every layer of your VapourSynth AI stack before running intensive video workflows.

---

## 1. Quick All-in-One Health Check

Run this one-liner in PowerShell to test your core VapourSynth installation and GPU acceleration runtimes:

```powershell
py -3.14 -c "import vapoursynth as vs; c=vs.core; print('=== VapourSynth AI Health Check ==='); print('VapourSynth Version:', vs.__version__); print('TensorRT (trt):      ', hasattr(c,'trt')); print('TensorRT RTX (trt_rtx):', hasattr(c,'trt_rtx')); print('ONNX Runtime (ort): ', hasattr(c,'ort')); print('BestSource (bs):    ', hasattr(c,'bs'))"
```

### Expected Result

```text
=== VapourSynth AI Health Check ===
VapourSynth Version: R81
TensorRT (trt):       True
TensorRT RTX (trt_rtx): True
ONNX Runtime (ort):  True
BestSource (bs):     True
```

All four GPU backends and source loaders should report `True`.

---

## 2. Check for Incompatible API 3 Plugins

If the check above produced warnings like:
```text
Plugin ...\bilateralgpu.dll uses API 3, which is no longer supported.
Plugin ...\bm3dcuda.dll uses API 3, which is no longer supported.
```

Run this cleanup snippet to remove outdated API 3 DLLs:

```powershell
$pluginBase = (py -3.14 -c "import vapoursynth as vs; print(vs.get_plugin_dir())").Trim()
$oldPlugins = @("bilateralgpu", "bm3dcpu", "bm3dcuda")
foreach ($p in $oldPlugins) {
    $target = Join-Path $pluginBase $p
    if (Test-Path $target) {
        Remove-Item -Recurse -Force $target
        Write-Host "Removed legacy API 3 directory: $target"
    }
}
```

Rerun Step 1 to confirm there are zero warnings.

---

## 3. Verify VSPipe and CLI Tools

Verify that `vspipe` and `vsview` are accessible from your PATH:

```powershell
vspipe --version
vsview --version
```

Expected output:
```text
VapourSynth Video Processing Library
Core R81
API R4.3
```

---

## 4. Verify Python Package Ecosystem

Confirm that Python dependencies are clean with no broken or missing requirements:

```powershell
py -3.14 -m pip check
```

Expected output:
```text
No broken requirements found.
```

---

## 5. Verify the Patched `vsmlrt.py` Wrapper

Ensure that the API 4 patched `vsmlrt.py` is present in `site-packages`:

```powershell
py -3.14 -c "import vsmlrt; print('Wrapper File:', vsmlrt.__file__); print('RIFE v4.26 supported:', hasattr(vsmlrt.RIFEModel, 'v4_26'))"
```

Expected output:
```text
Wrapper File: C:\...\Python314\Lib\site-packages\vsmlrt.py
RIFE v4.26 supported: True
```

---

## 6. Verify Model File Locations

Check whether the required model files exist in your VapourSynth plugins directory:

```powershell
$pluginDir = (py -3.14 -c "import vapoursynth as vs; print(vs.get_plugin_dir())").Trim()
$modelsDir = Join-Path $pluginDir "models"

$modelsToCheck = @(
    "animejanai\2x_AnimeJaNai_HD_V3_Compact.onnx",
    "rife_v2\rife_v4.26.onnx"
)

foreach ($rel in $modelsToCheck) {
    $fullPath = Join-Path $modelsDir $rel
    $exists = Test-Path $fullPath
    $status = if ($exists) { "[FOUND]" } else { "[MISSING]" }
    Write-Host "$status $rel"
}
```

---

## 7. Evaluate Script Graph Without Rendering

Before processing a full video, evaluate your `.vpy` script graph using `vspipe --info`:

```powershell
vspipe --info test.vpy
```

This verifies that:
- The video file can be indexed and decoded by BestSource.
- The color space transformations (`RGBS` and `YUV420P10`) are valid.
- The model graph and TensorRT backend instantiate properly.
- Output clips `0` and `1` are properly configured.
