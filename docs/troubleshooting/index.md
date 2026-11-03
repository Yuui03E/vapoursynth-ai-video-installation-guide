# Troubleshooting & Common Fixes

Solutions to the most frequent issues encountered when running modern VapourSynth (R80+) and NVIDIA AI video workflows.

---

## 1. Plugin uses API 3, which is no longer supported

### Symptom
When initializing VapourSynth or checking plugins, you see messages such as:
```text
Plugin C:\...\vapoursynth\plugins\bilateralgpu\bilateralgpu.dll uses API 3, which is no longer supported.
Plugin C:\...\vapoursynth\plugins\bm3dcpu\bm3dcpu.dll uses API 3, which is no longer supported.
Plugin C:\...\vapoursynth\plugins\bm3dcuda\bm3dcuda.dll uses API 3, which is no longer supported.
```

### Cause
VapourSynth R80+ transitioned to **API 4**. Legacy plugins compiled against API 3 are rejected by the core loader.

### Fix
Delete the deprecated plugin DLL directories from your VapourSynth plugin folder:

```powershell
$pluginBase = (py -3.14 -c "import vapoursynth as vs; print(vs.get_plugin_dir())").Trim()
$oldPlugins = @("bilateralgpu", "bm3dcpu", "bm3dcuda")
foreach ($p in $oldPlugins) {
    $dir = Join-Path $pluginBase $p
    if (Test-Path $dir) {
        Remove-Item -Recurse -Force $dir
        Write-Host "Removed legacy API 3 directory: $dir"
    }
}
```

---

## 2. `vapoursynth config` fails or complains about missing DLLs

### Symptom
Running `vapoursynth config` prints an error about `MSVCP140.dll`, `VCRUNTIME140.dll`, or fails with exit code 1.

### Cause
The Microsoft Visual C++ runtime libraries required by VapourSynth's native binaries are missing or outdated.

### Fix
Download and install the official Microsoft runtime:

[:material-download: **Visual C++ 2015–2022 Redistributable (x64)**](https://aka.ms/vs/17/release/vc_redist.x64.exe){ .md-button .md-button--primary }

After installing, restart your terminal and rerun:
```powershell
vapoursynth config
```

---

## 3. `TRT: False` or TensorRT Fails to Load

### Symptom
Checking `hasattr(vs.core, 'trt')` returns `False`, or importing returns `DLL load failed`.

### Cause
1. Incompatible NVIDIA graphics driver.
2. Missing NVIDIA CUDA/TensorRT runtime wheel packages.

### Fix
1. Update your NVIDIA GPU driver to the latest Studio or Game Ready driver from [NVIDIA's website](https://www.nvidia.com/Download/index.aspx).
2. Ensure the NVIDIA wheels were installed with the official NVIDIA PyPI index:
```powershell
pip install tensorrt_cu13 tensorrt_rtx_cu13 nvidia-cuda-runtime-cu13 `
  --extra-index-url https://pypi.nvidia.com/
```

---

## 4. `vsmlrt` Missing `RIFEModel.v4_26` or Wrapper Import Errors

### Symptom
```text
AttributeError: type object 'RIFEModel' has no attribute 'v4_26'
```
or
```text
cannot import name 'RIFE' from 'vsmlrt'
```

### Cause
The standard upstream `vsmlrt.py` script was written for older VapourSynth API versions or does not include definitions for modern ONNX models like RIFE v4.26.

### Fix
Download the API 4 patched `vsmlrt.py` into your Python `site-packages`:

```powershell
$sitePackages = (py -3.14 -c "import site; print(site.getsitepackages()[0])").Trim()
$wrapperPath = Join-Path $sitePackages "vsmlrt.py"

Invoke-WebRequest `
  -Uri "https://gist.githubusercontent.com/Yuui03E/f5d41b3991954b8c867c02c9751d9bcb/raw/14a43646eb956c52be3622a2829ad4941a68668e/vsmlrt.py" `
  -OutFile $wrapperPath

Write-Host "Patched wrapper saved to: $wrapperPath"
```

Verify that RIFE v4.26 is now available:
```powershell
py -3.14 -c "import vsmlrt; print('RIFE v4.26 supported:', hasattr(vsmlrt.RIFEModel, 'v4_26'))"
```

---

## 5. Model File Not Found Error

### Symptom
```text
FileNotFoundError: ONNX model not found: ...\models\animejanai\2x_AnimeJaNai_HD_V3_Compact.onnx
```

### Cause
Models were extracted into an extra nested folder (e.g., `models\models\animejanai`) or placed in the wrong directory.

### Fix
Check your actual VapourSynth plugin folder:
```powershell
python -c "import vapoursynth as vs; print(vs.get_plugin_dir())"
```
Ensure the folder structure inside matches:
```text
<plugin_dir>/models/animejanai/2x_AnimeJaNai_HD_V3_Compact.onnx
<plugin_dir>/models/rife_v2/rife_v4.26.onnx
```

---

## 6. CUDA Out of Memory (VRAM Exhaustion)

### Symptom
```text
CUDA out of memory. Tried to allocate ...
```
or TensorRT engine crashes during model execution.

### Fix
1. **Enable FP16 Precision:** Ensure your backend specifies `fp16=True`:
   ```python
   backend = Backend.TRT(fp16=True, device_id=0, num_streams=2)
   ```
2. **Reduce Stream Count:** If `num_streams=2` consumes too much memory, set `num_streams=1`.
3. **Close Background Applications:** Web browsers or video games using GPU VRAM can prevent TensorRT from allocating memory buffers.

---

## 7. Washed-Out Colors or Inaccurate Saturation

### Symptom
Upscaled output colors look pale, darker, or slightly shifted compared to the original.

### Cause
Mismatch between video matrix coefficients during RGB conversion:
- Most HD / 1080p / 4K content uses **BT.709** (`matrix_in_s="709"`).
- Standard Definition (SD / DVD / 480p / 576p) content usually uses **BT.601** (`matrix_in_s="170m"` or `matrix_in_s="470bg"`).

### Fix
Check source metadata with MediaInfo or FFprobe, and set matching matrix parameters:

```python
# For standard HD/Web video (BT.709):
clip_rgb = core.resize.Bicubic(clip, format=vs.RGBS, matrix_in_s="709")
out = core.resize.Bicubic(upscaled_rgb, format=vs.YUV420P10, matrix_s="709")

# For DVD / SD video (BT.601):
clip_rgb = core.resize.Bicubic(clip, format=vs.RGBS, matrix_in_s="170m")
out = core.resize.Bicubic(upscaled_rgb, format=vs.YUV420P10, matrix_s="170m")
```
