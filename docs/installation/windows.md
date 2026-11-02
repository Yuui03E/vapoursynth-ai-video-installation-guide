# Install on Windows 11

This procedure reproduces the audited reference stack. It uses one Python interpreter for every command and installs NVIDIA VapourSynth runtime plugins through JET's `nvidia` extra.

!!! warning "Install in the order shown"
    Open a **new PowerShell window** after installing Python. Do not mix plain `pip`, `python` and different Python launchers. Use `py -3.14 -m pip` throughout so the packages go into the selected Python 3.14 interpreter.

## 1. Install Python 3.14.10 x64

Download the official Windows x64 installer:

[**python-3.14.10-amd64.exe**](https://www.python.org/ftp/python/3.14.10/python-3.14.10-amd64.exe)

During installation:

1. Enable **Add Python to PATH** (wording may vary by installer).
2. Keep the 64-bit installation.
3. Complete the installation.
4. Open a new PowerShell window.

Verify the interpreter and pip:

```powershell
py -3.14 --version
py -3.14 -c "import sys, struct; print('Executable:', sys.executable); print('Architecture:', struct.calcsize('P') * 8, 'bit')"
py -3.14 -m pip --version
```

Expected baseline:

```text
Python 3.14.10
Architecture: 64 bit
...pip ... from Python314\Lib\site-packages\pip (python 3.14)
```

The executable and pip paths must refer to the same Python 3.14 installation. If the launcher selects a different interpreter, stop and correct that before installing anything else.

## 2. Update pip in that interpreter

```powershell
py -3.14 -m pip install --upgrade pip
```

This updates pip only; it does not update Python itself.

## 3. Install VapourSynth

Install the R81 Python wheel used by the reference environment:

```powershell
py -3.14 -m pip install "vapoursynth==81"
```

Initialize/configure the VapourSynth core:

```powershell
vapoursynth config
```

The audited reference reports **VapourSynth R81, API R4.3**. The current installation route is pip-based; do not add an old standalone VapourSynth installer on top of this Python-wheel installation.

Verify the core and plugin directory:

```powershell
py -3.14 -c "import vapoursynth as vs; print('Version:', vs.__version__); print(vs.core)"
py -3.14 -c "import vapoursynth as vs; print(vs.get_plugin_dir())"
vspipe --version
```

If `vapoursynth config` reports that the Microsoft Visual C++ Redistributable is missing, follow the specific error and install/update the named Microsoft runtime. Do not install unrelated build tools pre-emptively.

## 4. Install JET with NVIDIA support

This is the main ecosystem installation. Run it in PowerShell exactly as written:

```powershell
py -3.14 -m pip install "vsjetpack[full,nvidia]==2.2.6" `
  --extra-index-url https://pypi.nvidia.com/ `
  --extra-index-url https://jaded-encoding-thaumaturgy.github.io/vs-wheels/simple
```

The two extra indexes matter:

- NVIDIA's index hosts NVIDIA-related Python distributions.
- JET's VSWheels index hosts some VapourSynth plugin wheels.

The `full` extra installs JET's broad CPU-side filtering ecosystem. The `nvidia` extra adds the NVIDIA plugin/runtime dependencies. In the audited reference machine, this resulted in TensorRT, TensorRT-RTX and CUDA-related Python wheels, as well as the MLRT plugin DLLs.

!!! important "Do not install a second CUDA/TensorRT stack"
    For this exact wheel-based workflow, do not separately download the CUDA Toolkit, standalone TensorRT, TensorRT-RTX or `onnxruntime-gpu` unless a future documented dependency specifically requires it. The NVIDIA display driver is still required. A machine with a different GPU/driver must be checked against the package maintainers' compatibility information.

## 5. Check package dependencies

```powershell
py -3.14 -m pip check
```

Expected:

```text
No broken requirements found.
```

A clean `pip check` means the declared Python package requirements are consistent. It does **not** prove that every native DLL loads or that every ONNX model can execute. Continue with [verification](verification.md).

## 6. Install preview and repository tools

VSView is useful for previewing `.vpy` scripts. VSRepo is an optional plugin repository utility; it is not a required part of the JET pip installation.

```powershell
py -3.14 -m pip install "vsview==0.14.0" "vsrepo==2.0.0" `
  --extra-index-url https://jaded-encoding-thaumaturgy.github.io/vs-wheels/simple
```

Audited reference versions:

| Tool | Version | Role |
|---|---:|---|
| VSView | 0.14.0 | Preview `.vpy` outputs. |
| VSRepo | 2.0.0 | Optional plugin repository CLI. |

## 7. Install the AmusementClub model pack

Download the model archive used by the reference configuration:

[**models.v15.16.7z — vs-mlrt release v15.16**](https://github.com/AmusementClub/vs-mlrt/releases/download/v15.16/models.v15.16.7z)

Ask Python for the actual plugin directory instead of hard-coding a user-specific path:

```powershell
$pluginDir = (py -3.14 -c "import vapoursynth as vs; print(vs.get_plugin_dir())").Trim()
$modelsDir = Join-Path $pluginDir "models"
New-Item -ItemType Directory -Force -Path $modelsDir | Out-Null
Write-Host "Extract the model archive into: $modelsDir"
```

Extract the archive so the final structure looks like this:

```text
<plugin directory>/
└── models/
    ├── animejanai/
    ├── cugan/
    ├── dpir/
    ├── RealESRGANv2/
    ├── rife/
    ├── rife_v2/
    └── waifu2x/
```

Avoid accidental double nesting such as `plugins\models\models\animejanai`. The expected final path is `plugins\models\animejanai\...`.

Check the two model files used in this guide:

```powershell
$pluginDir = (py -3.14 -c "import vapoursynth as vs; print(vs.get_plugin_dir())").Trim()
$modelsDir = Join-Path $pluginDir "models"

Test-Path (Join-Path $modelsDir "animejanai\2x_AnimeJaNai_HD_V3_Compact.onnx")
Test-Path (Join-Path $modelsDir "rife_v2\rife_v4.26.onnx")
(Get-ChildItem $modelsDir -Recurse -Filter *.onnx | Measure-Object).Count
```

The audit found 76 ONNX files in the reference model directory. Different model archives can contain different contents; use the file-presence checks rather than assuming the count is universal.

## 8. Install the matching `vsmlrt.py` wrapper

The audited environment uses a custom API-4-adapted wrapper, not an arbitrary current copy from the upstream `master` branch.

- **Audited version:** `4.1.1+api4.jetfix2`
- **Audited location:** `<Python314>\Lib\site-packages\vsmlrt.py`
- **Audited SHA-256:** `a22b428f316c33574ee74b7687d1b77398ed79d56d7bba6e257c8ae5c2199903`

The source URL for that pinned revision is:

```text
https://gist.githubusercontent.com/Yuui03E/f5d41b3991954b8c867c02c9751d9bcb/raw/14a43646eb956c52be3622a2829ad4941a68668e/vsmlrt.py
```

Find the `site-packages` directory dynamically:

```powershell
$sitePackages = (py -3.14 -c "import site; print(site.getsitepackages()[0])").Trim()
$wrapperPath = Join-Path $sitePackages "vsmlrt.py"
Write-Host $wrapperPath
Test-Path $wrapperPath
```

If this file is not present and you intend to use the `vsmlrt.py` examples, download the exact pinned revision to that path. Do not overwrite an existing wrapper without checking its version and hash first.

```powershell
Invoke-WebRequest `
  -Uri "https://gist.githubusercontent.com/Yuui03E/f5d41b3991954b8c867c02c9751d9bcb/raw/14a43646eb956c52be3622a2829ad4941a68668e/vsmlrt.py" `
  -OutFile $wrapperPath

Get-FileHash $wrapperPath -Algorithm SHA256
```

The resulting hash should match the audited value above for the same file revision. The JET `vsscale` API and the `vsmlrt.py` API are related but distinct interfaces; the AnimeJaNai example uses JET, while the Waifu2x/RIFE examples use the wrapper.

## 9. First-pass verification

Run every command in [the verification checklist](verification.md) before attempting model inference. If any check fails, troubleshoot that layer before continuing.

## 10. Capture the installed package versions

The reference audit reports selected core versions but is not a complete 120-package lock file. To create a full snapshot on the client machine:

```powershell
py -3.14 -m pip freeze --all > requirements-installed.txt
py -3.14 -m pip list --format=json > packages-installed.json
py -3.14 -m pip check > pip-check.txt
nvidia-smi --query-gpu=name,driver_version,memory.total --format=csv > gpu-installed.txt
```

Keep these generated files with the machine's support ticket or private deployment record. Review and redact local paths and personal data before committing any audit to a public repository.

---

## Installation sources

- [VapourSynth — Installing and compiling](https://github.com/vapoursynth/vapoursynth/blob/master/doc/installation.rst)
- [vsjetpack — installation and extras](https://jaded-encoding-thaumaturgy.github.io/vs-jetpack/)
- [JET Encoding Guide — installation](https://jaded-encoding-thaumaturgy.github.io/JET-guide/master/basics/installation/)
- [AmusementClub vs-mlrt releases](https://github.com/AmusementClub/vs-mlrt/releases)
