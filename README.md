# Njord

A lightweight data API built with Next.js App Router and MongoDB. Register a project season to get an access token, then read and write documents to any sub-collection under that project.

---

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
  - [POST /api/v1/start](#post-apiv1start)
  - [GET /api/v1/route/\[...project\]](#get-apiv1routeproject)
  - [POST /api/v1/route/\[...project\]](#post-apiv1routeproject)
- [Authentication](#authentication)
- [Project Name Rules](#project-name-rules)
- [Error Format](#error-format)
- [Tech Stack](#tech-stack)

---

## Overview

Njord organises data around **seasons** — a season is a registered project that gets a unique 64-character access token. Once you have a token, you can read and write documents to any path under that project using a simple REST interface backed by MongoDB.

```
POST /api/v1/start                    → register a project, receive a token
GET  /api/v1/route/my_project/users   → fetch all documents in my_project.users
POST /api/v1/route/my_project/users   → insert a document into my_project.users
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Add your environment variables

Create a `.env.local` file at the root of your project (see [Environment Variables](#environment-variables)).

### 3. Run the development server

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/v1`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string (e.g. `mongodb+srv://...`) |

Create a `.env.local` file:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
```

The MongoDB client is expected at `@/lib/mongodb` and should export a `clientPromise`.

---

## API Reference

### Base URL

```
https://your-domain.com/api/v1
```

---

### POST /api/v1/start

Registers a new project season and returns a unique 64-character access token.

**Request body**

| Field | Type | Required | Description |
|---|---|---|---|
| `projectName` | string | ✓ | Unique project identifier. Letters, numbers, and underscores only. Normalised to lowercase. |
| `email` | string | ✓ | Email address stored with the season record. |

**Example**

```bash
curl -X POST https://your-domain.com/api/v1/start \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "my_project",
    "email": "you@example.com"
  }'
```

**201 — Success**

```json
{
  "status": "success",
  "message": "Season created successfully.",
  "token": "3f1d2e9a4b...64chars",
  "projectName": "my_project"
}
```

**400 — Validation error**

```json
{
  "status": "error",
  "message": "Invalid project name. Only letters, numbers, and underscores are allowed."
}
```

**Responses**

| Status | Description |
|---|---|
| `201` | Season created. Returns token and normalised project name. |
| `400` | Missing fields, invalid project name format, or name already taken. |
| `500` | Internal server error. |

---

### GET /api/v1/route/\[...project\]

Returns all documents from the collection addressed by the URL path.

**URL structure**

```
/api/v1/route/{projectName}/{...subCollection}
```

The first path segment must match the `projectName` your token was issued for. Additional segments address sub-collections — they are joined with dots to form the MongoDB collection name.

```
/api/v1/route/my_project/users/admins  →  collection: my_project.users.admins
```

**Required header**

| Header | Description |
|---|---|
| `x-njord-token` | Your 64-character project token. |

**Example**

```bash
curl -X GET https://your-domain.com/api/v1/route/my_project/users \
  -H "x-njord-token: 3f1d2e9a4b...64chars"
```

**200 — Success**

```json
{
  "status": "success",
  "message": "Documents fetched successfully.",
  "project": "my_project/users",
  "documents": [
    { "_id": "665abc...", "name": "Alice", "role": "admin" }
  ]
}
```

**Responses**

| Status | Description |
|---|---|
| `200` | Returns `project` label and `documents` array. |
| `401` | Missing `x-njord-token` header. |
| `403` | Invalid token, or token does not match the project in the URL. |
| `500` | Internal server error. |

---

### POST /api/v1/route/\[...project\]

Inserts a new document into the collection addressed by the URL path.

> **Note:** The `token` field is automatically stripped from the request body before insertion. MongoDB assigns `_id` automatically.

**URL structure**

Same as GET — see above.

**Required header**

| Header | Description |
|---|---|
| `x-njord-token` | Your 64-character project token. |

**Request body**

Any valid JSON object. The `token` field will be removed before saving.

**Example**

```bash
curl -X POST https://your-domain.com/api/v1/route/my_project/users \
  -H "Content-Type: application/json" \
  -H "x-njord-token: 3f1d2e9a4b...64chars" \
  -d '{
    "name": "Alice",
    "role": "admin"
  }'
```

**201 — Success**

```json
{
  "status": "success",
  "message": "Document created successfully.",
  "project": "my_project/users"
}
```

**Responses**

| Status | Description |
|---|---|
| `201` | Document inserted. Returns the `project` label. |
| `401` | Missing `x-njord-token` header. |
| `403` | Invalid token, or token does not match the project in the URL. |
| `500` | Internal server error. |

---

## Authentication

All data endpoints (`/api/v1/route/...`) require your project token sent via a request header:

```
x-njord-token: <your-64-char-token>
```

Tokens are 64-character hex strings generated at season creation. A token grants full read/write access to the project it was issued for — keep it private and never expose it client-side.

---

## Project Name Rules

- Only letters (`a–z`, `A–Z`), digits (`0–9`), and underscores (`_`) are allowed.
- Names are normalised to lowercase before storage and comparison.
- Each name must be unique — registering a taken name returns a `400` error.
- Spaces and special characters are rejected.

---

## Error Format

All error responses follow the same shape:

```json
{
  "status": "error",
  "message": "Human-readable description of what went wrong."
}
```

`5xx` responses also include an `error` field with the raw exception message for debugging.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) |
| Runtime | Node.js |
| Database | [MongoDB](https://www.mongodb.com) |
| HTTP | Next.js Route Handlers (`route.js`) |