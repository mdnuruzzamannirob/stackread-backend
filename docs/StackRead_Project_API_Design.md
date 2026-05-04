**Digital Library &**

**Self-Publishing Portal**

Complete API Design

~360 REST Endpoints · 4 Roles · JWT Auth · RFC 7807 Errors

# **1\. Conventions & Standards**

| **Concern**   | **Decision**                                          |
| ------------- | ----------------------------------------------------- |
| Base URL      | <https://api.yourdomain.com/v1>                       |
| ---           | ---                                                   |
| Protocol      | HTTPS only                                            |
| ---           | ---                                                   |
| Format        | JSON (Content-Type: application/json)                 |
| ---           | ---                                                   |
| Auth          | Bearer JWT - access + refresh token pair              |
| ---           | ---                                                   |
| Pagination    | Cursor-based (?cursor=&lt;token&gt;&limit=20)         |
| ---           | ---                                                   |
| Dates         | ISO 8601 - 2025-07-01T10:00:00Z                       |
| ---           | ---                                                   |
| IDs           | UUIDs v4                                              |
| ---           | ---                                                   |
| Errors        | RFC 7807 Problem Details                              |
| ---           | ---                                                   |
| Rate Limiting | Per-role, per-endpoint (X-RateLimit-\* headers)       |
| ---           | ---                                                   |
| Versioning    | URI path versioning (/v1/, /v2/)                      |
| ---           | ---                                                   |
| File Upload   | Multipart form-data or signed S3 pre-signed URL       |
| ---           | ---                                                   |
| Soft Delete   | deleted_at timestamp; hard delete on explicit request |
| ---           | ---                                                   |

# **2\. Authentication & Authorisation**

## **2.1 Role Hierarchy**

GUEST → READER → AUTHOR / PUBLISHER → ADMIN / STAFF

Roles are encoded in the JWT payload:

{

"sub": "uuid",

"role": "reader",

"plan": "premium",

"org_id": null,

"exp": 1720000000

}

## **2.2 Auth Endpoints**

| **Method & Path**                  | **Description**                 |
| ---------------------------------- | ------------------------------- |
| POST                               | /auth/register                  |
| ---                                | ---                             |
| POST                               | /auth/login                     |
| ---                                | ---                             |
| POST                               | /auth/logout                    |
| ---                                | ---                             |
| POST                               | /auth/refresh                   |
| ---                                | ---                             |
| POST                               | /auth/password/forgot           |
| ---                                | ---                             |
| POST                               | /auth/password/reset            |
| ---                                | ---                             |
| POST                               | /auth/password/change           |
| ---                                | ---                             |
| POST                               | /auth/email/verify              |
| ---                                | ---                             |
| POST                               | /auth/email/resend-verification |
| ---                                | ---                             |
| POST                               | /auth/2fa/enable                |
| ---                                | ---                             |
| POST                               | /auth/2fa/disable               |
| ---                                | ---                             |
| POST                               | /auth/2fa/verify                |
| ---                                | ---                             |
| GET                                | /auth/sso/providers             |
| ---                                | ---                             |
| GET                                | /auth/sso/{provider}/redirect   |
| ---                                | ---                             |
| GET                                | /auth/sso/{provider}/callback   |
| ---                                | ---                             |
| POST                               | /auth/social/{provider}         |
| ---                                | ---                             |
| GET                                | /auth/sessions                  |
| ---                                | ---                             |
| DELETE /auth/sessions/{session_id} | Revoke a session                |
| ---                                | ---                             |
| DELETE /auth/sessions              | Revoke all sessions             |
| ---                                | ---                             |

### **POST /auth/register - Request / Response**

// Request

{

"email": "<user@example.com>",

"password": "Str0ng!Pass",

"full_name": "Ayesha Rahman",

"role": "reader", // "reader" | "author" | "publisher"

"referral_code": "REF123"

}

// Response 201

{

"user_id": "uuid",

"email": "<user@example.com>",

"role": "reader",

"email_verified": false,

"access_token": "eyJ...",

"refresh_token": "eyJ...",

"expires_in": 3600

}

### **POST /auth/login - Request / Response**

// Request

{

"email": "<user@example.com>",

"password": "Str0ng!Pass",

"device_name": "Chrome / Windows"

}

// Response 200

{

"access_token": "eyJ...",

"refresh_token": "eyJ...",

"expires_in": 3600,

"user": { "id": "uuid", "role": "reader", "plan": "standard" }

}

# **3\. Error Format (RFC 7807)**

{

"type": "<https://api.yourdomain.com/errors/validation>",

"title": "Validation Failed",

"status": 422,

"detail": "The 'email' field must be a valid email address.",

"instance": "/v1/auth/register",

"errors": \[

{ "field": "email", "code": "invalid_format", "message": "Not a valid email." }

\]

}

## **Standard HTTP Status Codes**

| **Code** | **Meaning**                    |
| -------- | ------------------------------ |
| 200      | OK                             |
| ---      | ---                            |
| 201      | Created                        |
| ---      | ---                            |
| 202      | Accepted (async job queued)    |
| ---      | ---                            |
| 204      | No Content (successful delete) |
| ---      | ---                            |
| 400      | Bad Request                    |
| ---      | ---                            |
| 401      | Unauthenticated                |
| ---      | ---                            |
| 403      | Forbidden                      |
| ---      | ---                            |
| 404      | Not Found                      |
| ---      | ---                            |
| 409      | Conflict                       |
| ---      | ---                            |
| 422      | Unprocessable Entity           |
| ---      | ---                            |
| 429      | Too Many Requests              |
| ---      | ---                            |
| 500      | Internal Server Error          |
| ---      | ---                            |

# **4\. Public / Guest Endpoints \[No Auth Required\]**

## **4.1 Catalogue & Discovery**

| **Method & Path** | **Description**                   |
| ----------------- | --------------------------------- |
| GET               | /catalogue                        |
| ---               | ---                               |
| GET               | /catalogue/featured               |
| ---               | ---                               |
| GET               | /catalogue/trending               |
| ---               | ---                               |
| GET               | /catalogue/new-releases           |
| ---               | ---                               |
| GET               | /catalogue/staff-picks            |
| ---               | ---                               |
| GET               | /catalogue/curated-shelves        |
| ---               | ---                               |
| GET               | /catalogue/curated-shelves/{slug} |
| ---               | ---                               |
| GET               | /titles/{title_id}                |
| ---               | ---                               |
| GET               | /titles/{title_id}/related        |
| ---               | ---                               |
| GET               | /titles/{title_id}/series         |
| ---               | ---                               |
| GET               | /titles/{title_id}/preview        |
| ---               | ---                               |
| GET               | /titles/{title_id}/audio-preview  |
| ---               | ---                               |
| GET               | /titles/{title_id}/toc            |
| ---               | ---                               |
| GET               | /titles/{title_id}/reviews        |
| ---               | ---                               |

### **GET /catalogue - Query Parameters**

| **Parameter**         | **Type** | **Description**                             |
| --------------------- | -------- | ------------------------------------------- |
| genre                 | string   | fantasy, sci-fi, non-fiction…               |
| ---                   | ---      | ---                                         |
| format                | string   | ebook \| audiobook \| pdf                   |
| ---                   | ---      | ---                                         |
| language              | string   | en \| bn \| hi…                             |
| ---                   | ---      | ---                                         |
| rating_min            | number   | 1-5                                         |
| ---                   | ---      | ---                                         |
| publication_year_from | int      | Start year filter                           |
| ---                   | ---      | ---                                         |
| publication_year_to   | int      | End year filter                             |
| ---                   | ---      | ---                                         |
| availability          | string   | subscription \| purchase \| all             |
| ---                   | ---      | ---                                         |
| sort                  | string   | relevance \| newest \| rating \| popularity |
| ---                   | ---      | ---                                         |
| cursor                | string   | Pagination cursor                           |
| ---                   | ---      | ---                                         |
| limit                 | int      | Default 20, max 100                         |
| ---                   | ---      | ---                                         |

### **GET /catalogue - Response**

{

"data": \[

{

"id": "uuid",

"title": "The Bengal Chronicles",

"cover_url": "<https://cdn.../covers/uuid.jpg>",

"authors": \[{ "id": "uuid", "name": "Karim Ahmed" }\],

"genres": \["historical-fiction"\],

"formats": \["ebook", "audiobook"\],

"language": "en",

"publication_year": 2024,

"average_rating": 4.3,

"review_count": 287,

"access_model": "subscription"

}

\],

"pagination": {

"next_cursor": "eyJpZCI6...",

"has_more": true,

"total": 4200

}

}

## **4.2 Search**

| **Method & Path** | **Description**     |
| ----------------- | ------------------- |
| GET               | /search             |
| ---               | ---                 |
| GET               | /search/suggestions |
| ---               | ---                 |

## **4.3 Authors**

| **Method & Path** | **Description**             |
| ----------------- | --------------------------- |
| GET               | /authors/{author_id}        |
| ---               | ---                         |
| GET               | /authors/{author_id}/titles |
| ---               | ---                         |
| GET               | /authors/{author_id}/events |
| ---               | ---                         |

## **4.4 Subscription Plans**

| **Method & Path** | **Description**  |
| ----------------- | ---------------- |
| GET               | /plans           |
| ---               | ---              |
| GET               | /plans/{plan_id} |
| ---               | ---              |

### **GET /plans - Response**

{

"data": \[

{

"id": "basic",

"name": "Basic",

"price_monthly": 4.99,

"price_annual": 2990,

"currency": "USD",

"features": \["ebook_access", "limited_downloads"\],

"download_limit_per_month": 5,

"simultaneous_devices": 2,

"offline_reading": false

}

\]

}

## **4.5 Events**

| **Method & Path** | **Description**    |
| ----------------- | ------------------ |
| GET               | /events            |
| ---               | ---                |
| GET               | /events/{event_id} |
| ---               | ---                |
| GET               | /events/calendar   |
| ---               | ---                |

## **4.6 Community (Read-only)**

| **Method & Path** | **Description**          |
| ----------------- | ------------------------ |
| GET               | /reading-lists/public    |
| ---               | ---                      |
| GET               | /reading-lists/{list_id} |
| ---               | ---                      |

## **4.7 Help & Legal**

| **Method & Path** | **Description**       |
| ----------------- | --------------------- |
| GET               | /help/articles        |
| ---               | ---                   |
| GET               | /help/articles/{slug} |
| ---               | ---                   |
| GET               | /help/faqs            |
| ---               | ---                   |
| GET               | /legal/terms          |
| ---               | ---                   |
| GET               | /legal/privacy        |
| ---               | ---                   |
| GET               | /legal/refund         |
| ---               | ---                   |
| GET               | /legal/cookies        |
| ---               | ---                   |
| POST              | /support/contact      |
| ---               | ---                   |
| GET               | /about                |
| ---               | ---                   |

# **5\. Reader Endpoints \[Role: reader\]**

## **5.1 Account & Profile**

| **Method & Path**              | **Description**            |
| ------------------------------ | -------------------------- |
| GET                            | /me                        |
| ---                            | ---                        |
| PATCH                          | /me                        |
| ---                            | ---                        |
| DELETE /me                     | Account deletion request   |
| ---                            | ---                        |
| PUT                            | /me/avatar                 |
| ---                            | ---                        |
| DELETE /me/avatar              | Remove avatar              |
| ---                            | ---                        |
| GET                            | /me/preferences            |
| ---                            | ---                        |
| PUT                            | /me/preferences            |
| ---                            | ---                        |
| GET                            | /me/privacy                |
| ---                            | ---                        |
| PUT                            | /me/privacy                |
| ---                            | ---                        |
| GET                            | /me/notifications/settings |
| ---                            | ---                        |
| PUT                            | /me/notifications/settings |
| ---                            | ---                        |
| GET                            | /me/devices                |
| ---                            | ---                        |
| DELETE /me/devices/{device_id} | Remove a device            |
| ---                            | ---                        |

### **PATCH /me - Request Body**

{

"full_name": "Ayesha Rahman",

"bio": "Avid reader of Bengali literature.",

"favourite_genres": \["literary-fiction", "history"\],

"reading_language": "en"

}

## **5.2 Subscription & Billing**

| **Method & Path**                      | **Description**                  |
| -------------------------------------- | -------------------------------- |
| GET                                    | /me/subscription                 |
| ---                                    | ---                              |
| POST                                   | /me/subscription                 |
| ---                                    | ---                              |
| PATCH                                  | /me/subscription                 |
| ---                                    | ---                              |
| DELETE /me/subscription                | Cancel subscription              |
| ---                                    | ---                              |
| POST                                   | /me/subscription/reactivate      |
| ---                                    | ---                              |
| POST                                   | /me/subscription/promo           |
| ---                                    | ---                              |
| GET                                    | /me/subscription/invoices        |
| ---                                    | ---                              |
| GET                                    | /me/subscription/invoices/{id}   |
| ---                                    | ---                              |
| GET                                    | /me/billing/methods              |
| ---                                    | ---                              |
| POST                                   | /me/billing/methods              |
| ---                                    | ---                              |
| DELETE /me/billing/methods/{method_id} | Remove payment method            |
| ---                                    | ---                              |
| PUT                                    | /me/billing/methods/{id}/default |
| ---                                    | ---                              |

### **POST /me/subscription - Request Body**

{

"plan_id": "standard",

"billing_cycle": "monthly", // "monthly" | "annual"

"payment_method_id": "pm_uuid",

"promo_code": "LAUNCH50" // optional

}

## **5.3 Discovery & Search (Authenticated)**

| **Method & Path**         | **Description**                 |
| ------------------------- | ------------------------------- |
| GET                       | /search                         |
| ---                       | ---                             |
| GET                       | /search/saved                   |
| ---                       | ---                             |
| POST                      | /search/saved                   |
| ---                       | ---                             |
| DELETE /search/saved/{id} | Delete a saved search           |
| ---                       | ---                             |
| GET                       | /recommendations                |
| ---                       | ---                             |
| GET                       | /recommendations/mood           |
| ---                       | ---                             |
| GET                       | /recommendations/theme          |
| ---                       | ---                             |
| GET                       | /recommendations/reading-time   |
| ---                       | ---                             |
| GET                       | /titles/{title_id}/also-enjoyed |
| ---                       | ---                             |

## **5.4 Access & Borrowing**

| **Method & Path**               | **Description**                 |
| ------------------------------- | ------------------------------- |
| POST                            | /borrows                        |
| ---                             | ---                             |
| GET                             | /borrows                        |
| ---                             | ---                             |
| GET                             | /borrows/{borrow_id}            |
| ---                             | ---                             |
| POST                            | /borrows/{borrow_id}/renew      |
| ---                             | ---                             |
| DELETE /borrows/{borrow_id}     | Return a title early            |
| ---                             | ---                             |
| POST                            | /purchases                      |
| ---                             | ---                             |
| GET                             | /purchases                      |
| ---                             | ---                             |
| GET                             | /purchases/{purchase_id}        |
| ---                             | ---                             |
| POST                            | /holds                          |
| ---                             | ---                             |
| GET                             | /holds                          |
| ---                             | ---                             |
| DELETE /holds/{hold_id}         | Cancel a hold                   |
| ---                             | ---                             |
| GET                             | /titles/{title_id}/availability |
| ---                             | ---                             |
| POST                            | /downloads                      |
| ---                             | ---                             |
| GET                             | /downloads                      |
| ---                             | ---                             |
| DELETE /downloads/{download_id} | Remove offline download         |
| ---                             | ---                             |

### **POST /borrows - Request / Response**

// Request: { "title_id": "uuid", "format": "ebook" }

// Response 201

{

"id": "uuid",

"title_id": "uuid",

"format": "ebook",

"borrowed_at": "2025-07-01T10:00:00Z",

"due_at": "2025-07-15T10:00:00Z",

"read_url": "<https://reader.yourdomain.com/read/uuid?token=eyJ>..."

}

## **5.5 Reading Experience**

| **Method & Path**                          | **Description**                     |
| ------------------------------------------ | ----------------------------------- |
| GET                                        | /reader/{title_id}/session          |
| ---                                        | ---                                 |
| POST                                       | /reader/{title_id}/progress         |
| ---                                        | ---                                 |
| GET                                        | /reader/{title_id}/progress         |
| ---                                        | ---                                 |
| POST                                       | /reader/{title_id}/highlights       |
| ---                                        | ---                                 |
| GET                                        | /reader/{title_id}/highlights       |
| ---                                        | ---                                 |
| PATCH                                      | /reader/{title_id}/highlights/{id}  |
| ---                                        | ---                                 |
| DELETE /reader/{title_id}/highlights/{id}  | Delete a highlight                  |
| ---                                        | ---                                 |
| POST                                       | /reader/{title_id}/annotations      |
| ---                                        | ---                                 |
| GET                                        | /reader/{title_id}/annotations      |
| ---                                        | ---                                 |
| PATCH                                      | /reader/{title_id}/annotations/{id} |
| ---                                        | ---                                 |
| DELETE /reader/{title_id}/annotations/{id} | Delete an annotation                |
| ---                                        | ---                                 |
| GET                                        | /reader/{title_id}/dictionary       |
| ---                                        | ---                                 |
| GET                                        | /reader/{title_id}/translate        |
| ---                                        | ---                                 |
| GET                                        | /reader/settings                    |
| ---                                        | ---                                 |
| PUT                                        | /reader/settings                    |
| ---                                        | ---                                 |

### **POST /reader/{title_id}/progress - Request**

{

"format": "ebook",

"cfi": "epubcfi(/6/4\[chap01ref\]!/4\[body01\]/10\[para05\]/2/1:3)",

"chapter": 12,

"percentage": 43.5,

"device_id": "uuid",

"timestamp": "2025-07-01T14:22:00Z"

}

### **PUT /reader/settings - Request**

{

"font_family": "OpenDyslexic",

"font_size": 18,

"line_spacing": 1.6,

"margin": "wide",

"theme": "dark",

"text_to_speech_enabled": true,

"audio_playback_speed": 1.25,

"sleep_timer_minutes": 30

}

## **5.6 Reading Lists & Organisation**

| **Method & Path**                       | **Description**            |
| --------------------------------------- | -------------------------- |
| GET                                     | /me/lists                  |
| ---                                     | ---                        |
| POST                                    | /me/lists                  |
| ---                                     | ---                        |
| GET                                     | /me/lists/{list_id}        |
| ---                                     | ---                        |
| PATCH                                   | /me/lists/{list_id}        |
| ---                                     | ---                        |
| DELETE /me/lists/{list_id}              | Delete a list              |
| ---                                     | ---                        |
| POST                                    | /me/lists/{list_id}/titles |
| ---                                     | ---                        |
| DELETE /me/lists/{list_id}/titles/{id}  | Remove a title from a list |
| ---                                     | ---                        |
| GET                                     | /me/lists/{list_id}/export |
| ---                                     | ---                        |
| POST                                    | /me/tags                   |
| ---                                     | ---                        |
| GET                                     | /me/tags                   |
| ---                                     | ---                        |
| GET                                     | /me/tags/{tag}/titles      |
| ---                                     | ---                        |
| DELETE /me/tags/{tag}/titles/{title_id} | Remove tag from a title    |
| ---                                     | ---                        |

## **5.7 Reading Goals & Gamification**

| **Method & Path** | **Description**      |
| ----------------- | -------------------- |
| GET               | /me/goals            |
| ---               | ---                  |
| PUT               | /me/goals            |
| ---               | ---                  |
| GET               | /me/stats            |
| ---               | ---                  |
| GET               | /me/stats/wrapped    |
| ---               | ---                  |
| GET               | /me/badges           |
| ---               | ---                  |
| GET               | /me/badges/available |
| ---               | ---                  |

### **GET /me/stats/wrapped - Response**

{

"year": 2025,

"books_completed": 34,

"pages_read": 9820,

"hours_listened": 112,

"top_genre": "historical-fiction",

"top_author": { "id": "uuid", "name": "Karim Ahmed" },

"longest_streak_days": 28,

"current_streak_days": 7,

"badges_earned": 12

}

## **5.8 Community & Social**

| **Method & Path**                         | **Description**                                       |
| ----------------------------------------- | ----------------------------------------------------- |
| POST                                      | /reviews                                              |
| ---                                       | ---                                                   |
| PATCH                                     | /reviews/{review_id}                                  |
| ---                                       | ---                                                   |
| DELETE /reviews/{review_id}               | Delete my review                                      |
| ---                                       | ---                                                   |
| POST                                      | /reviews/{review_id}/likes                            |
| ---                                       | ---                                                   |
| DELETE /reviews/{review_id}/likes         | Unlike a review                                       |
| ---                                       | ---                                                   |
| POST                                      | /reviews/{review_id}/comments                         |
| ---                                       | ---                                                   |
| DELETE /reviews/{review_id}/comments/{id} | Delete a comment                                      |
| ---                                       | ---                                                   |
| POST                                      | /follows/readers/{reader_id}                          |
| ---                                       | ---                                                   |
| DELETE /follows/readers/{reader_id}       | Unfollow a reader                                     |
| ---                                       | ---                                                   |
| POST                                      | /follows/authors/{author_id}                          |
| ---                                       | ---                                                   |
| DELETE /follows/authors/{author_id}       | Unfollow an author                                    |
| ---                                       | ---                                                   |
| GET                                       | /me/following                                         |
| ---                                       | ---                                                   |
| GET                                       | /me/followers                                         |
| ---                                       | ---                                                   |
| GET                                       | /me/feed                                              |
| ---                                       | ---                                                   |
| POST                                      | /book-clubs                                           |
| ---                                       | ---                                                   |
| GET                                       | /book-clubs                                           |
| ---                                       | ---                                                   |
| GET                                       | /book-clubs/{club_id}                                 |
| ---                                       | ---                                                   |
| PATCH                                     | /book-clubs/{club_id}                                 |
| ---                                       | ---                                                   |
| DELETE /book-clubs/{club_id}              | Delete club (owner only)                              |
| ---                                       | ---                                                   |
| POST                                      | /book-clubs/{club_id}/members                         |
| ---                                       | ---                                                   |
| DELETE /book-clubs/{club_id}/members/me   | Leave a club                                          |
| ---                                       | ---                                                   |
| GET                                       | /book-clubs/{club_id}/discussions                     |
| ---                                       | ---                                                   |
| POST                                      | /book-clubs/{club_id}/discussions                     |
| ---                                       | ---                                                   |
| POST                                      | /book-clubs/{club_id}/discussions/{thread_id}/replies |
| ---                                       | ---                                                   |
| GET                                       | /book-clubs/{club_id}/shared-annotations              |
| ---                                       | ---                                                   |
| POST                                      | /me/share/title/{title_id}                            |
| ---                                       | ---                                                   |

## **5.9 Research Tools**

| **Method & Path**         | **Description**            |
| ------------------------- | -------------------------- |
| POST                      | /citations                 |
| ---                       | ---                        |
| GET                       | /me/citations              |
| ---                       | ---                        |
| DELETE /me/citations/{id} | Delete a citation          |
| ---                       | ---                        |
| GET                       | /me/citations/export       |
| ---                       | ---                        |
| POST                      | /me/citations/bibliography |
| ---                       | ---                        |

### **POST /citations - Request / Response**

// Request

{

"title_id": "uuid",

"style": "APA", // "APA" | "MLA" | "Chicago" | "Harvard"

"page_range": "45-52"

}

// Response 200

{

"id": "uuid",

"formatted": "Ahmed, K. (2024). The Bengal Chronicles. Dhaka Press.",

"style": "APA",

"saved": true

}

## **5.10 Events & Notifications**

| **Method & Path**              | **Description**            |
| ------------------------------ | -------------------------- |
| POST                           | /events/{event_id}/rsvp    |
| ---                            | ---                        |
| DELETE /events/{event_id}/rsvp | Cancel RSVP                |
| ---                            | ---                        |
| GET                            | /me/events                 |
| ---                            | ---                        |
| GET                            | /me/notifications          |
| ---                            | ---                        |
| PATCH                          | /me/notifications/{id}     |
| ---                            | ---                        |
| POST                           | /me/notifications/read-all |
| ---                            | ---                        |
| DELETE /me/notifications/{id}  | Delete a notification      |
| ---                            | ---                        |

# **6\. Author / Publisher Endpoints \[Role: author | publisher\]**

## **6.1 Author Profile**

| **Method & Path** | **Description**                  |
| ----------------- | -------------------------------- |
| GET               | /me/author-profile               |
| ---               | ---                              |
| PUT               | /me/author-profile               |
| ---               | ---                              |
| PATCH             | /me/author-profile               |
| ---               | ---                              |
| PUT               | /me/author-profile/photo         |
| ---               | ---                              |
| GET               | /me/author-profile/badge-status  |
| ---               | ---                              |
| POST              | /me/author-profile/badge-request |
| ---               | ---                              |
| GET               | /me/followers                    |
| ---               | ---                              |
| GET               | /me/follower-count               |
| ---               | ---                              |

### **PUT /me/author-profile - Request**

{

"display_name": "Karim Ahmed",

"bio": "Author of historical fiction based in Dhaka.",

"website": "<https://karimahmed.com>",

"social_links": {

"twitter": "<https://twitter.com/karimahmed>",

"instagram": "<https://instagram.com/karimahmed>"

},

"genre_tags": \["historical-fiction", "literary"\]

}

## **6.2 Publisher Account**

| **Method & Path**                      | **Description**                 |
| -------------------------------------- | ------------------------------- |
| GET                                    | /me/publisher                   |
| ---                                    | ---                             |
| PUT                                    | /me/publisher                   |
| ---                                    | ---                             |
| PUT                                    | /me/publisher/logo              |
| ---                                    | ---                             |
| GET                                    | /me/publisher/members           |
| ---                                    | ---                             |
| POST                                   | /me/publisher/members           |
| ---                                    | ---                             |
| PATCH                                  | /me/publisher/members/{user_id} |
| ---                                    | ---                             |
| DELETE /me/publisher/members/{user_id} | Remove team member              |
| ---                                    | ---                             |

Publisher roles: owner | admin | editor | finance | uploader

## **6.3 Content Upload & Management**

| **Method & Path**                         | **Description**                          |
| ----------------------------------------- | ---------------------------------------- |
| GET                                       | /titles/mine                             |
| ---                                       | ---                                      |
| POST                                      | /titles                                  |
| ---                                       | ---                                      |
| GET                                       | /titles/{title_id}                       |
| ---                                       | ---                                      |
| PATCH                                     | /titles/{title_id}                       |
| ---                                       | ---                                      |
| DELETE /titles/{title_id}                 | Delete or unpublish title                |
| ---                                       | ---                                      |
| POST                                      | /titles/{title_id}/submit                |
| ---                                       | ---                                      |
| POST                                      | /titles/{title_id}/unpublish             |
| ---                                       | ---                                      |
| POST                                      | /titles/{title_id}/republish             |
| ---                                       | ---                                      |
| POST                                      | /titles/bulk                             |
| ---                                       | ---                                      |
| PUT                                       | /titles/{title_id}/cover                 |
| ---                                       | ---                                      |
| POST                                      | /titles/{title_id}/cover/crop            |
| ---                                       | ---                                      |
| POST                                      | /titles/{title_id}/files                 |
| ---                                       | ---                                      |
| GET                                       | /titles/{title_id}/files                 |
| ---                                       | ---                                      |
| DELETE /titles/{title_id}/files/{file_id} | Remove a file version                    |
| ---                                       | ---                                      |
| GET                                       | /titles/{title_id}/versions              |
| ---                                       | ---                                      |
| POST                                      | /titles/{title_id}/versions/{id}/restore |
| ---                                       | ---                                      |
| GET                                       | /isbn-lookup/{isbn}                      |
| ---                                       | ---                                      |

### **POST /titles - Create Draft Request**

{

"title": "The Bengal Chronicles",

"subtitle": "A Novel",

"series_id": "uuid",

"series_order": 1,

"language": "en",

"genres": \["historical-fiction"\],

"tags": \["bengal", "partition"\],

"synopsis": "...",

"isbn": "978-3-16-148410-0",

"publication_date": "2025-09-01",

"page_count": 412,

"formats": \["ebook", "audiobook"\],

"access_model": "subscription",

"status": "draft"

}

## **6.4 Series & Bundles**

| **Method & Path**                         | **Description**                    |
| ----------------------------------------- | ---------------------------------- |
| GET                                       | /me/series                         |
| ---                                       | ---                                |
| POST                                      | /me/series                         |
| ---                                       | ---                                |
| GET                                       | /me/series/{series_id}             |
| ---                                       | ---                                |
| PATCH                                     | /me/series/{series_id}             |
| ---                                       | ---                                |
| DELETE /me/series/{series_id}             | Delete series                      |
| ---                                       | ---                                |
| POST                                      | /me/series/{series_id}/titles      |
| ---                                       | ---                                |
| PATCH                                     | /me/series/{series_id}/titles/{id} |
| ---                                       | ---                                |
| DELETE /me/series/{series_id}/titles/{id} | Remove from series                 |
| ---                                       | ---                                |
| GET                                       | /me/bundles                        |
| ---                                       | ---                                |
| POST                                      | /me/bundles                        |
| ---                                       | ---                                |
| PATCH                                     | /me/bundles/{bundle_id}            |
| ---                                       | ---                                |
| DELETE /me/bundles/{bundle_id}            | Delete bundle                      |
| ---                                       | ---                                |

## **6.5 Rights & Licensing**

| **Method & Path** | **Description**           |
| ----------------- | ------------------------- |
| GET               | /titles/{title_id}/rights |
| ---               | ---                       |
| PUT               | /titles/{title_id}/rights |
| ---               | ---                       |

### **PUT /titles/{id}/rights - Request**

{

"access_model": "both",

"purchase_price": 9.99,

"currency": "USD",

"simultaneous_copies": 5,

"loan_duration_days": 14,

"geo_availability": {

"mode": "allowlist",

"countries": \["BD", "IN", "GB"\]

},

"drm_enabled": true,

"licence_model": "one-copy-one-user",

"expiry": {

"mode": "loan_count",

"loan_count": 14.99

},

"free_access_window": {

"enabled": true,

"start": "2025-09-01T00:00:00Z",

"end": "2025-09-07T23:59:59Z"

}

}

## **6.6 Analytics**

| **Method & Path**                          | **Description**                   |
| ------------------------------------------ | --------------------------------- |
| GET                                        | /me/analytics/overview            |
| ---                                        | ---                               |
| GET                                        | /me/analytics/titles/{title_id}   |
| ---                                        | ---                               |
| GET                                        | /me/analytics/engagement          |
| ---                                        | ---                               |
| GET                                        | /me/analytics/geography           |
| ---                                        | ---                               |
| GET                                        | /me/analytics/discoverability     |
| ---                                        | ---                               |
| GET                                        | /me/analytics/referrals           |
| ---                                        | ---                               |
| GET                                        | /me/analytics/revenue             |
| ---                                        | ---                               |
| GET                                        | /me/analytics/reports             |
| ---                                        | ---                               |
| POST                                       | /me/analytics/reports             |
| ---                                        | ---                               |
| GET                                        | /me/analytics/reports/{report_id} |
| ---                                        | ---                               |
| POST                                       | /me/analytics/reports/schedule    |
| ---                                        | ---                               |
| GET                                        | /me/analytics/reports/schedule    |
| ---                                        | ---                               |
| DELETE /me/analytics/reports/schedule/{id} | Cancel scheduled report           |
| ---                                        | ---                               |

All analytics endpoints accept query params: from, to, title_id, format (json | csv | pdf)

### **GET /me/analytics/engagement - Response**

{

"title_id": "uuid",

"average_read_time_minutes": 240,

"completion_rate": 0.68,

"chapter_drop_off": \[

{ "chapter": 1, "readers": 4823, "percentage": 1.00 },

{ "chapter": 5, "readers": 3950, "percentage": 0.82 },

{ "chapter": 10, "readers": 2800, "percentage": 0.58 }

\]

}

## **6.7 Revenue & Royalties**

| **Method & Path**                                             | **Description**                                                |
| ------------------------------------------------------------- | -------------------------------------------------------------- |
| GET                                                           | /me/royalties/dashboard                                        |
| ---                                                           | ---                                                            |
| GET                                                           | /me/royalties/history                                          |
| ---                                                           | ---                                                            |
| GET                                                           | /me/royalties/upcoming                                         |
| ---                                                           | ---                                                            |
| GET                                                           | /me/royalties/breakdown/{title_id} Per-title royalty breakdown |
| ---                                                           | ---                                                            |
| GET                                                           | /me/royalties/formula                                          |
| ---                                                           | ---                                                            |
| POST                                                          | /me/royalties/payout-request                                   |
| ---                                                           | ---                                                            |
| GET                                                           | /me/royalties/payout-methods                                   |
| ---                                                           | ---                                                            |
| POST                                                          | /me/royalties/payout-methods                                   |
| ---                                                           | ---                                                            |
| DELETE /me/royalties/payout-methods/{id} Remove payout method |                                                                |
| ---                                                           | ---                                                            |
| PUT                                                           | /me/royalties/payout-methods/{id}/default                      |
| ---                                                           | ---                                                            |
| PATCH /me/royalties/settings                                  | Update threshold, currency                                     |
| ---                                                           | ---                                                            |
| GET                                                           | /me/royalties/invoices                                         |
| ---                                                           | ---                                                            |
| GET                                                           | /me/royalties/contracts                                        |
| ---                                                           | ---                                                            |
| GET                                                           | /me/royalties/tax-documents                                    |
| ---                                                           | ---                                                            |
| POST                                                          | /me/royalties/tax-documents                                    |
| ---                                                           | ---                                                            |

## **6.8 Promotion & Marketing**

| **Method & Path**                                            | **Description**                   |
| ------------------------------------------------------------ | --------------------------------- |
| POST                                                         | /me/promotions/placement-request  |
| ---                                                          | ---                               |
| GET                                                          | /me/promotions/placement-requests |
| ---                                                          | ---                               |
| DELETE /me/promotions/placement-requests/{id} Cancel request |                                   |
| ---                                                          | ---                               |
| POST                                                         | /me/promotions/banners            |
| ---                                                          | ---                               |
| GET                                                          | /me/promotions/banners            |
| ---                                                          | ---                               |
| DELETE /me/promotions/banners/{id}                           | Remove a banner                   |
| ---                                                          | ---                               |
| POST                                                         | /me/promotions/preorders          |
| ---                                                          | ---                               |
| GET                                                          | /me/promotions/preorders          |
| ---                                                          | ---                               |
| PATCH                                                        | /me/promotions/preorders/{id}     |
| ---                                                          | ---                               |
| DELETE /me/promotions/preorders/{id}                         | Cancel pre-order                  |
| ---                                                          | ---                               |
| POST                                                         | /me/promotions/free-windows       |
| ---                                                          | ---                               |
| GET                                                          | /me/promotions/free-windows       |
| ---                                                          | ---                               |
| DELETE /me/promotions/free-windows/{id}                      | Remove free-access window         |
| ---                                                          | ---                               |
| GET                                                          | /titles/{title_id}/widget-embed   |
| ---                                                          | ---                               |
| POST                                                         | /me/affiliate-links               |
| ---                                                          | ---                               |
| GET                                                          | /me/affiliate-links               |
| ---                                                          | ---                               |

## **6.9 Community & Engagement (Author-side)**

| **Method & Path**                        | **Description**                   |
| ---------------------------------------- | --------------------------------- |
| POST                                     | /reviews/{review_id}/author-reply |
| ---                                      | ---                               |
| PATCH                                    | /reviews/{review_id}/author-reply |
| ---                                      | ---                               |
| DELETE /reviews/{review_id}/author-reply | Delete reply                      |
| ---                                      | ---                               |
| GET                                      | /me/events                        |
| ---                                      | ---                               |
| POST                                     | /me/events                        |
| ---                                      | ---                               |
| PATCH                                    | /me/events/{event_id}             |
| ---                                      | ---                               |
| DELETE /me/events/{event_id}             | Cancel an event                   |
| ---                                      | ---                               |
| GET                                      | /me/events/{event_id}/attendees   |
| ---                                      | ---                               |
| POST                                     | /me/book-club-kits                |
| ---                                      | ---                               |
| GET                                      | /me/book-club-kits                |
| ---                                      | ---                               |
| PATCH                                    | /me/book-club-kits/{kit_id}       |
| ---                                      | ---                               |
| DELETE /me/book-club-kits/{kit_id}       | Delete kit                        |
| ---                                      | ---                               |
| POST                                     | /me/announcements                 |
| ---                                      | ---                               |
| GET                                      | /me/announcements                 |
| ---                                      | ---                               |
| GET                                      | /me/reader-questions              |
| ---                                      | ---                               |
| POST                                     | /me/reader-questions/{id}/answer  |
| ---                                      | ---                               |

## **6.10 Technical & Integration**

| **Method & Path**                | **Description**                |
| -------------------------------- | ------------------------------ |
| GET                              | /me/integrations/onix-feed     |
| ---                              | ---                            |
| GET                              | /me/api-keys                   |
| ---                              | ---                            |
| POST                             | /me/api-keys                   |
| ---                              | ---                            |
| DELETE /me/api-keys/{key_id}     | Revoke API key                 |
| ---                              | ---                            |
| GET                              | /me/webhooks                   |
| ---                              | ---                            |
| POST                             | /me/webhooks                   |
| ---                              | ---                            |
| PATCH                            | /me/webhooks/{webhook_id}      |
| ---                              | ---                            |
| DELETE /me/webhooks/{webhook_id} | Delete webhook                 |
| ---                              | ---                            |
| POST                             | /me/webhooks/{webhook_id}/test |
| ---                              | ---                            |

### **POST /me/webhooks - Request**

{

"url": "<https://myapp.com/webhooks/library>",

"events": \["title.read", "title.purchased", "royalty.paid"\],

"secret": "my_webhook_secret"

}

# **7\. Admin / Staff Endpoints \[Role: admin | staff\]**

## **7.1 User Management**

| **Method & Path**                           | **Description**                       |
| ------------------------------------------- | ------------------------------------- |
| GET                                         | /admin/users                          |
| ---                                         | ---                                   |
| GET                                         | /admin/users/{user_id}                |
| ---                                         | ---                                   |
| POST                                        | /admin/users                          |
| ---                                         | ---                                   |
| PATCH                                       | /admin/users/{user_id}                |
| ---                                         | ---                                   |
| DELETE /admin/users/{user_id}               | Delete user                           |
| ---                                         | ---                                   |
| POST                                        | /admin/users/{user_id}/suspend        |
| ---                                         | ---                                   |
| POST                                        | /admin/users/{user_id}/unsuspend      |
| ---                                         | ---                                   |
| POST                                        | /admin/users/{user_id}/warn           |
| ---                                         | ---                                   |
| POST                                        | /admin/users/{user_id}/ban            |
| ---                                         | ---                                   |
| POST                                        | /admin/users/{user_id}/unban          |
| ---                                         | ---                                   |
| POST                                        | /admin/users/{user_id}/password-reset |
| ---                                         | ---                                   |
| POST                                        | /admin/users/{user_id}/verify-email   |
| ---                                         | ---                                   |
| GET                                         | /admin/users/{user_id}/activity       |
| ---                                         | ---                                   |
| PATCH                                       | /admin/users/{user_id}/role           |
| ---                                         | ---                                   |
| PATCH                                       | /admin/users/{user_id}/plan           |
| ---                                         | ---                                   |
| POST                                        | /admin/users/bulk-import              |
| ---                                         | ---                                   |
| GET                                         | /admin/institutions                   |
| ---                                         | ---                                   |
| POST                                        | /admin/institutions                   |
| ---                                         | ---                                   |
| PATCH                                       | /admin/institutions/{id}              |
| ---                                         | ---                                   |
| DELETE /admin/institutions/{id}             | Delete institution                    |
| ---                                         | ---                                   |
| POST                                        | /admin/institutions/{id}/users        |
| ---                                         | ---                                   |
| DELETE /admin/institutions/{id}/users/{uid} | Remove user from institution          |
| ---                                         | ---                                   |

## **7.2 Catalogue Management**

| **Method & Path**                            | **Description**                             |
| -------------------------------------------- | ------------------------------------------- |
| GET                                          | /admin/titles                               |
| ---                                          | ---                                         |
| POST                                         | /admin/titles                               |
| ---                                          | ---                                         |
| PATCH                                        | /admin/titles/{title_id}                    |
| ---                                          | ---                                         |
| DELETE /admin/titles/{title_id}              | Remove title                                |
| ---                                          | ---                                         |
| GET                                          | /admin/titles/review-queue                  |
| ---                                          | ---                                         |
| POST                                         | /admin/titles/{title_id}/approve            |
| ---                                          | ---                                         |
| POST                                         | /admin/titles/{title_id}/reject             |
| ---                                          | ---                                         |
| POST                                         | /admin/titles/{title_id}/request-revision   |
| ---                                          | ---                                         |
| GET                                          | /admin/titles/audit                         |
| ---                                          | ---                                         |
| POST                                         | /admin/titles/batch-metadata                |
| ---                                          | ---                                         |
| GET                                          | /admin/shelves                              |
| ---                                          | ---                                         |
| POST                                         | /admin/shelves                              |
| ---                                          | ---                                         |
| PATCH                                        | /admin/shelves/{shelf_id}                   |
| ---                                          | ---                                         |
| DELETE /admin/shelves/{shelf_id}             | Delete shelf                                |
| ---                                          | ---                                         |
| POST                                         | /admin/shelves/{shelf_id}/titles            |
| ---                                          | ---                                         |
| DELETE /admin/shelves/{shelf_id}/titles/{id} | Remove title from shelf                     |
| ---                                          | ---                                         |
| PATCH                                        | /admin/shelves/{shelf_id}/titles/{id}/order |
| ---                                          | ---                                         |
| PATCH                                        | /admin/titles/{title_id}/access-limits      |
| ---                                          | ---                                         |
| PATCH                                        | /admin/titles/{title_id}/loan-duration      |
| ---                                          | ---                                         |

### **POST /admin/titles/{id}/reject - Request**

{

"reason_code": "metadata_incomplete",

"message": "Please provide a complete synopsis and at least 3 genre tags.",

"notify_author": true

}

## **7.3 Circulation & Access**

| **Method & Path** | **Description**                |
| ----------------- | ------------------------------ |
| GET               | /admin/circulation             |
| ---               | ---                            |
| GET               | /admin/circulation/overdue     |
| ---               | ---                            |
| GET               | /admin/circulation/holds       |
| ---               | ---                            |
| PATCH             | /admin/circulation/{access_id} |
| ---               | ---                            |
| POST              | /admin/circulation/override    |
| ---               | ---                            |
| GET               | /admin/circulation/rules       |
| ---               | ---                            |
| PUT               | /admin/circulation/rules       |
| ---               | ---                            |

## **7.4 Subscription & Billing Management**

| **Method & Path**                   | **Description**                      |
| ----------------------------------- | ------------------------------------ |
| GET                                 | /admin/subscriptions                 |
| ---                                 | ---                                  |
| GET                                 | /admin/subscriptions/{sub_id}        |
| ---                                 | ---                                  |
| PATCH                               | /admin/subscriptions/{sub_id}        |
| ---                                 | ---                                  |
| POST                                | /admin/subscriptions/{sub_id}/refund |
| ---                                 | ---                                  |
| GET                                 | /admin/subscriptions/failed-payments |
| ---                                 | ---                                  |
| POST                                | /admin/subscriptions/{sub_id}/retry  |
| ---                                 | ---                                  |
| GET                                 | /admin/plans                         |
| ---                                 | ---                                  |
| POST                                | /admin/plans                         |
| ---                                 | ---                                  |
| PATCH                               | /admin/plans/{plan_id}               |
| ---                                 | ---                                  |
| DELETE /admin/plans/{plan_id}       | Archive plan                         |
| ---                                 | ---                                  |
| GET                                 | /admin/promo-codes                   |
| ---                                 | ---                                  |
| POST                                | /admin/promo-codes                   |
| ---                                 | ---                                  |
| PATCH                               | /admin/promo-codes/{code_id}         |
| ---                                 | ---                                  |
| DELETE /admin/promo-codes/{code_id} | Deactivate promo code                |
| ---                                 | ---                                  |
| GET                                 | /admin/promo-codes/{code_id}/usage   |
| ---                                 | ---                                  |
| GET                                 | /admin/billing/gateway               |
| ---                                 | ---                                  |
| PUT                                 | /admin/billing/gateway               |
| ---                                 | ---                                  |

### **POST /admin/promo-codes - Request**

{

"code": "LAUNCH50",

"discount_type": "percentage",

"discount_value": 50,

"applies_to": "first_month",

"max_uses": 1000,

"per_user_limit": 1,

"expires_at": "2025-12-31T23:59:59Z",

"eligible_plans": \["standard", "premium"\]

}

## **7.5 Content Moderation**

| **Method & Path** | **Description**                     |
| ----------------- | ----------------------------------- |
| GET               | /admin/reviews                      |
| ---               | ---                                 |
| GET               | /admin/reviews/reported             |
| ---               | ---                                 |
| POST              | /admin/reviews/{review_id}/approve  |
| ---               | ---                                 |
| POST              | /admin/reviews/{review_id}/remove   |
| ---               | ---                                 |
| GET               | /admin/discussions/reported         |
| ---               | ---                                 |
| POST              | /admin/discussions/{post_id}/remove |
| ---               | ---                                 |
| GET               | /admin/reports                      |
| ---               | ---                                 |
| PATCH             | /admin/reports/{report_id}          |
| ---               | ---                                 |
| GET               | /admin/community-guidelines         |
| ---               | ---                                 |
| PUT               | /admin/community-guidelines         |
| ---               | ---                                 |

## **7.6 Author & Publisher Management**

| **Method & Path** | **Description**                        |
| ----------------- | -------------------------------------- |
| GET               | /admin/authors                         |
| ---               | ---                                    |
| GET               | /admin/authors/{author_id}             |
| ---               | ---                                    |
| GET               | /admin/publishers                      |
| ---               | ---                                    |
| GET               | /admin/publishers/{pub_id}             |
| ---               | ---                                    |
| GET               | /admin/authors/{author_id}/analytics   |
| ---               | ---                                    |
| GET               | /admin/badge-applications              |
| ---               | ---                                    |
| POST              | /admin/badge-applications/{id}/approve |
| ---               | ---                                    |
| POST              | /admin/badge-applications/{id}/reject  |
| ---               | ---                                    |
| GET               | /admin/placement-requests              |
| ---               | ---                                    |
| POST              | /admin/placement-requests/{id}/approve |
| ---               | ---                                    |
| POST              | /admin/placement-requests/{id}/reject  |
| ---               | ---                                    |

## **7.7 Financial & Royalty Admin**

| **Method & Path** | **Description**                         |
| ----------------- | --------------------------------------- |
| GET               | /admin/royalties                        |
| ---               | ---                                     |
| GET               | /admin/royalties/{payout_id}            |
| ---               | ---                                     |
| POST              | /admin/royalties/{payout_id}/approve    |
| ---               | ---                                     |
| POST              | /admin/royalties/{payout_id}/process    |
| ---               | ---                                     |
| POST              | /admin/royalties/{payout_id}/dispute    |
| ---               | ---                                     |
| PATCH             | /admin/royalties/{payout_id}/correction |
| ---               | ---                                     |
| GET               | /admin/royalties/formulas               |
| ---               | ---                                     |
| PUT               | /admin/royalties/formulas               |
| ---               | ---                                     |
| GET               | /admin/royalties/schedule               |
| ---               | ---                                     |
| PUT               | /admin/royalties/schedule               |
| ---               | ---                                     |
| GET               | /admin/financial/summary                |
| ---               | ---                                     |
| GET               | /admin/financial/tax-settings           |
| ---               | ---                                     |
| PUT               | /admin/financial/tax-settings           |
| ---               | ---                                     |

### **PUT /admin/royalties/formulas - Request**

{

"default_rate": 0.70,

"by_format": { "ebook": 0.70, "audiobook": 0.65, "pdf": 0.70 },

"by_plan": { "basic": 0.60, "standard": 0.65, "premium": 0.70 },

"minimum_reads_for_payout": 1,

"platform_commission": 0.30

}

## **7.8 Events & Programmes Management**

| **Method & Path**               | **Description**                      |
| ------------------------------- | ------------------------------------ |
| GET                             | /admin/events                        |
| ---                             | ---                                  |
| POST                            | /admin/events                        |
| ---                             | ---                                  |
| PATCH                           | /admin/events/{event_id}             |
| ---                             | ---                                  |
| DELETE /admin/events/{event_id} | Cancel / delete event                |
| ---                             | ---                                  |
| GET                             | /admin/events/{event_id}/attendees   |
| ---                             | ---                                  |
| POST                            | /admin/events/{event_id}/invitations |
| ---                             | ---                                  |
| GET                             | /admin/events/{event_id}/feedback    |
| ---                             | ---                                  |
| GET                             | /admin/events/archive                |
| ---                             | ---                                  |
| GET                             | /admin/events/integrations           |
| ---                             | ---                                  |
| PUT                             | /admin/events/integrations           |
| ---                             | ---                                  |

## **7.9 Platform Analytics**

| **Method & Path**                                                       | **Description**                   |
| ----------------------------------------------------------------------- | --------------------------------- |
| GET                                                                     | /admin/analytics/overview         |
| ---                                                                     | ---                               |
| GET                                                                     | /admin/analytics/users            |
| ---                                                                     | ---                               |
| GET                                                                     | /admin/analytics/subscriptions    |
| ---                                                                     | ---                               |
| GET                                                                     | /admin/analytics/circulation      |
| ---                                                                     | ---                               |
| GET                                                                     | /admin/analytics/engagement       |
| ---                                                                     | ---                               |
| GET                                                                     | /admin/analytics/search           |
| ---                                                                     | ---                               |
| GET                                                                     | /admin/analytics/authors          |
| ---                                                                     | ---                               |
| GET                                                                     | /admin/analytics/revenue          |
| ---                                                                     | ---                               |
| GET                                                                     | /admin/analytics/reports          |
| ---                                                                     | ---                               |
| POST                                                                    | /admin/analytics/reports          |
| ---                                                                     | ---                               |
| GET                                                                     | /admin/analytics/reports/{id}     |
| ---                                                                     | ---                               |
| POST                                                                    | /admin/analytics/reports/schedule |
| ---                                                                     | ---                               |
| DELETE /admin/analytics/reports/schedule/{id} Cancel a scheduled report |                                   |
| ---                                                                     | ---                               |

### **GET /admin/analytics/subscriptions - Response**

{

"period": { "from": "2025-06-01", "to": "2025-06-30" },

"mrr": 485000,

"arr": 5820000,

"currency": "USD",

"new_subscribers": 340,

"churned_subscribers": 62,

"churn_rate": 0.032,

"trial_started": 580,

"trial_to_paid_rate": 0.44,

"active_by_plan": { "basic": 820, "standard": 1540, "premium": 380 }

}

## **7.10 System Configuration**

| **Method & Path**                      | **Description**                    |
| -------------------------------------- | ---------------------------------- |
| GET                                    | /admin/config                      |
| ---                                    | ---                                |
| PATCH                                  | /admin/config                      |
| ---                                    | ---                                |
| GET                                    | /admin/config/auth-providers       |
| ---                                    | ---                                |
| PUT                                    | /admin/config/auth-providers       |
| ---                                    | ---                                |
| GET                                    | /admin/config/notifications        |
| ---                                    | ---                                |
| PUT                                    | /admin/config/notifications/{id}   |
| ---                                    | ---                                |
| GET                                    | /admin/config/drm                  |
| ---                                    | ---                                |
| PUT                                    | /admin/config/drm                  |
| ---                                    | ---                                |
| GET                                    | /admin/config/feature-flags        |
| ---                                    | ---                                |
| PATCH                                  | /admin/config/feature-flags/{flag} |
| ---                                    | ---                                |
| GET                                    | /admin/config/localisation         |
| ---                                    | ---                                |
| PUT                                    | /admin/config/localisation         |
| ---                                    | ---                                |
| GET                                    | /admin/config/cdn                  |
| ---                                    | ---                                |
| PUT                                    | /admin/config/cdn                  |
| ---                                    | ---                                |
| GET                                    | /admin/config/api-keys             |
| ---                                    | ---                                |
| POST                                   | /admin/config/api-keys             |
| ---                                    | ---                                |
| DELETE /admin/config/api-keys/{key_id} | Revoke platform key                |
| ---                                    | ---                                |

## **7.11 Security & Compliance**

| **Method & Path**                    | **Description**                          |
| ------------------------------------ | ---------------------------------------- |
| GET                                  | /admin/audit-logs                        |
| ---                                  | ---                                      |
| GET                                  | /admin/security/failed-logins            |
| ---                                  | ---                                      |
| GET                                  | /admin/security/suspicious-activity      |
| ---                                  | ---                                      |
| GET                                  | /admin/security/sessions                 |
| ---                                  | ---                                      |
| DELETE /admin/security/sessions/{id} | Revoke admin session                     |
| ---                                  | ---                                      |
| PUT                                  | /admin/security/policy                   |
| ---                                  | ---                                      |
| PUT                                  | /admin/security/2fa-enforcement          |
| ---                                  | ---                                      |
| GET                                  | /admin/privacy/data-requests             |
| ---                                  | ---                                      |
| POST                                 | /admin/privacy/data-requests/{id}/export |
| ---                                  | ---                                      |
| POST                                 | /admin/privacy/data-requests/{id}/delete |
| ---                                  | ---                                      |
| GET                                  | /admin/privacy/retention-policies        |
| ---                                  | ---                                      |
| PUT                                  | /admin/privacy/retention-policies        |
| ---                                  | ---                                      |
| GET                                  | /admin/dmca                              |
| ---                                  | ---                                      |
| POST                                 | /admin/dmca                              |
| ---                                  | ---                                      |
| PATCH                                | /admin/dmca/{id}                         |
| ---                                  | ---                                      |
| GET                                  | /admin/piracy-reports                    |
| ---                                  | ---                                      |
| POST                                 | /admin/piracy-reports/{id}/action        |
| ---                                  | ---                                      |

## **7.12 Support & Communication**

| **Method & Path**                       | **Description**                          |
| --------------------------------------- | ---------------------------------------- |
| GET                                     | /admin/support/tickets                   |
| ---                                     | ---                                      |
| GET                                     | /admin/support/tickets/{ticket_id}       |
| ---                                     | ---                                      |
| POST                                    | /admin/support/tickets                   |
| ---                                     | ---                                      |
| PATCH                                   | /admin/support/tickets/{ticket_id}       |
| ---                                     | ---                                      |
| POST                                    | /admin/support/tickets/{ticket_id}/reply |
| ---                                     | ---                                      |
| POST                                    | /admin/support/tickets/{ticket_id}/close |
| ---                                     | ---                                      |
| GET                                     | /admin/support/templates                 |
| ---                                     | ---                                      |
| POST                                    | /admin/support/templates                 |
| ---                                     | ---                                      |
| PATCH                                   | /admin/support/templates/{id}            |
| ---                                     | ---                                      |
| DELETE /admin/support/templates/{id}    | Delete template                          |
| ---                                     | ---                                      |
| GET                                     | /admin/help-centre/articles              |
| ---                                     | ---                                      |
| POST                                    | /admin/help-centre/articles              |
| ---                                     | ---                                      |
| PATCH                                   | /admin/help-centre/articles/{id}         |
| ---                                     | ---                                      |
| DELETE /admin/help-centre/articles/{id} | Delete article                           |
| ---                                     | ---                                      |
| POST                                    | /admin/broadcasts                        |
| ---                                     | ---                                      |
| GET                                     | /admin/broadcasts                        |
| ---                                     | ---                                      |
| GET                                     | /admin/onboarding/flows                  |
| ---                                     | ---                                      |
| PATCH                                   | /admin/onboarding/flows/{role}           |
| ---                                     | ---                                      |
| GET                                     | /admin/surveys                           |
| ---                                     | ---                                      |
| POST                                    | /admin/surveys                           |
| ---                                     | ---                                      |
| POST                                    | /admin/surveys/{id}/trigger              |
| ---                                     | ---                                      |
| GET                                     | /admin/surveys/{id}/responses            |
| ---                                     | ---                                      |

### **POST /admin/broadcasts - Request**

{

"subject": "New Feature: Audiobook Speed Controls",

"body": "We've launched ...",

"channel": "in-app", // "email" | "push" | "in-app" | "all"

"audience": {

"roles": \["reader"\],

"plans": \["standard", "premium"\],

"regions": \["BD"\]

},

"scheduled_at": "2025-07-05T09:00:00Z"

}

# **8\. Webhooks**

## **8.1 Event Catalogue**

| **Event**            | **Description**                      |
| -------------------- | ------------------------------------ |
| title.submitted      | Author submitted a title for review  |
| ---                  | ---                                  |
| title.approved       | Title approved and published         |
| ---                  | ---                                  |
| title.rejected       | Title rejected by admin              |
| ---                  | ---                                  |
| title.read           | A read/borrow event occurred         |
| ---                  | ---                                  |
| title.purchased      | A title was purchased                |
| ---                  | ---                                  |
| title.returned       | A borrowed title was returned        |
| ---                  | ---                                  |
| title.hold_available | A held title became available        |
| ---                  | ---                                  |
| user.registered      | New user registered                  |
| ---                  | ---                                  |
| user.subscribed      | User subscribed to a plan            |
| ---                  | ---                                  |
| user.churned         | User cancelled subscription          |
| ---                  | ---                                  |
| royalty.calculated   | Royalty amount calculated for period |
| ---                  | ---                                  |
| royalty.paid         | Payout processed                     |
| ---                  | ---                                  |
| review.submitted     | New review submitted                 |
| ---                  | ---                                  |
| review.flagged       | Review flagged by a user             |
| ---                  | ---                                  |
| event.rsvp           | User RSVPed to an event              |
| ---                  | ---                                  |
| dmca.received        | New DMCA takedown request logged     |
| ---                  | ---                                  |

## **8.2 Webhook Payload Structure**

{

"event": "title.read",

"id": "evt_uuid",

"occurred_at": "2025-07-01T14:22:00Z",

"data": {

"title_id": "uuid",

"reader_id": "uuid",

"format": "ebook",

"borrow_id": "uuid"

}

}

# **9\. Pagination**

All list endpoints use cursor-based pagination:

GET /catalogue?cursor=eyJpZCI6Ijk4NyJ9&limit=20

Response:

{

"data": \[...\],

"pagination": {

"next_cursor": "eyJpZCI6IjEwMDcifQ",

"prev_cursor": "eyJpZCI6Ijk2NyJ9",

"has_more": true,

"total": 4200

}

}

# **10\. Rate Limits**

| **Role**           | **Default Limit**                   |
| ------------------ | ----------------------------------- |
| Guest              | 60 req / min                        |
| ---                | ---                                 |
| Reader             | 300 req / min                       |
| ---                | ---                                 |
| Author / Publisher | 600 req / min                       |
| ---                | ---                                 |
| Admin              | 1200 req / min                      |
| ---                | ---                                 |
| Webhook delivery   | 10 retries with exponential backoff |
| ---                | ---                                 |

Heavy endpoints (file upload, report generation, bulk operations) have separate lower limits and return 202 Accepted with a job ID for async polling:

POST /me/analytics/reports

→ 202 Accepted

{ "job_id": "uuid", "poll_url": "/jobs/uuid" }

GET /jobs/{job_id}

→ { "status": "pending" | "processing" | "done" | "failed", "result_url": "..." }

# **11\. File Upload Pattern**

For large files (EPUB, PDF, audiobooks) use the pre-signed URL flow:

Step 1: POST /uploads/initiate

Request: { "filename": "book.epub", "content_type": "application/epub+zip", "size_bytes": 2048000 }

Response: { "upload_id": "uuid", "presigned_url": "<https://s3.../>...", "expires_in": 900 }

Step 2: PUT {presigned_url} (direct upload to S3/CDN - no server proxy)

Step 3: POST /uploads/{upload_id}/confirm

Request: { "title_id": "uuid", "format": "ebook" }

Response: { "file_id": "uuid", "status": "processing" }

Step 4: GET /uploads/{upload_id}/status

Response: { "status": "ready" | "processing" | "failed", "file_id": "uuid" }

# **12\. Streaming (Audiobook / eBook)**

| **Method & Path**               | **Description**                                |
| ------------------------------- | ---------------------------------------------- |
| GET /stream/{title_id}/manifest | Signed streaming manifest (HLS/DASH for audio) |
| ---                             | ---                                            |
| GET /stream/{title_id}/epub     | Signed EPUB access URL (DRM wrapper)           |
| ---                             | ---                                            |

Both URLs are signed JWTs with embedded user ID, expiry, and device fingerprint. The CDN validates these without hitting the API.

# **13\. Endpoint Summary by Role**

| **Role**           | **Endpoint Groups**                                                                                                   | **Approx. Count** |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Public / Guest     | Catalogue, Search, Authors, Plans, Events, Community (RO), Help, Auth                                                 | ~40               |
| ---                | ---                                                                                                                   | ---               |
| Reader             | Account, Subscription, Discovery, Access/Borrows, Reading, Lists, Goals, Social, Research, Events                     | ~100              |
| ---                | ---                                                                                                                   | ---               |
| Author / Publisher | Profile, Upload, Series, Rights, Analytics, Royalties, Promotion, Community, Integrations                             | ~90               |
| ---                | ---                                                                                                                   | ---               |
| Admin / Staff      | Users, Catalogue, Circulation, Billing, Moderation, Authors, Financials, Events, Analytics, Config, Security, Support | ~130              |
| ---                | ---                                                                                                                   | ---               |
| Total              |                                                                                                                       | ~360              |
| ---                | ---                                                                                                                   | ---               |
