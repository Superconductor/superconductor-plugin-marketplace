---
name: video-generation
description: Generate videos using Google Veo models. Create 4-8 second videos from text prompts, with optional image-to-video and video extension capabilities. Veo 3.1 supports native audio generation including dialogue and sound effects.
---

# Video Generation: Create videos with Veo

## Overview

Generate videos using Google's Veo models. Supports:

- Text-to-video generation (4-8 seconds)
- Image-to-video (animate a starting frame)
- Native audio generation with dialogue and sound effects (Veo 3.1)

Reference: https://ai.google.dev/gemini-api/docs/video

## How to use

```bash
bash ${CLAUDE_PLUGIN_ROOT}/scripts/gemini.sh --model=veo-3.1-generate-preview "YOUR VIDEO DESCRIPTION"
```

**Arguments:**

- `--model` - Required: Use a Veo model (see Models below)
- `--file` - Optional: Starting frame image for image-to-video
- `--aspect-ratio` - Optional: `16:9` (default) or `9:16`
- `--duration` - Optional: `4`, `6`, or `8` seconds (default: 8)

**Examples:**

```bash
# Generate a video from text
npx /path/to/scripts --model=veo-3.1-generate-preview "A serene mountain landscape at sunset, camera slowly panning right"

# Generate with specific aspect ratio and duration
npx /path/to/scripts --model=veo-3.1-generate-preview --aspect-ratio=9:16 --duration=4 "A person walking through a busy city street"

# Include dialogue (Veo 3.1)
npx /path/to/scripts --model=veo-3.1-generate-preview "Two friends at a coffee shop. One says \"Did you hear the news?\" The other replies \"No, what happened?\""

# Animate an image
npx /path/to/scripts --model=veo-3.1-generate-preview --file=landscape.jpg "Camera slowly zooms in on the mountain peak"

# Fast generation (lower quality, quicker)
npx /path/to/scripts --model=veo-3.1-fast-generate-preview "A cat playing with a ball of yarn"
```

## Prompt tips

Effective prompts should include:
- **Subject**: What appears in the video
- **Action**: What the subject does
- **Style**: Creative direction (cinematic, documentary, etc.)
- **Camera**: Movement and positioning (pan, zoom, tracking shot)
- **Audio** (Veo 3.1): Dialogue in quotes, sound effect descriptions

## Output

Generated videos are saved to the current directory as `gemini-video-{timestamp}.mp4`.

## Limitations

- Video length: 4-8 seconds
- Generation time: 11 seconds to 6 minutes
- Videos stored on server for 2 days
- All videos include SynthID watermarks

## API Key

The `GEMINI_API_KEY` environment variable must be set. Get your key at: https://ai.google.dev/gemini-api/docs/api-key

## Models

| Model ID                        | Features                    | Speed  |
| ------------------------------- | --------------------------- | ------ |
| `veo-3.1-generate-preview`      | Native audio, best quality  | Normal |
| `veo-3.1-fast-generate-preview` | Native audio, faster        | Fast   |
| `veo-3.0-generate-001`          | Audio support               | Normal |
| `veo-2.0-generate-001`          | Silent video only           | Normal |
