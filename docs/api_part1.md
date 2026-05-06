# StackRead — Final API Design
**Version:** 1.0 — Final
**Base URL:** `https://api.stackread.com/v1`
**Spec Format:** REST / JSON
**Date:** May 2026

---

## Part 1 — Conventions & Global Rules

---

### 1.1 Versioning

The API is versioned via the URL path. The current version is `v1`. Breaking changes will result in a new version (`v2`). Non-breaking additions (new fields, new optional params) are released without a version bump, with a changelog update and 30-day advance notice. Deprecated fields are marked with a `X-Deprecated-Field` header for 90 days before removal.

---

### 1.2 Resource ID Format

All IDs are prefixed short-UUIDs (CUID2 under the hood). Prefix makes logs and errors immediately readable.

| Resource | Prefix | Example |
|----------|--------|---------|
| User | `usr_` | `usr_cm2x1y3z4` |
| Title | `ttl_` | `ttl_cm2x1y3z4` |
| Borrow | `brw_` | `brw_cm2x1y3z4` |
| Hold | `hld_` | `hld_cm2x1y3z4` |
| Subscription | `sub_` | `sub_cm2x1y3z4` |
| Invoice | `inv_` | `inv_cm2x1y3z4` |
| Reading List | `lst_` | `lst_cm2x1y3z4` |
| Annotation | `ann_` | `ann_cm2x1y3z4` |
| Bookmark | `bmk_` | `bmk_cm2x1y3z4` |
| Review | `rev_` | `rev_cm2x1y3z4` |
| Shelf | `shf_` | `shf_cm2x1y3z4` |
| Plan | `pln_` | `pln_cm2x1y3z4` |
| Promo Code | `prm_` | `prm_cm2x1y3z4` |
| Payout | `pay_` | `pay_cm2x1y3z4` |
| DRM License | `lic_` | `lic_cm2x1y3z4` |
| Session | `ses_` | `ses_cm2x1y3z4` |
| Audit Log | `log_` | `log_cm2x1y3z4` |
| Webhook | `wbh_` | `wbh_cm2x1y3z4` |
| Genre | `gen_` | `gen_cm2x1y3z4` |

---

### 1.3 Request Format

- **Content-Type:** `application/json` for all JSON bodies
- **File uploads:** `multipart/form-data`
- **Charset:** UTF-8 everywhere
- All timestamps: ISO 8601 UTC — `2026-05-06T10:00:00Z`
- All money amounts: **integers in smallest currency unit** (e.g. BDT paisa, USD cents). Currency specified separately as ISO 4217 code.

---

### 1.4 Authentication

Protected endpoints require:
```
Authorization: Bearer <access_token>
```

**Token strategy:**
- Access token: JWT, HS256, **15-minute** TTL, signed with server secret
- Refresh token: opaque random token, **30-day** TTL, stored HTTP-only cookie (`stackread_refresh`, `SameSite=Strict`, `Secure`)
- Both tokens rotate on every `/auth/refresh` call

**JWT payload:**
```json
{
  "sub": "usr_cm2x1y3z4",
  "role": "reader",
  "plan": "standard",
  "email_verified": true,
  "iat": 1715000000,
  "exp": 1715000900
}
```

---

### 1.5 Role Hierarchy

| Role | Access |
|------|--------|
| `guest` | Public endpoints only |
| `reader` | Own account + catalogue + reading |
| `author` | Reader access + `/author/*` dashboard |
| `admin` | Full access including `/admin/*` |

Authors are also readers — they can subscribe and read like any reader.

---

### 1.6 Response Envelope

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "request_id": "req_cm2x1y3z4",
    "timestamp": "2026-05-06T10:00:00Z"
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "TITLE_UNAVAILABLE",
    "message": "All simultaneous access slots for this title are occupied.",
    "details": {
      "queue_size": 3,
      "estimated_wait_days": 14
    }
  },
  "meta": {
    "request_id": "req_cm2x1y3z4",
    "timestamp": "2026-05-06T10:00:00Z"
  }
}
```

**Validation error (400):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed.",
    "fields": {
      "email": "Must be a valid email address.",
      "password": "Must be at least 8 characters with one number and one special character."
    }
  }
}
```

---

### 1.7 Pagination

**Page-based** (catalogue, admin lists, reviews):
```
GET /titles?page=2&per_page=20
```
Response includes:
```json
"pagination": {
  "page": 2,
  "per_page": 20,
  "total_items": 1204,
  "total_pages": 61,
  "has_next": true,
  "has_prev": true
}
```
`per_page` max: 100. Default: 20.

**Cursor-based** (activity feeds, history, audit logs — for performance at scale):
```
GET /me/history?cursor=brw_cm2x1y3z4&limit=20&direction=before
```
Response includes:
```json
"pagination": {
  "next_cursor": "brw_cm2a1b2c3",
  "prev_cursor": "brw_cm9z8y7x6",
  "has_next": true,
  "has_prev": false,
  "limit": 20
}
```

---

### 1.8 Filtering & Sorting

Consistent convention across all list endpoints:
```
GET /titles?q=keyword&filter[genre]=fiction&filter[format]=epub&sort=created_at:desc
```

Multiple sort fields: `sort=rating:desc,title:asc`
Multiple filter values: `filter[genre]=fiction,thriller` (OR) or `filter[genre][]=fiction&filter[genre][]=thriller`

---

### 1.9 Rate Limiting

| Client | Limit | Scope |
|--------|-------|-------|
| Unauthenticated | 60 req/min | Per IP |
| Authenticated (reader/author) | 300 req/min | Per user |
| Admin | 600 req/min | Per user |
| Auth endpoints (login, register, forgot-password) | 10 req/min | Per IP |
| File upload endpoints | 10 req/hour | Per user |
| ISBN lookup | 30 req/hour | Per user |

Headers on every response:
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 287
X-RateLimit-Reset: 1715000060
Retry-After: 60        (only on 429 responses)
```

---

### 1.10 Global Decisions (Not Negotiable)

These decisions are final and encoded into the API design:

| Decision | Choice | Reason |
|----------|--------|--------|
| Currency | Multi-currency from day 1 (`amount` + `currency` fields) | Authors are international; future-proof |
| Active borrow limit | Max **5 simultaneous borrows** per reader, all plans | Prevents abuse; aligns with library norms |
| Review gate | Reader must have **ever borrowed** the title | Prevents fake reviews |
| Payout minimum | **500 BDT** (or equivalent in author's currency) | Keeps transfer costs manageable |
| Payout schedule | Processed on **1st of each month** | Predictable for authors |
| ISBN metadata | Open Library API (primary) → Google Books API (fallback) | Open Library is free and comprehensive |
| Progress polling | **30-second** client-side polling in MVP | WebSocket added Phase 3 |
| Soft deletes | Users: anonymised (GDPR). Titles: soft-deleted (audit trail) | Compliance + data integrity |
| File storage | Covers/avatars: Cloudinary. eBooks/audiobooks: Cloudflare R2 | Best tools for each job |
| DRM provider | Readium LCP | Open standard, no vendor lock-in |
| Admin 2FA | **Mandatory** for all admin accounts | Non-negotiable security |

---

### 1.11 HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| `200` | OK | Successful GET, PATCH, POST (non-creating) |
| `201` | Created | Successful POST that creates a resource |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Failed validation |
| `401` | Unauthorised | Missing, expired, or invalid token |
| `403` | Forbidden | Authenticated but lacks permission |
| `404` | Not Found | Resource does not exist |
| `409` | Conflict | Duplicate resource, slot conflict, state conflict |
| `413` | Payload Too Large | File upload exceeds limit |
| `415` | Unsupported Media Type | Wrong file format |
| `422` | Unprocessable Entity | Valid JSON but fails business logic |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server failure |
| `502` | Bad Gateway | Upstream service (Stripe, DRM) failure |
| `503` | Service Unavailable | Planned maintenance |

---

### 1.12 Security Headers (All Responses)

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'none'
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Part 2 — Authentication & Sessions

**Prefix:** `/auth`
**Auth required:** Noted per endpoint

---

### POST /auth/register

Register a new reader account.

**Auth required:** No
**Rate limit:** Auth tier (10/min)

**Request:**
```json
{
  "email": "reader@example.com",
  "password": "MyP@ssw0rd!",
  "display_name": "Rafi Islam"
}
```

**Validation:**
- `email`: Valid email format, max 254 chars, unique in system
- `password`: Min 8 chars, must contain at least 1 uppercase, 1 number, 1 special character (`!@#$%^&*`)
- `display_name`: 2–50 chars, no HTML

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "user_id": "usr_cm2x1y3z4",
    "email": "reader@example.com",
    "role": "reader",
    "email_verified": false,
    "message": "Check your inbox to verify your email before logging in."
  }
}
```

**Side effects:**
- Sends verification email (Nodemailer) with a signed 24-hour token
- Account is NOT usable until email is verified

**Errors:**
| Code | HTTP | Condition |
|------|------|-----------|
| `EMAIL_ALREADY_EXISTS` | 409 | Email already registered |
| `VALIDATION_ERROR` | 400 | Invalid email, weak password, missing display_name |

---

### POST /auth/register/author

Register a new author account. Authors go through a 2-step process: account creation (this endpoint) → admin approval for the verified badge.

**Auth required:** No
**Rate limit:** Auth tier (10/min)

**Request:**
```json
{
  "email": "author@example.com",
  "password": "MyP@ssw0rd!",
  "display_name": "Karim Hossain",
  "pen_name": "K. Hossain",
  "bio": "Award-winning fiction writer from Dhaka.",
  "genres": ["fiction", "thriller"],
  "payout_currency": "BDT"
}
```

**Validation:**
- Same as reader registration, plus:
- `pen_name`: 2–100 chars
- `bio`: 10–1000 chars
- `genres`: Array, 1–5 valid genre slugs
- `payout_currency`: ISO 4217, one of `["BDT", "USD", "GBP", "EUR", "INR"]`

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "user_id": "usr_cm2a1b2c3",
    "email": "author@example.com",
    "role": "author",
    "email_verified": false,
    "verified_author": false,
    "message": "Check your inbox to verify your email. Your author profile is pending admin review."
  }
}
```

**Notes:**
- Author can log in and access their dashboard after email verification
- `verified_author: false` until admin approves — a badge is shown/hidden based on this
- Author can upload content immediately; titles go into the review queue regardless of verified status

---

### POST /auth/verify-email

Verify email using the token from the verification email.

**Auth required:** No

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoidXNyX2NtMngxeTN6NCIsImV4cCI6MTcxNTAwMDAwMH0.SIGNATURE"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "email_verified": true,
    "message": "Email verified successfully. You can now log in."
  }
}
```

**Errors:**
| Code | HTTP | Condition |
|------|------|-----------|
| `TOKEN_INVALID` | 401 | Token malformed or tampered |
| `TOKEN_EXPIRED` | 401 | Token older than 24 hours |
| `EMAIL_ALREADY_VERIFIED` | 409 | Already verified |

---

### POST /auth/resend-verification

Resend verification email.

**Auth required:** No
**Rate limit:** Max 3 resends per email per hour

**Request:**
```json
{ "email": "reader@example.com" }
```

**Response `200 OK`:** Always returns success to prevent email enumeration.
```json
{
  "success": true,
  "data": { "message": "If that account exists and is unverified, a new verification email has been sent." }
}
```

---

### POST /auth/login

Authenticate with email and password.

**Auth required:** No
**Rate limit:** Auth tier (10/min per IP)

**Request:**
```json
{
  "email": "reader@example.com",
  "password": "MyP@ssw0rd!",
  "device_name": "Chrome on Windows"
}
```

**Validation:**
- `device_name`: Optional, max 100 chars. Stored for session display.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiJ9...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": "usr_cm2x1y3z4",
      "email": "reader@example.com",
      "display_name": "Rafi Islam",
      "role": "reader",
      "avatar_url": "https://cdn.stackread.com/avatars/usr_cm2x1y3z4.webp",
      "email_verified": true,
      "subscription": {
        "plan_id": "pln_standard",
        "plan_name": "Standard",
        "status": "active",
        "current_period_end": "2026-06-06T00:00:00Z"
      }
    }
  }
}
```

**Side effects:**
- `stackread_refresh` HTTP-only cookie set (30 days)
- Session record created with device name + IP + UA
- Failed login counter incremented; account locked for 15 min after 10 consecutive failures

**Errors:**
| Code | HTTP | Condition |
|------|------|-----------|
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `EMAIL_NOT_VERIFIED` | 403 | Account not yet verified |
| `ACCOUNT_SUSPENDED` | 403 | Account suspended by admin |
| `ACCOUNT_LOCKED` | 403 | Too many failed attempts; `details.unlock_at` provided |

---

### POST /auth/oauth/google

Authenticate or register via Google OAuth.

**Auth required:** No

**Request:**
```json
{
  "id_token": "GOOGLE_ID_TOKEN",
  "role": "reader",
  "device_name": "Safari on iPhone"
}
```

**Notes:**
- `role` is only applied on first-time registration (`reader` or `author`). Ignored on subsequent logins.
- If email from Google already exists in system (from email/password registration), accounts are merged.
- Google email is treated as pre-verified.

**Response `200 OK`:** Same structure as `/auth/login`.

**Errors:**
| Code | HTTP | Condition |
|------|------|-----------|
| `OAUTH_TOKEN_INVALID` | 401 | Google ID token failed verification |
| `ACCOUNT_SUSPENDED` | 403 | Merged account is suspended |

---

### POST /auth/refresh

Get a new access token using the refresh token cookie.

**Auth required:** No (uses `stackread_refresh` cookie)

**Request:** No body.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiJ9...",
    "expires_in": 900
  }
}
```

**Notes:**
- Both access token and refresh token rotate on each call (refresh token rotation)
- If refresh token is reused after rotation, all sessions for that user are revoked (replay attack detection)

**Errors:**
| Code | HTTP | Condition |
|------|------|-----------|
| `REFRESH_TOKEN_MISSING` | 401 | Cookie not present |
| `REFRESH_TOKEN_INVALID` | 401 | Expired or revoked |

---

### POST /auth/logout

Invalidate current session.

**Auth required:** Yes

**Request:**
```json
{ "all_devices": false }
```

`all_devices: true` revokes all sessions and all refresh tokens for the user.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": { "message": "Logged out successfully." }
}
```

**Side effects:** Clears `stackread_refresh` cookie.

---

### POST /auth/forgot-password

Initiate password reset flow.

**Auth required:** No
**Rate limit:** 3 requests per email per hour

**Request:**
```json
{ "email": "reader@example.com" }
```

**Response `200 OK`:** Always returns success.
```json
{
  "success": true,
  "data": { "message": "If that email is registered, a reset link has been sent." }
}
```

**Side effects:** Sends email with signed 1-hour reset token.

---

### POST /auth/reset-password

Complete password reset.

**Auth required:** No

**Request:**
```json
{
  "token": "RESET_TOKEN_FROM_EMAIL",
  "password": "NewP@ssw0rd!"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": { "message": "Password updated. Please log in with your new password." }
}
```

**Side effects:** All existing sessions for the user are revoked.

**Errors:**
| Code | HTTP | Condition |
|------|------|-----------|
| `TOKEN_INVALID` | 401 | Token malformed |
| `TOKEN_EXPIRED` | 401 | Token older than 1 hour |
| `SAME_PASSWORD` | 422 | New password same as current |

---

### GET /auth/me

Get authenticated user's full profile.

**Auth required:** Yes

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "usr_cm2x1y3z4",
    "email": "reader@example.com",
    "display_name": "Rafi Islam",
    "pen_name": null,
    "role": "reader",
    "avatar_url": "https://cdn.stackread.com/avatars/usr_cm2x1y3z4.webp",
    "email_verified": true,
    "two_fa_enabled": false,
    "verified_author": false,
    "subscription": {
      "plan_id": "pln_standard",
      "plan_name": "Standard",
      "status": "active",
      "current_period_start": "2026-05-06T00:00:00Z",
      "current_period_end": "2026-06-06T00:00:00Z",
      "cancel_at_period_end": false,
      "trial_end": null
    },
    "preferences": {
      "genres": ["fiction", "sci-fi"],
      "formats": ["epub"],
      "reading_history_public": false,
      "language_ui": "en",
      "notifications": {
        "hold_available": true,
        "subscription_renewal": true,
        "subscription_payment_failed": true,
        "new_releases_from_followed_authors": false,
        "platform_announcements": true
      }
    },
    "active_borrows_count": 2,
    "active_borrows_limit": 5,
    "created_at": "2026-05-01T10:00:00Z"
  }
}
```

---

### GET /auth/sessions

List all active sessions.

**Auth required:** Yes

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "session_id": "ses_cm2x1y3z4",
      "device_name": "Chrome on Windows",
      "ip_address": "103.120.11.4",
      "location": "Dhaka, BD",
      "last_active_at": "2026-05-06T09:45:00Z",
      "created_at": "2026-05-01T10:00:00Z",
      "is_current": true
    },
    {
      "session_id": "ses_cm2a1b2c3",
      "device_name": "Safari on iPhone",
      "ip_address": "103.120.11.5",
      "location": "Chittagong, BD",
      "last_active_at": "2026-05-05T18:00:00Z",
      "created_at": "2026-04-28T14:00:00Z",
      "is_current": false
    }
  ]
}
```

---

### DELETE /auth/sessions/:session_id

Revoke a specific session (not the current one).

**Auth required:** Yes

**Response `204 No Content`**

**Errors:**
| Code | HTTP | Condition |
|------|------|-----------|
| `SESSION_NOT_FOUND` | 404 | Session does not exist or belongs to another user |
| `CANNOT_REVOKE_CURRENT_SESSION` | 422 | Use `/auth/logout` instead |

---

### DELETE /auth/sessions

Revoke all sessions except the current one.

**Auth required:** Yes

**Response `200 OK`:**
```json
{
  "success": true,
  "data": { "revoked_count": 3 }
}
```

---

### POST /auth/2fa/enable

Send OTP to verified email to begin enabling 2FA.

**Auth required:** Yes

**Response `200 OK`:**
```json
{
  "success": true,
  "data": { "message": "A 6-digit OTP has been sent to your email. It expires in 10 minutes." }
}
```

---

### POST /auth/2fa/verify

Confirm OTP and enable 2FA.

**Auth required:** Yes

**Request:**
```json
{ "otp": "847291" }
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": { "two_fa_enabled": true }
}
```

---

### POST /auth/2fa/disable

Disable 2FA by confirming with OTP.

**Auth required:** Yes

**Request:**
```json
{ "otp": "847291" }
```

---

## Part 3 — Catalogue & Discovery

**Prefix:** `/`
**Auth required:** None (public). Authenticated requests receive additional `reader_state` fields.

---

### GET /titles

Browse and search the catalogue.

**Auth required:** No (reader_state included if authenticated)

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `q` | string | — | Full-text search across title, author name, synopsis, ISBN |
| `filter[genre]` | string | — | Genre slug(s), comma-separated (OR logic) |
| `filter[format]` | string | — | `epub`, `pdf`, `audiobook` — comma-separated |
| `filter[language]` | string | — | ISO 639-1 code(s) |
| `filter[year_from]` | integer | — | Publication year range start |
| `filter[year_to]` | integer | — | Publication year range end |
| `filter[rating_min]` | float | — | Min average rating (1.0–5.0) |
| `filter[availability]` | string | — | `available` or `waitlist` |
| `filter[access_model]` | string | — | `subscription`, `purchase`, `both` |
| `shelf` | string | — | Curated shelf slug (e.g. `staff-picks`) |
| `sort` | string | `relevance` | `relevance`, `title:asc`, `created_at:desc`, `rating:desc`, `reads:desc`, `publication_date:desc` |
| `page` | integer | 1 | Page number |
| `per_page` | integer | 20 | Max 100 |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ttl_cm2x1y3z4",
      "title": "The Lost Hours",
      "slug": "the-lost-hours",
      "author": {
        "id": "usr_cm2a1b2c3",
        "display_name": "K. Hossain",
        "verified_author": true
      },
      "cover_url": "https://cdn.stackread.com/covers/ttl_cm2x1y3z4_400.webp",
      "formats": ["epub", "audiobook"],
      "genre_tags": ["fiction", "thriller"],
      "language": "en",
      "publication_date": "2025-11-15",
      "average_rating": 4.3,
      "total_reviews": 87,
      "access_model": "subscription",
      "availability": "available",
      "reader_state": {
        "borrowed": false,
        "on_hold": false,
        "in_lists": []
      }
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_items": 1204,
    "total_pages": 61,
    "has_next": true,
    "has_prev": false
  }
}
```

**Notes:**
- `reader_state` is `null` for guests
- `cover_url` always returns WebP at 400px width. Use `?w=800` query param for larger size (Cloudinary transforms)
- Full-text search uses PostgreSQL FTS (Phase 2). Upgraded to Algolia at Phase 5 when catalogue exceeds 5,000 titles — same API contract, no client changes

---

### GET /titles/:id

Get full title detail.

**Auth required:** No

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "ttl_cm2x1y3z4",
    "title": "The Lost Hours",
    "slug": "the-lost-hours",
    "author": {
      "id": "usr_cm2a1b2c3",
      "display_name": "K. Hossain",
      "pen_name": "K. Hossain",
      "verified_author": true,
      "avatar_url": "https://cdn.stackread.com/avatars/usr_cm2a1b2c3.webp"
    },
    "cover_url": "https://cdn.stackread.com/covers/ttl_cm2x1y3z4_800.webp",
    "synopsis": "A gripping psychological thriller set in 1970s Dhaka...",
    "isbn": "978-3-16-148410-0",
    "publisher": "Noir Press",
    "publication_date": "2025-11-15",
    "language": "en",
    "pages": 312,
    "audiobook_duration_minutes": 480,
    "formats": ["epub", "audiobook"],
    "genre_tags": ["fiction", "thriller"],
    "subject_tags": ["crime", "mystery", "historical"],
    "access_model": "subscription",
    "purchase_price": null,
    "availability": "available",
    "simultaneous_access_limit": 5,
    "active_readers_count": 2,
    "loan_duration_days": 14,
    "drm_protected": true,
    "has_sample": true,
    "series": null,
    "average_rating": 4.3,
    "rating_breakdown": { "5": 42, "4": 31, "3": 10, "2": 3, "1": 1 },
    "total_reviews": 87,
    "total_reads": 1204,
    "published_at": "2026-01-10T00:00:00Z",
    "related_titles": [
      {
        "id": "ttl_cm9z8y7x6",
        "title": "The Dark Shore",
        "cover_url": "https://cdn.stackread.com/covers/ttl_cm9z8y7x6_400.webp",
        "average_rating": 4.1
      }
    ],
    "reader_state": {
      "borrowed": false,
      "borrow_id": null,
      "on_hold": false,
      "hold_id": null,
      "hold_position": null,
      "reviewed": false,
      "progress_percent": 0,
      "in_lists": [
        { "list_id": "lst_cm2x1y3z4", "list_name": "Want to Read" }
      ]
    }
  }
}
```

**Notes:**
- `related_titles`: 3 titles from same genre(s), sorted by rating — simple SQL query, no AI
- `simultaneous_access_limit: -1` means unlimited
- `purchase_price`: `null` if not available for purchase. Otherwise `{ "amount": 49900, "currency": "BDT" }`

---

### GET /titles/:id/sample

Get a time-limited signed URL to read the title's free sample.

**Auth required:** No

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "title_id": "ttl_cm2x1y3z4",
    "format": "epub",
    "sample_url": "https://cdn.stackread.com/samples/ttl_cm2x1y3z4_sample.epub?token=SIGNED&expires=1715005200",
    "expires_at": "2026-05-06T12:00:00Z",
    "sample_description": "First 2 chapters (30 pages)"
  }
}
```

**Notes:**
- Signed URL expires in 2 hours
- Sample is DRM-free (no license needed)
- Author controls whether a sample exists; not all titles have one

---

### GET /genres

List all active genres with title counts.

**Auth required:** No

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    { "id": "gen_cm2x1y3z4", "slug": "fiction", "name": "Fiction", "name_bn": "কল্পকাহিনী", "title_count": 843 },
    { "id": "gen_cm2a1b2c3", "slug": "sci-fi", "name": "Science Fiction", "name_bn": "বিজ্ঞান কল্পকাহিনী", "title_count": 312 },
    { "id": "gen_cm9z8y7x6", "slug": "history", "name": "History", "name_bn": "ইতিহাস", "title_count": 198 }
  ]
}
```

---

### GET /languages

List all languages that have titles in the catalogue.

**Auth required:** No

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    { "code": "en", "name": "English", "name_native": "English", "title_count": 892 },
    { "code": "bn", "name": "Bengali", "name_native": "বাংলা", "title_count": 312 }
  ]
}
```

---

### GET /shelves

List all curated shelves.

**Auth required:** No

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "shf_cm2x1y3z4",
      "slug": "staff-picks",
      "name": "Staff Picks",
      "description": "Handpicked by the StackRead editorial team.",
      "cover_image_url": "https://cdn.stackread.com/shelves/staff-picks.webp",
      "title_count": 24,
      "updated_at": "2026-05-01T00:00:00Z"
    },
    {
      "id": "shf_cm2a1b2c3",
      "slug": "new-arrivals",
      "name": "New Arrivals",
      "description": "Titles added in the last 30 days.",
      "cover_image_url": null,
      "title_count": 87,
      "updated_at": "2026-05-06T00:00:00Z"
    }
  ]
}
```

---

### GET /shelves/:slug/titles

Get paginated titles in a shelf.

**Auth required:** No

**Query:** `sort`, `page`, `per_page` (same as `/titles`)

**Response `200 OK`:** Same structure as `GET /titles` with pagination.

---

### GET /authors/:id

Get a public author profile.

**Auth required:** No

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "usr_cm2a1b2c3",
    "display_name": "K. Hossain",
    "pen_name": "K. Hossain",
    "bio": "Award-winning fiction writer from Dhaka. Author of six novels.",
    "avatar_url": "https://cdn.stackread.com/avatars/usr_cm2a1b2c3.webp",
    "verified_author": true,
    "genres": ["fiction", "thriller"],
    "website_url": "https://khossain.com",
    "title_count": 7,
    "total_reads": 94020,
    "average_rating": 4.2,
    "joined_at": "2025-03-01T00:00:00Z"
  }
}
```

---

### GET /authors/:id/titles

Get an author's published titles.

**Auth required:** No

**Query:** `sort=created_at:desc`, `page`, `per_page`

**Response `200 OK`:** Same structure as `GET /titles` filtered to this author.
