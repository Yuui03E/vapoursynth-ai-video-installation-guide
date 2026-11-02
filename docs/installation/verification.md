# Verify the installation

Run these checks after installation and before opening a large model. They are designed to identify which layer is failing: Python, VapourSynth, packages, plugin loading, GPU runtime or model files.

## 1. Confirm the selected Python

```powershell
py -3.14 -c "import sys, struct; print('Python:', sys.version); print('Executable:', sys.executable); print('Bits:', struct.calcsize('P') * 8)"
py -3.14 -m pip --version
```

## 2. Confirm VapourSynth and VSPipe

```powershell
py -3.14 -c "import vapoursynth as vs; print('VapourSynth:', vs.__version__); print('Core:', vs.core); print('Plugin directory:', vs.get_plugin_dir())"
vspipe --version
```

Reference output: VapourSynth Core R81, API R4.3.

## 3. Check package dependencies

```powershell
py -3.14 -m pip check
```

The reference machine returned `No broken requirements found.`

## 4. Check critical Python imports

```powershell
py -3.14 -c "from vssource import BestSource; from vstools import initialize_clip, finalize_clip; from vsscale import GenericOnnxScaler; from vsscale.mlrt import Backend; print('Core VapourSynth / JET imports: PASS')"
```

## 5. Check MLRT namespaces

```powershell
py -3.14 -c "import vapoursynth as vs; c=vs.core; print('TRT:', hasattr(c,'trt')); print('TRT RTX:', hasattr(c,'trt_rtx')); print('ORT:', hasattr(c,'ort')); print('BestSource:', hasattr(c,'bs'))"
```

Expected on the reference environment:

```text
TRT: True
TRT RTX: True
ORT: True
BestSource: True
```

This only confirms that those plugin namespaces are available. It does not prove that all libraries, model operators, input shapes or engines work for every ONNX file.

## 6. Check the wrapper that model examples import

```powershell
py -3.14 -c "import vsmlrt; print('Wrapper path:', vsmlrt.__file__); print('Wrapper version:', getattr(vsmlrt, '__version__', 'unknown'))"
```

Expected reference:

```text
Version: 4.1.1+api4.jetfix2
```

Inspect model-specific exports and signatures before running code copied from a different wrapper version:

```powershell
@'
import inspect
import vsmlrt

print("Wrapper:", vsmlrt.__file__)
print("Version:", getattr(vsmlrt, "__version__", "unknown"))

for name in ("RIFE", "RIFEModel", "Waifu2x", "Waifu2xModel", "Backend"):
    obj = getattr(vsmlrt, name, None)
    print("\n", name, ":", obj)
    if obj is not None:
        try:
            print("Signature:", inspect.signature(obj))
        except (TypeError, ValueError):
            pass
        if name.endswith("Model"):
            print("Members:", [x for x in dir(obj) if not x.startswith("_")])
'@ | py -3.14 -
```

## 7. Check the NVIDIA driver

```powershell
nvidia-smi
```

The reference machine reported an RTX 5070 and driver 617.14. `nvidia-smi` can display a CUDA compatibility/runtime ceiling associated with the driver; it does not prove that the separate CUDA Toolkit or `nvcc` is installed.

## 8. Check model file locations

```powershell
$pluginDir = (py -3.14 -c "import vapoursynth as vs; print(vs.get_plugin_dir())").Trim()
$modelsDir = Join-Path $pluginDir "models"

$checks = @(
  "animejanai\2x_AnimeJaNai_HD_V3_Compact.onnx",
  "rife_v2\rife_v4.26.onnx"
)

foreach ($relativePath in $checks) {
    $path = Join-Path $modelsDir $relativePath
    [pscustomobject]@{ Model = $relativePath; Exists = (Test-Path $path); Path = $path }
}
```

## 9. Test the script graph before inference

For a `.vpy` script that sets output 0 and output 1:

```powershell
vspipe --info .\docs\examples\animejanai_2x.vpy
```

This evaluates the script and reports the output nodes without rendering the entire video. It is a useful first test, but a graph can still fail when a model begins processing a frame.

## 10. Run a short inference test

After the namespace, import and model-file checks pass, run a short section (for example, 48–120 frames) through the model. Confirm:

- A frame is produced without runtime errors.
- Output dimensions are what the workflow expects.
- Pixel format and color properties are sensible.
- RIFE's output frame count/FPS matches the intended interpolation mode.
- GPU utilization and VRAM usage are plausible.
- The output plays and has no obvious model artifacts.

Use [VSPipe](../workflows/preview-and-render.md) to render only a short range.

## Verification levels

| Level | Meaning | Evidence |
|---|---|---|
| Package installed | pip metadata exists | `pip show` / `pip list` |
| Import verified | Python can import the module | import test |
| Plugin loaded | VapourSynth exposes the namespace | `hasattr(vs.core, "trt")` |
| Graph constructed | `.vpy` evaluates and exposes outputs | `vspipe --info` |
| Inference verified | Model processes frames through selected backend | short render / preview |
| Production validated | Full-length output reviewed and encoded | complete render QA |

Do not label a setup “fully working” until it has passed the inference test for the model/backend combination that the client intends to use.

## 11. Generate a local audit report

The repository includes a read-only diagnostic script. From the repository root, run:

```powershell
py -3.14 scripts/audit_environment.py
```

It writes `vapoursynth_environment_report.md` and `vapoursynth_environment_manifest.json` into the current directory. It records Python/package metadata, VapourSynth namespaces, key model paths and hashes, the `vsmlrt.py` wrapper and available command versions. It does not install, uninstall or update packages. It does write the two report files in the current directory.

!!! warning "Review before publishing an audit"
    Audit reports include local executable and plugin paths, installed package names and hardware/driver information. Remove user names, custom paths and any other private details before attaching a report to a public issue or committing it to GitHub.
