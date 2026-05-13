---
name: superconductor-artifacts
description: How to share visual content (screenshots, images, videos, diagrams) with the user when running inside Superconductor. Use any time you want to embed an image or video in your reply, save a screenshot you took, or include a Playwright screenshot.
---

# Sharing Artifacts

When Superconductor coordinates your work, the user reads your replies in a chat UI. They cannot see files inside the working directory directly — to share a screenshot, diagram, or video with them, the file must live in the artifacts directory and be referenced from your message using Markdown.

## Artifacts directory

All visual content you want to share must be stored in:

```
/workspace/.sc/artifacts
```

Files anywhere else will not render for the user.

## Embedding in a reply

**Images** — use Markdown image syntax:

```markdown
![](/workspace/.sc/artifacts/screenshot_1.png)
```

**Videos** — use a regular Markdown link (not image syntax):

```markdown
[Demo video](/workspace/.sc/artifacts/demo.mp4)
```

## Playwright MCP screenshots

When taking a screenshot with `browser_take_screenshot`:

1. Do **NOT** pass a `filename` parameter. The screenshot is saved to `/tmp/playwright-mcp-output/*`.
2. Copy the file from `/tmp/playwright-mcp-output/` to `/workspace/.sc/artifacts/` with the filename you want.
3. Embed it in your reply with the Markdown image syntax above.

## Reusing filenames

If you are retaking a screenshot of the same thing (for example, after making a fix and re-running the page), **reuse the same filename** instead of creating new filenames like `updated_X.png` or `final_X.png`. This ensures the user only sees the most recent version inline in chat.

## What does NOT belong in artifacts

Artifacts are **only** for visual content (screenshots, diagrams, images, videos). They are not a scratch directory.

- Put your text response directly in the chat message, not in a file.
- Save temporary debugging scripts to `/workspace` (outside any repo), not to the artifacts directory.
- Only save a textual file (Markdown plan, generated document, etc.) into the artifacts directory if the user **explicitly** asks you to produce a file.
