---
name: granola
description: Search and read the user's public Granola meeting notes with curl commands. Use this skill to find recent meetings, read note summaries, fetch full transcripts with attendees, and browse folders — useful whenever meeting context would help with a task.
---

# Granola: Read meeting notes via the Granola public API

## Overview

Use curl commands to interact with the Granola public-notes API. This skill covers read-only access to the user's public Granola meeting notes: listing notes, reading a note's summary and transcript, and browsing folders.

**Authentication assumption:** The environment variable `GRANOLA_API_KEY` must already be set with a valid Granola public-notes API key. All commands below rely on it.

**Base URL:** `https://public-api.granola.ai` (do not use `api.granola.ai` — that is Granola's internal app API and rejects public-notes keys).

## How to use

All requests follow this pattern:

```bash
curl -sS "<endpoint_url>" \
  -H "Authorization: Bearer $GRANOLA_API_KEY"
```

### Required response-handling workflow

Always write API responses to a file first, then read/search only the fields you need. Transcripts in particular can be very large (a 45-minute meeting can have over a thousand segments) — never paste raw responses into chat output.

```bash
# 1) Store response
curl -sS "<endpoint_url>" \
  -H "Authorization: Bearer $GRANOLA_API_KEY" \
  -o /tmp/granola_response.json

# 2) Inspect or extract specific fields
jq '.notes[] | {id, title, created_at}' /tmp/granola_response.json
jq -r '.summary_text' /tmp/granola_response.json
```

## Endpoints

There are three endpoints:

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET | `/v1/notes` | List notes, newest first |
| GET | `/v1/notes/{note_id}` | Get one note (summary, attendees, optional transcript) |
| GET | `/v1/folders` | List folders |

### List notes

```bash
curl -sS "https://public-api.granola.ai/v1/notes?page_size=10" \
  -H "Authorization: Bearer $GRANOLA_API_KEY" \
  -o /tmp/granola_notes.json
jq '{notes: [.notes[] | {id, title, created_at, owner}], hasMore, cursor}' /tmp/granola_notes.json
```

Query parameters:

- `page_size` — integer, 1-30 (default 10)
- `created_before`, `created_after`, `updated_after` — date (`2026-01-27`) or date-time (`2026-01-27T15:30:00Z`)
- `folder_id` — folder ID (`fol_...`); includes notes in child folders
- `cursor` — opaque pagination cursor from a previous response

Each note in the response has `id` (`not_...`), `title`, `owner` (`{name, email}`), `created_at`, and `updated_at`. Notes are sorted newest-first by `created_at`.

### Get a note

```bash
curl -sS "https://public-api.granola.ai/v1/notes/not_hmVtAgY9Q7hA5p" \
  -H "Authorization: Bearer $GRANOLA_API_KEY" \
  -o /tmp/granola_note.json
jq '{title, created_at, attendees, summary_text, web_url}' /tmp/granola_note.json
```

The response includes everything from the list entry plus:

- `summary_text` (always present) and `summary_markdown` (nullable)
- `attendees` — array of `{name, email}`
- `calendar_event` — nullable: `{event_title, invitees, organiser, scheduled_start_time, scheduled_end_time}`
- `folder_membership` — array of folders
- `web_url` — link to the note on notes.granola.ai
- `transcript` — `null` unless you pass `include=transcript`

### Get a note with its transcript

```bash
curl -sS "https://public-api.granola.ai/v1/notes/not_hmVtAgY9Q7hA5p?include=transcript" \
  -H "Authorization: Bearer $GRANOLA_API_KEY" \
  -o /tmp/granola_transcript.json
jq '{title, segments: (.transcript | length)}' /tmp/granola_transcript.json
jq -r '.transcript[:20][] | "[\(.start_time)] \(.speaker.source): \(.text)"' /tmp/granola_transcript.json
```

Transcript segments have `text`, `start_time`, `end_time`, and `speaker` (`{source, diarization_label}` — `source` is e.g. `microphone` or `system`). Search the stored file with `jq`/`rg` rather than dumping all segments.

### List folders

```bash
curl -sS "https://public-api.granola.ai/v1/folders?page_size=30" \
  -H "Authorization: Bearer $GRANOLA_API_KEY" \
  -o /tmp/granola_folders.json
jq '.folders[] | {id, name, parent_folder_id}' /tmp/granola_folders.json
```

Folders are sorted alphabetically; `parent_folder_id` is `null` for top-level folders.

## Pagination

Cursor-based and identical for notes and folders: each response includes `hasMore` (boolean) and `cursor` (opaque string, `null` when exhausted). Pass the cursor back as the `cursor` query parameter to fetch the next page. Maximum `page_size` is 30.

## Tips

- To find a meeting about a topic, list notes (paginating as needed) and match on `title`, then fetch the note and search `summary_text` before resorting to the transcript.
- Only notes the user has made public are accessible; an empty list does not mean the user has no meetings.
- A `401` response means the API key is invalid or missing; a `404` means the note ID doesn't exist or isn't public.

## API Reference

Full OpenAPI specification: https://docs.granola.ai/api-reference/openapi.json

## Authentication

The `GRANOLA_API_KEY` environment variable must be set with a Granola public-notes API key. Users can generate one in their [Granola settings](https://docs.granola.ai/introduction). Never write the API key into files, code, or chat output.
