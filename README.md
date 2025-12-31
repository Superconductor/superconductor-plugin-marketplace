# Superconductor Plugin Marketplace

A set of plugins to enhance Claude Code and other agents with various capabilities, developed by the [superconductor.dev](https://www.superconductor.dev) team.

We help you build software with AI agents.

## Quick Start

Run Claude and add the marketplace:

```
/plugin marketplace add https://github.com/superconductor/superconductor-plugin-marketplace
```

Then install the Gemini plugin:

```
/plugin install gemini
```

**MAKE SURE TO RELOAD CLAUDE CODE IN ORDER TO LOAD THE PLUGIN.**

## Gemini plugin

This plugin adds several skills powered by Google Gemini and Veo AI models:

- **video-understanding**: Analyze and understand video content (local files and YouTube links)
- **audio-understanding**: Transcribe and analyze audio content (local files and YouTube links)
- **image-generation**: Create high-quality images using the Nano Banana Pro model
- **video-generation**: Create short videos from text prompts using the Gemini Veo 3.1 model
- **gemini-consultation**: Get a second opinion from another frontier AI, analyze PDFs and images

## Development

## References

- https://code.claude.com/docs/en/plugin-marketplaces
- https://code.claude.com/docs/en/discover-plugins 
- https://code.claude.com/docs/en/plugins-reference
- https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- https://github.com/EveryInc/compound-engineering-plugin/

### Running Tests

```bash
make test
```

### Tasks

- [ ] Publish repo
- [ ] Add plugin to https://claudemarketplaces.com and https://claude-plugins.dev
- [ ] Potentially publish `@superconductor/gemini` as an NPM package (then the skill can just say `npx superconductor-gemini` instead of including all the code in the plugin)
