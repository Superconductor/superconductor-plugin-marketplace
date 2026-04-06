---
name: superconductor-knowledge
description: Learn how Superconductor works by reading the full Superconductor docs bundle for LLMs. Use this skill when the user asks how Superconductor works, how a Superconductor feature behaves, or for architecture and product context about the Superconductor app.
---

# Superconductor Knowledge

## When to use this skill

Use this skill whenever the user asks about how Superconductor works, how a Superconductor feature behaves, or for architecture and product context about the Superconductor app.

## Required workflow

Before answering any substantive question about Superconductor, read the full docs bundle at:

- `https://superconductor.com/docs/llms-full.txt`

Do not rely only on prior memory for Superconductor-specific behavior when this docs bundle is available.

## How to use

Fetch and read the docs bundle with a network tool, for example:

```bash
curl -L https://superconductor.com/docs/llms-full.txt
```

Read the full document, then answer the user's question using that document as your primary source of truth.
