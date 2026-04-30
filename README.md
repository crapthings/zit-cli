# zit-cli

![zit-cli mascot banner](assets/zit-cli-cover.png)

A small Node.js CLI for generating affordable web and project images with WaveSpeedAI's `wavespeed-ai/z-image/turbo` model.

`zit` intentionally focuses on one fast, low-cost model that works well for website illustrations, README banners, blog covers, placeholder artwork, and product mockups. Write a prompt, choose a common aspect ratio, and optionally download the generated image to a local file or directory.

## Features

- Uses the affordable WaveSpeedAI `wavespeed-ai/z-image/turbo` model
- Supports text-to-image and image-guided generation
- Works well for web illustrations, repo banners, blog covers, placeholders, and quick visual drafts
- Common aspect ratios with automatic max-side sizing
- Maximum generated width or height is `1536`
- Optional local file upload for reference images
- Optional output download
- JSON output for scripting
- No build step required

## Installation

```bash
npm install -g @crapthings/zit-cli
```

Or run it without installing:

```bash
npx @crapthings/zit-cli --help
```

Set your WaveSpeedAI API key:

```bash
export WAVESPEED_API_KEY="your-api-key"
```

You can get an API key from:

```text
https://wavespeed.ai/accesskey
```

## Quick Start

```bash
zit "a cinematic photo of a cat astronaut, soft studio lighting"
```

Generate a portrait image and save it:

```bash
zit "minimal product photo of a glass perfume bottle" --ratio 4:5 --format png --output ./images
```

Use a reference image:

```bash
zit --image ./reference.png "turn this into a cinematic poster" --ratio poster --output poster.jpg
```

Print the full API result as JSON:

```bash
zit "anime key visual, neon city at night" --ratio wide --seed 42 --json
```

## Usage

```text
zit [prompt] [options]
zit gen [prompt] [options]
zit ratios
```

Examples:

```bash
zit "Wong Kar-wai film style, a lonely man smoking in a narrow Hong Kong hallway"
zit gen "editorial fashion photo, red silk dress" --ratio 2:3
zit "clean app icon, glassmorphism, blue flame" --size 1024x1024 --format webp
```

## Tips

Use a ratio alias for the common social and phone formats:

```bash
zit "friendly mascot illustration for an open source project" --ratio wide
zit "storybook character poster, soft colors" --ratio poster
zit "mobile wallpaper, calm abstract landscape" --ratio phone
```

Use `--seed` when you want repeatable generations:

```bash
zit "simple cartoon mascot, warm colors" --seed 42
```

Use `--json` when you want to pipe the result into another script:

```bash
zit "product photo, white background" --json
```

## Codex Skill

This repo includes a Codex skill that teaches agents how to use `zit` for image generation, repo banners, mascot assets, parameter selection, and result verification.

Install the skill locally:

```bash
mkdir -p ~/.agents/skills/zit-cli
cp skills/zit-cli/SKILL.md ~/.agents/skills/zit-cli/SKILL.md
```

After installing, restart or refresh your agent session so the new skill appears in the available skills list.

## Aspect Ratios

`zit` caps generated images at a maximum width or height of `1536`.

When you use `--ratio`, the longest side is set to `1536`, and the shorter side is computed from the ratio and rounded to the nearest multiple of `8`.

List supported common ratios:

```bash
zit ratios
```

Common ratios:

| Ratio | Size |
| --- | --- |
| `1:1` | `1536*1536` |
| `16:9` | `1536*864` |
| `9:16` | `864*1536` |
| `4:3` | `1536*1152` |
| `3:4` | `1152*1536` |
| `3:2` | `1536*1024` |
| `2:3` | `1024*1536` |
| `5:4` | `1536*1232` |
| `4:5` | `1232*1536` |
| `21:9` | `1536*656` |
| `9:21` | `656*1536` |
| `2:1` | `1536*768` |
| `1:2` | `768*1536` |

Supported aliases:

| Alias | Ratio |
| --- | --- |
| `square` | `1:1` |
| `wide` | `16:9` |
| `tall`, `story`, `reel`, `phone` | `9:16` |
| `landscape` | `4:3` |
| `portrait` | `3:4` |
| `photo` | `3:2` |
| `poster` | `2:3` |
| `ultrawide` | `21:9` |

Use `--size WIDTHxHEIGHT` for an explicit custom size. Width and height must each be `1536` or smaller.

```bash
zit "a detailed fantasy map" --size 1536x1024
```

## Options

| Option | Description |
| --- | --- |
| `-p, --prompt <text>` | Positive prompt. Positional text also works. |
| `-r, --ratio <ratio>` | Aspect ratio or alias. Default: `1:1`. |
| `-s, --size <WIDTHxHEIGHT>` | Explicit size. Overrides `--ratio`. |
| `-i, --image <url-or-path>` | Reference image URL, data URI, or local file path. Local files are uploaded first. |
| `-o, --output <path>` | Download output to a directory or file path. |
| `--format <jpeg\|png\|webp>` | Output format. Default: `jpeg`. |
| `--strength <number>` | Transformation strength. Default: `0.6`. |
| `--seed <integer>` | Seed. Use `-1` for random. Default: `-1`. |
| `--sync` | Use WaveSpeedAI sync mode. |
| `--base64` | Request base64 output instead of URLs. |
| `--timeout <seconds>` | Max wait time. Default: `36000`. |
| `--poll <seconds>` | Poll interval. Default: `1`. |
| `--retries <count>` | Task-level retries. Default: `0`. |
| `--api-key <key>` | API key. Defaults to `WAVESPEED_API_KEY`. |
| `--json` | Print model, input, and result as JSON. |
| `-h, --help` | Show help. |

## Authentication

The recommended setup is to use `WAVESPEED_API_KEY`:

```bash
export WAVESPEED_API_KEY="your-api-key"
zit "a clean architectural photo of a concrete house"
```

You can also pass the key directly:

```bash
zit "a clean architectural photo of a concrete house" --api-key "your-api-key"
```

## Output

By default, `zit` prints the model, resolved size, and output URL:

```text
model: wavespeed-ai/z-image/turbo
size: 1536*864
https://cdn.wavespeed.ai/outputs/example.jpeg
```

Use `--output` to download the result:

```bash
zit "luxury watch macro photo" --ratio 1:1 --output ./out
```

If `--output` points to a directory, `zit` creates a generated filename. If it points to a file path, `zit` writes to that file.

## License

MIT
