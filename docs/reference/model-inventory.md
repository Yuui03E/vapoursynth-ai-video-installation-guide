# ONNX model inventory

The reference audit found **76 ONNX model files** in the model directory from AmusementClub's `models.v15.16` archive.

## Inventory by family

| Model family | Files | Notable files / variants | Approximate size range |
|---|---:|---|---:|
| AnimeJaNai | 1 | `2x_AnimeJaNai_HD_V3_Compact.onnx` | 2.30 MB |
| CUGAN | 17 | Conservative, up2x/up3x/up4x and denoise variants | 4.91–5.38 MB |
| DPIR | 4 | Color/grayscale denoise and deblocking networks | ~124.5 MB each |
| RealESRGANv2 | 3 | Anime video v3 and x2/x4 variants | 2.30–2.38 MB |
| RIFE | 10 | v4.0 through v4.10 | 19.69–21.51 MB |
| RIFE v2 | 2 | `rife_v4.25.onnx`, `rife_v4.26.onnx` | 21.69 MB each |
| Waifu2x | 39 | anime art, CUNet, photo, upconv, upresnet families | 1.10–4.91 MB |

## Important file hashes

These are hashes from the audited reference machine, useful for confirming that a downloaded model asset matches that snapshot.

| Model | SHA-256 |
|---|---|
| `animejanai/2x_AnimeJaNai_HD_V3_Compact.onnx` | `053178394c0962bab3c2a6d3262d6d96a1a944eee2fcad31cad7ec22034a8898` |
| `rife_v2/rife_v4.26.onnx` | `af25762dfec02a4bbb949decea63988b01fa56c46c0ff9dc66ac8e2f12cbb661` |

Verify on Windows:

```powershell
Get-FileHash "<plugin directory>\models\animejanai\2x_AnimeJaNai_HD_V3_Compact.onnx" -Algorithm SHA256
Get-FileHash "<plugin directory>\models\rife_v2\rife_v4.26.onnx" -Algorithm SHA256
```

## Download source

[AmusementClub vs-mlrt model pack v15.16](https://github.com/AmusementClub/vs-mlrt/releases/download/v15.16/models.v15.16.7z)

Model assets are not included in this Git repository. Download them from the upstream project, review the associated license/terms, and keep the original folder names intact. Do not upload the 76 ONNX files into this documentation repository.
