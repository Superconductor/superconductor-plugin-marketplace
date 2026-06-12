---
name: notion
description: Search, read, and create pages in the user's Notion workspace with curl commands. Use this skill to find pages and databases, read page content, create new pages, and append content — useful whenever workspace docs, notes, or knowledge-base context would help with a task.
---

# Notion: Read and write workspace pages via the Notion API

## Overview

Use curl commands to interact with the Notion API. This skill covers searching the workspace, reading pages and their content, querying databases, creating pages, and appending content.

**Authentication assumption:** The environment variable `NOTION_API_KEY` must already be set with a valid Notion integration token (an access token connection). All commands below rely on it.

**Base URL:** `https://api.notion.com`

**Access scoping:** The connection can only see pages and teamspaces that were explicitly shared with it. An empty search result does not mean the workspace is empty — it may mean the connection has not been granted access to the relevant pages.

## How to use

Every request needs the Bearer token and a `Notion-Version` header. Write operations also need a JSON content type:

```bash
curl -sS "https://api.notion.com/v1/<endpoint>" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json"
```

### Required response-handling workflow

Always write API responses to a file first, then read/search only the fields you need. Page block trees can be very large — never paste raw responses into chat output.

```bash
# 1) Store response
curl -sS "https://api.notion.com/v1/search" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"query": "outage", "page_size": 10}' \
  -o /tmp/notion_search.json

# 2) Inspect or extract specific fields
jq '.results[] | {id, object, url, title: (.properties.title.title[0].plain_text? // .properties.Name.title[0].plain_text? // .title[0].plain_text?)}' /tmp/notion_search.json
```

## Key endpoints

| Method | Path | Purpose |
| ------ | ---- | ------- |
| POST | `/v1/search` | Search pages and databases by title |
| GET | `/v1/pages/{page_id}` | Get a page's properties and metadata |
| GET | `/v1/blocks/{block_id}/children` | Read a page's content blocks |
| POST | `/v1/pages` | Create a page |
| PATCH | `/v1/blocks/{block_id}/children` | Append content blocks to a page |
| POST | `/v1/databases/{database_id}/query` | Query a database's rows |
| GET | `/v1/users` | List workspace users |

### Search the workspace

```bash
curl -sS "https://api.notion.com/v1/search" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"query": "June 8 outage", "filter": {"value": "page", "property": "object"}, "page_size": 20}' \
  -o /tmp/notion_search.json
jq '.results[] | {id, url, last_edited_time}' /tmp/notion_search.json
```

Search matches page and database **titles only** (not body text). If a specific query returns nothing, retry with a shorter or partial query (e.g. `"outage"` instead of `"June 8 outage"`), then read the candidate pages' content to find the right one. Omit `query` entirely to list everything the connection can access.

### Read a page and its content

```bash
# Page properties (title, parent, timestamps)
curl -sS "https://api.notion.com/v1/pages/<page_id>" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -o /tmp/notion_page.json
jq '{url, properties}' /tmp/notion_page.json

# Page content (blocks)
curl -sS "https://api.notion.com/v1/blocks/<page_id>/children?page_size=100" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -o /tmp/notion_blocks.json
jq -r '.results[] | .type as $t | [.[$t].rich_text[]?.plain_text] | join("")' /tmp/notion_blocks.json
```

Blocks with `"has_children": true` (toggles, nested lists, child pages) require another `GET /v1/blocks/{block_id}/children` call with that block's `id` to read their nested content.

### Create a page

A new page needs a parent — an existing page (`page_id`) or database (`database_id`) that the connection can access:

```bash
curl -sS -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"page_id": "<parent_page_id>"},
    "properties": {
      "title": {"title": [{"text": {"content": "Page Title"}}]}
    },
    "children": [
      {"object": "block", "type": "heading_2", "heading_2": {"rich_text": [{"text": {"content": "Section"}}]}},
      {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"text": {"content": "Body text."}}]}}
    ]
  }' \
  -o /tmp/notion_created.json
jq '{id, url}' /tmp/notion_created.json
```

The response's `url` field is the shareable link to the new page. For database parents, `properties` must match the database's schema (fetch it with `GET /v1/databases/{database_id}`).

### Append content to a page

```bash
curl -sS -X PATCH "https://api.notion.com/v1/blocks/<page_id>/children" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"children": [{"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"text": {"content": "Appended text."}}]}}]}'
```

### Query a database

```bash
curl -sS -X POST "https://api.notion.com/v1/databases/<database_id>/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  -d '{"page_size": 25}' \
  -o /tmp/notion_db.json
jq '.results[] | {id, url, properties}' /tmp/notion_db.json
```

Supports `filter` and `sorts` keys; see the [database query docs](https://developers.notion.com/reference/post-database-query) for the filter syntax.

## Pagination

Cursor-based and identical across list endpoints: each response includes `has_more` (boolean) and `next_cursor` (opaque string, `null` when exhausted). Pass the cursor back as `start_cursor` (in the JSON body for POST endpoints, as a query parameter for GET endpoints). Maximum `page_size` is 100.

## Tips

- To find a page about a topic, search with a few short title keywords, then read candidate pages' blocks to confirm content.
- Page IDs appear in Notion URLs as the trailing 32-hex-character segment; the API accepts them with or without dashes.
- When sharing a page with the user, give them the page's `url` field from the API response.
- A `401` response means the token is invalid; a `404` usually means the page exists but has not been shared with the connection.
- A `429` response means rate limiting (about 3 requests/second) — wait and retry.

## API Reference

Full documentation: https://developers.notion.com/guides/get-started/overview

## Authentication

The `NOTION_API_KEY` environment variable must be set with a Notion integration token. Users create one as an access token connection at [notion.so/developers/connections](https://www.notion.so/developers/connections), scoped to their workspace, and then select which pages and teamspaces it can access. Never write the API key into files, code, or chat output.
