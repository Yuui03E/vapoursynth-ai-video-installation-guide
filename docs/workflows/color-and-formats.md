# Color spaces, pixel formats and bit depth

Many apparent “AI model quality” problems are actually color-conversion or format problems. The example scripts convert the source to floating-point RGB before inference and convert the result back to 10-bit YUV 4:2:0 for video encoding.

## Formats used in the examples

| Format | Meaning | Where it appears |
|---|---|---|
| `vs.RGBS` | 32-bit floating-point RGB | Input expected by the example model wrappers. |
| `vs.YUV420P10` | 10-bit planar YUV 4:2:0 | Typical processed-video output. |
| `matrix_in_s="709"` | Interpret the source YUV matrix as BT.709 during conversion | Input conversion only when that matches source metadata. |
| `matrix_s="709"` | Set the output YUV matrix to BT.709 | Output conversion when intended target is BT.709. |

## Why color metadata matters

A source file can carry separate metadata for:

- **Matrix coefficients:** how RGB and YUV components relate.
- **Transfer characteristics:** how signal values map to light.
- **Color primaries:** the chromaticity coordinates of the color system.
- **Range:** limited/video range or full/PC range.

`matrix_in_s="709"` is not a universal setting. It is an explicit assumption in the reference templates, appropriate only when the source uses BT.709 matrix coefficients. SD video, HDR sources and files with incomplete or incorrect metadata need deliberate handling.

## Bit depth is not the same as source quality

Converting a source to 10-bit output does not restore lost precision from an 8-bit source, but it can reduce additional rounding/banding in later processing and encoding. Likewise, using RGBS as the inference format does not mean the original video was captured as 32-bit RGB.

## Practical checklist

1. Inspect source metadata before conversion.
2. Choose matrix and range deliberately.
3. Keep color conversion explicit in the script.
4. Confirm the output properties after conversion.
5. Inspect gradients, skin tones, dark scenes and saturated colors.

For HDR-to-SDR tone mapping, use a dedicated color-management workflow. The example scripts in this guide are not an HDR tone-mapping recipe.
