# Troubleshooting

Do not reinstall the entire stack as the first response to an error. Identify the layer that failed and collect evidence before changing the environment.

## Triage order

1. Confirm Python executable and package target.
2. Confirm VapourSynth core and VSPipe.
3. Run `pip check` and critical imports.
4. Confirm the relevant MLRT namespace.
5. Confirm the model file and wrapper API.
6. Test graph construction, then short inference.
7. Only then investigate model/runtime compatibility or GPU memory.

## Common symptoms

| Symptom | Likely cause | First action |
|---|---|---|
| `ModuleNotFoundError: vapoursynth` | The script is running under a different Python interpreter. | Run `py -3.14 -c "import sys; print(sys.executable)"` and confirm the `vspipe`/previewer uses the same environment. |
| `vapoursynth config` fails | Core setup issue or missing Windows runtime. | Capture the complete error. Install/update the Microsoft Visual C++ Redistributable only if the error requests it. |
| `vspipe` is not recognized | Python Scripts directory is not on PATH, or the wrong environment was installed. | Run `py -3.14 -m pip show vapoursynth` and locate `Scripts\vspipe.exe`. Open a new terminal after PATH changes. |
| `pip check` reports conflicts | Package versions are inconsistent. | Save the complete output and `pip freeze --all` before changing packages. Do not blindly upgrade everything. |
| `core.trt` is false | MLRT TensorRT plugin absent, failed to load or mismatched. | Check `pip show vapoursynth-mlrt-trt`, plugin files and VapourSynth log. |
| `core.trt_rtx` is false | TensorRT-RTX MLRT plugin absent or failed to load. | Check `vapoursynth-mlrt-trt-rtx` and the exact DLL load message. |
| `core.ort` is false | MLRT ORT plugin absent or failed to load. | Check `vapoursynth-mlrt-ort` and the plugin directory. |
| ONNX model path not found | The archive was extracted to the wrong folder or has an extra nested directory. | Resolve `vs.get_plugin_dir()` and run `Test-Path` against the exact model path. |
| `cannot import name RIFE` | The local `vsmlrt.py` API differs from the script's expected wrapper revision. | Print `vsmlrt.__file__`, version, members and signatures. Use a script compatible with that exact wrapper. |
| `RIFEModel.v4_26` missing | That model enum is not exposed by the installed wrapper version. | Inspect `dir(RIFEModel)` and align the model pack and wrapper version. |
| TensorRT build/engine error | Unsupported ONNX operator, shape/profile mismatch, driver/runtime mismatch or stale engine cache. | Save the full error, test a short clip, verify model/backend pairing, then try another already-installed backend if supported. |
| CUDA out of memory | Model, frame size, tiles or streams exceed available VRAM. | Close other GPU applications; reduce tile size or stream count only if the wrapper supports it. |
| Wrong colors / washed-out output | Wrong matrix, transfer, primaries or range assumption. | Inspect source metadata and correct conversion properties. Do not assume BT.709 for all sources. |
| API 3 plugin warning | A legacy plugin binary is being loaded. | Identify the exact DLL and owning package. Update or uninstall only that package if needed; do not delete random DLLs. |
| First TensorRT run is much slower | Runtime engine optimization/build and cache generation. | Allow the first build to complete; compare later runs using the same model, shape and backend. |

## API 3 warnings: safe handling

The reference audit found zero legacy API 3 DLLs. An earlier environment may contain old `bilateralgpu` or `bm3d` DLLs, but do not assume all machines have the same problem.

First identify the files and packages:

```powershell
py -3.14 -m pip list | findstr /i "bilateral bm3d"
py -3.14 -m pip show vapoursynth-bilateralgpu
py -3.14 -m pip show vapoursynth-bm3dcpu
py -3.14 -m pip show vapoursynth-bm3dcuda
```

A package may have metadata while its binary payload is missing. Conversely, an orphaned DLL can remain even after package metadata is removed. Match each warning to its owning file/package before taking action.

## Collect a useful bug report

Ask the client to attach:

```powershell
py -3.14 --version
py -3.14 -m pip check
py -3.14 -m pip freeze --all
py -3.14 -c "import sys, vapoursynth as vs; print(sys.executable); print(vs.__version__); print(vs.get_plugin_dir()); print(vs.core)"
vspipe --version
nvidia-smi
```

Also request:

- The full traceback and native DLL loading messages.
- The model filename and SHA-256.
- The installed `vsmlrt.py` path/version if a wrapper is involved.
- The exact `.vpy` script, with private paths redacted if needed.
- A short source sample or source properties (codec, dimensions, FPS, pixel format, color metadata).

## Recovery rule

Change one thing at a time. Save the old package list and error output first. Prefer repairing the single failing layer over reinstalling Python, VapourSynth, JET, every plugin and all model files.
