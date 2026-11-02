# Glossary

| Term | Meaning |
|---|---|
| VapourSynth | A frame-based video processing framework. |
| `.vpy` | A Python script that builds a VapourSynth filter graph and exposes output nodes. |
| VideoNode | A VapourSynth object representing a sequence of video frames and properties. |
| Plugin | A native VapourSynth component that registers functions under a namespace on `vs.core`. |
| JET / vsjetpack | A collection of Python modules and plugin dependencies for VapourSynth filtering workflows. |
| MLRT | Machine-learning runtime plugins for VapourSynth. |
| ONNX | Open Neural Network Exchange model format used to store model graphs and weights. |
| TensorRT | NVIDIA inference runtime that builds optimized engines for a target GPU. |
| TensorRT-RTX | NVIDIA inference runtime variant targeting RTX GPUs. |
| CUDA driver | System-level NVIDIA driver interface used by CUDA applications. |
| CUDA runtime | Libraries used to execute CUDA work; can be supplied by application-specific packages/wheels. |
| CUDA Toolkit | Developer toolkit including compiler/tooling such as `nvcc`; distinct from runtime libraries. |
| Engine cache | Compiled TensorRT representation generated for a model/configuration. It is not the original ONNX model. |
| RGBS | VapourSynth 32-bit floating-point RGB format. |
| YUV420P10 | 10-bit planar YUV 4:2:0 format. |
| Upscaling | Increasing frame width and height. |
| Denoising | Estimating/removing noise from an image. |
| Deblocking | Reducing visible block artifacts from compressed video. |
| Frame interpolation | Generating estimated frames between original frames to change motion cadence/FPS. |
| FPS | Frames per second; temporal frame cadence. |
| VSPipe | Command-line application that evaluates `.vpy` scripts and writes output frames. |
| VSView | A graphical VapourSynth script previewer. |
