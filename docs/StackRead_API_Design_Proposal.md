# StackRead — API Design Proposal
**Version:** 0.1 (Proposal Draft — for discussion)
**Author:** Claude (Anthropic)
**Date:** May 2026
**Base URL:** `https://api.stackread.com/v1`

---

## Table of Contents

1. [Conventions & Global Rules](#1-conventions--global-rules)
2. [Authentication & Sessions](#2-authentication--sessions)
3. [Catalogue & Discovery](#3-catalogue--discovery)
4. [Subscription & Billing](#4-subscription--billing)
5. [Reader — Library & Borrowing](#5-reader--library--borrowing)
6. [Reader — Reading Experience](#6-reader--reading-experience)
7. [Reader — Lists, Annotations & Reviews](#7-reader--lists-annotations--reviews)
8. [Author Dashboard](#8-author-dashboard)
9. [Admin](#9-admin)
10. [DRM & Streaming](#10-drm--streaming)
11. [Webhooks](#11-webhooks)
12. [Error Reference](#12-error-reference)
13. [Phase Roadmap Tag Legend](#13-phase-roadmap-tag-legend)

---

## 1. Conventions & Global Rules

### 1.1 Base URL & Versioning
```
https://api.stackread.com/v1
```
- Major version in URL path (`/v1`, `/v2`).
- Minor non-breaking changes are additive and do not bump the version.
- Deprecated fields are returned with a `Deprecated: true` header and removed after 90 days notice.

### 1.2 Request Format
- All request bodies: `Content-Type: application/json`
- File uploads: `Content-Type: multipart/form-data`
- Charset: UTF-8 everywhere.

### 1.3 Response Envelope
Every response wraps payload in a consistent envelope:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "request_id": "req_01J9XZ",
    "timestamp": "2026-05-06T10:00:00Z"
  }
}
```

Paginated list responses add a `pagination` block:
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total_items": 340,
    "total_pages": 17,
    "has_next": true,
    "has_prev": false
  }
}
```

### 1.4 Authentication
All protected endpoints require:
```
Authorization: Bearer <access_token>
```

Tokens are short-lived JWTs (15 min). Refresh tokens (30 days, HTTP-only cookie).

### 1.5 Rate Limiting
| Tier | Limit |
|------|-------|
| Unauthenticated | 60 req/min |
| Authenticated reader | 300 req/min |
| Author | 300 req/min |
| Admin | 600 req/min |
| Auth endpoints (login, register) | 10 req/min |

Rate limit headers returned on every response:
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 287
X-RateLimit-Reset: 1715000060
```

### 1.6 Pagination
Default cursor: page-based.
```
GET /titles?page=2&per_page=20
```
`per_page` max: 100.

### 1.7 Sorting & Filtering
Consistent query param convention:
```
sort=created_at:desc,title:asc
filter[genre]=fiction
filter[format]=epub
```

### 1.8 Common Field Patterns

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` (UUID v4) | All resource IDs |
| `created_at` | `string` (ISO 8601) | UTC |
| `updated_at` | `string` (ISO 8601) | UTC |
| `status` | `string` (enum) | Documented per resource |

---

## 2. Authentication & Sessions

### 2.1 Register — Reader
`POST /auth/register`
> **Phase 2 MUST**

**Request:**
```json
{
  "email": "reader@example.com",
  "password": "MinLength8Ch@r",
  "display_name": "Rafi",
  "role": "reader"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "user_id": "usr_01J9XZ",
    "email": "reader@example.com",
    "role": "reader",
    "email_verified": false,
    "message": "Verification email sent. Please check your inbox."
  }
}
```

**Notes:**
- `role` accepted values: `reader`, `author`
- Password hashed with bcrypt (cost 12)
- Verification email sent immediately via Nodemailer
- Account is created but `email_verified: false` — access limited until verified

---

### 2.2 Register — Author
`POST /auth/register/author`
> **Phase 2 MUST** — Author-specific fields

**Request:**
```json
{
  "email": "author@example.com",
  "password": "SecureP@ssword1",
  "display_name": "Karim Hossain",
  "pen_name": "K. Hossain",
  "bio": "Award-winning fiction writer from Dhaka.",
  "genres": ["fiction", "thriller"],
  "payout_currency": "BDT"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "user_id": "usr_02K1AB",
    "role": "author",
    "verified_author": false,
    "profile_status": "pending_review",
    "message": "Registration received. Verification email sent. Admin will review your author profile."
  }
}
```

---

### 2.3 Verify Email
`POST /auth/verify-email`
> **Phase 2 MUST**

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "email_verified": true,
    "message": "Email verified successfully."
  }
}
```

---

### 2.4 Login — Email/Password
`POST /auth/login`
> **Phase 2 MUST**

**Request:**
```json
{
  "email": "reader@example.com",
  "password": "MinLength8Ch@r"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiJ9...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": "usr_01J9XZ",
      "email": "reader@example.com",
      "display_name": "Rafi",
      "role": "reader",
      "avatar_url": "https://cdn.stackread.com/avatars/usr_01J9XZ.webp",
      "subscription_status": "active",
      "subscription_plan": "standard"
    }
  }
}
```

**Notes:**
- Refresh token set as HTTP-only cookie (`stackread_refresh`)
- Failed login increments a counter; account locked after 10 consecutive failures for 15 min
- Login blocked if `email_verified: false`

---

### 2.5 OAuth — Google
`POST /auth/oauth/google`
> **Phase 2 MUST**

**Request:**
```json
{
  "id_token": "google_id_token_here",
  "role": "reader"
}
```

**Response `200 OK`:**
Same structure as `/auth/login`. `role` only used on first-time registration; ignored on subsequent logins.

---

### 2.6 Refresh Access Token
`POST /auth/refresh`
> **Phase 2 MUST**

No request body. Reads `stackread_refresh` cookie automatically.

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

---

### 2.7 Logout
`POST /auth/logout`
> **Phase 2 MUST** | Auth required

Invalidates current session. Optionally invalidates all sessions.

**Request:**
```json
{
  "all_devices": false
}
```

**Response `200 OK`:**
```json
{ "success": true, "data": { "message": "Logged out successfully." } }
```

---

### 2.8 Forgot Password
`POST /auth/forgot-password`
> **Phase 2 MUST**

**Request:**
```json
{ "email": "reader@example.com" }
```

**Response `200 OK`:** Always returns success (prevent email enumeration).
```json
{ "success": true, "data": { "message": "If that email exists, a reset link has been sent." } }
```

---

### 2.9 Reset Password
`POST /auth/reset-password`
> **Phase 2 MUST**

**Request:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecureP@ss1"
}
```

---

### 2.10 Get Current User
`GET /auth/me`
> **Phase 2 MUST** | Auth required

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "usr_01J9XZ",
    "email": "reader@example.com",
    "display_name": "Rafi",
    "role": "reader",
    "avatar_url": "https://cdn.stackread.com/avatars/...",
    "email_verified": true,
    "two_fa_enabled": false,
    "subscription": {
      "plan": "standard",
      "status": "active",
      "current_period_end": "2026-06-06T00:00:00Z"
    },
    "preferences": {
      "genres": ["fiction", "sci-fi"],
      "formats": ["epub"],
      "reading_history_public": false,
      "notifications": {
        "hold_available": true,
        "subscription_renewal": true,
        "new_releases": false
      }
    },
    "created_at": "2026-05-01T10:00:00Z"
  }
}
```

---

### 2.11 Active Sessions
`GET /auth/sessions`
> **Phase 2 SHOULD** | Auth required

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "session_id": "sess_01ABC",
      "device": "Chrome on Windows",
      "ip": "192.168.1.1",
      "location": "Dhaka, BD",
      "last_active": "2026-05-06T09:00:00Z",
      "current": true
    }
  ]
}
```

`DELETE /auth/sessions/:session_id` — Revoke a specific session.
`DELETE /auth/sessions` — Revoke all sessions except current.

---

### 2.12 Two-Factor Authentication (2FA)
`POST /auth/2fa/enable` — Send OTP to email.
`POST /auth/2fa/verify` — `{ "otp": "123456" }` — Enables 2FA.
`POST /auth/2fa/disable` — `{ "otp": "123456" }` — Disables 2FA.
> **Phase 2 SHOULD**

---

## 3. Catalogue & Discovery

### 3.1 List / Search Titles
`GET /titles`
> **Phase 2 MUST** | Public

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Full-text search — title, author, ISBN |
| `genre` | string | Slug e.g. `fiction`, `sci-fi` |
| `format` | string | `epub`, `pdf`, `audiobook`, `all` |
| `language` | string | ISO 639-1 e.g. `en`, `bn` |
| `year_from` | integer | Publication year range start |
| `year_to` | integer | Publication year range end |
| `rating_min` | float | Minimum average rating |
| `availability` | string | `available`, `on_hold` |
| `shelf` | string | Curated shelf slug e.g. `staff-picks`, `new-arrivals` |
| `sort` | string | `relevance`, `title:asc`, `created_at:desc`, `rating:desc`, `reads:desc` |
| `page` | integer | Default: 1 |
| `per_page` | integer | Default: 20, max: 100 |

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ttl_01XYZ",
      "title": "The Lost Hours",
      "slug": "the-lost-hours",
      "author": {
        "id": "usr_02K1AB",
        "display_name": "K. Hossain",
        "verified": true
      },
      "cover_url": "https://cdn.stackread.com/covers/ttl_01XYZ.webp",
      "formats": ["epub", "audiobook"],
      "genre_tags": ["fiction", "thriller"],
      "language": "en",
      "publication_date": "2025-11-15",
      "average_rating": 4.3,
      "total_reviews": 87,
      "access_model": "subscription",
      "availability": "available",
      "simultaneous_access_limit": 5,
      "active_readers": 2
    }
  ],
  "pagination": { ... }
}
```

---

### 3.2 Get Title Detail
`GET /titles/:id`
> **Phase 2 MUST** | Public

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "ttl_01XYZ",
    "title": "The Lost Hours",
    "slug": "the-lost-hours",
    "author": {
      "id": "usr_02K1AB",
      "display_name": "K. Hossain",
      "pen_name": "K. Hossain",
      "verified": true,
      "avatar_url": "https://cdn.stackread.com/avatars/..."
    },
    "cover_url": "https://cdn.stackread.com/covers/ttl_01XYZ.webp",
    "synopsis": "A gripping thriller set in...",
    "formats": ["epub", "audiobook"],
    "isbn": "978-3-16-148410-0",
    "publisher": "StackRead Originals",
    "publication_date": "2025-11-15",
    "language": "en",
    "pages": 312,
    "audiobook_duration_minutes": 480,
    "genre_tags": ["fiction", "thriller"],
    "subject_tags": ["crime", "mystery"],
    "access_model": "subscription",
    "availability": "available",
    "simultaneous_access_limit": 5,
    "active_readers": 2,
    "loan_duration_days": 14,
    "drm_protected": true,
    "average_rating": 4.3,
    "total_reviews": 87,
    "total_reads": 1204,
    "has_sample": true,
    "series": null,
    "related_titles": [
      { "id": "ttl_02ABC", "title": "The Dark Shore", "cover_url": "..." }
    ],
    "reader_state": {
      "borrowed": false,
      "on_hold": false,
      "hold_position": null,
      "in_reading_list": false,
      "progress_percent": 0
    }
  }
}
```

**Notes:**
- `reader_state` is `null` for unauthenticated guests
- `related_titles` uses genre-based simple query (not AI — Phase 2)

---

### 3.3 Get Title Sample
`GET /titles/:id/sample`
> **Phase 2 MUST** | Public

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "title_id": "ttl_01XYZ",
    "format": "epub",
    "sample_url": "https://cdn.stackread.com/samples/ttl_01XYZ_sample.epub",
    "sample_expires_at": "2026-05-06T11:00:00Z",
    "sample_chapters": 2,
    "sample_page_limit": 30
  }
}
```

---

### 3.4 List Genres
`GET /genres`
> **Phase 2 MUST** | Public

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    { "id": "gen_01", "slug": "fiction", "name": "Fiction", "title_count": 843 },
    { "id": "gen_02", "slug": "sci-fi", "name": "Science Fiction", "title_count": 312 }
  ]
}
```

---

### 3.5 List Languages
`GET /languages`
> **Phase 2 MUST** | Public

---

### 3.6 List Curated Shelves
`GET /shelves`
> **Phase 2 MUST** | Public

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    { "id": "shf_01", "slug": "staff-picks", "name": "Staff Picks", "description": "Handpicked by our team", "title_count": 24 },
    { "id": "shf_02", "slug": "new-arrivals", "name": "New Arrivals", "title_count": 50 },
    { "id": "shf_03", "slug": "trending", "name": "Trending", "title_count": 20 }
  ]
}
```

`GET /shelves/:slug/titles` — Paginated list of titles in a shelf.

---

### 3.7 Get Public Author Profile
`GET /authors/:id`
> **Phase 2 MUST** | Public

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "usr_02K1AB",
    "display_name": "K. Hossain",
    "pen_name": "K. Hossain",
    "bio": "Award-winning fiction writer from Dhaka.",
    "avatar_url": "https://cdn.stackread.com/avatars/...",
    "verified": true,
    "genres": ["fiction", "thriller"],
    "title_count": 7,
    "total_reads": 9402,
    "joined_at": "2025-03-01T00:00:00Z"
  }
}
```

`GET /authors/:id/titles` — Author's published titles (paginated).

---

## 4. Subscription & Billing

### 4.1 List Plans
`GET /subscriptions/plans`
> **Phase 2 MUST** | Public

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "plan_basic",
      "name": "Basic",
      "price_monthly": 299,
      "currency": "BDT",
      "features": [
        "Access to full catalogue",
        "1 device at a time",
        "Standard quality audiobooks"
      ],
      "simultaneous_devices": 1,
      "offline_download": false,
      "trial_days": 7
    },
    {
      "id": "plan_standard",
      "name": "Standard",
      "price_monthly": 499,
      "currency": "BDT",
      "features": ["Access to full catalogue", "2 devices", "HD audiobooks"],
      "simultaneous_devices": 2,
      "offline_download": false,
      "trial_days": 7
    },
    {
      "id": "plan_premium",
      "name": "Premium",
      "price_monthly": 799,
      "currency": "BDT",
      "features": ["Access to full catalogue", "5 devices", "HD audiobooks", "Offline downloads"],
      "simultaneous_devices": 5,
      "offline_download": true,
      "trial_days": 14
    }
  ]
}
```

---

### 4.2 Subscribe
`POST /subscriptions`
> **Phase 2 MUST** | Auth required (reader)

**Request:**
```json
{
  "plan_id": "plan_standard",
  "payment_method_id": "pm_stripe_xyz",
  "promo_code": "LAUNCH50"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "subscription_id": "sub_01ABC",
    "plan": "standard",
    "status": "active",
    "current_period_start": "2026-05-06T00:00:00Z",
    "current_period_end": "2026-06-06T00:00:00Z",
    "trial_end": null,
    "stripe_subscription_id": "sub_stripe_1234"
  }
}
```

---

### 4.3 Get My Subscription
`GET /subscriptions/me`
> **Phase 2 MUST** | Auth required

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "subscription_id": "sub_01ABC",
    "plan": "standard",
    "status": "active",
    "current_period_end": "2026-06-06T00:00:00Z",
    "cancel_at_period_end": false,
    "payment_method": {
      "type": "card",
      "brand": "visa",
      "last4": "4242",
      "exp_month": 12,
      "exp_year": 2027
    }
  }
}
```

---

### 4.4 Change Plan
`PATCH /subscriptions/me`
> **Phase 2 MUST** | Auth required

**Request:**
```json
{ "plan_id": "plan_premium" }
```

Prorated billing handled by Stripe. Downgrade takes effect at next billing cycle.

---

### 4.5 Cancel Subscription
`DELETE /subscriptions/me`
> **Phase 2 MUST** | Auth required

**Request:**
```json
{ "cancel_immediately": false }
```

`cancel_immediately: false` sets `cancel_at_period_end: true` (default). Access continues until period end.

---

### 4.6 Update Payment Method
`PUT /subscriptions/me/payment-method`
> **Phase 2 MUST** | Auth required

**Request:**
```json
{ "payment_method_id": "pm_stripe_new_xyz" }
```

---

### 4.7 Billing History
`GET /subscriptions/me/invoices`
> **Phase 2 SHOULD** | Auth required

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "invoice_id": "inv_01",
      "amount": 499,
      "currency": "BDT",
      "status": "paid",
      "period_start": "2026-04-06T00:00:00Z",
      "period_end": "2026-05-06T00:00:00Z",
      "pdf_url": "https://api.stackread.com/v1/subscriptions/me/invoices/inv_01/pdf",
      "paid_at": "2026-04-06T00:00:05Z"
    }
  ]
}
```

`GET /subscriptions/me/invoices/:id/pdf` — Download PDF invoice.

---

### 4.8 Apply Promo Code
`POST /subscriptions/me/promo`
> **Phase 2 SHOULD** | Auth required

**Request:**
```json
{ "code": "LAUNCH50" }
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "code": "LAUNCH50",
    "discount_type": "percent",
    "discount_value": 50,
    "valid_for_months": 3,
    "applied": true
  }
}
```

---

## 5. Reader — Library & Borrowing

### 5.1 Borrow a Title
`POST /me/library`
> **Phase 2 MUST** | Auth required (active subscription)

**Request:**
```json
{
  "title_id": "ttl_01XYZ",
  "format": "epub"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "borrow_id": "brw_01ABC",
    "title_id": "ttl_01XYZ",
    "format": "epub",
    "borrowed_at": "2026-05-06T10:00:00Z",
    "due_at": "2026-05-20T10:00:00Z",
    "drm_license_url": "https://api.stackread.com/v1/drm/licenses/brw_01ABC",
    "read_url": "https://api.stackread.com/v1/stream/titles/ttl_01XYZ/ebook?session=TOKEN"
  }
}
```

**Error cases:**
- `409 TITLE_UNAVAILABLE` — All simultaneous slots taken; offer to join hold queue.
- `403 SUBSCRIPTION_REQUIRED` — No active subscription.

---

### 5.2 Get My Library (Borrowed)
`GET /me/library`
> **Phase 2 MUST** | Auth required

**Query params:** `status=active|overdue|returned`, `sort`, `page`, `per_page`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "borrow_id": "brw_01ABC",
      "title": { "id": "ttl_01XYZ", "title": "The Lost Hours", "cover_url": "..." },
      "format": "epub",
      "borrowed_at": "2026-05-06T10:00:00Z",
      "due_at": "2026-05-20T10:00:00Z",
      "progress_percent": 34,
      "status": "active"
    }
  ]
}
```

---

### 5.3 Return a Title
`DELETE /me/library/:borrow_id`
> **Phase 2 MUST** | Auth required

Frees up a simultaneous slot. Notifies next person in hold queue.

---

### 5.4 Borrowing History
`GET /me/history`
> **Phase 2 MUST** | Auth required

---

### 5.5 Place a Hold
`POST /me/holds`
> **Phase 2 MUST** | Auth required

**Request:**
```json
{ "title_id": "ttl_01XYZ", "format": "epub" }
```

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "hold_id": "hld_01ABC",
    "title_id": "ttl_01XYZ",
    "queue_position": 3,
    "estimated_wait_days": 14,
    "placed_at": "2026-05-06T10:00:00Z",
    "expires_at": "2026-06-06T10:00:00Z"
  }
}
```

---

### 5.6 Get My Holds
`GET /me/holds`
> **Phase 2 MUST** | Auth required

---

### 5.7 Cancel a Hold
`DELETE /me/holds/:hold_id`
> **Phase 2 MUST** | Auth required

---

## 6. Reader — Reading Experience

### 6.1 Get / Update Reading Progress
`GET /me/progress/:title_id`
> **Phase 2 MUST** | Auth required

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "title_id": "ttl_01XYZ",
    "format": "epub",
    "cfi_position": "epubcfi(/6/4!/4/2/2/2:0)",
    "percent_complete": 34,
    "chapter": 7,
    "chapter_title": "The Missing Key",
    "last_read_at": "2026-05-05T21:00:00Z",
    "device_id": "dev_phone",
    "audiobook_position_seconds": null
  }
}
```

`PUT /me/progress/:title_id`
> **Phase 2 MUST** | Auth required

**Request:**
```json
{
  "format": "epub",
  "cfi_position": "epubcfi(/6/4!/4/2/2/2:0)",
  "percent_complete": 34,
  "chapter": 7,
  "device_id": "dev_phone"
}
```

For audiobook:
```json
{
  "format": "audiobook",
  "audiobook_position_seconds": 3600,
  "percent_complete": 25
}
```

**Notes:**
- Called automatically by reader every 30 seconds while reading.
- Cross-device sync via WebSocket added in Phase 3. For Phase 2, this polling endpoint covers it.

---

### 6.2 Reader Preferences (per-user)
`GET /me/reader-preferences`
`PUT /me/reader-preferences`
> **Phase 2 MUST** | Auth required

**Request / Response body:**
```json
{
  "font_family": "OpenDyslexic",
  "font_size": 18,
  "line_spacing": 1.5,
  "margins": "medium",
  "theme": "sepia",
  "text_to_speech_enabled": false,
  "dictionary_lookup_enabled": true
}
```

**Font options:** `"Georgia"`, `"Arial"`, `"OpenDyslexic"`, `"Merriweather"`
**Theme options:** `"light"`, `"dark"`, `"sepia"`

---

### 6.3 Annotations
`GET /me/annotations/:title_id`
> **Phase 2 MUST** | Auth required

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "annotation_id": "ann_01",
      "type": "highlight",
      "cfi_range": "epubcfi(/6/4[chap01]!/4/2/2,:0,:24)",
      "highlighted_text": "The darkness fell like a curtain",
      "note": "Great imagery",
      "color": "yellow",
      "chapter": 7,
      "created_at": "2026-05-05T22:00:00Z"
    }
  ]
}
```

`POST /me/annotations/:title_id`
> **Phase 2 MUST** | Auth required

**Request:**
```json
{
  "type": "highlight",
  "cfi_range": "epubcfi(...)",
  "highlighted_text": "The darkness fell like a curtain",
  "note": "Great imagery",
  "color": "yellow"
}
```

`PATCH /me/annotations/:title_id/:annotation_id` — Update note or color.
`DELETE /me/annotations/:title_id/:annotation_id` — Delete annotation.

---

### 6.4 Bookmarks
`GET /me/bookmarks/:title_id`
`POST /me/bookmarks/:title_id`
`DELETE /me/bookmarks/:title_id/:bookmark_id`
> **Phase 2 MUST** | Auth required

**Bookmark body:**
```json
{
  "cfi_position": "epubcfi(...)",
  "chapter": 7,
  "chapter_title": "The Missing Key",
  "label": "Remember this part"
}
```

---

## 7. Reader — Lists, Annotations & Reviews

### 7.1 Reading Lists

`GET /me/lists`
> **Phase 2 MUST** | Auth required

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "list_id": "lst_01",
      "name": "Want to Read",
      "slug": "want-to-read",
      "visibility": "private",
      "title_count": 12,
      "created_at": "2026-04-01T00:00:00Z"
    }
  ]
}
```

`POST /me/lists`
> **Phase 2 MUST** | Auth required

**Request:**
```json
{ "name": "Bengali Classics", "visibility": "private" }
```

`GET /me/lists/:list_id` — Get list with its titles.
`PATCH /me/lists/:list_id` — Update name / visibility.
`DELETE /me/lists/:list_id` — Delete list.

`POST /me/lists/:list_id/titles`
> **Phase 2 MUST** | Auth required

```json
{ "title_id": "ttl_01XYZ" }
```

`DELETE /me/lists/:list_id/titles/:title_id` — Remove title from list.

---

### 7.2 Reviews & Ratings

`GET /titles/:id/reviews`
> **Phase 2 MUST** | Public

**Query:** `sort=recent|helpful|rating_high|rating_low`, `page`, `per_page`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "review_id": "rev_01ABC",
      "reader": {
        "id": "usr_01J9XZ",
        "display_name": "Rafi",
        "avatar_url": "..."
      },
      "rating": 4,
      "body": "A compelling read. The pacing could be tighter in the middle.",
      "spoiler": false,
      "helpful_count": 23,
      "my_vote": null,
      "created_at": "2026-04-15T00:00:00Z",
      "updated_at": "2026-04-15T00:00:00Z"
    }
  ]
}
```

`POST /titles/:id/reviews`
> **Phase 2 MUST** | Auth required (must have borrowed title)

**Request:**
```json
{
  "rating": 4,
  "body": "A compelling read...",
  "spoiler": false
}
```

`PATCH /titles/:id/reviews/:review_id` — Edit own review.
`DELETE /titles/:id/reviews/:review_id` — Delete own review.

`POST /reviews/:review_id/helpful`
> **Phase 2 SHOULD** | Auth required

```json
{ "vote": "up" }
```

`POST /reviews/:review_id/flag`
> **Phase 2 MUST** | Auth required

```json
{ "reason": "spam" }
```

---

### 7.3 User Profile (Public View)

`GET /users/:id/profile`
> **Phase 2 MUST** | Public (respects privacy settings)

---

### 7.4 Account Settings

`PATCH /me/profile`
> **Phase 2 MUST** | Auth required

```json
{
  "display_name": "Rafi Islam",
  "bio": "Reader. Writer. Dreamer.",
  "avatar_url": "https://cdn.stackread.com/avatars/..."
}
```

`PUT /me/avatar`
> **Phase 2 MUST** | Auth required | `multipart/form-data`

`PATCH /me/preferences`
> **Phase 2 MUST** | Auth required

```json
{
  "genres": ["fiction", "history"],
  "formats": ["epub"],
  "reading_history_public": false,
  "notifications": {
    "hold_available": true,
    "subscription_renewal": true,
    "new_releases": false,
    "payment_failure": true
  }
}
```

`PATCH /me/email`
> **Phase 2 SHOULD** | Auth required

```json
{ "new_email": "new@example.com", "password": "current_password" }
```
Sends verification email to new address.

`POST /me/delete-request`
> **Phase 2 MUST** | Auth required — GDPR

```json
{ "reason": "no_longer_needed", "password": "confirm_password" }
```
Schedules account + data deletion within 30 days.

---

## 8. Author Dashboard

> All endpoints in this section require `role: author` and a verified author account.
> Prefix: `/author`

### 8.1 Get Author Profile (Private)
`GET /author/profile`
> **Phase 2 MUST**

### 8.2 Update Author Profile
`PATCH /author/profile`
> **Phase 2 MUST**

```json
{
  "bio": "Updated bio text.",
  "pen_name": "K. Hossain",
  "genres": ["fiction", "thriller"],
  "website_url": "https://khossain.com"
}
```

---

### 8.3 Upload a New Title
`POST /author/titles`
> **Phase 2 MUST** | `multipart/form-data`

**Form fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `file_ebook` | file | Conditional | EPUB or PDF |
| `file_audiobook` | file | Conditional | MP3 or M4B |
| `cover_image` | file | Yes | Min 600×900px |
| `title` | string | Yes | Max 255 chars |
| `synopsis` | string | Yes | Max 5000 chars |
| `isbn` | string | No | ISBN-13, auto-fills metadata if provided |
| `genre_tags` | array | Yes | Min 1, max 5 |
| `subject_tags` | array | No | Max 10 |
| `language` | string | Yes | ISO 639-1 |
| `publication_date` | date | Yes | |
| `access_model` | string | Yes | `subscription`, `purchase`, `both` |
| `simultaneous_access_limit` | integer | Yes | 1, 3, 5, or -1 (unlimited) |
| `loan_duration_days` | integer | Yes | 7, 14, 21, or 30 |
| `drm_enabled` | boolean | Yes | |
| `price_purchase` | integer | Conditional | Required if `access_model` includes `purchase` (in smallest currency unit) |

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "title_id": "ttl_02DEF",
    "status": "draft",
    "upload_status": {
      "ebook": "processing",
      "audiobook": "processing",
      "cover": "done"
    },
    "created_at": "2026-05-06T10:00:00Z"
  }
}
```

**Notes:**
- Files are virus-scanned and format-validated asynchronously.
- Author polls `GET /author/titles/:id` to check `upload_status`.
- Status flow: `draft` → `ready_to_submit` → `under_review` → `published` or `rejected`.

---

### 8.4 ISBN Metadata Lookup
`GET /author/isbn/:isbn`
> **Phase 2 MUST**

Returns auto-fill metadata for the upload form.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "title": "The Lost Hours",
    "author_name": "Karim Hossain",
    "publisher": "Penguin Books",
    "publication_date": "2025-11-15",
    "language": "en",
    "pages": 312,
    "genre_suggestion": ["fiction", "thriller"]
  }
}
```

---

### 8.5 List My Titles
`GET /author/titles`
> **Phase 2 MUST**

**Query:** `status=draft|under_review|published|rejected|unpublished`, `sort`, `page`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ttl_02DEF",
      "title": "The Lost Hours",
      "cover_url": "...",
      "status": "published",
      "formats": ["epub", "audiobook"],
      "total_reads": 1204,
      "average_rating": 4.3,
      "earnings_total_pending": 8430,
      "published_at": "2026-01-10T00:00:00Z"
    }
  ]
}
```

---

### 8.6 Get Title Detail (Author View)
`GET /author/titles/:id`
> **Phase 2 MUST**

Full metadata + review feedback + rejection reason if applicable.

---

### 8.7 Update Draft Title
`PATCH /author/titles/:id`
> **Phase 2 MUST**

Can update metadata or re-upload files while status is `draft` or `rejected`.

---

### 8.8 Submit for Review
`POST /author/titles/:id/submit`
> **Phase 2 MUST**

Moves status from `draft` → `under_review`. Triggers admin notification.

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "status": "under_review",
    "submitted_at": "2026-05-06T10:05:00Z",
    "estimated_review_days": 3
  }
}
```

---

### 8.9 Unpublish a Title
`POST /author/titles/:id/unpublish`
> **Phase 2 MUST**

Immediately removes from public catalogue. Active borrows are allowed to complete their current session.

---

### 8.10 Author Analytics — Overview
`GET /author/analytics`
> **Phase 2 MUST**

**Query:** `period=7d|30d|90d|12m`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "total_reads": 3420,
    "total_readers": 870,
    "total_pages_read": 142500,
    "average_completion_rate": 0.61,
    "top_titles": [
      { "id": "ttl_02DEF", "title": "The Lost Hours", "reads": 1204, "completion_rate": 0.72 }
    ]
  }
}
```

---

### 8.11 Author Analytics — Per Title
`GET /author/analytics/:title_id`
> **Phase 2 MUST**

```json
{
  "success": true,
  "data": {
    "title_id": "ttl_02DEF",
    "period": "30d",
    "reads": 1204,
    "unique_readers": 890,
    "pages_read": 98240,
    "completion_rate": 0.72,
    "average_session_minutes": 28,
    "chapter_drop_off": [
      { "chapter": 1, "readers_reached": 1204 },
      { "chapter": 5, "readers_reached": 980 },
      { "chapter": 10, "readers_reached": 740 }
    ],
    "geographic_breakdown": [
      { "country": "BD", "readers": 620 },
      { "country": "IN", "readers": 180 }
    ],
    "ratings_breakdown": { "5": 42, "4": 31, "3": 10, "2": 4, "1": 0 }
  }
}
```

---

### 8.12 Earnings Summary
`GET /author/earnings`
> **Phase 2 MUST**

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "total_earned_lifetime": 52400,
    "total_pending_payout": 8430,
    "total_paid_out": 43970,
    "currency": "BDT",
    "royalty_rate_subscription": 0.60,
    "royalty_rate_purchase": 0.70,
    "next_payout_date": "2026-06-01T00:00:00Z",
    "earnings_by_title": [
      {
        "title_id": "ttl_02DEF",
        "title": "The Lost Hours",
        "earned_this_month": 4200,
        "earned_total": 32000
      }
    ]
  }
}
```

---

### 8.13 Payout Method Setup
`PUT /author/payout-method`
> **Phase 2 MUST**

**Request:**
```json
{
  "method": "bank_transfer",
  "bank_name": "Dutch-Bangla Bank",
  "account_name": "Karim Hossain",
  "account_number": "XXXXXXXXXXXX",
  "routing_number": "XXXXXXXX"
}
```

Or for PayPal:
```json
{
  "method": "paypal",
  "paypal_email": "karim@example.com"
}
```

---

### 8.14 Request Payout
`POST /author/payouts`
> **Phase 2 MUST**

```json
{ "amount": 8430 }
```

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "payout_id": "pay_01XYZ",
    "amount": 8430,
    "status": "pending_approval",
    "requested_at": "2026-05-06T10:00:00Z"
  }
}
```

`GET /author/payouts` — Payout history.

---

## 9. Admin

> All endpoints require `role: admin`. Prefix: `/admin`.

### 9.1 User Management

`GET /admin/users`
> **Phase 2 MUST**

**Query:** `q` (search by email/name), `role=reader|author|admin`, `status=active|suspended|deleted`, `sort`, `page`

`GET /admin/users/:id` — Full user detail + activity log.

`PATCH /admin/users/:id`
> **Phase 2 MUST**

```json
{
  "role": "author",
  "subscription_plan": "premium",
  "internal_note": "VIP author — handle carefully"
}
```

`POST /admin/users/:id/suspend`
```json
{ "reason": "Terms of Service violation", "duration_days": 30 }
```

`POST /admin/users/:id/unsuspend`

`DELETE /admin/users/:id`
> GDPR-compliant hard delete. Triggers data anonymisation workflow.

`POST /admin/users/:id/reset-password`
> Sends password reset email on behalf of user.

`POST /admin/users/:id/verify-email`
> Force-verifies email without requiring user action.

---

### 9.2 Catalogue Management

`GET /admin/titles/queue`
> **Phase 2 MUST**

Titles with status `under_review`, ordered by submission date.

`POST /admin/titles/:id/approve`
> **Phase 2 MUST**

```json
{ "scheduled_publish_at": null }
```

`POST /admin/titles/:id/reject`
> **Phase 2 MUST**

```json
{
  "reason": "FILE_QUALITY",
  "feedback": "The EPUB file has formatting issues in chapters 3-5. Please fix and resubmit."
}
```

`PATCH /admin/titles/:id`
> Edit any title metadata (cover, synopsis, genre tags, etc.)

`DELETE /admin/titles/:id`
> Immediate removal. Notifies author.

`POST /admin/titles/:id/feature`
> Add/remove from staff picks or curated shelves.

---

### 9.3 Shelf Management

`GET /admin/shelves`
`POST /admin/shelves`
```json
{ "name": "Summer Reads 2026", "slug": "summer-reads-2026", "description": "..." }
```
`PATCH /admin/shelves/:id`
`DELETE /admin/shelves/:id`
`POST /admin/shelves/:id/titles` — Add title to shelf.
`DELETE /admin/shelves/:id/titles/:title_id` — Remove title from shelf.

---

### 9.4 Subscription Plan Management

`GET /admin/subscriptions/plans`
`POST /admin/subscriptions/plans`
> **Phase 2 MUST**

```json
{
  "name": "Student",
  "price_monthly": 149,
  "currency": "BDT",
  "simultaneous_devices": 1,
  "offline_download": false,
  "trial_days": 30,
  "features": ["Access to full catalogue", "1 device"],
  "stripe_price_id": "price_stripe_xyz"
}
```

`PATCH /admin/subscriptions/plans/:id`
`DELETE /admin/subscriptions/plans/:id`

`POST /admin/subscriptions/:subscription_id/override`
> Manual plan change or refund for a reader.

---

### 9.5 Promo Codes

`GET /admin/promos`
`POST /admin/promos`
> **Phase 2 SHOULD**

```json
{
  "code": "LAUNCH50",
  "discount_type": "percent",
  "discount_value": 50,
  "max_uses": 500,
  "valid_from": "2026-05-01T00:00:00Z",
  "valid_until": "2026-05-31T00:00:00Z",
  "applicable_plans": ["plan_standard", "plan_premium"]
}
```

`PATCH /admin/promos/:id`
`DELETE /admin/promos/:id`

---

### 9.6 Royalty Management

`GET /admin/payouts`
> **Phase 2 MUST**

**Query:** `status=pending_approval|approved|processing|paid|failed|on_hold`

`POST /admin/payouts/:id/approve`
> **Phase 2 MUST**

`POST /admin/payouts/:id/hold`
```json
{ "reason": "Tax documents missing" }
```

`PATCH /admin/royalty-rates`
```json
{
  "subscription_royalty_rate": 0.60,
  "purchase_royalty_rate": 0.70,
  "platform_commission": 0.30
}
```

---

### 9.7 Metrics Dashboard

`GET /admin/metrics`
> **Phase 2 MUST**

**Query:** `period=today|7d|30d|all_time`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "users": {
      "total_readers": 4820,
      "total_authors": 142,
      "new_registrations": 380,
      "active_subscribers": 3210
    },
    "revenue": {
      "mrr": 1568490,
      "arr_projected": 18821880,
      "new_subscriptions": 380,
      "cancellations": 52,
      "churn_rate": 0.016
    },
    "catalogue": {
      "total_titles": 1204,
      "pending_review": 14,
      "published_this_month": 87
    },
    "engagement": {
      "total_reads": 48200,
      "total_pages_read": 2140000,
      "average_books_per_reader": 2.1
    },
    "payouts": {
      "total_pending": 48430,
      "total_paid_this_month": 142000,
      "currency": "BDT"
    }
  }
}
```

---

### 9.8 Audit Log

`GET /admin/audit-log`
> **Phase 2 MUST**

**Query:** `actor_id`, `action_type`, `target_type`, `date_from`, `date_to`, `page`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "log_id": "log_01ABC",
      "actor": { "id": "usr_admin_01", "display_name": "Nadia (Admin)" },
      "action": "TITLE_APPROVED",
      "target_type": "title",
      "target_id": "ttl_02DEF",
      "metadata": { "title": "The Lost Hours" },
      "ip": "192.168.1.1",
      "timestamp": "2026-05-06T10:00:00Z"
    }
  ]
}
```

---

### 9.9 GDPR / Data Deletion Requests

`GET /admin/gdpr/requests`
> **Phase 2 MUST**

**Query:** `status=pending|in_progress|completed|rejected`

`POST /admin/gdpr/requests/:id/process`
```json
{ "action": "approve", "notes": "All data anonymised and deleted." }
```

---

### 9.10 System Configuration

`GET /admin/config`
`PATCH /admin/config`
> **Phase 2 MUST**

```json
{
  "supported_formats": ["epub", "pdf", "mp3", "m4b"],
  "max_ebook_size_mb": 50,
  "max_audiobook_size_mb": 500,
  "default_loan_duration_days": 14,
  "auth_providers_enabled": ["email", "google"],
  "platform_name": "StackRead",
  "support_email": "support@stackread.com"
}
```

`GET /admin/email-templates`
`PATCH /admin/email-templates/:template_slug`
> Edit transactional email templates (verification, welcome, hold notification, etc.)

`GET /admin/legal-documents`
`POST /admin/legal-documents`
> Create new version of Terms of Service or Privacy Policy (auto-increments version).

---

### 9.11 Review Moderation

`GET /admin/moderation/reviews`
> Flagged reviews pending moderation.

`POST /admin/moderation/reviews/:id/approve`
`POST /admin/moderation/reviews/:id/remove`
```json
{ "reason": "spam", "notify_author": true }
```

---

## 10. DRM & Streaming

### 10.1 Request Signed eBook URL
`GET /stream/titles/:title_id/ebook`
> **Phase 2 MUST** | Auth required (active borrow)

**Query:** `format=epub|pdf`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "stream_url": "https://cdn.stackread.com/drm/ttl_01XYZ/signed_epub?token=SIGNED&expires=1715005200",
    "expires_at": "2026-05-06T12:00:00Z",
    "drm_license_url": "https://api.stackread.com/v1/drm/licenses/brw_01ABC",
    "format": "epub"
  }
}
```

**Notes:**
- Signed URL expires in 2 hours. Client must re-request on expiry.
- URL is single-use per device session.
- Server validates borrow status before issuing signed URL.

---

### 10.2 Request Signed Audiobook URL
`GET /stream/titles/:title_id/audiobook`
> **Phase 2 MUST** | Auth required (active borrow)

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "manifest": {
      "format": "m4b",
      "chapters": [
        {
          "chapter": 1,
          "title": "Part One",
          "stream_url": "https://cdn.stackread.com/audio/ttl_01XYZ/ch01.m4b?token=SIGNED",
          "duration_seconds": 1842
        }
      ]
    },
    "expires_at": "2026-05-06T12:00:00Z"
  }
}
```

---

### 10.3 Fetch DRM License
`POST /drm/licenses`
> **Phase 2 MUST** | Auth required

**Request:**
```json
{
  "borrow_id": "brw_01ABC",
  "device_id": "dev_phone_01",
  "device_fingerprint": "ua_hash_abc"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "license_id": "lic_01ABC",
    "title_id": "ttl_01XYZ",
    "format": "epub",
    "issued_at": "2026-05-06T10:00:00Z",
    "expires_at": "2026-05-20T10:00:00Z",
    "device_limit": 2,
    "license_document": "BASE64_ENCODED_LCP_LICENSE"
  }
}
```

**Notes:**
- Uses Readium LCP (preferred) or Adobe ACS.
- One license per borrow per device.
- License tied to `borrow_id` — revoked when title is returned.

---

## 11. Webhooks

StackRead emits webhooks for critical events to registered endpoints.

### 11.1 Register Webhook (Admin Only)
`POST /admin/webhooks`

```json
{
  "url": "https://yourserver.com/stackread-events",
  "events": ["subscription.created", "payout.approved", "title.approved"],
  "secret": "your_signing_secret"
}
```

### 11.2 Webhook Event Payload Format
```json
{
  "event_id": "evt_01ABC",
  "event_type": "subscription.created",
  "created_at": "2026-05-06T10:00:00Z",
  "data": { ... }
}
```

Signature header: `X-StackRead-Signature: sha256=HMAC_HASH`

### 11.3 Stripe Webhook Receiver
`POST /webhooks/stripe`
> Internal — receives Stripe events (payment success, failure, subscription updates).

### 11.4 Event Catalogue

| Event | Trigger |
|-------|---------|
| `user.registered` | New user registration |
| `user.email_verified` | Email verified |
| `subscription.created` | New subscription |
| `subscription.renewed` | Auto-renewal |
| `subscription.cancelled` | Cancellation |
| `subscription.payment_failed` | Payment failure |
| `title.submitted` | Author submits for review |
| `title.approved` | Admin approves |
| `title.rejected` | Admin rejects |
| `hold.available` | Held title becomes available |
| `payout.requested` | Author requests payout |
| `payout.approved` | Admin approves payout |
| `payout.paid` | Payout transferred |
| `gdpr.request_received` | Data deletion request |

---

## 12. Error Reference

### 12.1 Error Envelope
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
    "request_id": "req_01J9XZ",
    "timestamp": "2026-05-06T10:00:00Z"
  }
}
```

### 12.2 HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content (delete success) |
| 400 | Bad Request — validation errors |
| 401 | Unauthorised — missing or invalid token |
| 403 | Forbidden — authenticated but no permission |
| 404 | Not Found |
| 409 | Conflict — e.g. already borrowed, duplicate resource |
| 422 | Unprocessable Entity — semantic validation error |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### 12.3 Application Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `VALIDATION_ERROR` | 400 | Request body fails validation |
| `EMAIL_NOT_VERIFIED` | 403 | Login blocked — email not verified |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `TOKEN_EXPIRED` | 401 | Access token expired |
| `TOKEN_INVALID` | 401 | Malformed token |
| `ACCOUNT_SUSPENDED` | 403 | Account suspended |
| `SUBSCRIPTION_REQUIRED` | 403 | Action requires active subscription |
| `PLAN_INSUFFICIENT` | 403 | Action requires higher plan |
| `TITLE_NOT_FOUND` | 404 | Title does not exist |
| `TITLE_UNAVAILABLE` | 409 | No access slots available |
| `ALREADY_BORROWED` | 409 | Reader already has active borrow |
| `ALREADY_ON_HOLD` | 409 | Already in hold queue for this title |
| `REVIEW_EXISTS` | 409 | Reader already reviewed this title |
| `BORROW_REQUIRED` | 403 | Must borrow title to review |
| `UPLOAD_INVALID_FORMAT` | 422 | File format not supported |
| `UPLOAD_SIZE_EXCEEDED` | 422 | File exceeds size limit |
| `DRM_LICENSE_FAILED` | 500 | DRM provider error |
| `PAYMENT_FAILED` | 402 | Stripe payment declined |
| `RATE_LIMITED` | 429 | Too many requests |

---

## 13. Phase Roadmap Tag Legend

Endpoints and features are tagged throughout this document:

| Tag | Phase | Notes |
|-----|-------|-------|
| **Phase 2 MUST** | MVP | Required for launch |
| **Phase 2 SHOULD** | MVP | Build if time allows |
| **Phase 3** | Advanced | Real-time sync, offline, royalty engine, publisher org |
| **Phase 4** | Community | Book clubs, goals, gamification, events |
| **Phase 5** | Scale | AI recommendations, Elasticsearch, Redis caching |

---

## Appendix A — Endpoints Quick Reference (MVP Phase 2)

### Auth (13 endpoints)
```
POST   /auth/register
POST   /auth/register/author
POST   /auth/verify-email
POST   /auth/login
POST   /auth/oauth/google
POST   /auth/refresh
POST   /auth/logout
POST   /auth/forgot-password
POST   /auth/reset-password
GET    /auth/me
GET    /auth/sessions
DELETE /auth/sessions/:id
DELETE /auth/sessions
```

### Catalogue (9 endpoints)
```
GET    /titles
GET    /titles/:id
GET    /titles/:id/sample
GET    /genres
GET    /languages
GET    /shelves
GET    /shelves/:slug/titles
GET    /authors/:id
GET    /authors/:id/titles
```

### Subscription (8 endpoints)
```
GET    /subscriptions/plans
POST   /subscriptions
GET    /subscriptions/me
PATCH  /subscriptions/me
DELETE /subscriptions/me
PUT    /subscriptions/me/payment-method
GET    /subscriptions/me/invoices
POST   /subscriptions/me/promo
```

### Reader Library (8 endpoints)
```
POST   /me/library
GET    /me/library
DELETE /me/library/:borrow_id
GET    /me/history
POST   /me/holds
GET    /me/holds
DELETE /me/holds/:hold_id
```

### Reading Experience (12 endpoints)
```
GET    /me/progress/:title_id
PUT    /me/progress/:title_id
GET    /me/reader-preferences
PUT    /me/reader-preferences
GET    /me/annotations/:title_id
POST   /me/annotations/:title_id
PATCH  /me/annotations/:title_id/:id
DELETE /me/annotations/:title_id/:id
GET    /me/bookmarks/:title_id
POST   /me/bookmarks/:title_id
DELETE /me/bookmarks/:title_id/:id
```

### Lists & Reviews (14 endpoints)
```
GET    /me/lists
POST   /me/lists
GET    /me/lists/:id
PATCH  /me/lists/:id
DELETE /me/lists/:id
POST   /me/lists/:id/titles
DELETE /me/lists/:id/titles/:title_id
GET    /titles/:id/reviews
POST   /titles/:id/reviews
PATCH  /titles/:id/reviews/:id
DELETE /titles/:id/reviews/:id
POST   /reviews/:id/helpful
POST   /reviews/:id/flag
GET    /users/:id/profile
```

### Account (6 endpoints)
```
PATCH  /me/profile
PUT    /me/avatar
PATCH  /me/preferences
PATCH  /me/email
POST   /me/delete-request
```

### Author Dashboard (14 endpoints)
```
GET    /author/profile
PATCH  /author/profile
POST   /author/titles
GET    /author/isbn/:isbn
GET    /author/titles
GET    /author/titles/:id
PATCH  /author/titles/:id
POST   /author/titles/:id/submit
POST   /author/titles/:id/unpublish
GET    /author/analytics
GET    /author/analytics/:title_id
GET    /author/earnings
PUT    /author/payout-method
POST   /author/payouts
```

### Admin (38 endpoints)
```
GET    /admin/users
GET    /admin/users/:id
PATCH  /admin/users/:id
POST   /admin/users/:id/suspend
POST   /admin/users/:id/unsuspend
DELETE /admin/users/:id
POST   /admin/users/:id/reset-password
POST   /admin/users/:id/verify-email
GET    /admin/titles/queue
POST   /admin/titles/:id/approve
POST   /admin/titles/:id/reject
PATCH  /admin/titles/:id
DELETE /admin/titles/:id
POST   /admin/titles/:id/feature
GET    /admin/shelves
POST   /admin/shelves
PATCH  /admin/shelves/:id
DELETE /admin/shelves/:id
POST   /admin/shelves/:id/titles
DELETE /admin/shelves/:id/titles/:title_id
GET    /admin/subscriptions/plans
POST   /admin/subscriptions/plans
PATCH  /admin/subscriptions/plans/:id
DELETE /admin/subscriptions/plans/:id
POST   /admin/subscriptions/:id/override
GET    /admin/payouts
POST   /admin/payouts/:id/approve
POST   /admin/payouts/:id/hold
GET    /admin/metrics
GET    /admin/audit-log
GET    /admin/gdpr/requests
POST   /admin/gdpr/requests/:id/process
GET    /admin/config
PATCH  /admin/config
GET    /admin/moderation/reviews
POST   /admin/moderation/reviews/:id/approve
POST   /admin/moderation/reviews/:id/remove
```

### DRM & Streaming (3 endpoints)
```
GET    /stream/titles/:id/ebook
GET    /stream/titles/:id/audiobook
POST   /drm/licenses
```

### Webhooks (1 endpoint)
```
POST   /admin/webhooks
POST   /webhooks/stripe  (internal)
```

---

**Total Phase 2 MVP Endpoints: ~130**

---
*StackRead API Design Proposal v0.1 — Claude (Anthropic) — May 2026*
*This is a proposal draft. All decisions subject to discussion and revision.*
