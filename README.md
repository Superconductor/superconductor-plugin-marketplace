# Superconductor Plugin Marketplace

A set of plugins to enhance Claude Code and other agents with various capabilities, such as video understanding, image generation, and more.

Developed by the [superconductor.dev](https://www.superconductor.dev) team. We help you build software with AI agents.

## Plugins

### Gemini Skills

This plugin adds several skills powered by Google Gemini and Veo AI models:

- 🎬 **video-understanding**: Analyze and understand video content (local files and YouTube links)
- 🎧 **audio-understanding**: Transcribe and analyze audio content (local files and YouTube links)
- 🎨 **image-generation**: Create high-quality images using the Nano Banana Pro model
- 🎥 **video-generation**: Create short videos from text prompts using the Gemini Veo 3.1 model
- 🤖 **gemini-consultation**: Get a second opinion from another frontier AI, analyze PDFs and images

> [!IMPORTANT]
> You need to have `GEMINI_API_KEY` environment variable set.
Get it [here](https://ai.google.dev/gemini-api/docs/api-key) to get one.

## Quick Start

Run Claude and add the marketplace:

```
/plugin marketplace add https://github.com/superconductor/superconductor-plugin-marketplace
/plugin install gemini-skills
```

**YOU MUST RELOAD CLAUDE CODE TO LOAD THE PLUGIN.**

## Development

### Running Tests

```bash
# Run tests using fixtures
make test

# Run tests without fixtures (make sure to have GEMINI_API_KEY set)
make delete-fixtures && make test
```

## References

- https://code.claude.com/docs/en/plugin-marketplaces
- https://code.claude.com/docs/en/discover-plugins 
- https://code.claude.com/docs/en/plugins-reference
- https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- https://github.com/EveryInc/compound-engineering-plugin/

### Tasks

- [ ] Add to https://claudemarketplaces.com and https://claude-plugins.dev
- [ ] Potentially publish `@superconductor/gemini` as an NPM package (then the skill can just say `npx superconductor-gemini` instead of including all the code in the plugin)
