---
name: gemini
description: Use Google Gemini to answer questions, watch and analyze video and audio files, and generate images using the Nano Banana family of models.
---

# Gemini

## How to use

Make sure you understand where this skill is located (it could be `/mnt/skills/gemini`, or `.claude/skills/gemini`, or another path depending on your setup).

Then, change your working directory to the skill directory, and run 

```bash
npx --yes -p @google/genai scripts/gemini.js --model=<model> --file=<filename> "$REQUEST"
```

- `model` defaults to `gemini-3-flash-preview`. If a `-image` model is used, then your request should ask to create an image.
- `file` is optional, and is used to provide a video, audio, or image file for analysis, and your request should specify what kind of analysis you want.

Note that the `GEMINI_API_KEY` env variable must be set. If it is not, you can ask the user to provide it by linking them to these instructions 

# Info from https://ai.google.dev/gemini-api/docs/gemini-3
# TODO: make this a proper markdown table
Model ID	Context Window (In / Out)	Knowledge Cutoff	Pricing (Input / Output)*
gemini-3-pro-preview	1M / 64k	Jan 2025	$2 / $12 (<200k tokens)
$4 / $18 (>200k tokens)
gemini-3-flash-preview	1M / 64k	Jan 2025	$0.50 / $3
gemini-3-pro-image-preview	65k / 32k	Jan 2025	$2 (Text Input) / $0.134 (Image Output)**
