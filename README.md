# Superconductor Plugin Marketplace

A set of plugins to enhance Claude Code and other agents with various capabilities, such as video understanding, image generation, and more.

Developed by the [superconductor.dev](https://superconductor.dev) team. We help you build software with AI agents.

## Plugins

> [!IMPORTANT]
> For all of these plugins to work, you need to have `GEMINI_API_KEY` environment variable set.
> You can get it by following [these instructions](https://ai.google.dev/gemini-api/docs/api-key).

These plugins use our [Gemini Skills](https://github.com/superconductor/gemini-skills) CLI.

### 🎬 Video Understanding

Analyze and understand video content (up to an hour long) using Google Gemini. Supports local video files (mp4, mov, webm, avi, mkv) and YouTube links.

### 🎧 Audio Understanding

Transcribe and analyze audio content (up to 9.5 hours long) using Google Gemini. Supports local audio files (mp3, wav, m4a, ogg, flac) and YouTube links.

### 🎨 Image Generation

Generate high-quality images from text descriptions using Google Gemini's image models. Can also use existing images or videos as reference for style guidance.

### 🎥 Video Generation

Create 4-8 second videos from text prompts using Google Veo models. Supports image-to-video animation and native audio generation including dialogue and sound effects.

### 🔊 Text-to-Speech

Convert text to natural-sounding speech using Google Gemini TTS models. Supports 30 different voices and 24 languages with automatic language detection.

### 🤖 Gemini Consultation

Get a second opinion on anything from Google Gemini AI. Also useful for analyzing documents (PDFs up to 50MB) and images.

## Quick Start

Run Claude and add the marketplace:

```
/plugin marketplace add https://github.com/superconductor/superconductor-plugin-marketplace
```

Then install the plugins you want:

```
/plugin install video-understanding
/plugin install audio-understanding
/plugin install image-generation
/plugin install video-generation
/plugin install text-to-speech
/plugin install gemini-consultation
```

**YOU MUST RELOAD CLAUDE CODE TO LOAD THE PLUGINS.**

## References

- https://code.claude.com/docs/en/plugin-marketplaces
- https://code.claude.com/docs/en/discover-plugins
- https://code.claude.com/docs/en/plugins-reference
- https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- https://github.com/EveryInc/compound-engineering-plugin/

### Tasks

- [ ] Add to https://claudemarketplaces.com and https://claude-plugins.dev
