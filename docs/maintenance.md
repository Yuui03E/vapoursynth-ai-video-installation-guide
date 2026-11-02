# Maintain and publish this guide

This repository is intended to be uploaded to GitHub and published as a searchable documentation site with GitHub Pages.

## Repository layout

```text
vapoursynth-ai-video-guide/
├── .github/workflows/docs.yml
├── docs/
│   ├── assets/
│   ├── examples/
│   ├── installation/
│   ├── models/
│   ├── reference/
│   ├── start-here/
│   ├── stylesheets/
│   ├── troubleshooting/
│   └── workflows/
├── scripts/
├── mkdocs.yml
├── requirements-docs.txt
└── README.md
```

## 1. Rename the repository (optional)

Choose a repository name such as `vapoursynth-ai-video-guide`. The name is part of the GitHub Pages URL.

## 2. Update the GitHub Pages URL

Open `mkdocs.yml` and replace:

```yaml
site_url: https://yuui03e.github.io/vapoursynth-ai-video-guide/
```

with the actual Pages URL. For example, if the account is `example-user` and the repository is `vapoursynth-ai-video-guide`, use:

```yaml
site_url: https://example-user.github.io/vapoursynth-ai-video-guide/
```

In `README.md`, replace the placeholder GitHub username/repository in the Pages link and build-status badge too. If you are not ready to publish, you can leave those links as placeholders locally, but update them before making the repo public.

## 3. Preview locally

Install documentation tooling in a separate virtual environment. This environment is only for building the website; it is not the VapourSynth runtime environment.

```powershell
py -3.14 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-docs.txt
zensical serve
```

Open `http://127.0.0.1:8000/`. Edit Markdown pages under `docs/`; the preview server rebuilds the site as files change.

Build a static version:

```powershell
zensical build --clean
```

The generated website is placed in `site/`. Do not commit the generated `site/` directory unless you deliberately choose a different hosting workflow.

## 4. Upload to GitHub

Create an empty GitHub repository, then from the root of this folder run:

```powershell
git init
git add .
git commit -m "Add VapourSynth AI video documentation"
git branch -M main
git remote add origin https://github.com/Yuui03E/vapoursynth-ai-video-guide.git
git push -u origin main
```

Replace the remote URL with your actual repository URL.

## 5. Enable GitHub Pages

In the repository on GitHub:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Push to the `main` branch or run the `Publish documentation` workflow manually.
4. Check the **Actions** tab for the deployment result.
5. Open the published Pages URL.

The workflow is based on the current Zensical GitHub Pages instructions and uses the official Pages configure/upload/deploy actions.

## 6. Update the tested environment responsibly

When the reference PC is updated, do not simply replace the version table with the latest package versions. Run the full validation sequence:

1. Export `pip freeze --all` and `pip list --format=json`.
2. Record Windows, Python, VapourSynth, JET, driver and GPU versions.
3. Confirm core imports and plugin namespaces.
4. Verify wrapper files and hashes.
5. Verify model files and hashes.
6. Run an actual short inference for each advertised workflow.
7. Review output dimensions, FPS, pixel format, audio mapping and visual quality.
8. Update [the environment baseline](reference/tested-environment.md) and [validation status](reference/validation-status.md).

The audit in this repository is a reference snapshot from 2 November 2026. It did not include a full lockfile for all 120 Python distributions and did not execute all model inference tests.

## 7. Public-repository hygiene

Before publishing:

- Remove personal user paths from generated audit reports.
- Do not commit ONNX model weights, TensorRT engine caches or source videos.
- Do not commit full private package/environment logs unless reviewed.
- Keep the model archive and wrapper downloads linked to their upstream source.
- Record SHA-256 values for important pinned assets.
- Preserve attribution and the licenses of third-party projects.

## 8. Documentation builder choice

This repository uses Zensical. It is maintained by the team behind Material for MkDocs and is the current successor project. The documentation content remains Markdown-first and is intentionally separated from the VapourSynth installation environment.

References:

- [Zensical — create a site](https://zensical.org/docs/create-your-site/)
- [Zensical — publish with GitHub Pages](https://zensical.org/docs/publish-your-site/)
- [Zensical — customization](https://zensical.org/docs/customization/)
