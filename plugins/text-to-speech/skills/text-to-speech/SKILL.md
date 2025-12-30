---
name: text-to-speech
description: Convert text to natural-sounding speech using Google Gemini TTS models. Supports 30 different voices and 24 languages. Use this skill when you need to generate audio narration, voiceovers, or spoken content from text.
---

# Text-to-Speech: Generate audio from text with Gemini

## Overview

Convert text to natural-sounding speech using Google Gemini's TTS models. Supports:

- 30 prebuilt voices with distinct characteristics
- 24 languages with automatic detection
- Single-speaker and multi-speaker audio
- Natural intonation and expression

Reference: https://ai.google.dev/gemini-api/docs/speech-generation

## How to use

```bash
bash ${CLAUDE_PLUGIN_ROOT}/scripts/gemini.sh --model=gemini-2.5-flash-preview-tts "TEXT TO SPEAK"
```

**Arguments:**

- `--model` - Required: Use a TTS model (see Models below)
- `--voice` - Optional: Voice name (default: `Kore`)

**Examples:**

```bash
# Generate speech with default voice
npx -y superconductor-gemini-skills --model=gemini-2.5-flash-preview-tts "Hello, welcome to our application."

# Use a specific voice
npx -y superconductor-gemini-skills --model=gemini-2.5-flash-preview-tts --voice=Puck "The quick brown fox jumps over the lazy dog."

# Generate longer narration
npx -y superconductor-gemini-skills --model=gemini-2.5-flash-preview-tts --voice=Charon "In today's tutorial, we'll explore the fundamentals of machine learning."

# Use higher quality model for professional content
npx -y superconductor-gemini-skills --model=gemini-2.5-pro-preview-tts --voice=Kore "This is a premium quality voice synthesis."
```

## Available voices

| Voice Name | Description                           |
| ---------- | ------------------------------------- |
| `Kore`     | Default voice, clear and professional |
| `Puck`     | Friendly and warm                     |
| `Charon`   | Deep and authoritative                |
| `Fenrir`   | Energetic and dynamic                 |
| `Leda`     | Soft and gentle                       |
| `Orus`     | Neutral and balanced                  |
| `Zephyr`   | Light and airy                        |
| `Aoede`    | Melodic and expressive                |

Additional voices: Altair, Calliope, Clio, Electra, Ember, Eris, Helios, Hyperion, Iris, Lyra, Melpomene, Nova, Orion, Polaris, Sage, Selene, Thalia, Titan, Vega, and more.

## Supported languages

English, Spanish, French, German, Italian, Portuguese, Dutch, Russian, Japanese, Korean, Chinese (Simplified/Traditional), Arabic, Hindi, Turkish, Polish, Vietnamese, Thai, Indonesian, and more.

Languages are automatically detected from the input text.

## Output

Generated audio is saved to the current directory as `gemini-speech-{timestamp}.wav`.

- Format: WAV (PCM)
- Sample rate: 24000 Hz
- Channels: Mono
- Bit depth: 16-bit

## API Key

The `GEMINI_API_KEY` environment variable must be set. Get your key at: https://ai.google.dev/gemini-api/docs/api-key

## Models

| Model ID                       | Context Window | Pricing (Input / Output)  |
| ------------------------------ | -------------- | ------------------------- |
| `gemini-2.5-flash-preview-tts` | 8k / 16k       | $0.50 / $10 per 1M tokens |
| `gemini-2.5-pro-preview-tts`   | 8k / 16k       | $1.00 / $20 per 1M tokens |
