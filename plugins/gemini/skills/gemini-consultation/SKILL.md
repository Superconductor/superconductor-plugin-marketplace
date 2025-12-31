---
name: gemini-consultation
description: Ask questions to Google Gemini AI models. Use this skill when you need a second opinion from another frontier AI model, want to analyze documents (PDFs, images), or need Gemini's perspective on any topic.
---

# Gemini Consultation: Questions and document analysis

## Overview

Ask questions to Google Gemini AI models. Useful for:

- Getting a second opinion from another frontier AI model
- Analyzing documents (PDFs up to 50MB or 1000 pages)
- Analyzing images
- General questions requiring Gemini's knowledge

## File support

| Category  | Extensions                               |
| --------- | ---------------------------------------- |
| Images    | `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp` |
| Documents | `.pdf`                                   |

Reference: https://ai.google.dev/gemini-api/docs/document-processing

## How to use

```bash
bash ${CLAUDE_PLUGIN_ROOT}/scripts/gemini.sh "YOUR QUESTION"
```

**Arguments:**

- `--file` - Optional: File path for document/image analysis
- `--model` - Optional: Model to use (defaults to `gemini-3-flash-preview`)

**Examples:**

```bash
# Simple question
npx /path/to/scripts "Explain quantum computing in one sentence"

# Get a second opinion
npx /path/to/scripts "What's the best approach to implement caching in a Node.js application?"

# Analyze a PDF
npx /path/to/scripts --file=document.pdf "Extract the key findings from this paper"
npx /path/to/scripts --file=contract.pdf "Summarize the main terms and conditions"

# Analyze an image
npx /path/to/scripts --file=diagram.png "Explain what this diagram shows"
```

## API Key

The `GEMINI_API_KEY` environment variable must be set. Get your key at: https://ai.google.dev/gemini-api/docs/api-key

## Models

| Model ID                 | Context Window | Knowledge Cutoff | Pricing (Input / Output)           |
| ------------------------ | -------------- | ---------------- | ---------------------------------- |
| `gemini-3-pro-preview`   | 1M / 64k       | Jan 2025         | $2 / $12 (<200k), $4 / $18 (>200k) |
| `gemini-3-flash-preview` | 1M / 64k       | Jan 2025         | $0.50 / $3                         |
