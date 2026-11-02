# Prerequisites

This guide documents a **Windows x64 + NVIDIA** reference setup. The commands are intentionally specific to that path. Other operating systems and GPU vendors need a different package selection.

## Required

| Requirement | Reference baseline | Why it matters |
|---|---|---|
| Windows | Windows 11 x64 | The tested wheels and paths in this guide are Windows-specific. |
| Python | CPython 3.14.10, 64-bit | All Python packages must install into this interpreter. |
| NVIDIA GPU | RTX 5070, 12 GB VRAM | Reference GPU for the tested package configuration. Other NVIDIA GPUs may work if driver/runtime support aligns. |
| NVIDIA driver | 617.14 on the audit date | The driver provides the system-level CUDA driver interface. |
| Internet | Required during installation and model download | pip and GitHub release assets are downloaded online. |
| Disk space | Allow several GB for packages and model assets | Runtime wheels and ONNX model packs can be large. Keep additional room for TensorRT engine caches and render outputs. |

## Required system components

- Install the official NVIDIA display driver appropriate for the target GPU.
- Install the Microsoft Visual C++ Redistributable only if VapourSynth's configuration command requests it or the relevant package documentation requires it.
- Ensure the Python launcher (`py`) is available and can select Python 3.14.

## Not required for the reference setup

| Component | Install separately? | Explanation |
|---|---|---|
| CUDA Toolkit / `nvcc` | No | The reference uses CUDA runtime libraries distributed as Python wheels. No standalone Toolkit was found in the audit. |
| Standalone TensorRT installer | No | TensorRT Python distributions and MLRT plugin wheels are already part of the JET NVIDIA installation path. |
| Standalone TensorRT-RTX installer | No | The audited environment uses the matching Python wheel and VapourSynth plugin package. |
| `onnxruntime-gpu` Python package | No | The MLRT `ort` plugin carries its runtime DLLs. The audit did not use the Python `onnxruntime-gpu` package. |
| Visual Studio / CUDA compiler toolchain | No | The guide installs prebuilt wheels; it does not compile plugins from source. |

!!! note "Driver, runtime and Toolkit are different things"
    The NVIDIA display driver is a system component. CUDA runtime, cuBLAS, cuDNN and TensorRT libraries can be delivered through Python wheels. The CUDA Toolkit is a separate developer package that includes tools such as `nvcc`. Do not interpret the `CUDA Version` line from `nvidia-smi` as proof that the full Toolkit is installed.

## Download locations

- [Python 3.14.10 Windows x64 installer](https://www.python.org/ftp/python/3.14.10/python-3.14.10-amd64.exe)
- [NVIDIA driver downloads](https://www.nvidia.com/Download/index.aspx)
- [VapourSynth installation documentation](https://github.com/vapoursynth/vapoursynth/blob/master/doc/installation.rst)
- [JET package documentation](https://jaded-encoding-thaumaturgy.github.io/vs-jetpack/)
- [AmusementClub vs-mlrt releases](https://github.com/AmusementClub/vs-mlrt/releases)
