# Previewing & Rendering Video

Once you have written a `.vpy` script, you can preview it in a GUI, inspect individual frames, and render the final video to an MP4/MKV file.

---

## 1. Interactive Preview with VSView

**VSView** is a lightweight, high-performance frame previewer built specifically for VapourSynth scripts.

### Launching VSView

```powershell
vsview test.vpy
```

### Essential VSView Keyboard Shortcuts

| Key | Action |
|:---:|---|
| <kbd>1</kbd> | Switch to **Output 0** (Original source clip) |
| <kbd>2</kbd> | Switch to **Output 1** (AI Processed clip) |
| <kbd>Space</kbd> | Play / Pause video playback |
| <kbd>←</kbd> / <kbd>→</kbd> | Step back / forward 1 frame |
| <kbd>Ctrl</kbd> + <kbd>Scroll</kbd> | Zoom in / out to inspect pixel details |
| <kbd>F</kbd> | Toggle Fullscreen mode |

!!! tip "Instant A/B Quality Comparison"
    While zoomed in on fine line art or text, toggle rapidly between <kbd>1</kbd> and <kbd>2</kbd> to inspect the sharpness and artifacts of your AI model compared to the source.

---

## 2. Inspecting Script Metadata (`vspipe --info`)

To verify clip resolution, frame rate, total frames, and pixel format without rendering:

```powershell
vspipe --info test.vpy
```

Expected output:
```text
Output 0:
  Width: 1920, Height: 1080
  FPS: 24000/1001 (23.976 fps)
  Format: YUV420P10
  Frames: 1440

Output 1:
  Width: 3840, Height: 2160
  FPS: 24000/1001 (23.976 fps)
  Format: YUV420P10
  Frames: 1440
```

---

## 3. Rendering a Short Test Segment

Always render a short range of frames (e.g. 100 frames) before committing to a full-length video encode.

To export frames 0 to 99 as a `.y4m` raw video file:

```powershell
vspipe --start 0 --end 99 --outputindex 1 --container y4m test.vpy test_clip.y4m
```

---

## 4. Direct Pipe to FFmpeg (Full Video Encode)

Instead of saving massive uncompressed `.y4m` files to disk, you can stream VapourSynth's output directly into **FFmpeg** through a pipe (`|`).

### Option A: NVIDIA NVENC Hardware Encoding (Ultra Fast)

Streams processed frames into NVIDIA's hardware HEVC (H.265) encoder:

```powershell
vspipe -c y4m test.vpy - | ffmpeg -i - -c:v hevc_nvenc -preset p7 -cq 18 -pix_fmt p010le output_ai.mp4
```

### Option B: High-Quality CPU Encoding (x265 / 10-bit)

For maximum visual efficiency and compression:

```powershell
vspipe -c y4m test.vpy - | ffmpeg -i - -c:v libx265 -crf 18 -preset slow -pix_fmt yuv420p10le output_ai.mp4
```

### Option C: Muxing Audio and Subtitles from the Original Video

To take the AI-processed video stream from VapourSynth while copying audio and subtitle tracks from your original source file:

```powershell
vspipe -c y4m test.vpy - | ffmpeg -i - -i "C:\path\to\original_video.mp4" `
  -map 0:v:0 -map 1:a? -map 1:s? `
  -c:v hevc_nvenc -preset p7 -cq 18 `
  -c:a copy -c:s copy output_complete.mkv
```

---

## 5. VSPipe Command Options Reference

| Option | Description |
|---|---|
| `-c y4m` / `--container y4m` | Outputs standard Y4M video header (required for piping into FFmpeg). |
| `--outputindex <N>` | Specifies which output node to render (`0` or `1`). Default is the last output defined. |
| `--start <N>` / `--end <N>` | First and last frame numbers to render (inclusive). |
| `-p` / `--progress` | Displays progress bar with current FPS and time elapsed. |
| `-r <N>` / `--requests <N>` | Number of concurrent frame requests. Defaults to number of CPU threads. |
