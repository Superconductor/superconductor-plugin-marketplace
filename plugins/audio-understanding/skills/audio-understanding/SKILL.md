---
name: audio-understanding
description: Transcribe and analyze audio content using Google Gemini. Supports local audio files (mp3, wav, m4a, ogg, flac) and YouTube links up to 9.5 hours long. Use this skill when you need to transcribe, summarize, or extract information from audio content.
---

# Audio Understanding: Audio transcription and analysis with Gemini

## File support

This skill supports audio analysis using Google Gemini models. Supported formats:

| Category | Extensions                              |
| -------- | --------------------------------------- |
| Audio    | `.mp3`, `.wav`, `.m4a`, `.ogg`, `.flac` |

- Local audio files up to 9.5 hours long
- YouTube links (youtube.com/watch, youtu.be, youtube.com/embed)

Reference: https://ai.google.dev/gemini-api/docs/audio?example=dialogue

## How to use

```bash
bash ${CLAUDE_PLUGIN_ROOT}/scripts/gemini.sh --file=AUDIO_PATH "YOUR QUESTION ABOUT THE AUDIO"
```

**Arguments:**

- `--file` - Required: Local audio file path or YouTube URL
- `--model` - Optional: Model to use (defaults to `gemini-3-flash-preview`)

**Examples:**

```bash
# Transcribe a local audio file
npx -y superconductor-gemini-skills --file=recording.mp3 "Transcribe this audio"
npx -y superconductor-gemini-skills --file=meeting.wav "Summarize the key points discussed"

# Analyze a podcast or YouTube audio
npx -y superconductor-gemini-skills --file="https://www.youtube.com/watch?v=dQw4w9WgXcQ" "Transcribe this audio"
npx -y superconductor-gemini-skills --file="https://youtu.be/dQw4w9WgXcQ" "What topics are discussed?"

# Extract specific information
npx -y superconductor-gemini-skills --file=interview.m4a "List all the questions asked by the interviewer"
npx -y superconductor-gemini-skills --file=lecture.ogg "Create a bullet-point summary of the main concepts"
```

## API Key

The `GEMINI_API_KEY` environment variable must be set. Get your key at: https://ai.google.dev/gemini-api/docs/api-key

## Models

| Model ID                 | Context Window | Pricing (Input / Output)                 |
| ------------------------ | -------------- | ---------------------------------------- |
| `gemini-3-pro-preview`   | 1M / 64k       | $2 / $12 (<200k), $4 / $18 (>200k)       |
| `gemini-3-flash-preview` | 1M / 64k       | $0.50 / $3                               |
| `gemini-2.5-pro`         | 1M / 65k       | $1.25 / $10 (<200k), $2.50 / $15 (>200k) |
| `gemini-2.5-flash`       | 1M / 65k       | $0.30 / $2.50                            |
