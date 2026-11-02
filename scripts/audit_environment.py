"""Read-only VapourSynth environment auditor.

Run with: py -3.14 scripts/audit_environment.py

The script imports the installed VapourSynth core and reads package metadata,
plugin namespaces, model files and NVIDIA driver information. It writes two
reports to the current working directory. It does not install, uninstall,
update or modify software under Python/site-packages.
"""
from __future__ import annotations

import hashlib
import importlib.metadata as metadata
import json
import platform
import shutil
import subprocess
import sys
import sysconfig
from datetime import datetime
from pathlib import Path
from typing import Any

PACKAGE_NAMES = [
    "vapoursynth", "vsjetpack", "vstools", "vsview", "vsrepo",
    "vapoursynth-bestsource", "vapoursynth-mlrt-trt",
    "vapoursynth-mlrt-trt-rtx", "vapoursynth-mlrt-ort",
    "vapoursynth-mlrt-ncnn", "vapoursynth-mlrt-ov",
    "tensorrt-cu13", "tensorrt-rtx-cu13",
    "nvidia-cuda-runtime", "nvidia-cuda-runtime-cu13",
    "nvidia-cublas", "nvidia-cublas-cu13", "nvidia-cudnn-cu13",
]
MODEL_RELATIVE_PATHS = [
    Path("animejanai/2x_AnimeJaNai_HD_V3_Compact.onnx"),
    Path("rife_v2/rife_v4.26.onnx"),
]


def run_command(args: list[str]) -> dict[str, Any]:
    executable = shutil.which(args[0])
    if not executable:
        return {"available": False, "command": args, "output": None}
    try:
        completed = subprocess.run(
            args, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=20
        )
        return {
            "available": True,
            "command": args,
            "returncode": completed.returncode,
            "stdout": completed.stdout.strip(),
            "stderr": completed.stderr.strip(),
        }
    except (OSError, subprocess.TimeoutExpired) as exc:
        return {"available": True, "command": args, "error": str(exc)}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def get_all_distributions() -> list[dict[str, str]]:
    items = []
    for dist in metadata.distributions():
        name = dist.metadata.get("Name")
        if name:
            items.append({"name": name, "version": dist.version})
    return sorted(items, key=lambda item: item["name"].lower())


def get_package_versions(all_distributions: list[dict[str, str]]) -> dict[str, str | None]:
    installed = {
        item["name"].lower().replace("_", "-"): item["version"]
        for item in all_distributions
    }
    return {
        name: installed.get(name.lower().replace("_", "-"))
        for name in PACKAGE_NAMES
    }


def main() -> int:
    all_distributions = get_all_distributions()
    report: dict[str, Any] = {
        "audit_generated_local": datetime.now().astimezone().isoformat(timespec="seconds"),
        "python": {
            "version": sys.version,
            "executable": sys.executable,
            "architecture": platform.architecture()[0],
            "platform": platform.platform(),
            "prefix": sys.prefix,
            "site_packages": sysconfig.get_paths().get("purelib"),
        },
        "packages": get_package_versions(all_distributions),
        "all_distributions": all_distributions,
        "commands": {"nvidia_smi": run_command(["nvidia-smi"]), "vspipe": run_command(["vspipe", "--version"])},
        "vapoursynth": {},
        "models": [],
        "vsmlrt": {},
        "warnings": [],
    }

    try:
        import vapoursynth as vs

        core = vs.core
        plugin_dir = Path(vs.get_plugin_dir())
        report["vapoursynth"] = {
            "version": getattr(vs, "__version__", "unknown"),
            "core": str(core),
            "plugin_dir": str(plugin_dir),
            "plugin_dll_count": len(list(plugin_dir.rglob("*.dll"))) if plugin_dir.exists() else 0,
            "plugin_dlls": [
                {"path": str(path.relative_to(plugin_dir)), "size_bytes": path.stat().st_size}
                for path in sorted(plugin_dir.rglob("*.dll"))
            ] if plugin_dir.exists() else [],
            "plugin_namespaces": sorted(str(key) for key in core.plugins().keys()),
            "namespace_checks": {
                name: hasattr(core, name)
                for name in ("bs", "trt", "trt_rtx", "ort", "ov", "ncnn", "bm3d")
            },
        }
        models_dir = plugin_dir / "models"
        for relative in MODEL_RELATIVE_PATHS:
            path = models_dir / relative
            item: dict[str, Any] = {"relative_path": str(relative), "exists": path.is_file()}
            if path.is_file():
                item["size_bytes"] = path.stat().st_size
                item["sha256"] = sha256(path)
            report["models"].append(item)
        if models_dir.exists():
            report["models"].append({
                "inventory": True,
                "onnx_file_count": sum(1 for _ in models_dir.rglob("*.onnx")),
                "models_dir": str(models_dir),
            })
    except Exception as exc:  # capture diagnostics rather than aborting the audit
        report["warnings"].append(f"VapourSynth import/core inspection failed: {type(exc).__name__}: {exc}")

    try:
        import vsmlrt
        wrapper_path = Path(vsmlrt.__file__).resolve()
        report["vsmlrt"] = {
            "path": str(wrapper_path),
            "version": getattr(vsmlrt, "__version__", "unknown"),
            "size_bytes": wrapper_path.stat().st_size if wrapper_path.is_file() else None,
            "sha256": sha256(wrapper_path) if wrapper_path.is_file() else None,
        }
    except Exception as exc:
        report["warnings"].append(f"vsmlrt import failed or is not installed: {type(exc).__name__}: {exc}")

    report["pip_check"] = run_command([sys.executable, "-m", "pip", "check"])

    json_path = Path.cwd() / "vapoursynth_environment_manifest.json"
    md_path = Path.cwd() / "vapoursynth_environment_report.md"
    json_path.write_text(json.dumps(report, indent=2, default=str), encoding="utf-8")

    lines = [
        "# VapourSynth Environment Audit",
        "",
        f"> Generated: {report['audit_generated_local']}",
        "> Read-only inspection. The script writes only these report files.",
        "",
        "## Python",
        "",
        f"- Version: `{report['python']['version']}`",
        f"- Executable: `{report['python']['executable']}`",
        f"- Architecture: `{report['python']['architecture']}`",
        "",
        "## Packages",
        "",
        "| Distribution | Detected version |",
        "|---|---:|",
    ]
    lines.extend(f"| `{name}` | {version or 'Not detected'} |" for name, version in report["packages"].items())
    vs_info = report.get("vapoursynth") or {}
    lines += ["", "## VapourSynth", ""]
    if vs_info:
        lines += [
            f"- Version: `{vs_info.get('version', 'unknown')}`",
            f"- Plugin directory: `{vs_info.get('plugin_dir', 'unknown')}`",
            f"- Plugin DLL files: {vs_info.get('plugin_dll_count', 'unknown')}",
            f"- Namespaces: {', '.join(vs_info.get('plugin_namespaces', []))}",
            "",
            "| Namespace | Available |",
            "|---|---:|",
        ]
        lines.extend(f"| `{name}` | {value} |" for name, value in vs_info.get("namespace_checks", {}).items())
    else:
        lines.append("VapourSynth inspection did not complete. See the warning section in the JSON report.")
    lines += ["", "## Model files", "", "| Item | Result |", "|---|---|"]
    for model in report["models"]:
        if model.get("inventory"):
            lines.append(f"| ONNX file count | {model['onnx_file_count']} |")
        else:
            status = "Present" if model.get("exists") else "Missing"
            lines.append(f"| `{model['relative_path']}` | {status} |")
            if model.get("sha256"):
                lines.append(f"| SHA-256 | `{model['sha256']}` |")
    lines += ["", "## vsmlrt.py", ""]
    if report.get("vsmlrt"):
        lines += [
            f"- Path: `{report['vsmlrt']['path']}`",
            f"- Version: `{report['vsmlrt']['version']}`",
            f"- SHA-256: `{report['vsmlrt']['sha256']}`",
        ]
    else:
        lines.append("Not imported. See JSON warnings.")
    lines += ["", "## Dependency check", "", str(report["pip_check"]), "", "## Warnings", ""]
    lines.extend(f"- {warning}" for warning in report["warnings"])
    if not report["warnings"]:
        lines.append("- None reported by this script.")
    lines += ["", "## Commands", ""]
    for name, result in report["commands"].items():
        lines.append(f"### {name}")
        lines.append("```text")
        lines.append(result.get("stdout") or result.get("stderr") or "Not available")
        lines.append("```")
        lines.append("")
    md_path.write_text("\n".join(lines), encoding="utf-8")

    print(f"Audit complete. Reports written to:\n  {md_path}\n  {json_path}")
    print("No Python packages or files under the VapourSynth installation were modified.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
