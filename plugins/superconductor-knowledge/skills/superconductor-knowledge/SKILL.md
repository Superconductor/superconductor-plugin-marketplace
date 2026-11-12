---
name: superconductor-knowledge
description: Learn how Superconductor works by reading the Superconductor docs for LLMs. Use this skill when the user asks how Superconductor works, how a Superconductor feature behaves, or for architecture and product context about the Superconductor app.
---

# Superconductor Knowledge

## When to use this skill

Use this skill whenever the user asks about how Superconductor works, how a Superconductor feature behaves, or for architecture and product context about the Superconductor app.

## Required workflow

Before answering any substantive question about Superconductor, read the relevant pages of the Superconductor docs. Do not rely only on prior memory for Superconductor-specific behavior.

1. Fetch the docs index, which lists every page with a one-line description:

   ```bash
   curl -sL https://www.superconductor.com/docs/llms.txt
   ```

2. Pick the pages that cover the question and fetch their Markdown versions, using the URLs from the index:

   ```bash
   curl -sL https://www.superconductor.com/docs/llms/agents/claude-code.md
   ```

3. Follow links between pages as needed. Pages link to each other with paths like `/docs/implementations/chat`; fetch the Markdown version of `/docs/<path>` at `https://www.superconductor.com/docs/llms/<path>.md`. The docs overview page is `https://www.superconductor.com/docs/llms/index.md`.

4. Answer using those pages as your primary source of truth, and link the user to the regular page URL (`https://www.superconductor.com/docs/<path>`) when it helps.

## Reading everything at once

`https://www.superconductor.com/docs/llms-full.txt` has every page in one file. It is well over 100K tokens, so only fetch it when the question needs broad context across most of the docs, such as an overview of every feature. Prefer the index and individual pages otherwise.

The public API's OpenAPI spec is at `https://www.superconductor.com/docs/api/openapi.yaml`.
