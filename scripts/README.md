# Local diagnostic tools

## `audit_environment.py`

Run from the repository root:

```powershell
py -3.14 scripts/audit_environment.py
```

The script is read-only with respect to the installed Python/VapourSynth environment. It imports VapourSynth, inspects package metadata, checks available plugin namespaces, hashes two reference model files and the active `vsmlrt.py`, queries `nvidia-smi`/`vspipe`, and writes:

- `vapoursynth_environment_report.md`
- `vapoursynth_environment_manifest.json`

The reports are written in the current working directory. They may contain user-specific paths, installed package lists and hardware details. Review and redact them before publishing.

The script does not run AI inference and does not change installed software.
