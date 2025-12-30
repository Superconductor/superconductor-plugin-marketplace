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

MAKE SURE TO RELOAD CLAUDE CODE IN ORDER TO LOAD THE PLUGIN.

## Gemini plugin

Enables the agent to make requests to Google Gemini AI models in order to:

- Get a second opinion from another frontier AI model
- Watch and analyze videos (both local and YouTube)
- Generate high-quality images (using the Nano Banana Pro model)


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

### Future Work

- [x] Add Gemini plugin: https://ai.google.dev/gemini-api/docs/gemini-3
- [ ] Use Polly for tests, so we don't have to hit API every time
- [ ] Add GitHub CI to run the tests
- [ ] Add to https://claudemarketplaces.com and https://claude-plugins.dev
- [ ] Add GPT plugin: https://platform.openai.com/docs/
- [ ] Add Grok plugin: https://docs.x.ai/docs/guides/chat
