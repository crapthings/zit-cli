---
name: zit-cli
description: Use this skill whenever the user wants to generate images from the command line with this repo's `zit` tool, create GitHub repo/social preview images, make mascot/banner/illustration assets, test the WaveSpeedAI Z-Image-Turbo CLI, or needs help choosing `zit` parameters such as aspect ratio, size, seed, format, output path, reference image, or JSON output. Prefer this skill for repo artwork and prompt-to-image workflows in projects that use `@crapthings/zit-cli`.
license: MIT
metadata:
  author: crapthings
  repository: https://github.com/crapthings/zit-cli
---

# zit-cli

Use `zit-cli` to generate images with WaveSpeedAI's `wavespeed-ai/z-image/turbo` model from the terminal.

This skill teaches agents how to use the CLI in this repository and how to choose practical parameters for common image-generation tasks.

## Prerequisites

Check for the CLI before using it:

```bash
command -v zit
```

If the current working directory is the `zit-cli` repo, prefer the local entrypoint:

```bash
node bin/zit.js --help
```

For installed usage:

```bash
zit --help
```

For one-off usage after the package is published:

```bash
npx @crapthings/zit-cli --help
```

Authentication is required. Prefer the environment variable:

```bash
test -n "$WAVESPEED_API_KEY" && echo "WAVESPEED_API_KEY is set"
```

Do not print or expose the API key. If it is missing, tell the user to set:

```bash
export WAVESPEED_API_KEY="your-api-key"
```

## Core Command

Generate from a prompt:

```bash
zit "a warm cartoon mascot illustration for an open source CLI" --ratio wide --output assets/cover.png
```

Use the local repo entrypoint:

```bash
node bin/zit.js "a warm cartoon mascot illustration for an open source CLI" --ratio wide --output assets/cover.png
```

Use a reference image:

```bash
zit --image ./reference.png "turn this into a soft illustrated project banner" --ratio wide --output assets/banner.png
```

Print JSON for scripting:

```bash
zit "minimal product photo, white background" --json
```

## Parameter Selection

### Ratios

Use `--ratio` for most work. The CLI sets the longest side to `1536` and computes the other side from the ratio.

Common choices:

| Goal | Parameter | Size |
| --- | --- | --- |
| GitHub repo/social preview | `--ratio wide` or `--ratio 16:9` | `1536*864` |
| Square icon or avatar | `--ratio square` or `--ratio 1:1` | `1536*1536` |
| Poster | `--ratio poster` or `--ratio 2:3` | `1024*1536` |
| Phone wallpaper/story/reel | `--ratio phone` or `--ratio 9:16` | `864*1536` |
| Landscape illustration | `--ratio landscape` or `--ratio 4:3` | `1536*1152` |
| Portrait illustration | `--ratio portrait` or `--ratio 3:4` | `1152*1536` |
| Photo-like landscape | `--ratio photo` or `--ratio 3:2` | `1536*1024` |

List available ratios:

```bash
zit ratios
```

Use `--size WIDTHxHEIGHT` only when the user needs an exact custom size. Width and height must each be `1536` or smaller:

```bash
zit "detailed fantasy map" --size 1536x1024
```

### Output Format

Use:

- `--format png` for repo art, UI assets, illustrations, and images that may be reused.
- `--format jpeg` for photo-like generations and smaller files.
- `--format webp` for web-optimized output when compatibility is acceptable.

### Output Path

Use `--output <path>` when the user wants a local file.

If the path has an extension, the CLI writes that file:

```bash
zit "cartoon mascot" --ratio wide --format png --output assets/zit-cli-cover.png
```

If the path is a directory, the CLI creates a generated filename:

```bash
zit "cartoon mascot" --ratio wide --output assets
```

Do not combine `--base64` with `--output`; the CLI rejects it because base64 results are not downloadable URLs.

### Seed

Use `--seed <integer>` for repeatability:

```bash
zit "friendly mascot, hand drawn, warm colors" --seed 42
```

Use the default `--seed -1` for random output.

### Reference Images

For local reference images, pass the path with `--image`. The CLI uploads the file first:

```bash
zit --image ./sketch.png "convert this sketch into a polished cartoon banner" --ratio wide --output banner.png
```

For remote images, pass the URL directly:

```bash
zit --image "https://example.com/reference.png" "make this warmer and more playful" --ratio 1:1
```

## Prompting Guidance

Write prompts that describe the target asset directly. Include:

- Subject: mascot, banner, icon, cover, poster, product photo.
- Style: cartoon, hand-drawn, warm, minimal, editorial, cinematic.
- Composition: GitHub repo banner, centered subject, room for title, simple background.
- Constraints: no watermark, no logo, no tiny unreadable text.

For repo artwork, prefer friendly and inspectable prompts over abstract tech visuals:

```text
A charming cartoon mascot for an open source command-line image generator named zit-cli, a friendly small zebra artist holding a tiny paintbrush beside a simple terminal prompt that says zit, warm playful illustration, clean GitHub repository banner composition, soft colors, hand-drawn style, approachable, minimal tech elements, no futuristic neon, no logos, no watermark, readable simple shapes
```

When the user says the image is too technical, reduce neon, glass, circuit, cyber, terminal-heavy, and futuristic language. Add words like `cartoon`, `hand-drawn`, `warm`, `storybook`, `soft colors`, `friendly mascot`, and a concrete animal or character.

## Common Workflows

### Create a GitHub repo banner

Use a wide PNG and save under `assets/`:

```bash
mkdir -p assets
zit "friendly cartoon mascot for a command-line image generator, warm hand-drawn project banner, simple background, no watermark" --ratio wide --format png --output assets/zit-cli-cover.png
```

Then add to README:

```markdown
![zit-cli mascot banner](assets/zit-cli-cover.png)
```

### Replace an existing generated asset

If the user asks for a better version, overwrite the same output file unless they ask for variants:

```bash
zit "new prompt here" --ratio wide --format png --output assets/zit-cli-cover.png
```

### Generate variants

Use different seeds and save to a directory:

```bash
zit "cartoon mascot, warm colors" --ratio wide --seed 1 --output assets/variants
zit "cartoon mascot, warm colors" --ratio wide --seed 2 --output assets/variants
zit "cartoon mascot, warm colors" --ratio wide --seed 3 --output assets/variants
```

## Verification

After generation, verify the file:

```bash
file assets/zit-cli-cover.png
ls -lh assets/zit-cli-cover.png
```

Expected for a wide PNG:

```text
PNG image data, 1536 x 864
```

If the command fails with DNS, network, or `fetch failed` errors in a sandboxed environment, request permission to run the same command with network access. Do not treat this as a prompt or API key problem until the network path is confirmed.

If the command fails with an API key error, ask the user to set `WAVESPEED_API_KEY` or pass `--api-key`.

## Safety and Cost

Each generation calls the WaveSpeedAI API and may cost credits. Avoid generating many variants unless the user asked for them.

Do not reveal API keys in logs, README files, shell history snippets, or final answers.
