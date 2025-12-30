---
name: gemini
description: Make a request to a Gemini model to answer a question, watch and analyze video files (both local and youtube), audio files (local and youtube), and generate images using the high-quality Nano Banana model. Use this skill when you need video understanding or top-tier image generation.
---

# Gemini: questions, video/audio/image/PDF analysis, and image generation

## File support

This skill supports video, audio, image, and PDF file analysis using Google Gemini models. Supported file types include:

| Category  | Extensions                               |
| --------- | ---------------------------------------- |
| Video     | `.mp4`, `.mov`, `.webm`, `.avi`, `.mkv`  |
| Audio     | `.mp3`, `.wav`, `.m4a`, `.ogg`, `.flac`  |
| Images    | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp` |
| Documents | `.pdf`       

- Videos can be local files or YouTube links. Up to an hour long. [1]
- PDF files up to 50MB or 1000 pages. [2]
- Audio can be local files or YouTube links. Up to 9.5 hours long. [3]

[1]: https://ai.google.dev/gemini-api/docs/video-understanding#upload-video
[2]: https://ai.google.dev/gemini-api/docs/document-processing#document-types
[3]: https://ai.google.dev/gemini-api/docs/audio

## How to use

Run the skill using `npx` with the path to the skill directory. This automatically installs dependencies:

```bash
npx /path/to/skills/gemini [--model=MODEL] [--file=FILENAME] "YOUR REQUEST"
```

The skill path depends on your setup (e.g., `/mnt/skills/gemini`, `.claude/skills/gemini`, etc.).

**Arguments:**

- `--model` - Model to use (defaults to `gemini-3-flash-preview`). Use an `-image` model for image generation.
- `--file` - Optional file path for video, audio, image, or PDF analysis.

**Examples:**

```bash
# Simple question
npx /path/to/skills/gemini "Explain quantum computing in one sentence"

# Analyze a video
npx /path/to/skills/gemini --file=video.mp4 "What is the best single frame timestamp to represent the content of this video?"
npx /path/to/skills/gemini --file="https://www.youtube.com/watch?v=F0I5M4Pb85k" "Summarize the video"

# Analyze a PDF
npx /path/to/skills/gemini --file=document.pdf "Extract the key findings from this paper"

# Generate an image
npx /path/to/skills/gemini --model=gemini-3-pro-image-preview "A serene mountain landscape at sunset"

# Generate an image from a video
npx /path/to/skills/gemini --model=gemini-3-pro-image-preview --file=video.mp4 "Generate an image that captures the essence of this video"
```

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test
```

## API Key

The `GEMINI_API_KEY` environment variable must be set. If not set, the script will provide instructions. Get your key at: https://ai.google.dev/gemini-api/docs/api-key

## Available Models

| Model ID                     | Context Window | Knowledge Cutoff | Pricing (Input / Output)           |
| ---------------------------- | -------------- | ---------------- | ---------------------------------- |
| `gemini-3-pro-preview`       | 1M / 64k       | Jan 2025         | $2 / $12 (<200k), $4 / $18 (>200k) |
| `gemini-3-flash-preview`     | 1M / 64k       | Jan 2025         | $0.50 / $3                         |
| `gemini-3-pro-image-preview` | 65k / 32k      | Jan 2025         | $2 (Text) / $0.134 (Image)         |
