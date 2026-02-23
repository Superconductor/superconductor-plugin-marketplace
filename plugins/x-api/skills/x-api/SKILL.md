---
name: x-api
description: Interact with the X (Twitter) API v2 using curl commands. Use this skill to look up user profiles, search recent posts, retrieve tweets, get user timelines, and explore other public X API v2 endpoints.
---

# X API: Query the X (Twitter) API v2 with curl

## Overview

Use curl commands to interact with the X (Twitter) API v2. This skill covers read-only, public endpoints that do not require an authenticated user context — things like looking up profiles, searching recent posts, and retrieving tweets.

**Authentication assumption:** The environment variable `X_BEARER_TOKEN` must already be set with a valid X API v2 Bearer Token. All commands below rely on it.

## How to use

All requests follow this pattern:

```bash
curl "<endpoint_url>" \
  -H "Authorization: Bearer $X_BEARER_TOKEN"
```

For any endpoint that returns tweets, always include `note_tweet` in `tweet.fields` so long posts return full content.

### Required response-handling workflow

Always write API responses to a file first, then read/search only the fields you need. Do not paste large raw JSON directly into chat output.

```bash
# 1) Store response
curl -sS "<endpoint_url>" \
  -H "Authorization: Bearer $X_BEARER_TOKEN" \
  -o /tmp/x_api_response.json

# 2) Inspect or extract specific fields
jq '.' /tmp/x_api_response.json
jq '.data' /tmp/x_api_response.json
jq -r '.data[]?.text' /tmp/x_api_response.json
rg -n "next_token|id|username" /tmp/x_api_response.json
```

If the response is large, summarize using targeted `jq` queries (counts, IDs, timestamps, specific text fields) instead of returning entire payloads.

## Examples

### Get a user profile

```bash
curl -sS "https://api.x.com/2/users/by/username/xdevelopers" \
  -H "Authorization: Bearer $X_BEARER_TOKEN" \
  -o /tmp/x_user_profile.json
jq '.data' /tmp/x_user_profile.json
```

### Get a user profile with additional fields

```bash
curl -sS "https://api.x.com/2/users/by/username/xdevelopers?user.fields=created_at,description,public_metrics" \
  -H "Authorization: Bearer $X_BEARER_TOKEN" \
  -o /tmp/x_user_profile_fields.json
jq '.data | {id,username,created_at,description,public_metrics}' /tmp/x_user_profile_fields.json
```

Common `user.fields`: `created_at`, `description`, `entities`, `id`, `location`, `name`, `pinned_tweet_id`, `profile_image_url`, `protected`, `public_metrics`, `url`, `username`, `verified`, `withheld`.

### Look up a post by ID

```bash
curl -sS "https://api.x.com/2/tweets/1460323737035677698?tweet.fields=note_tweet,created_at,public_metrics" \
  -H "Authorization: Bearer $X_BEARER_TOKEN" \
  -o /tmp/x_tweet_lookup.json
jq '.data | {id,created_at,text,note_tweet,public_metrics}' /tmp/x_tweet_lookup.json
```

Common `tweet.fields`: `note_tweet`, `attachments`, `author_id`, `conversation_id`, `created_at`, `entities`, `id`, `in_reply_to_user_id`, `lang`, `public_metrics`, `referenced_tweets`, `source`, `text`, `withheld`.

### Search recent posts

```bash
curl -sS "https://api.x.com/2/tweets/search/recent?query=from:xdevelopers&tweet.fields=note_tweet,created_at" \
  -H "Authorization: Bearer $X_BEARER_TOKEN" \
  -o /tmp/x_recent_search.json
jq -r '.data[]? | [.id, .created_at, (.note_tweet.text // .text)] | @tsv' /tmp/x_recent_search.json
```

The `query` parameter supports the full X search query syntax. Examples:
- `from:username` — posts from a specific user
- `to:username` — replies to a specific user
- `"exact phrase"` — posts containing an exact phrase
- `keyword1 keyword2` — posts containing both keywords
- `keyword1 OR keyword2` — posts containing either keyword
- `#hashtag` — posts with a specific hashtag
- `has:media` — posts that contain media
- `has:links` — posts that contain links
- `lang:en` — posts in a specific language

### Get a user's posts

```bash
curl -sS "https://api.x.com/2/users/2244994945/tweets?max_results=5&tweet.fields=note_tweet" \
  -H "Authorization: Bearer $X_BEARER_TOKEN" \
  -o /tmp/x_user_tweets.json
jq -r '.data[]? | [.id, (.note_tweet.text // .text)] | @tsv' /tmp/x_user_tweets.json
```

You can add more `tweet.fields`, `max_results` (5-100), and pagination tokens to customize the response, but always keep `note_tweet` included.

### Get a user's mentions

```bash
curl -sS "https://api.x.com/2/users/2244994945/mentions?max_results=5&tweet.fields=note_tweet,created_at,author_id" \
  -H "Authorization: Bearer $X_BEARER_TOKEN" \
  -o /tmp/x_user_mentions.json
jq -r '.data[]? | [.id, .author_id, .created_at, (.note_tweet.text // .text)] | @tsv' /tmp/x_user_mentions.json
```

### Look up multiple users by username

```bash
curl -sS "https://api.x.com/2/users/by?usernames=xdevelopers,twitterdev&user.fields=description,public_metrics" \
  -H "Authorization: Bearer $X_BEARER_TOKEN" \
  -o /tmp/x_users_by_username.json
jq '.data[] | {id,username,description,public_metrics}' /tmp/x_users_by_username.json
```

### Get tweet counts for a search query

```bash
curl -sS "https://api.x.com/2/tweets/counts/recent?query=from:xdevelopers" \
  -H "Authorization: Bearer $X_BEARER_TOKEN" \
  -o /tmp/x_tweet_counts.json
jq '.meta, .data[:5]' /tmp/x_tweet_counts.json
```

Returns the count of tweets matching the query, grouped by time period.

### Get a user's followers

```bash
curl -sS "https://api.x.com/2/users/2244994945/followers?max_results=10&user.fields=description,public_metrics" \
  -H "Authorization: Bearer $X_BEARER_TOKEN" \
  -o /tmp/x_followers.json
jq '.data[] | {id,username,public_metrics}' /tmp/x_followers.json
```

### Get accounts a user is following

```bash
curl -sS "https://api.x.com/2/users/2244994945/following?max_results=10&user.fields=description,public_metrics" \
  -H "Authorization: Bearer $X_BEARER_TOKEN" \
  -o /tmp/x_following.json
jq '.data[] | {id,username,public_metrics}' /tmp/x_following.json
```

### Look up a list and its members

```bash
# Get list details
curl -sS "https://api.x.com/2/lists/84839422" \
  -H "Authorization: Bearer $X_BEARER_TOKEN" \
  -o /tmp/x_list_details.json
jq '.data' /tmp/x_list_details.json

# Get list members
curl -sS "https://api.x.com/2/lists/84839422/members?user.fields=description,public_metrics" \
  -H "Authorization: Bearer $X_BEARER_TOKEN" \
  -o /tmp/x_list_members.json
jq '.data[] | {id,username,public_metrics}' /tmp/x_list_members.json
```

## Tips

- To find a user's numeric ID (needed for some endpoints), first look them up by username, then use the `id` field from the response.
- Use `expansions` to include related objects in the response. For example, `expansions=author_id` on a tweet lookup will include the author's user object.
- Pagination: When results span multiple pages, the response includes a `next_token` field. Pass it as `pagination_token` in the next request.
- Rate limits vary by endpoint. If you receive a 429 response, wait before retrying.
- Prefer `curl -sS -o <file>` with follow-up `jq` filters so output remains compact and targeted.

## API Reference

Full OpenAPI specification: https://api.x.com/2/openapi.json

## Authentication

The `X_BEARER_TOKEN` environment variable must be set with a valid Bearer Token. This token provides app-only authentication, which grants access to public read-only endpoints.

To obtain a Bearer Token, create a project and app in the [X Developer Portal](https://developer.x.com/en/portal/dashboard) and generate a Bearer Token from your app's "Keys and tokens" settings.
