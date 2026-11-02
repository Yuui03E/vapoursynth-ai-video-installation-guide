# Preview and render a VapourSynth script

A `.vpy` file defines one or more output nodes. A previewer requests frames interactively; VSPipe evaluates the script and writes frames to a file or standard output.

## 1. Understand output indexes

The example scripts in this repository expose:

| Output index | Content |
|---:|---|
| `0` | Original source clip |
| `1` | Processed clip (upscaled or interpolated) |

In VSView, select output 1 to inspect the processed version. In VSPipe, use `--outputindex 1` to render only that node.

## 2. Inspect the script graph

```powershell
vspipe --info .\docs\examples\animejanai_2x.vpy
```

This loads the script and reports output information without rendering the full clip. It is a graph/metadata check, not a complete inference test.

## 3. Preview in VSView

Open the `.vpy` file in VSView. Select output 1 for the processed result. Scrub through:

- A clean scene with fine line detail.
- A dark scene.
- A scene with fast motion.
- A scene with subtitles or small text.
- A scene near a cut or flash (especially for RIFE).

Compare original and processed frames at the same zoom level. A model can make an image look sharper while also introducing halos, ringing, waxy texture or fabricated details.

## 4. Render a short test with VSPipe

For the AnimeJaNai example, render frames 0–95 (96 frames total):

```powershell
vspipe --start 0 --end 95 --outputindex 1 --container y4m `
  .\docs\examples\animejanai_2x.vpy .\animejanai_test.y4m
```

For RIFE:

```powershell
vspipe --start 0 --end 95 --outputindex 1 --container y4m `
  .\docs\examples\rife_v4_26.vpy .\rife_test.y4m
```

For Waifu2x:

```powershell
vspipe --start 0 --end 95 --outputindex 1 --container y4m `
  .\docs\examples\waifu2x_2x.vpy .\waifu2x_test.y4m
```

VSPipe's `--start` and `--end` values are frame indexes; `--end` is inclusive. The resulting Y4M file contains video frames only. It does not carry the original audio or subtitles.

## 5. Encode and mux with FFmpeg (optional)

FFmpeg is a separate tool; it is not installed by the VapourSynth commands in this guide. Once FFmpeg is installed and available in PATH, an example video encode plus audio copy is:

```powershell
ffmpeg -i .\source.mkv -i .\animejanai_test.y4m `
  -map 1:v:0 -map 0:a? `
  -c:v libx265 -pix_fmt yuv420p10le -crf 18 -preset medium `
  -c:a copy .\animejanai_test.mkv
```

This maps the processed video from the Y4M input and optional audio from the source. Adjust codec, quality, preset and audio/subtitle mapping to your own workflow. For a test Y4M generated from only 96 frames, the output is also only that short test segment.

## 6. Full render checklist

Before a long render:

- Confirm output dimensions and FPS.
- Confirm output color format and bit depth.
- Confirm the correct output index.
- Check GPU VRAM headroom and background GPU usage.
- Check audio and subtitle mapping in the final encode command.
- Render a representative short segment and inspect it.
- Keep the original source untouched until the output has been verified.

## Useful VSPipe options

| Option | Meaning |
|---|---|
| `--info` | Print information about output nodes and exit. |
| `--outputindex N` | Select one output node. |
| `--start N` | First frame to output. |
| `--end N` | Last frame to output (inclusive). |
| `--container y4m` | Write YUV video with a Y4M header. |
| `--progress` | Print render progress. |
| `--requests N` | Set concurrent frame requests. Increase only after confirming the script and filters behave correctly. |

See the [VapourSynth VSPipe documentation](https://www.vapoursynth.com/doc/output.html).
