---
name: video-understanding
description: Analyze and understand video content using Google Gemini. Supports local video files (mp4, mov, webm, avi, mkv) and YouTube links up to an hour long. Use this skill when you need to understand, summarize, or extract information from video content.
---

# Video Understanding: Video analysis with Gemini

## File support

This skill supports video analysis using Google Gemini models. Supported formats:

| Category | Extensions                              |
| -------- | --------------------------------------- |
| Video    | `.mp4`, `.mov`, `.webm`, `.avi`, `.mkv` |

- Local video files up to an hour long
- YouTube links (youtube.com/watch, youtu.be, youtube.com/embed)

Reference: https://ai.google.dev/gemini-api/docs/video-understanding

## How to use

```bash
bash ${CLAUDE_PLUGIN_ROOT}/scripts/gemini.sh --file=VIDEO_PATH "YOUR QUESTION ABOUT THE VIDEO"
```

**Arguments:**

- `--file` - Required: Local video file path or YouTube URL
- `--model` - Optional: Model to use (defaults to `gemini-3-flash-preview`)

**Examples:**

```bash
# Analyze a local video
npx /path/to/scripts --file=video.mp4 "Summarize this video"
npx /path/to/scripts --file=presentation.mov "What are the key points discussed?"

# Analyze a YouTube video
npx /path/to/scripts --file="https://www.youtube.com/watch?v=F0I5M4Pb85k" "Summarize the video"
npx /path/to/scripts --file="https://youtu.be/F0I5M4Pb85k" "What happens at the 2 minute mark?"

# Find specific moments
npx /path/to/scripts --file=video.mp4 "What is the best timestamp to represent this video's content?"
```

## API Key

The `GEMINI_API_KEY` environment variable must be set. Get your key at: https://ai.google.dev/gemini-api/docs/api-key

## Models

| Model ID                 | Context Window | Pricing (Input / Output)           |
| ------------------------ | -------------- | ---------------------------------- |
| `gemini-3-pro-preview`   | 1M / 64k       | $2 / $12 (<200k), $4 / $18 (>200k) |
| `gemini-3-flash-preview` | 1M / 64k       | $0.50 / $3                         |
