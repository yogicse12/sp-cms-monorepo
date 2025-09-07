# Blog Posts Pagination API Examples

## Endpoint

`GET /api/post/get-with-pagination`

## Authentication

Requires Bearer token in Authorization header

## Query Parameters

| Parameter | Type   | Required | Default | Description                                                          |
| --------- | ------ | -------- | ------- | -------------------------------------------------------------------- |
| `page`    | number | No       | 1       | Page number (min: 1)                                                 |
| `limit`   | number | No       | 10      | Items per page (min: 1, max: 100)                                    |
| `status`  | string | No       | -       | Filter by post status: `draft`, `published`, `archived`, `scheduled` |
| `search`  | string | No       | -       | Search posts by title (case-insensitive, partial match)              |

## Example Requests

### 1. Basic Pagination (First Page)

```bash
GET /api/post/get-with-pagination
GET /api/post/get-with-pagination?page=1&limit=10
```

### 2. Get Second Page with 5 Items

```bash
GET /api/post/get-with-pagination?page=2&limit=5
```

### 3. Filter by Status (Published Posts Only)

```bash
GET /api/post/get-with-pagination?status=published
```

### 4. Search Posts by Title

```bash
GET /api/post/get-with-pagination?search=getting%20started
```

### 5. Combined Filters

```bash
GET /api/post/get-with-pagination?page=1&limit=5&status=draft&search=blog
```

## Response Format

```json
{
  "posts": [
    {
      "id": "uuid",
      "title": "Getting Started with SP CMS",
      "slug": "getting-started-with-sp-cms",
      "excerpt": "Learn how to use the SP CMS platform...",
      "content": "# Getting Started...",
      "author": "admin@example.com",
      "status": "draft",
      "publishedAt": null,
      "updatedAt": "2025-01-07T12:00:00.000Z",
      "scheduledAt": null,
      "tags": "cms,tutorial",
      "featuredImage": null,
      "isFeatured": false,
      "createdAt": "2025-01-07T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Error Responses

### 400 - Invalid Parameters

```json
{
  "error": "Invalid status. Must be one of: draft, published, archived, scheduled"
}
```

### 400 - Invalid Pagination

```json
{
  "error": "Invalid pagination parameters. Page must be >= 1, limit must be 1-100"
}
```

### 500 - Server Error

```json
{
  "error": "Failed to fetch posts"
}
```
