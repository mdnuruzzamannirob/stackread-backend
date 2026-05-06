## Part 4 — Subscription & Billing

**Prefix:** `/subscriptions`
**Integration:** Stripe

---

### GET /subscriptions/plans

List all active subscription plans.

**Auth required:** No

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pln_basic",
      "name": "Basic",
      "slug": "basic",
      "description": "Perfect for casual readers.",
      "price": { "amount": 29900, "currency": "BDT" },
      "price_usd": { "amount": 299, "currency": "USD" },
      "billing_period": "monthly",
      "features": [
        "Full catalogue access",
        "1 device at a time",
        "Standard audiobook quality",
        "Unlimited reading lists"
      ],
      "simultaneous_devices": 1,
      "max_active_borrows": 5,
      "offline_download": false,
      "trial_days": 7,
      "is_popular": false,
      "stripe_price_id": "price_stripe_basic_bdt"
    },
    {
      "id": "pln_standard",
      "name": "Standard",
      "slug": "standard",
      "description": "Our most popular plan.",
      "price": { "amount": 49900, "currency": "BDT" },
      "price_usd": { "amount": 499, "currency": "USD" },
      "billing_period": "monthly",
      "features": [
        "Full catalogue access",
        "2 devices simultaneously",
        "HD audiobook quality",
        "Unlimited reading lists",
        "Priority hold queue"
      ],
      "simultaneous_devices": 2,
      "max_active_borrows": 5,
      "offline_download": false,
      "trial_days": 7,
      "is_popular": true,
      "stripe_price_id": "price_stripe_standard_bdt"
    },
    {
      "id": "pln_premium",
      "name": "Premium",
      "slug": "premium",
      "description": "For power readers.",
      "price": { "amount": 79900, "currency": "BDT" },
      "price_usd": { "amount": 799, "currency": "USD" },
      "billing_period": "monthly",
      "features": [
        "Full catalogue access",
        "5 devices simultaneously",
        "HD audiobook quality",
        "Unlimited reading lists",
        "Priority hold queue",
        "Offline downloads (Phase 3)"
      ],
      "simultaneous_devices": 5,
      "max_active_borrows": 5,
      "offline_download": false,
      "trial_days": 14,
      "is_popular": false,
      "stripe_price_id": "price_stripe_premium_bdt"
    }
  ]
}
```

**Notes:**
- `offline_download: false` for all plans at Phase 2. Enabled for Premium in Phase 3.
- `max_active_borrows: 5` is platform-wide regardless of plan.
- Prices in BDT are authoritative. USD shown for reference.

---

### POST /subscriptions

Subscribe to a plan.

**Auth required:** Yes (reader or author)
**Preconditions:** No active subscription

**Request:**
```json
{
  "plan_id": "pln_standard",
  "payment_method_id": "pm_stripe_1234AbCd",
  "promo_code": "LAUNCH50"
}
```

**Validation:**
- `plan_id`: Must be a valid active plan
- `payment_method_id`: Stripe PaymentMethod ID, must belong to this customer
- `promo_code`: Optional

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "subscription_id": "sub_cm2x1y3z4",
    "plan_id": "pln_standard",
    "plan_name": "Standard",
    "status": "active",
    "current_period_start": "2026-05-06T00:00:00Z",
    "current_period_end": "2026-06-06T00:00:00Z",
    "trial_end": "2026-05-13T00:00:00Z",
    "cancel_at_period_end": false,
    "discount_applied": {
      "code": "LAUNCH50",
      "discount_percent": 50,
      "valid_for_months": 3
    },
    "stripe_subscription_id": "sub_stripe_xyz"
  }
}
```

**Side effects:**
- Stripe subscription created
- Welcome email sent
- Reader gains catalogue access immediately

**Errors:**
| Code | HTTP | Condition |
|------|------|-----------|
| `ALREADY_SUBSCRIBED` | 409 | Already has active subscription |
| `PAYMENT_FAILED` | 402 | Stripe declined payment |
| `INVALID_PROMO_CODE` | 422 | Code doesn't exist or is expired |
| `PROMO_USAGE_EXCEEDED` | 422 | Code has no remaining uses |

---

### GET /subscriptions/me

Get current subscription details.

**Auth required:** Yes

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "subscription_id": "sub_cm2x1y3z4",
    "plan": {
      "id": "pln_standard",
      "name": "Standard",
      "price": { "amount": 49900, "currency": "BDT" }
    },
    "status": "active",
    "current_period_start": "2026-05-06T00:00:00Z",
    "current_period_end": "2026-06-06T00:00:00Z",
    "trial_end": null,
    "cancel_at_period_end": false,
    "cancelled_at": null,
    "payment_method": {
      "type": "card",
      "brand": "visa",
      "last4": "4242",
      "exp_month": 12,
      "exp_year": 2027
    },
    "active_discount": null
  }
}
```

**Subscription status values:**
| Status | Meaning |
|--------|---------|
| `trialing` | In free trial |
| `active` | Paid and active |
| `past_due` | Payment failed; Stripe retrying |
| `cancelled` | Cancelled; access until period end |
| `expired` | Period ended; no access |
| `paused` | Admin-paused (manual override) |

---

### PATCH /subscriptions/me

Change subscription plan.

**Auth required:** Yes

**Request:**
```json
{ "plan_id": "pln_premium" }
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "subscription_id": "sub_cm2x1y3z4",
    "plan_id": "pln_premium",
    "status": "active",
    "proration_credit": { "amount": 12450, "currency": "BDT" },
    "next_invoice_amount": { "amount": 67450, "currency": "BDT" },
    "effective_immediately": true
  }
}
```

**Notes:**
- Upgrades take effect immediately; prorated credit applied to next invoice via Stripe
- Downgrades take effect at the end of the current billing period (`effective_immediately: false`)

---

### DELETE /subscriptions/me

Cancel subscription.

**Auth required:** Yes

**Request:**
```json
{
  "cancel_immediately": false,
  "reason": "too_expensive"
}
```

`cancel_immediately: false` (default): Sets `cancel_at_period_end: true`. Reader retains access until period end.
`cancel_immediately: true`: Revokes access now. No refund issued automatically.

**Reason values (for analytics):** `too_expensive`, `not_enough_content`, `switching_service`, `temporary_break`, `other`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "status": "cancelled",
    "access_until": "2026-06-06T00:00:00Z",
    "cancel_at_period_end": true
  }
}
```

**Side effects:** Cancellation confirmation email sent.

---

### PUT /subscriptions/me/payment-method

Update the default payment method.

**Auth required:** Yes

**Request:**
```json
{ "payment_method_id": "pm_stripe_newMethod" }
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "payment_method": {
      "type": "card",
      "brand": "mastercard",
      "last4": "5555",
      "exp_month": 8,
      "exp_year": 2028
    }
  }
}
```

---

### GET /subscriptions/me/invoices

Get billing history.

**Auth required:** Yes

**Query:** `page`, `per_page`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "invoice_id": "inv_cm2x1y3z4",
      "stripe_invoice_id": "in_stripe_xyz",
      "amount": { "amount": 49900, "currency": "BDT" },
      "status": "paid",
      "description": "StackRead Standard — May 2026",
      "period_start": "2026-05-06T00:00:00Z",
      "period_end": "2026-06-06T00:00:00Z",
      "paid_at": "2026-05-06T00:00:05Z",
      "pdf_url": "https://api.stackread.com/v1/subscriptions/me/invoices/inv_cm2x1y3z4/pdf"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /subscriptions/me/invoices/:invoice_id/pdf

Download invoice PDF.

**Auth required:** Yes

**Response:** `application/pdf` file stream with `Content-Disposition: attachment; filename="stackread-invoice-MAY2026.pdf"`

---

### POST /subscriptions/me/promo

Apply a promo code to current subscription.

**Auth required:** Yes

**Request:**
```json
{ "code": "SUMMER25" }
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "code": "SUMMER25",
    "discount_type": "percent",
    "discount_value": 25,
    "valid_for_months": 2,
    "applied_at": "2026-05-06T10:00:00Z",
    "expires_at": "2026-07-06T00:00:00Z",
    "next_invoice_amount": { "amount": 37425, "currency": "BDT" }
  }
}
```

---

## Part 5 — Reader Library & Borrowing

**Prefix:** `/me`
**Auth required:** Yes (active subscription for borrowing actions)

---

### POST /me/library

Borrow a title.

**Auth required:** Yes + active subscription

**Request:**
```json
{
  "title_id": "ttl_cm2x1y3z4",
  "format": "epub"
}
```

**Validation:**
- `format`: Must be one of the formats available for this title
- Reader must have fewer than 5 active borrows
- Title must be available (not all slots taken)

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "borrow_id": "brw_cm2x1y3z4",
    "title_id": "ttl_cm2x1y3z4",
    "title_name": "The Lost Hours",
    "format": "epub",
    "borrowed_at": "2026-05-06T10:00:00Z",
    "due_at": "2026-05-20T10:00:00Z",
    "stream_url": "https://api.stackread.com/v1/stream/titles/ttl_cm2x1y3z4/ebook?session=SIGNED_SESSION_TOKEN",
    "drm_license_endpoint": "https://api.stackread.com/v1/drm/licenses"
  }
}
```

**Notes:**
- `due_at` is set by author's `loan_duration_days` config
- `stream_url` is a short-lived (2hr) signed URL. Client must call `GET /stream/titles/:id/ebook` to refresh
- If reader was in hold queue for this title, hold is automatically cancelled

**Errors:**
| Code | HTTP | Condition |
|------|------|-----------|
| `SUBSCRIPTION_REQUIRED` | 403 | No active subscription |
| `BORROW_LIMIT_REACHED` | 409 | Reader already has 5 active borrows |
| `TITLE_UNAVAILABLE` | 409 | All simultaneous slots taken; `details.queue_size` provided |
| `ALREADY_BORROWED` | 409 | Reader already has active borrow for this title |
| `FORMAT_UNAVAILABLE` | 422 | Requested format not available for this title |

---

### GET /me/library

Get all currently borrowed titles.

**Auth required:** Yes

**Query:** `status=active|overdue|returned`, `sort=due_at:asc`, `page`, `per_page`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "borrow_id": "brw_cm2x1y3z4",
      "title": {
        "id": "ttl_cm2x1y3z4",
        "title": "The Lost Hours",
        "author_name": "K. Hossain",
        "cover_url": "https://cdn.stackread.com/covers/ttl_cm2x1y3z4_400.webp",
        "format": "epub"
      },
      "borrowed_at": "2026-05-06T10:00:00Z",
      "due_at": "2026-05-20T10:00:00Z",
      "days_remaining": 14,
      "is_overdue": false,
      "progress_percent": 34,
      "status": "active"
    }
  ],
  "pagination": { ... }
}
```

---

### DELETE /me/library/:borrow_id

Return a title early.

**Auth required:** Yes

**Response `204 No Content`**

**Side effects:**
- Simultaneous access slot freed immediately
- Next person in hold queue notified by email
- Progress is preserved (reader can borrow again and resume)

---

### GET /me/history

Borrowing history (all time).

**Auth required:** Yes

**Query:** cursor-based pagination, `limit=20`

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "borrow_id": "brw_cm9z8y7x6",
      "title": {
        "id": "ttl_cm9z8y7x6",
        "title": "The Dark Shore",
        "cover_url": "https://cdn.stackread.com/covers/ttl_cm9z8y7x6_400.webp"
      },
      "format": "audiobook",
      "borrowed_at": "2026-04-01T00:00:00Z",
      "returned_at": "2026-04-12T00:00:00Z",
      "final_progress_percent": 100,
      "status": "returned"
    }
  ],
  "pagination": { "next_cursor": "brw_cm2a1b2c3", "has_next": true }
}
```

---

### POST /me/holds

Join the hold queue for a title.

**Auth required:** Yes + active subscription

**Request:**
```json
{
  "title_id": "ttl_cm2x1y3z4",
  "format": "epub"
}
```

**Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "hold_id": "hld_cm2x1y3z4",
    "title_id": "ttl_cm2x1y3z4",
    "format": "epub",
    "queue_position": 3,
    "estimated_wait_days": 14,
    "placed_at": "2026-05-06T10:00:00Z",
    "expires_at": "2026-08-06T10:00:00Z"
  }
}
```

**Notes:**
- Hold expires in 90 days if reader hasn't claimed the title
- When title becomes available: reader gets 48-hour window to borrow before hold passes to next in queue
- Standard plan readers: regular queue position. (Phase 4 — Premium plan holders get priority queue position)

**Errors:**
| Code | HTTP | Condition |
|------|------|-----------|
| `TITLE_AVAILABLE` | 422 | Title is currently available — just borrow it |
| `ALREADY_ON_HOLD` | 409 | Reader already in queue for this title |
| `ALREADY_BORROWED` | 409 | Reader already has active borrow |

---

### GET /me/holds

Get all active holds.

**Auth required:** Yes

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "hold_id": "hld_cm2x1y3z4",
      "title": {
        "id": "ttl_cm2x1y3z4",
        "title": "The Lost Hours",
        "cover_url": "https://cdn.stackread.com/covers/ttl_cm2x1y3z4_400.webp"
      },
      "format": "epub",
      "queue_position": 2,
      "estimated_wait_days": 7,
      "status": "waiting",
      "placed_at": "2026-05-06T10:00:00Z",
      "expires_at": "2026-08-06T10:00:00Z"
    }
  ]
}
```

**Hold status values:** `waiting`, `ready` (title available, 48hr window), `expired`, `cancelled`

---

### DELETE /me/holds/:hold_id

Cancel a hold.

**Auth required:** Yes

**Response `204 No Content`**

---

## Part 6 — Reading Experience

**Prefix:** `/me`
**Auth required:** Yes (active borrow required for progress/annotation endpoints)

---

### GET /me/progress/:title_id

Get saved reading position for a title.

**Auth required:** Yes

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "title_id": "ttl_cm2x1y3z4",
    "borrow_id": "brw_cm2x1y3z4",
    "format": "epub",
    "cfi_position": "epubcfi(/6/4[chap01ref]!/4/2/2/2:0)",
    "percent_complete": 34,
    "chapter_number": 7,
    "chapter_title": "The Missing Key",
    "last_read_at": "2026-05-05T21:30:00Z",
    "last_device_id": "dev_chrome_win",
    "audiobook_position_seconds": null,
    "audiobook_chapter_number": null
  }
}
```

**Notes:** Returns `null` in `data` if no progress saved yet (first open).

---

### PUT /me/progress/:title_id

Save reading position. Called by the reader client every 30 seconds while reading, and on close.

**Auth required:** Yes + active borrow

**Request (eBook):**
```json
{
  "borrow_id": "brw_cm2x1y3z4",
  "format": "epub",
  "cfi_position": "epubcfi(/6/4[chap01ref]!/4/2/2/2:0)",
  "percent_complete": 34,
  "chapter_number": 7,
  "chapter_title": "The Missing Key",
  "device_id": "dev_chrome_win"
}
```

**Request (Audiobook):**
```json
{
  "borrow_id": "brw_cm2x1y3z4",
  "format": "audiobook",
  "audiobook_position_seconds": 7240,
  "audiobook_chapter_number": 5,
  "percent_complete": 25,
  "device_id": "dev_iphone"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "saved": true,
    "percent_complete": 34,
    "royalty_event_recorded": true
  }
}
```

**Notes:**
- `royalty_event_recorded: true` means a page-read or minute-read event was logged for the royalty engine
- Server computes delta between last saved position and new position to prevent duplicate events
- `device_id`: client-generated stable ID (localStorage UUID). Used for conflict resolution in Phase 3 real-time sync.

---

### GET /me/reader-preferences

Get per-user reading UI preferences.

**Auth required:** Yes

**Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "font_family": "Georgia",
    "font_size": 18,
    "line_spacing": 1.5,
    "margins": "medium",
    "theme": "light",
    "text_align": "justify",
    "text_to_speech_enabled": false,
    "dictionary_enabled": true,
    "autoplay_next_chapter": true,
    "audiobook_speed": 1.0,
    "sleep_timer_minutes": null
  }
}
```

**Allowed values:**
- `font_family`: `"Georgia"`, `"Arial"`, `"Merriweather"`, `"OpenDyslexic"`
- `font_size`: integer, 12–28
- `line_spacing`: `1.0`, `1.25`, `1.5`, `1.75`, `2.0`
- `margins`: `"narrow"`, `"medium"`, `"wide"`
- `theme`: `"light"`, `"dark"`, `"sepia"`
- `text_align`: `"left"`, `"justify"`
- `audiobook_speed`: `0.5`, `0.75`, `1.0`, `1.25`, `1.5`, `1.75`, `2.0`
- `sleep_timer_minutes`: `null`, `15`, `30`, `45`, `60`

---

### PUT /me/reader-preferences

Save reading preferences.

**Auth required:** Yes

**Request:** Any subset of the fields above.

**Response `200 OK`:** Full preferences object.

---

### GET /me/annotations/:title_id

Get all annotations (highlights + notes) for a title.

**Auth required:** Yes

**Query:** `chapter_number` (optional filter)

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "annotation_id": "ann_cm2x1y3z4",
      "type": "highlight",
      "cfi_range": "epubcfi(/6/4[chap01ref]!/4/2/2,/1:0,/1:24)",
      "highlighted_text": "The darkness fell like a curtain",
      "note": "Great imagery — use in essay",
      "color": "yellow",
      "chapter_number": 7,
      "chapter_title": "The Missing Key",
      "created_at": "2026-05-05T22:00:00Z",
      "updated_at": "2026-05-05T22:05:00Z"
    },
    {
      "annotation_id": "ann_cm2a1b2c3",
      "type": "note",
      "cfi_range": "epubcfi(/6/6[chap03ref]!/4/4/2,/1:0,/1:0)",
      "highlighted_text": null,
      "note": "Chapter 3 — story turns here",
      "color": null,
      "chapter_number": 9,
      "chapter_title": "The Turn",
      "created_at": "2026-05-06T08:00:00Z",
      "updated_at": "2026-05-06T08:00:00Z"
    }
  ]
}
```

**Annotation types:** `highlight` (text selected + optional note), `note` (point note at position, no text selection)
**Color options:** `"yellow"`, `"green"`, `"blue"`, `"pink"`, `null`

---

### POST /me/annotations/:title_id

Create a new annotation.

**Auth required:** Yes + active borrow

**Request:**
```json
{
  "type": "highlight",
  "cfi_range": "epubcfi(/6/4[chap01ref]!/4/2/2,/1:0,/1:24)",
  "highlighted_text": "The darkness fell like a curtain",
  "note": "Great imagery",
  "color": "yellow",
  "chapter_number": 7,
  "chapter_title": "The Missing Key"
}
```

**Response `201 Created`:** Full annotation object.

---

### PATCH /me/annotations/:title_id/:annotation_id

Update annotation note or color.

**Auth required:** Yes

**Request:**
```json
{
  "note": "Updated note text",
  "color": "green"
}
```

**Response `200 OK`:** Full annotation object.

---

### DELETE /me/annotations/:title_id/:annotation_id

Delete an annotation.

**Auth required:** Yes

**Response `204 No Content`**

---

### GET /me/bookmarks/:title_id

Get all bookmarks for a title.

**Auth required:** Yes

**Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "bookmark_id": "bmk_cm2x1y3z4",
      "cfi_position": "epubcfi(/6/8[chap05ref]!/4/6/2:0)",
      "chapter_number": 12,
      "chapter_title": "The Confession",
      "label": "Left off here",
      "created_at": "2026-05-06T09:00:00Z"
    }
  ]
}
```

---

### POST /me/bookmarks/:title_id

Add a bookmark.

**Auth required:** Yes + active borrow

**Request:**
```json
{
  "cfi_position": "epubcfi(/6/8[chap05ref]!/4/6/2:0)",
  "chapter_number": 12,
  "chapter_title": "The Confession",
  "label": "Important scene"
}
```

**Response `201 Created`:** Full bookmark object.

---

### DELETE /me/bookmarks/:title_id/:bookmark_id

Delete a bookmark.

**Auth required:** Yes

**Response `204 No Content`**
