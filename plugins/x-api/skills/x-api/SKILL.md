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

## Examples

### Get a user profile

```bash
curl "https://api.x.com/2/users/by/username/xdevelopers" \
  -H "Authorization: Bearer $X_BEARER_TOKEN"
```

### Get a user profile with additional fields

```bash
curl "https://api.x.com/2/users/by/username/xdevelopers?user.fields=created_at,description,public_metrics" \
  -H "Authorization: Bearer $X_BEARER_TOKEN"
```

Common `user.fields`: `created_at`, `description`, `entities`, `id`, `location`, `name`, `pinned_tweet_id`, `profile_image_url`, `protected`, `public_metrics`, `url`, `username`, `verified`, `withheld`.

### Look up a post by ID

```bash
curl "https://api.x.com/2/tweets/1460323737035677698?tweet.fields=note_tweet,created_at,public_metrics" \
  -H "Authorization: Bearer $X_BEARER_TOKEN"
```

Common `tweet.fields`: `note_tweet`, `attachments`, `author_id`, `conversation_id`, `created_at`, `entities`, `id`, `in_reply_to_user_id`, `lang`, `public_metrics`, `referenced_tweets`, `source`, `text`, `withheld`.

### Search recent posts

```bash
curl "https://api.x.com/2/tweets/search/recent?query=from:xdevelopers&tweet.fields=note_tweet,created_at" \
  -H "Authorization: Bearer $X_BEARER_TOKEN"
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
curl "https://api.x.com/2/users/2244994945/tweets?max_results=5&tweet.fields=note_tweet" \
  -H "Authorization: Bearer $X_BEARER_TOKEN"
```

You can add more `tweet.fields`, `max_results` (5-100), and pagination tokens to customize the response, but always keep `note_tweet` included.

### Get a user's mentions

```bash
curl "https://api.x.com/2/users/2244994945/mentions?max_results=5&tweet.fields=note_tweet,created_at,author_id" \
  -H "Authorization: Bearer $X_BEARER_TOKEN"
```

### Look up multiple users by username

```bash
curl "https://api.x.com/2/users/by?usernames=xdevelopers,twitterdev&user.fields=description,public_metrics" \
  -H "Authorization: Bearer $X_BEARER_TOKEN"
```

### Get tweet counts for a search query

```bash
curl "https://api.x.com/2/tweets/counts/recent?query=from:xdevelopers" \
  -H "Authorization: Bearer $X_BEARER_TOKEN"
```

Returns the count of tweets matching the query, grouped by time period.

### Get a user's followers

```bash
curl "https://api.x.com/2/users/2244994945/followers?max_results=10&user.fields=description,public_metrics" \
  -H "Authorization: Bearer $X_BEARER_TOKEN"
```

### Get accounts a user is following

```bash
curl "https://api.x.com/2/users/2244994945/following?max_results=10&user.fields=description,public_metrics" \
  -H "Authorization: Bearer $X_BEARER_TOKEN"
```

### Look up a list and its members

```bash
# Get list details
curl "https://api.x.com/2/lists/84839422" \
  -H "Authorization: Bearer $X_BEARER_TOKEN"

# Get list members
curl "https://api.x.com/2/lists/84839422/members?user.fields=description,public_metrics" \
  -H "Authorization: Bearer $X_BEARER_TOKEN"
```

## Tips

- To find a user's numeric ID (needed for some endpoints), first look them up by username, then use the `id` field from the response.
- Use `expansions` to include related objects in the response. For example, `expansions=author_id` on a tweet lookup will include the author's user object.
- Pagination: When results span multiple pages, the response includes a `next_token` field. Pass it as `pagination_token` in the next request.
- Rate limits vary by endpoint. If you receive a 429 response, wait before retrying.

## API Reference

Full OpenAPI specification: https://api.x.com/2/openapi.json

## Authentication

The `X_BEARER_TOKEN` environment variable must be set with a valid Bearer Token. This token provides app-only authentication, which grants access to public read-only endpoints.

To obtain a Bearer Token, create a project and app in the [X Developer Portal](https://developer.x.com/en/portal/dashboard) and generate a Bearer Token from your app's "Keys and tokens" settings.
