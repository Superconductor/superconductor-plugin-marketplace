---
name: image-generation
description: Generate high-quality images using Google Gemini's Nano Banana Pro image model. Use this skill when you need to create images from text descriptions or transform existing images/videos into new artwork.
---

# Image Generation: Create images with Gemini

## Overview

Generate high-quality images using Google Gemini's image generation models. Supports text-to-image generation and can optionally use existing images or videos as reference.

## How to use

```bash
bash ${CLAUDE_PLUGIN_ROOT}/scripts/gemini.sh --model=gemini-3-pro-image-preview "YOUR IMAGE DESCRIPTION"
```

**Arguments:**

- `--model` - Required for image generation: Use `gemini-3-pro-image-preview`
- `--file` - Optional: Reference image or video for style/content guidance

**Examples:**

```bash
# Generate an image from a text description
npx /path/to/scripts --model=gemini-3-pro-image-preview "A serene mountain landscape at sunset with golden light"

# Generate an image inspired by an existing image
npx /path/to/scripts --model=gemini-3-pro-image-preview --file=reference.jpg "Transform this into a watercolor painting"

# Generate an image from a video
npx /path/to/scripts --model=gemini-3-pro-image-preview --file=video.mp4 "Generate an image that captures the essence of this video"

# Create specific styles
npx /path/to/scripts --model=gemini-3-pro-image-preview "A cyberpunk cityscape in neon colors, digital art style"
```

## Output

Generated images are saved to the current directory as `gemini-image-{timestamp}.png`.

## API Key

The `GEMINI_API_KEY` environment variable must be set. Get your key at: https://ai.google.dev/gemini-api/docs/api-key

## Models

| Model ID                     | Context Window | Pricing                    |
| ---------------------------- | -------------- | -------------------------- |
| `gemini-3-pro-image-preview` | 65k / 32k      | $2 (Text) / $0.134 (Image) |
