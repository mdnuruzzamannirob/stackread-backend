# StackRead Backend - Copilot Context Guide

**Last Updated:** May 4, 2026
**Status:** Requirements Analysis Complete - Ready for Development
**Audience:** AI Copilot and Development Team

---

## 1. Project Overview

**StackRead** is a commercial, multi-tenant digital library and self-publishing platform that enables:

- **Readers** to subscribe and access a large catalogue of eBooks, audiobooks, and PDFs with cross-device reading synchronisation
- **Authors & Publishers** to upload, manage rights, track analytics, and earn royalties from their content
- **Admins** to govern the platform, manage financial operations, moderate content, and ensure compliance

### Key Characteristics

- **Business Model**: Dual revenue stream (subscription + individual purchases) with author royalty pool
- **Scale Target**: 500 concurrent users at MVP launch, scaling to 10K within 12 months
- **Compliance**: GDPR, PDPA, DMCA, WCAG 2.1 AA from day one
- **DRM Integration**: Mandatory from start (Readium LCP or Adobe ACS)
- **Content**: eBooks (EPUB, PDF), audiobooks (MP3, M4B), supplementary materials
- **Solo Developer**: MVP must be MUST-priority features only (SHOULD/COULD are post-launch)

---

## 2. Tech Stack (Current)

### Backend Framework & Runtime

- **Node.js** with **Express 5.1** (REST API, no GraphQL in scope for MVP)
- **TypeScript 5.8** (strict mode required)
- **Database**: MongoDB 8+ with Mongoose 8.13 ODM

### Authentication & Authorization

- **JWT** (access + refresh token pair) via `jsonwebtoken` 9.0.2
- **Passport 0.7** with strategies:
  - `passport-google-oauth20` 2.0 (Google OAuth)
  - `passport-facebook` 3.0 (Facebook Sign-In)
  - Custom SAML/LDAP handlers (for institutional SSO)

### Payment Processing

- **Stripe** 20.4.1 (primary gateway: subscriptions, purchases, payouts)
- **PayPal** `@paypal/checkout-server-sdk` 1.0.3 (alternative gateway)
- **SSLCommerz** `sslcommerz-lts` 1.2.0 (local Bangladesh gateway: bKash, Nagad)

### File & Media Handling

- **Cloudinary** 2.7.0 (image upload, transformation, CDN)
- **PDFKit** 0.17.2 (PDF generation for invoices, reports)
- **QRCode** 1.5.4 (QR code generation for affiliate links, event tickets)
- **Pre-signed S3 URLs** (direct upload pattern - no server proxy)

### Notifications & Communication

- **Firebase Admin** 13.5.0 (push notifications for iOS/Android)
- **Nodemailer** 7.0.7 (transactional emails)
- **SendGrid/Resend** (configured via .env, not npm package)

### Security & Middleware

- **Helmet** 8.1.0 (HTTP security headers)
- **Express Rate Limit** 7.5.0 (per-role, per-endpoint rate limiting)
- **Express Mongo Sanitize** 2.2.0 (NoSQL injection prevention)
- **CORS** 2.8.5 (cross-origin request handling)
- **Morgan** 1.10.0 (HTTP request logging)
- **Response Time** 2.3.4 (performance monitoring)

### Validation & Error Handling

- **Zod** 3.24.2 (runtime schema validation)
- **Zod Validation Error** 3.5.3 (formatted error messages)
- **HTTP Status** 2.1.0 (standardised HTTP codes)
- **RFC 7807 Problem Details** (standardised error format)

### Utilities & Helpers

- **Nanoid** 5.1.6 (ID generation for URLs, shorts)
- **Libphonenumber-js** 1.12.41 (phone number validation)
- **Speakeasy** 2.0.0 (TOTP for 2FA)
- **Node Cron** 4.2.1 (scheduled jobs: royalty calc, reminders, cleanup)
- **ExcelJS** 4.4.0 (bulk import/export for authors, reports)

### Logging & Monitoring

- **Winston** 3.17.0 (structured logging)
- **Winston Daily Rotate File** 5.0.0 (log rotation by date)

### Testing

- **Vitest** 4.1.0 (unit & integration tests)
- **Supertest** 7.2.2 (HTTP assertion library)
- **MongoDB Memory Server** 11.0.1 (in-memory test database)

### Development Tools

- **TSX** 4.19.0 (TypeScript execution with watch mode)

---

## 3. New Business Rules (From SRS & Features List)

### Access Control & Roles

```
Guest → Reader → Author/Publisher → Admin/Staff

Guest:     No auth required, public endpoints only
Reader:    Authenticated, subscription-based access
Author:    Can upload content, manage own titles
Publisher: Can manage multiple authors' titles, org-level control
Admin:     Full platform governance
Staff:     Moderation, support, analytics (limited actions)
```

### Subscription Model

- **Plans**: Basic, Standard, Premium (admin-configurable)
- **Billing Cycles**: Monthly or annual (auto-renew by default)
- **Trial**: 14 days free (optional, configurable), no card required
- **Promo Codes**: Discount or fixed amount, per-plan eligibility, usage limits
- **Cancellation**: Anytime, but reader loses access at period end
- **Downgrade**: Effective next billing cycle
- **Upgrade**: Prorated charge (if applicable)

### Content Access Rules

- **Subscription Access**: Unlimited reads within plan features
- **Simultaneous User Limits**: Author sets per title (1, 3, 5, 10, unlimited)
- **Loan Duration**: Author sets (7, 14, 21, 30 days) for library-model titles
- **Geo-Restrictions**: Author can allowlist/blocklist countries
- **DRM**: Author chooses: apply platform DRM, custom DRM, or none
- **Free Access Windows**: Time-limited promotional periods (no hold required)

### Borrowing & Circulation

- **Active Borrows**: Reader can have multiple active borrows
- **Holds/Waitlist**: If simultaneous limit reached, reader can place hold
- **Hold Expiry**: Reader has limited window to borrow when available (e.g., 48 hrs)
- **Renewals**: Default 2 max renewals per title, author-configurable
- **Auto-Return**: System auto-returns expired loans
- **Download Limits**: Per plan (e.g., Basic: 5/month, Standard: unlimited)

### Reading Progress & Cross-Device Sync

- **Automatic Sync**: Reading position syncs in real-time across devices
- **Device Fingerprinting**: Track which device last read (for DRM enforcement)
- **Session Tracking**: Aggregate sessions per reading engagement metric
- **Completion Tracking**: Mark 100% progress as "completed"

### Royalty Calculation

- **Trigger**: End of calendar month
- **Formula**: Varies by plan/format, set by admin, visible to author
  ```
  Royalty = (subscription_reads + purchase_amount) × rate - platform_commission
  ```
- **Minimum Payout Threshold**: Author configurable (e.g., $50 minimum)
- **Payout Methods**: Bank transfer, PayPal, bKash, Nagad
- **Tax Documents**: Store W-8, W-9, VAT for compliance
- **Currency**: Author configurable per payout method

### Reviews & Moderation

- **Status States**: pending → approved | removed
- **Spoiler Flags**: Reader can flag review as containing spoilers
- **Author Replies**: Author can post public reply (appears below review)
- **Like/Comment**: Readers can like reviews and comment (nested max depth: 2)
- **Reporting**: Users can flag inappropriate content
- **Approval Queue**: Staff reviews flagged content

### Analytics & Transparency

- **Author Dashboard**: Real-time read count, engagement, geographic breakdown, search appearance
- **Engagement Metrics**: Avg read time, completion rate, chapter-level drop-off
- **Discoverability**: Search impressions, CTR
- **Comparative Reports**: Title vs. title, date range comparisons
- **Export Formats**: CSV, PDF, scheduled delivery

### Notifications (User-Triggered)

- **Types**: hold_available, new_follower, review_liked, new_release, event_reminder, badge_earned, payout_processed, title_approved, title_rejected, admin_warning
- **Channels**: Email, push (mobile), in-app
- **User Preferences**: Per-notification-type, per-channel opt-in/out
- **Expiry**: Auto-delete after 30 days (configurable)

### DMCA & Copyright Compliance

- **Takedown Workflow**: Receive → Review → Action (remove, restrict, reject)
- **Counter-Notice**: Author can submit counter-notice within 14 days
- **Audit Trail**: All DMCA actions logged immutably
- **Piracy Reports**: Community can report unauthorised sharing

### Gamification (Reader Engagement)

- **Reading Goals**: Yearly/monthly targets (books or pages)
- **Streaks**: Track consecutive reading days
- **Badges**: Trigger on milestones (first borrow, 5 books, genre explorer, etc.)
- **Annual Wrapped**: Summary of year (books read, pages, hours, top genre, top author)

### Events & Programmes

- **Types**: Webinar, live Q&A, author talk, workshop
- **RSVP**: Readers RSVP, auto-reminder 24hrs before
- **Registration**: Limited capacity optional
- **Recording**: Capture and archive with transcript
- **Resources**: Attach discussion guides, slides, links

---

## 4. Database Models Needed

### Core User & Auth (Priority: 1)

```
users
├── Basic auth (email, password_hash, status: active|suspended|banned|deleted)
├── Social accounts (Google, Facebook, SSO provider, provider_id)
├── 2FA (two_factor_enabled, two_factor_secret, backup_codes)
├── Profile (full_name, avatar_url, bio, favourite_genres, reading_language)
├── Subscription (active_subscription_id, plan_id, plan_override_by_admin)
├── Institutional (institution_id, sso_subject, sso_provider)
├── Referral (referral_code, referred_by_code)
├── Activity (last_login_at, deletion_requested_at, deleted_at, created_at, updated_at)
├── Timestamps & soft delete

author_profiles (1:1 with users)
├── display_name, slug (unique), photo_url, bio, website
├── social_links (Twitter, Instagram, Facebook, LinkedIn, YouTube)
├── genre_tags[], badge_status, badge_approved_at
├── follower_count (denormalised)

publisher_accounts
├── owner_user_id, brand_name, slug (unique), logo_url
├── members[] (embedded: user_id, role, invited_at, joined_at)
├── seat_limit, tax_id, country, currency
├── status (active|suspended)
```

### Subscription & Billing (Priority: 2)

```
subscription_plans (Admin-created)
├── _id: "basic"|"standard"|"premium" (human readable)
├── name, description, price_monthly, price_annual, currency
├── features[], download_limit_per_month, simultaneous_devices
├── offline_reading, audiobook_access, research_tools, ai_recommendations
├── trial_days, is_active, display_order

subscriptions
├── user_id (unique), plan_id, billing_cycle (monthly|annual)
├── status (trialing|active|past_due|paused|cancelled|expired)
├── trial_ends_at, trial_converted_at
├── current_period_start, current_period_end, renewal_date, cancelled_at
├── payment_method_id, promo_code_applied, discount_percent
├── gateway (stripe|paypal|bkash|nagad), gateway_subscription_id
├── downloads_used_this_period (reset on period start)

payment_methods
├── user_id, type (card|paypal|bkash|nagad|bank_transfer)
├── is_default
├── card (last4, brand, exp_month, exp_year, holder_name) [encrypted]
├── mobile (provider, number) [encrypted]
├── paypal (email)
├── gateway_token (reference, never raw data)

invoices
├── user_id, subscription_id|purchase_id
├── type (subscription|purchase)
├── status (draft|open|paid|void|uncollectible)
├── invoice_number (unique), issued_at, paid_at
├── line_items[], subtotal, tax, total, currency
├── gateway_invoice_id, pdf_url

promo_codes
├── code (unique, uppercase), discount_type (percentage|fixed), discount_value
├── applies_to (first_month|first_year|all_periods)
├── eligible_plans[], max_uses, per_user_limit
├── total_used (denormalised), expires_at, is_active
├── created_by (admin)
```

### Content & Catalogue (Priority: 3)

```
titles
├── author_id, co_authors[] (user_id, revenue_share_percent)
├── publisher_id (optional)
├── title, subtitle, slug (unique), isbn (sparse unique)
├── language, publication_date, page_count (ebook), duration_seconds (audio)
├── series_id, series_order
├── genres[], tags[], synopsis, cover_url
├── formats[] (ebook|audiobook|pdf), status (draft|submitted|under_review|revision_requested|approved|published|unpublished|withdrawn)
├── rejection_reason (code, message, rejected_at, rejected_by)
├── access_model (subscription|purchase|both), purchase_price, currency
├── rights (simultaneous_copies, loan_duration_days, geo_availability, drm_enabled, licence_model, expiry, free_access_window)
├── stats (denormalised: total_reads, total_purchases, active_borrows, holds_count, average_rating, review_count, completion_rate)
├── featured, staff_pick, created_at, updated_at, deleted_at

title_files
├── title_id, upload_id, format (ebook|audiobook|pdf|reading_guide|author_notes)
├── mime_type, storage_url (private S3), cdn_url (optional, post-processing)
├── filename_original, size_bytes, version (increments on re-upload)
├── is_current, changelog, processing_status (pending|processing|ready|failed)
├── drm_applied, drm_provider (LCP|Adobe|none)
├── uploaded_by, created_at, deleted_at (soft delete)

series
├── author_id, publisher_id (optional)
├── name, slug (unique), description, cover_url, genres[]
├── instalments[] (denormalised: title_id, order, title_name)
├── instalment_count, is_complete

bundles
├── author_id, publisher_id (optional)
├── name, description, cover_url, title_ids[] (ordered)
├── pricing (bundle_price, currency, individual_total, savings_percent)
├── access_model (purchase|subscription|both)
├── active, available_from, available_until
```

### Circulation & Access (Priority: 4)

```
borrows
├── user_id, title_id, format (ebook|audiobook|pdf)
├── status (active|returned|expired|renewed)
├── borrowed_at, due_at, returned_at
├── auto_returned (boolean)
├── renewals[] (renewed_at, new_due_at), renewal_count, max_renewals

purchases
├── user_id, title_id, format (ebook|audiobook|pdf|all)
├── amount, currency, payment_method_id, invoice_id
├── gateway (stripe|paypal|bkash), gateway_payment_id
├── status (completed|refunded|disputed)
├── refunded_at, created_at

holds
├── user_id, title_id, format (ebook|audiobook|pdf)
├── status (waiting|available|expired|cancelled|fulfilled)
├── queue_position (recalculated on fulfillment/cancellation)
├── placed_at, available_at (when copy freed), expires_at
├── notified_at, fulfilled_at

downloads
├── user_id, title_id, borrow_id|purchase_id
├── format, device_id (fingerprint), device_name
├── downloaded_at, expires_at (tied to loan/subscription), removed_at
├── file_id (ref to title_files)
```

### Reading Experience (Priority: 5)

```
reading_progress
├── user_id, title_id (unique compound)
├── ebook (cfi position, chapter, percentage, last_updated_at, last_device_id)
├── audiobook (position_seconds, chapter, percentage, last_updated_at, last_device_id)
├── total_reading_seconds (cumulative)
├── sessions[] (last 30: started_at, ended_at, seconds, format, device_id)
├── completed, completed_at

highlights
├── user_id, title_id, format (ebook|pdf)
├── cfi_start, cfi_end, selected_text, color (yellow|green|blue|pink)
├── chapter, note (optional), shared_club_id (optional)

annotations
├── user_id, title_id, cfi, chapter, note, page_reference
├── shared_club_id (optional), created_at, deleted_at

reader_settings
├── user_id (1:1), font_family, font_size, line_spacing, margin
├── theme (light|dark|sepia|system)
├── text_to_speech_enabled, high_contrast, colour_blind_mode
├── audio_playback_speed, sleep_timer_minutes
├── page_turn_animation, show_progress_bar
```

### Community & Social (Priority: 6)

```
reviews
├── title_id, user_id, rating (1-5), headline, body
├── status (pending|approved|removed), moderated_by, removal_reason
├── report_count, reported_by[], like_count, liked_by[]
├── comment_count, comments[] (embedded: _id, user_id, user_name, body, created_at, deleted_at)
├── author_reply (body, replied_at, updated_at), contains_spoiler, format_read

follows
├── follower_id, followed_id, followed_type (reader|author)
├── created_at (unique compound: follower_id + followed_id)

book_clubs
├── owner_id, name, slug (unique), description, cover_url
├── genre_focus[], current_title_id (optional), is_public
├── member_limit, member_count (denormalised)

book_club_members
├── club_id, user_id (unique compound), role (owner|moderator|member)
├── joined_at, left_at (optional)

discussions
├── club_id, title_id (optional), parent_id (optional, null = root thread)
├── depth (0=root, 1=reply, 2=reply-to-reply, max 2)
├── author_id, body, annotation_ids[]
├── status (visible|removed|flagged), report_count
├── like_count, reply_count (root posts only)
```

### Reading Goals & Gamification (Priority: 7)

```
reading_goals
├── user_id, year, month (optional, null = yearly)
├── target_books, target_pages (optional), target_hours (optional)
├── books_completed, pages_read, hours_read (denormalised progress)
├── current_streak_days, longest_streak_days
├── last_read_date, created_at, updated_at

badges (Admin-defined)
├── code (unique), name, description, icon_url
├── category (reading|social|milestone|genre|streak)
├── trigger (type, threshold)
├── is_active

user_badges
├── user_id, badge_id, badge_code (denormalised)
├── earned_at (unique compound: user_id + badge_id)
```

### Authors & Publishers (Priority: 8)

```
royalties
├── author_id, publisher_id (optional), title_id
├── period_start, period_end
├── subscription_reads, purchases
├── formula_snapshot (rate, calculation details), gross_amount, platform_commission, net_amount
├── currency, revenue_shares[] (co-author breakdown)
├── status (calculated|approved|paid|disputed|corrected)
├── approved_by, payout_id (optional)

payout_methods
├── user_id, is_default, type (bank_transfer|paypal|bkash|nagad)
├── bank (bank_name, account_number_last4, routing_number, swift_code) [encrypted]
├── mobile (provider, number) [encrypted]
├── paypal (email)
├── currency, country

payout_requests
├── user_id, payout_method_id, royalty_ids[] (included royalties)
├── amount, currency, type (manual_request|scheduled_auto)
├── status (pending|approved|processing|completed|failed|disputed|corrected)
├── approved_by, processed_at, gateway_transaction_id
```

### Notifications & Communication (Priority: 9)

```
notifications
├── user_id, type (hold_available|new_follower|review_liked|etc.)
├── title, body, action_url, action_label
├── ref_type (title|event|review|club|payout), ref_id
├── read, read_at
├── created_at, expires_at (TTL), deleted_at

saved_searches
├── user_id, name, query (embedded filter state)
├── alert_enabled, last_alerted_at, last_run_at

announcements (Author broadcasts)
├── author_id, subject, body, title_id (optional)
├── channel (email|in_app|both)
├── status (draft|scheduled|sent|cancelled)
├── scheduled_at, sent_at, recipient_count, open_count (email)

broadcasts (Platform-wide)
├── created_by, subject, body, channel (email|push|in_app|all)
├── audience (roles[], plans[], regions[], institution_ids[])
├── status (draft|scheduled|sent|cancelled)
├── scheduled_at, sent_at, recipient_count
```

### Admin & Operations (Priority: 10)

```
audit_logs (Immutable)
├── actor_id, actor_role (admin|staff)
├── action (user.suspended, title.approved, royalty.processed, etc.)
├── target_type, target_id
├── before, after (document snapshots before/after)
├── ip_address, user_agent
├── created_at (no updates)

support_tickets
├── ticket_number (unique), submitter_id|null, submitter_email, submitter_name
├── submitter_role (reader|author|publisher|guest)
├── subject, category (billing|access|content|account|technical|other)
├── priority (low|medium|high|urgent)
├── status (open|in_progress|waiting_user|resolved|closed)
├── assigned_to, sla_due_at
├── messages[] (embedded thread)
├── satisfaction_score (CSAT)

dmca_requests
├── complainant (name, email, organisation, country)
├── infringing_title_id, infringing_url
├── original_work_description, evidence_urls[]
├── status (received|under_review|actioned|rejected|counter_noticed)
├── actioned_at, actioned_by, action_taken
├── counter_notice (submitted_at, submitted_by, statement)

piracy_reports
├── reported_by (optional), title_id, infringing_url
├── description, evidence_screenshot_url
├── status (open|investigating|actioned|dismissed)
├── action_taken (dmca_sent|url_reported|no_action)

system_config (Singleton: _id = 'platform_config')
├── registration_open, require_email_verification
├── allow_social_login, allow_sso
├── default_loan_duration_days, hold_expiry_days
├── supported_formats[], supported_languages[]
├── session_timeout_minutes, drm_provider
├── payment_gateways (config per gateway)
├── royalty_defaults (rates, commission, thresholds)
├── cdn_base_url, maintenance_mode, updated_at, updated_by

institutions
├── name, slug (unique), type (university|school|corporate|public_library|government)
├── country, sso_provider (saml|ldap|none), sso_config
├── allowed_ip_ranges[]
├── plan_id, seat_limit, active_seat_count (denormalised)
├── contract_start, contract_end, auto_renew
├── billing_contact (name, email), invoice_frequency
├── status (active|suspended|expired)
```

### Integration & System (Priority: 11)

```
webhooks (Author-managed)
├── user_id, url, secret (hashed)
├── events[], is_active, failure_count, last_triggered_at, last_failure_at
├── last_failure_reason, created_at, deleted_at

api_keys (Author-managed)
├── user_id, name, key_prefix, key_hash
├── last4 (for display), scopes[], last_used_at
├── expires_at, is_active, created_at, revoked_at

uploads (Pre-signed URL flow)
├── user_id, filename_original, content_type, size_bytes
├── presigned_url, presigned_expires_at
├── status (initiated|uploaded|confirmed|processing|ready|failed)
├── error, title_id, format, file_id
├── created_at

jobs (Async job tracking)
├── type (report_generation|bulk_metadata|catalogue_audit|bulk_user_import|royalty_calculation|data_export)
├── initiated_by, status (pending|processing|done|failed)
├── input (job-specific params), result_url, error, progress_percent
├── created_at, started_at, completed_at, expires_at (result TTL)
```

---

## 5. API Endpoints List (By Module & Priority)

### Authentication & Public (Priority: 1 - MVP)

```
POST   /auth/register                 → Create reader/author/publisher account
POST   /auth/login                    → Email/password login
POST   /auth/logout                   → Revoke current session
POST   /auth/refresh                  → Refresh JWT token pair
POST   /auth/password/forgot          → Request password reset email
POST   /auth/password/reset           → Reset password via OTP/token
POST   /auth/password/change          → Change password (authenticated)
POST   /auth/email/verify             → Verify email with token
POST   /auth/email/resend-verification → Resend verification email
POST   /auth/2fa/enable               → Enable TOTP 2FA
POST   /auth/2fa/disable              → Disable 2FA
POST   /auth/2fa/verify               → Verify TOTP code
GET    /auth/sso/providers            → List configured SSO providers
GET    /auth/sso/{provider}/redirect  → Initiate SSO flow
GET    /auth/sso/{provider}/callback  → SSO callback handler
POST   /auth/social/{provider}        → Social login (Google, Facebook)
GET    /auth/sessions                 → List active sessions
DELETE /auth/sessions/{session_id}    → Revoke specific session
DELETE /auth/sessions                 → Revoke all sessions
```

### Public Browse & Discovery (Priority: 1 - MVP)

```
GET    /catalogue                     → Browse catalogue with filters (cursor pagination)
       ?genre=&format=&language=&rating_min=&publication_year_from|to=&availability=&sort=
GET    /catalogue/featured            → Featured titles shelf
GET    /catalogue/trending            → Trending titles
GET    /catalogue/new-releases        → New arrivals
GET    /catalogue/staff-picks         → Admin-curated staff picks
GET    /catalogue/curated-shelves     → List curated shelves
GET    /catalogue/curated-shelves/{slug} → Get specific curated shelf
GET    /search                        → Full-text search
GET    /search/suggestions            → Auto-complete suggestions
GET    /titles/{title_id}             → Title detail page
GET    /titles/{title_id}/related     → Related titles
GET    /titles/{title_id}/series      → Series continuation
GET    /titles/{title_id}/preview     → Free sample (embedded reader)
GET    /titles/{title_id}/audio-preview → Audiobook sample stream
GET    /titles/{title_id}/toc         → Table of contents
GET    /titles/{title_id}/reviews     → Title reviews
GET    /authors/{author_id}           → Public author profile
GET    /authors/{author_id}/titles    → Author bibliography
GET    /authors/{author_id}/events    → Author upcoming events
GET    /plans                         → List subscription plans
GET    /plans/{plan_id}               → Get plan details
GET    /events                        → List public events
GET    /events/{event_id}             → Event detail
GET    /events/calendar               → Event calendar view
GET    /reading-lists/public          → Public reading lists
GET    /reading-lists/{list_id}       → Public list detail
GET    /help/articles                 → Help centre articles
GET    /help/articles/{slug}          → Specific help article
GET    /help/faqs                     → FAQ list
GET    /legal/terms                   → Terms of Service
GET    /legal/privacy                 → Privacy Policy
GET    /legal/refund                  → Refund Policy
GET    /legal/cookies                 → Cookie Policy
POST   /support/contact               → Contact form submission
GET    /about                         → About page content
```

### Reader Account & Subscription (Priority: 1 - MVP)

```
GET    /me                            → Get current user profile
PATCH  /me                            → Update profile (name, bio, genres, language)
DELETE /me                            → Request account deletion
PUT    /me/avatar                     → Upload profile avatar
DELETE /me/avatar                     → Remove avatar
GET    /me/preferences                → Get reading preferences
PUT    /me/preferences                → Update preferences
GET    /me/privacy                    → Get privacy settings
PUT    /me/privacy                    → Update privacy (history visibility, list visibility)
GET    /me/notifications/settings     → Get notification preferences
PUT    /me/notifications/settings     → Update notification preferences
GET    /me/devices                    → List logged-in devices
DELETE /me/devices/{device_id}        → Sign out device

GET    /me/subscription               → Current subscription status
POST   /me/subscription               → Create/upgrade subscription
PATCH  /me/subscription               → Modify subscription (plan change)
DELETE /me/subscription               → Cancel subscription
POST   /me/subscription/reactivate    → Resume paused subscription
POST   /me/subscription/promo         → Apply promo code
GET    /me/subscription/invoices      → Invoice history
GET    /me/subscription/invoices/{id} → Specific invoice (download PDF)
GET    /me/billing/methods            → Saved payment methods
POST   /me/billing/methods            → Add payment method
DELETE /me/billing/methods/{method_id} → Remove payment method
PUT    /me/billing/methods/{id}/default → Set default payment method
```

### Reader Discovery & Search (Priority: 2)

```
GET    /search                        → Authenticated search (user preferences applied)
POST   /search/saved                  → Save search query with alerts
GET    /search/saved                  → List saved searches
DELETE /search/saved/{id}             → Delete saved search
GET    /recommendations               → Personalised recommendations
GET    /recommendations/mood          → Mood-based suggestions
GET    /recommendations/theme         → Theme-based suggestions
GET    /recommendations/reading-time  → Time estimate filtering
GET    /titles/{title_id}/also-enjoyed → "Readers also enjoyed" suggestions
```

### Reader Borrowing & Access (Priority: 2)

```
POST   /borrows                       → Borrow/access title
GET    /borrows                       → My active borrows
GET    /borrows/{borrow_id}           → Specific borrow detail
POST   /borrows/{borrow_id}/renew     → Renew loan (within limits)
DELETE /borrows/{borrow_id}           → Return title early

POST   /purchases                     → Purchase individual title
GET    /purchases                     → My purchases
GET    /purchases/{purchase_id}       → Specific purchase

POST   /holds                         → Place hold on title
GET    /holds                         → My active holds
DELETE /holds/{hold_id}               → Cancel hold
GET    /titles/{title_id}/availability → Check availability + queue position

POST   /downloads                     → Download for offline access
GET    /downloads                     → My downloads
DELETE /downloads/{download_id}       → Remove offline download
```

### Reader Reading Engine (Priority: 2)

```
GET    /reader/{title_id}/session     → Get or create reading session
POST   /reader/{title_id}/progress    → Save reading position (auto-sync)
GET    /reader/{title_id}/progress    → Get reading position (all devices)

POST   /reader/{title_id}/highlights  → Create highlight
GET    /reader/{title_id}/highlights  → List highlights
PATCH  /reader/{title_id}/highlights/{id} → Update highlight note
DELETE /reader/{title_id}/highlights/{id} → Delete highlight

POST   /reader/{title_id}/annotations → Create annotation
GET    /reader/{title_id}/annotations → List annotations
PATCH  /reader/{title_id}/annotations/{id} → Update annotation
DELETE /reader/{title_id}/annotations/{id} → Delete annotation

GET    /reader/{title_id}/dictionary  → Word lookup (uses API)
GET    /reader/{title_id}/translate   → Translate passage (uses API)

GET    /reader/settings               → Reader display settings
PUT    /reader/settings               → Update reader settings (fonts, theme, TTS)
```

### Reader Lists & Organisation (Priority: 3)

```
GET    /me/lists                      → My reading lists
POST   /me/lists                      → Create reading list
GET    /me/lists/{list_id}            → List detail + titles
PATCH  /me/lists/{list_id}            → Update list (name, description)
DELETE /me/lists/{list_id}            → Delete list

POST   /me/lists/{list_id}/titles     → Add title to list
DELETE /me/lists/{list_id}/titles/{id} → Remove title from list
GET    /me/lists/{list_id}/export     → Export list as CSV

POST   /me/tags                       → Tag a title
GET    /me/tags                       → List user tags
GET    /me/tags/{tag}/titles          → Titles with tag
DELETE /me/tags/{tag}/titles/{title_id} → Remove tag
```

### Reader Goals & Gamification (Priority: 4)

```
GET    /me/goals                      → Current reading goal
PUT    /me/goals                      → Set/update goal
GET    /me/stats                      → Reading statistics (lifetime)
GET    /me/stats/wrapped              → Annual reading summary
GET    /me/badges                     → Earned badges
GET    /me/badges/available           → All available badges
```

### Reader Community & Social (Priority: 4)

```
POST   /reviews                       → Submit review + rating
PATCH  /reviews/{review_id}           → Edit my review
DELETE /reviews/{review_id}           → Delete my review
POST   /reviews/{review_id}/likes     → Like a review
DELETE /reviews/{review_id}/likes     → Unlike a review
POST   /reviews/{review_id}/comments  → Comment on review
DELETE /reviews/{review_id}/comments/{id} → Delete my comment

POST   /follows/readers/{reader_id}   → Follow reader
DELETE /follows/readers/{reader_id}   → Unfollow reader
POST   /follows/authors/{author_id}   → Follow author
DELETE /follows/authors/{author_id}   → Unfollow author
GET    /me/following                  → List I follow
GET    /me/followers                  → My followers list
GET    /me/feed                       → Social feed (followed activity)

POST   /book-clubs                    → Create book club
GET    /book-clubs                    → Search public clubs
GET    /book-clubs/{club_id}          → Club detail
PATCH  /book-clubs/{club_id}          → Update club (owner only)
DELETE /book-clubs/{club_id}          → Delete club (owner only)
POST   /book-clubs/{club_id}/members  → Join club
DELETE /book-clubs/{club_id}/members/me → Leave club
GET    /book-clubs/{club_id}/discussions → Club discussions thread
POST   /book-clubs/{club_id}/discussions → Start discussion
POST   /book-clubs/{club_id}/discussions/{thread_id}/replies → Reply to discussion
GET    /book-clubs/{club_id}/shared-annotations → Shared highlights
POST   /me/share/title/{title_id}     → Share title to social media

POST   /citations                     → Create citation
GET    /me/citations                  → My citations
DELETE /me/citations/{id}             → Delete citation
GET    /me/citations/export           → Export bibliography
POST   /me/citations/bibliography     → Build formatted bibliography

POST   /events/{event_id}/rsvp        → RSVP to event
DELETE /events/{event_id}/rsvp        → Cancel RSVP
GET    /me/events                     → My upcoming events
GET    /me/notifications              → My notification inbox
PATCH  /me/notifications/{id}         → Mark notification as read
POST   /me/notifications/read-all     → Mark all as read
DELETE /me/notifications/{id}         → Delete notification
```

### Author / Publisher Account & Profile (Priority: 3)

```
GET    /me/author-profile             → Get author profile
PUT    /me/author-profile             → Update author profile (bio, links, genres)
PATCH  /me/author-profile             → Partial update
PUT    /me/author-profile/photo       → Upload author photo
GET    /me/author-profile/badge-status → Verified badge application status
POST   /me/author-profile/badge-request → Apply for verified author badge
GET    /me/followers                  → Follower list
GET    /me/follower-count             → Total follower count

GET    /me/publisher                  → Get publisher org details
PUT    /me/publisher                  → Update org info (brand, about, contact)
PUT    /me/publisher/logo             → Upload org logo
GET    /me/publisher/members          → Team member list
POST   /me/publisher/members          → Invite team member
PATCH  /me/publisher/members/{user_id} → Change member role
DELETE /me/publisher/members/{user_id} → Remove team member
```

### Author Content Upload & Management (Priority: 3)

```
GET    /titles/mine                   → My titles (all statuses)
POST   /titles                        → Create title (draft)
GET    /titles/{title_id}             → Title detail (if owner)
PATCH  /titles/{title_id}             → Update title metadata
DELETE /titles/{title_id}             → Delete/unpublish title

POST   /titles/{title_id}/submit      → Submit for admin review
POST   /titles/{title_id}/unpublish   → Withdraw published title
POST   /titles/{title_id}/republish   → Republish unpublished title

POST   /titles/bulk                   → Bulk import titles (CSV/ONIX)

PUT    /titles/{title_id}/cover       → Upload cover image
POST   /titles/{title_id}/cover/crop  → Crop cover image

POST   /titles/{title_id}/files       → Upload file (EPUB, MP3, etc.)
GET    /titles/{title_id}/files       → File versions
DELETE /titles/{title_id}/files/{file_id} → Delete specific version

GET    /titles/{title_id}/versions    → Version history
POST   /titles/{title_id}/versions/{id}/restore → Restore previous version

GET    /isbn-lookup/{isbn}            → Auto-fill metadata from ISBN
```

### Author Series & Bundles (Priority: 4)

```
GET    /me/series                     → My series
POST   /me/series                     → Create series
GET    /me/series/{series_id}         → Series detail
PATCH  /me/series/{series_id}         → Update series
DELETE /me/series/{series_id}         → Delete series
POST   /me/series/{series_id}/titles  → Add title to series
PATCH  /me/series/{series_id}/titles/{id} → Reorder title
DELETE /me/series/{series_id}/titles/{id} → Remove from series

GET    /me/bundles                    → My bundles
POST   /me/bundles                    → Create bundle
PATCH  /me/bundles/{bundle_id}        → Update bundle
DELETE /me/bundles/{bundle_id}        → Delete bundle
```

### Author Rights & Licensing (Priority: 3)

```
GET    /titles/{title_id}/rights      → Get rights configuration
PUT    /titles/{title_id}/rights      → Update rights (access model, DRM, geo, etc.)
```

### Author Analytics & Reporting (Priority: 3)

```
GET    /me/analytics/overview         → Dashboard summary
GET    /me/analytics/titles/{title_id} → Per-title analytics
GET    /me/analytics/engagement       → Engagement metrics + drop-off
GET    /me/analytics/geography        → Geographic readership breakdown
GET    /me/analytics/discoverability  → Search appearance, CTR
GET    /me/analytics/referrals        → Traffic source breakdown
GET    /me/analytics/revenue          → Earnings breakdown
GET    /me/analytics/reports          → Saved reports list
POST   /me/analytics/reports          → Generate custom report
GET    /me/analytics/reports/{report_id} → Download report
POST   /me/analytics/reports/schedule → Schedule automated reports
GET    /me/analytics/reports/schedule → View scheduled reports
DELETE /me/analytics/reports/schedule/{id} → Cancel scheduled report
```

### Author Revenue & Royalties (Priority: 3)

```
GET    /me/royalties/dashboard        → Royalty earnings overview
GET    /me/royalties/history          → Past royalty periods
GET    /me/royalties/upcoming         → Upcoming payment date
GET    /me/royalties/breakdown/{title_id} → Per-title royalty breakdown
GET    /me/royalties/formula          → Royalty calculation formula
POST   /me/royalties/payout-request   → Request manual payout
GET    /me/royalties/payout-methods   → Configured payout methods
POST   /me/royalties/payout-methods   → Add payout method
DELETE /me/royalties/payout-methods/{id} → Remove payout method
PUT    /me/royalties/payout-methods/{id}/default → Set default method
PATCH  /me/royalties/settings         → Update threshold, currency
GET    /me/royalties/invoices         → Payout invoices
GET    /me/royalties/contracts        → Stored contracts
GET    /me/royalties/tax-documents    → Tax documents
POST   /me/royalties/tax-documents    → Upload tax document
```

### Author Promotion & Marketing (Priority: 4)

```
POST   /me/promotions/placement-request → Request featured placement
GET    /me/promotions/placement-requests → My placement requests
DELETE /me/promotions/placement-requests/{id} → Cancel request

POST   /me/promotions/banners         → Create promo banner
GET    /me/promotions/banners         → My banners
DELETE /me/promotions/banners/{id}    → Remove banner

POST   /me/promotions/preorders       → Create pre-order
GET    /me/promotions/preorders       → My pre-orders
PATCH  /me/promotions/preorders/{id}  → Update pre-order
DELETE /me/promotions/preorders/{id}  → Cancel pre-order

POST   /me/promotions/free-windows    → Create free-access window
GET    /me/promotions/free-windows    → My free windows
DELETE /me/promotions/free-windows/{id} → Remove free window

GET    /titles/{title_id}/widget-embed → Embed code for title widget

POST   /me/affiliate-links            → Generate tracking link
GET    /me/affiliate-links            → My affiliate links
```

### Author Community & Engagement (Priority: 4)

```
POST   /reviews/{review_id}/author-reply → Reply to reader review
PATCH  /reviews/{review_id}/author-reply → Edit reply
DELETE /reviews/{review_id}/author-reply → Delete reply

GET    /me/events                     → My hosted events
POST   /me/events                     → Create event
PATCH  /me/events/{event_id}          → Update event
DELETE /me/events/{event_id}          → Cancel event
GET    /me/events/{event_id}/attendees → RSVP list

POST   /me/book-club-kits             → Create discussion kit
GET    /me/book-club-kits             → My kits
PATCH  /me/book-club-kits/{kit_id}    → Update kit
DELETE /me/book-club-kits/{kit_id}    → Delete kit

POST   /me/announcements              → Send newsletter
GET    /me/announcements              → My announcements

GET    /me/reader-questions           → Questions submitted to me
POST   /me/reader-questions/{id}/answer → Answer question
```

### Author Technical & Integration (Priority: 4)

```
GET    /me/integrations/onix-feed    → ONIX feed for aggregators
GET    /me/api-keys                   → My API keys
POST   /me/api-keys                   → Create API key
DELETE /me/api-keys/{key_id}          → Revoke API key

GET    /me/webhooks                   → My webhooks
POST   /me/webhooks                   → Create webhook subscription
PATCH  /me/webhooks/{webhook_id}      → Update webhook
DELETE /me/webhooks/{webhook_id}      → Delete webhook
POST   /me/webhooks/{webhook_id}/test → Test webhook
```

### Admin User Management (Priority: 2)

```
GET    /admin/users                   → Search/list users
GET    /admin/users/{user_id}         → User detail
POST   /admin/users                   → Create user
PATCH  /admin/users/{user_id}         → Update user
DELETE /admin/users/{user_id}         → Delete user

POST   /admin/users/{user_id}/suspend → Suspend user
POST   /admin/users/{user_id}/unsuspend → Unsuspend user
POST   /admin/users/{user_id}/warn    → Issue warning
POST   /admin/users/{user_id}/ban     → Ban user
POST   /admin/users/{user_id}/unban   → Unban user

POST   /admin/users/{user_id}/password-reset → Force password reset
POST   /admin/users/{user_id}/verify-email   → Mark email verified
GET    /admin/users/{user_id}/activity      → User activity log
PATCH  /admin/users/{user_id}/role          → Change role
PATCH  /admin/users/{user_id}/plan          → Override plan
POST   /admin/users/bulk-import             → Import users from CSV

GET    /admin/institutions            → List institutions
POST   /admin/institutions            → Create institution
PATCH  /admin/institutions/{id}       → Update institution
DELETE /admin/institutions/{id}       → Delete institution
POST   /admin/institutions/{id}/users → Add user to institution
DELETE /admin/institutions/{id}/users/{uid} → Remove user
```

### Admin Catalogue Management (Priority: 2)

```
GET    /admin/titles                  → All titles (searchable)
POST   /admin/titles                  → Create title (override)
PATCH  /admin/titles/{title_id}       → Edit any title
DELETE /admin/titles/{title_id}       → Remove title

GET    /admin/titles/review-queue     → Pending author submissions
POST   /admin/titles/{title_id}/approve → Approve submitted title
POST   /admin/titles/{title_id}/reject → Reject with reason
POST   /admin/titles/{title_id}/request-revision → Request changes
GET    /admin/titles/audit            → Catalogue audit (missing metadata, broken files)
POST   /admin/titles/batch-metadata   → Bulk metadata edit

GET    /admin/shelves                 → Curated shelves
POST   /admin/shelves                 → Create shelf
PATCH  /admin/shelves/{shelf_id}      → Update shelf
DELETE /admin/shelves/{shelf_id}      → Delete shelf
POST   /admin/shelves/{shelf_id}/titles → Add title to shelf
DELETE /admin/shelves/{shelf_id}/titles/{id} → Remove title
PATCH  /admin/shelves/{shelf_id}/titles/{id}/order → Reorder title

PATCH  /admin/titles/{title_id}/access-limits → Override simultaneous copies
PATCH  /admin/titles/{title_id}/loan-duration → Override loan duration
```

### Admin Circulation & Access (Priority: 2)

```
GET    /admin/circulation             → Active borrows, purchases, holds
GET    /admin/circulation/overdue     → Overdue items
GET    /admin/circulation/holds       → All holds queue
PATCH  /admin/circulation/{access_id} → Modify access (override)
POST   /admin/circulation/override    → Force borrow/return
GET    /admin/circulation/rules       → System circulation rules
PUT    /admin/circulation/rules       → Update rules
```

### Admin Subscription & Financial (Priority: 3)

```
GET    /admin/subscriptions           → List all subscriptions (filter by status)
GET    /admin/subscriptions/{sub_id}  → Subscription detail
PATCH  /admin/subscriptions/{sub_id}  → Modify subscription (downgrade, extend)
POST   /admin/subscriptions/{sub_id}/refund → Process refund
GET    /admin/subscriptions/failed-payments → Failed charge queue
POST   /admin/subscriptions/{sub_id}/retry → Retry failed payment

GET    /admin/plans                   → Subscription plans
POST   /admin/plans                   → Create plan
PATCH  /admin/plans/{plan_id}         → Update plan
DELETE /admin/plans/{plan_id}         → Archive plan

GET    /admin/promo-codes             → All promo codes
POST   /admin/promo-codes             → Create promo code
PATCH  /admin/promo-codes/{code_id}   → Update code
DELETE /admin/promo-codes/{code_id}   → Deactivate code
GET    /admin/promo-codes/{code_id}/usage → Code usage stats

GET    /admin/billing/gateway         → Payment gateway config
PUT    /admin/billing/gateway         → Update gateway settings
```

### Admin Content Moderation (Priority: 3)

```
GET    /admin/reviews                 → All reviews (filter by status)
GET    /admin/reviews/reported        → Flagged reviews
POST   /admin/reviews/{review_id}/approve → Approve review
POST   /admin/reviews/{review_id}/remove  → Remove review

GET    /admin/discussions/reported    → Flagged discussions
POST   /admin/discussions/{post_id}/remove → Remove discussion post

GET    /admin/reports                 → User reports/flags
PATCH  /admin/reports/{report_id}     → Update report status (investigated)

GET    /admin/community-guidelines    → Current guidelines
PUT    /admin/community-guidelines    → Update + version guidelines
```

### Admin Author & Publisher Management (Priority: 3)

```
GET    /admin/authors                 → List authors
GET    /admin/authors/{author_id}     → Author detail + stats
GET    /admin/publishers              → List publishers
GET    /admin/publishers/{pub_id}     → Publisher detail

GET    /admin/authors/{author_id}/analytics → Author performance overview

GET    /admin/badge-applications      → Pending badge requests
POST   /admin/badge-applications/{id}/approve → Approve badge
POST   /admin/badge-applications/{id}/reject  → Reject badge

GET    /admin/placement-requests      → Featured placement requests
POST   /admin/placement-requests/{id}/approve → Approve request
POST   /admin/placement-requests/{id}/reject  → Reject request
```

### Admin Financial & Royalty (Priority: 3)

```
GET    /admin/royalties               → All royalty periods
GET    /admin/royalties/{payout_id}   → Specific payout
POST   /admin/royalties/{payout_id}/approve → Approve payout
POST   /admin/royalties/{payout_id}/process → Process payout
POST   /admin/royalties/{payout_id}/dispute → Dispute payout
PATCH  /admin/royalties/{payout_id}/correction → Correct amount

GET    /admin/royalties/formulas      → Royalty rate configuration
PUT    /admin/royalties/formulas      → Update rates + formula

GET    /admin/royalties/schedule      → Payout schedule
PUT    /admin/royalties/schedule      → Update schedule

GET    /admin/financial/summary       → Platform financial summary
GET    /admin/financial/tax-settings  → Tax compliance settings
PUT    /admin/financial/tax-settings  → Update tax config
```

### Admin Events Management (Priority: 4)

```
GET    /admin/events                  → All events
POST   /admin/events                  → Create platform event
PATCH  /admin/events/{event_id}       → Update event
DELETE /admin/events/{event_id}       → Cancel event

GET    /admin/events/{event_id}/attendees → RSVP list
POST   /admin/events/{event_id}/invitations → Send invitations
GET    /admin/events/{event_id}/feedback   → Post-event feedback

GET    /admin/events/archive          → Past events
GET    /admin/events/integrations     → Event provider config
PUT    /admin/events/integrations     → Update integrations (Zoom, etc.)
```

### Admin Analytics (Priority: 3)

```
GET    /admin/analytics/overview      → Platform summary (users, revenue, reads)
GET    /admin/analytics/users         → User growth, retention, churn
GET    /admin/analytics/subscriptions → MRR, ARR, trial conversion, churn
GET    /admin/analytics/circulation   → Borrow/hold/download stats
GET    /admin/analytics/engagement    → DAU, MAU, session length, completion rate
GET    /admin/analytics/search        → Top searches, zero-result queries, filter usage
GET    /admin/analytics/authors       → Author performance, new uploads
GET    /admin/analytics/revenue       → Total revenue, by gateway, by plan
GET    /admin/analytics/reports       → Saved reports list
POST   /admin/analytics/reports       → Generate custom report
GET    /admin/analytics/reports/{id}  → Download report
POST   /admin/analytics/reports/schedule → Schedule automated reports
DELETE /admin/analytics/reports/schedule/{id} → Cancel scheduled report
```

### Admin System Configuration (Priority: 2)

```
GET    /admin/config                  → All platform config
PATCH  /admin/config                  → Update config (registration, formats, etc.)

GET    /admin/config/auth-providers   → Auth provider configuration
PUT    /admin/config/auth-providers   → Update OAuth/SSO settings

GET    /admin/config/notifications   → Email/push template config
PUT    /admin/config/notifications/{id} → Update notification template

GET    /admin/config/drm             → DRM provider settings
PUT    /admin/config/drm             → Update DRM config

GET    /admin/config/feature-flags   → Feature flag state
PATCH  /admin/config/feature-flags/{flag} → Toggle feature flag

GET    /admin/config/localisation    → Language/locale config
PUT    /admin/config/localisation    → Update languages, currency

GET    /admin/config/cdn             → CDN configuration
PUT    /admin/config/cdn             → Update CDN settings

GET    /admin/config/api-keys        → Platform API keys (for integrations)
POST   /admin/config/api-keys        → Create platform API key
DELETE /admin/config/api-keys/{key_id} → Revoke platform API key
```

### Admin Security & Compliance (Priority: 2)

```
GET    /admin/audit-logs              → Full audit trail (searchable, exportable)
GET    /admin/security/failed-logins  → Failed login attempts
GET    /admin/security/suspicious-activity → Anomaly detection alerts
GET    /admin/security/sessions       → Active admin/staff sessions
DELETE /admin/security/sessions/{id}  → Revoke admin session

PUT    /admin/security/policy         → Update password policy, session timeout
PUT    /admin/security/2fa-enforcement → Require 2FA for admins

GET    /admin/privacy/data-requests   → GDPR/PDPA data requests
POST   /admin/privacy/data-requests/{id}/export → Export user data
POST   /admin/privacy/data-requests/{id}/delete → Delete user data
GET    /admin/privacy/retention-policies → Data retention schedule
PUT    /admin/privacy/retention-policies → Update retention rules

GET    /admin/dmca                    → DMCA requests
POST   /admin/dmca                    → Log DMCA request
PATCH  /admin/dmca/{id}               → Update DMCA status + action

GET    /admin/piracy-reports          → Piracy reports
POST   /admin/piracy-reports/{id}/action → Take action (send DMCA, report URL)
```

### Admin Support & Communication (Priority: 4)

```
GET    /admin/support/tickets         → Support ticket queue
GET    /admin/support/tickets/{ticket_id} → Ticket detail + thread
POST   /admin/support/tickets         → Create ticket (staff)
PATCH  /admin/support/tickets/{ticket_id} → Update ticket (assign, priority, status)
POST   /admin/support/tickets/{ticket_id}/reply → Add staff reply
POST   /admin/support/tickets/{ticket_id}/close → Close ticket

GET    /admin/support/templates       → Support response templates
POST   /admin/support/templates       → Create template
PATCH  /admin/support/templates/{id}  → Update template
DELETE /admin/support/templates/{id}  → Delete template

GET    /admin/help-centre/articles    → Knowledge base articles
POST   /admin/help-centre/articles    → Create article
PATCH  /admin/help-centre/articles/{id} → Update article
DELETE /admin/help-centre/articles/{id} → Delete article

POST   /admin/broadcasts              → Send platform-wide announcement
GET    /admin/broadcasts              → Broadcast history

GET    /admin/onboarding/flows        → Onboarding flow config
PATCH  /admin/onboarding/flows/{role} → Update onboarding for role

GET    /admin/surveys                 → NPS/CSAT surveys
POST   /admin/surveys                 → Create survey
POST   /admin/surveys/{id}/trigger    → Send survey
GET    /admin/surveys/{id}/responses  → Collect responses
```

### Webhooks & Events (All authenticated users can subscribe)

```
Webhook Events:
- title.submitted → Author submitted title for review
- title.approved → Title published after approval
- title.rejected → Title rejected by admin
- title.read → Reader accessed title
- title.purchased → Title purchased
- title.returned → Borrowed title returned
- title.hold_available → Held title available for user
- user.registered → New user account created
- user.subscribed → User subscribed/upgraded
- user.churned → User cancelled subscription
- royalty.calculated → Monthly royalty period calculated
- royalty.paid → Payout processed
- review.submitted → Reader submitted review
- review.flagged → Review reported/flagged
- event.rsvp → User RSVP'd to event
- dmca.received → DMCA takedown received
```

---

## 6. Build Order & Phasing Strategy

### Phase 1: Foundation & Infrastructure (Week 1-2)

**Goal**: Project structure, database, auth foundation, error handling

- [ ] Express server setup (middleware: helmet, cors, rate-limit, sanitize)
- [ ] MongoDB connection + Mongoose schemas
- [ ] Winston logging + structured logs
- [ ] Zod validation schemas for all inputs
- [ ] RFC 7807 error handling middleware
- [ ] JWT authentication (access + refresh tokens)
- [ ] Unit test infrastructure (Vitest setup)

### Phase 2: Guest & Public APIs (Week 3-4)

**Goal**: Public browse, discovery, basic auth

**Modules:**

1. **Authentication** (FR-G-050 to FR-G-056)
   - POST /auth/register, login, logout, refresh
   - POST /auth/password/forgot, reset
   - POST /auth/email/verify, resend-verification
   - GET /auth/sso/providers, /auth/sso/{provider}/redirect, /auth/sso/{provider}/callback
   - POST /auth/social/{provider} (Google, Facebook)

2. **Public Catalogue Browse** (FR-G-001 to FR-G-024)
   - GET /catalogue with cursor pagination + filters
   - GET /catalogue/featured, /trending, /new-releases, /staff-picks
   - GET /titles/{id}, /titles/{id}/related, /titles/{id}/series
   - GET /titles/{id}/preview (basic sample)
   - GET /titles/{id}/reviews (basic read)

3. **Public Author & Pricing** (FR-G-030, FR-G-040)
   - GET /authors/{id}, /authors/{id}/titles
   - GET /plans

4. **Search Basics** (FR-G-011 to FR-G-014)
   - GET /search (basic full-text)
   - GET /search/suggestions (autocomplete)

5. **Admin User & Catalogue Management** (Phase 2 admin subset)
   - Create super-admin seed script
   - POST/PATCH /admin/users
   - POST /admin/titles/review-queue endpoints
   - Basic permission checks (RBAC middleware)

### Phase 3: Reader Subscription & Access (Week 5-7)

**Goal**: Reader account, subscription, borrowing, reading

**Modules:**

1. **Reader Account & Subscription** (FR-R-001 to FR-R-010, FR-R-020 to FR-R-026)
   - GET/PATCH /me (profile)
   - GET/POST /me/subscription, PATCH, DELETE
   - POST /me/subscription/promo (apply promo codes)
   - GET /me/subscription/invoices
   - POST/GET/DELETE /me/billing/methods
   - 2FA setup (POST /auth/2fa/enable, /auth/2fa/verify)

2. **Reader Borrowing & Access** (FR-R-040 to FR-R-047)
   - POST /borrows, GET /borrows, POST /borrows/{id}/renew
   - POST /holds, GET /holds, DELETE /holds/{id}
   - POST /purchases, GET /purchases
   - POST /downloads, GET /downloads

3. **Reading Engine Core** (FR-R-050 to FR-R-055)
   - GET/POST /reader/{title_id}/progress (sync)
   - GET /reader/{title_id}/session
   - Basic EPUB/PDF reader (frontend component)
   - PUT /reader/settings

4. **Payment Integration**
   - Stripe webhook handler (subscription events)
   - PayPal integration
   - Invoice generation (PDFKit)

5. **Reading Progress Sync** (Core feature)
   - Real-time synchronization across devices
   - Device fingerprinting
   - Session aggregation

### Phase 4: Author/Publisher Content Management (Week 8-10)

**Goal**: Content upload, rights management, analytics

**Modules:**

1. **Author Profile & Organization** (FR-A-001 to FR-A-006)
   - GET/PUT /me/author-profile
   - GET/PUT /me/publisher (for publishers)
   - Team member management (POST/PATCH/DELETE /me/publisher/members)

2. **Content Upload & Management** (FR-A-010 to FR-A-023)
   - POST /titles (create draft)
   - POST /titles/{id}/files (upload EPUB, PDF, MP3)
   - PUT /titles/{id}/cover (upload cover)
   - POST /titles/{id}/submit (review queue)
   - POST /titles/{id}/unpublish, /republish
   - Bulk upload (CSV/ONIX)
   - ISBN lookup integration

3. **Rights & Licensing** (FR-A-030 to FR-A-036)
   - PUT /titles/{id}/rights (access model, DRM, geo, loan duration)

4. **Analytics** (FR-A-040 to FR-A-046)
   - GET /me/analytics/overview
   - GET /me/analytics/titles/{id}
   - GET /me/analytics/engagement
   - GET /me/analytics/geography
   - GET /me/analytics/discoverability
   - Report generation (CSV, PDF)

5. **Series & Bundles** (FR-A-022, FR-A-023)
   - GET/POST /me/series, /me/bundles
   - Grouping and ordering

### Phase 5: Royalty & Financials (Week 11-12)

**Goal**: Royalty calculation, payout processing

**Modules:**

1. **Royalty Calculation Engine** (Core backend job)
   - Monthly job: aggregate reads/purchases by title
   - Apply formula (rate varies by plan/format)
   - Calculate platform commission
   - Handle co-author splits
   - Trigger royalty calculation

2. **Author Royalty Endpoints** (FR-A-050 to FR-A-057)
   - GET /me/royalties/dashboard
   - GET /me/royalties/history, /upcoming
   - GET /me/royalties/breakdown/{title_id}
   - POST /me/royalties/payout-request
   - GET/POST /me/royalties/payout-methods
   - PATCH /me/royalties/settings

3. **Admin Royalty Management** (FR-AD-022 to FR-AD-026)
   - GET/PATCH /admin/royalties
   - GET/PUT /admin/royalties/formulas
   - GET/PUT /admin/royalties/schedule
   - GET /admin/financial/summary

4. **Payout Integration**
   - Stripe Connect for payouts
   - PayPal API for disbursement
   - Local payment (bKash, Nagad)
   - Tax document storage

### Phase 6: Admin Governance & Compliance (Week 13-14)

**Goal**: Moderation, compliance, system control

**Modules:**

1. **Content Moderation** (FR-AD-030 to FR-AD-034)
   - GET /admin/reviews, /admin/reviews/reported
   - POST /admin/reviews/{id}/approve, /remove
   - DMCA workflow (GET/PATCH /admin/dmca)

2. **Audit & Compliance** (FR-AD-070 to FR-AD-075)
   - Immutable audit logs (all admin actions)
   - GDPR data export/deletion (POST /admin/privacy/data-requests/{id}/export)
   - Failed login tracking
   - Suspicious activity alerts

3. **System Configuration** (FR-AD-060 to FR-AD-065)
   - GET/PATCH /admin/config
   - Auth provider config (OAuth, SSO)
   - Feature flags
   - Email/push template management

4. **Support & Communication** (Admin endpoints)
   - Support ticket queue (GET /admin/support/tickets)
   - Help centre management
   - Broadcast system (POST /admin/broadcasts)

### Phase 7: Community & Advanced Reader Features (Week 15-16)

**Goal**: Social features, reading goals, gamification

**Modules:**

1. **Reviews & Comments** (FR-R-090 to FR-R-092)
   - POST /reviews, PATCH, DELETE
   - Like/comment on reviews
   - Moderation integration

2. **Social Features** (FR-R-093 to FR-R-098)
   - POST /follows/readers/{id}, /follows/authors/{id}
   - GET /me/feed
   - Book clubs (POST /book-clubs, JOIN, discussions)

3. **Reading Goals & Gamification** (FR-R-080 to FR-R-084)
   - POST/GET /me/goals
   - GET /me/stats, /me/stats/wrapped (annual summary)
   - Badge system (GET /me/badges)

4. **Research Tools** (FR-R-100 to FR-R-103)
   - POST /citations
   - Citation formatting (APA, MLA, Chicago, Harvard)
   - Bibliography export

### Phase 8: Events & Promotion (Week 17-18)

**Goal**: Events, author promotion, affiliate tracking

**Modules:**

1. **Events Management** (FR-R-098, FR-A-071, FR-AD-040)
   - GET /events, /events/{id}
   - POST /events/{id}/rsvp
   - Admin event creation (POST /admin/events)

2. **Author Promotion** (FR-A-060 to FR-A-064)
   - Placement requests
   - Pre-orders with countdown
   - Affiliate link generation
   - Embeddable widgets

3. **Reader Notifications** (Multi-phase)
   - Email notifications (Nodemailer)
   - Push notifications (Firebase)
   - In-app notification inbox
   - User preferences per channel

### Phase 9: Performance & Security Hardening (Week 19-20)

**Goal**: Optimization, security audit, stress testing

- [ ] Database indexing optimization
- [ ] Caching layer (Redis for hot data)
- [ ] API performance tuning
- [ ] OWASP Top 10 security assessment
- [ ] Penetration testing
- [ ] Load testing (500 → 10K concurrent users)
- [ ] GDPR/PDPA compliance audit
- [ ] WCAG 2.1 AA accessibility audit

### Phase 10: QA & Polish (Week 21-22)

**Goal**: Bug fixes, documentation, deployment

- [ ] Full regression testing
- [ ] Integration test suite completion
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Postman collection export
- [ ] README & deployment guide
- [ ] Docker/container setup
- [ ] CI/CD pipeline setup
- [ ] Production deployment dry run

---

## 7. Naming Conventions

### Variables & Functions

```typescript
// camelCase for variables and functions
const userEmailAddress = 'user@example.com';
function calculateRoyaltyAmount(reads: number, rate: number): number { }

// Descriptive, no abbreviations (except common: id, url, pdf, json)
const getUserByEmail() // ✓
const getUsrByEM() // ✗

// Boolean prefixes: is, has, can, should
const isSubscriptionActive = true;
const hasDownloadLimit = true;
const canAccessTitle = true;
const shouldRetryPayment = true;
```

### Classes & Types

```typescript
// PascalCase for classes and types
class ReadingProgressService {}
interface ReaderProfile {}
type PaymentMethod = 'card' | 'paypal' | 'bkash' | 'nagad'
enum UserStatus {
  Active,
  Suspended,
  Banned,
  Deleted,
}
```

### Files & Folders

```
// kebab-case for file/folder names
src/
  app/
    app.ts           // Express app factory
    routes.ts        // Route registration
    server.ts        // Server entry point
    worker.ts        // Worker/job entry point
  common/
    errors/
      app-error.ts      // Base error class
      validation-error.ts
      not-found-error.ts
    interfaces/
      auth.interface.ts
      user.interface.ts
    middlewares/
      auth.middleware.ts
      error-handler.middleware.ts
      rate-limiter.middleware.ts
    utils/
      helpers.ts
      validators.ts
    constants/
      permissions.ts
      error-codes.ts
  config/
    db.ts              // MongoDB connection
    env.ts             // Environment validation
    logger.ts          // Winston setup
    passport.ts        // Passport strategies
  modules/
    auth/
      auth.service.ts
      auth.controller.ts
      auth.routes.ts
      auth.types.ts
      auth.test.ts
    users/
      user.model.ts
      user.service.ts
      user.controller.ts
      user.routes.ts
      user.types.ts
      user.test.ts
    subscriptions/
      subscription.model.ts
      subscription.service.ts
      subscription.controller.ts
      subscription.routes.ts
      subscription.types.ts
      subscription.test.ts
    [other modules follow same pattern]
  jobs/
    royalty-calculation.job.ts
    renewal-reminders.job.ts
    unverified-user-cleanup.job.ts
  migrations/
    20260318-initial-schema.ts
    20260401-add-2fa.ts
  seeds/
    permissions.seed.ts
    plans.seed.ts
    super-admin.seed.ts
  scripts/
    generate-api-docs.ts
    migrate.ts
    seed.ts
  workers/
    notification.worker.ts
    report-generator.worker.ts
tests/
  unit/
    auth.test.ts
    royalty-calculation.test.ts
  integration/
    auth.integration.test.ts
    subscriptions.integration.test.ts
```

### MongoDB Collections & Documents

```typescript
// Collections: plural snake_case
// Collections: users, subscriptions, titles, borrows, holdings, reviews, etc.

// Database fields: snake_case
interface IUser {
  _id: string
  email: string
  password_hash: string
  full_name: string
  avatar_url?: string
  is_email_verified: boolean
  email_verified_at?: Date
  active_subscription_id?: string
  two_factor_enabled: boolean
  last_login_at?: Date
  deleted_at?: Date
  created_at: Date
  updated_at: Date
}

// Enums: UPPERCASE_SNAKE_CASE
enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  DELETED = 'deleted',
}

enum PaymentGateway {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  BKASH = 'bkash',
  NAGAD = 'nagad',
}
```

### API Endpoints

```
// RESTful convention with resource paths
GET    /api/v1/titles                      (list)
POST   /api/v1/titles                      (create)
GET    /api/v1/titles/{title_id}           (read)
PATCH  /api/v1/titles/{title_id}           (update)
DELETE /api/v1/titles/{title_id}           (delete)

// Nested resources
GET    /api/v1/titles/{title_id}/reviews
POST   /api/v1/titles/{title_id}/reviews

// Actions (verbs)
POST   /api/v1/borrows/{borrow_id}/renew
POST   /api/v1/titles/{title_id}/submit    (for review)
DELETE /api/v1/me/sessions                 (revoke all)
```

### Error Codes

```typescript
// Format: ERR_{DOMAIN}_{ISSUE}
// Example:
enum ErrorCode {
  ERR_AUTH_INVALID_CREDENTIALS = 'ERR_AUTH_INVALID_CREDENTIALS',
  ERR_AUTH_EMAIL_NOT_VERIFIED = 'ERR_AUTH_EMAIL_NOT_VERIFIED',
  ERR_USER_NOT_FOUND = 'ERR_USER_NOT_FOUND',
  ERR_SUBSCRIPTION_NOT_ACTIVE = 'ERR_SUBSCRIPTION_NOT_ACTIVE',
  ERR_TITLE_NOT_FOUND = 'ERR_TITLE_NOT_FOUND',
  ERR_BORROW_LIMIT_EXCEEDED = 'ERR_BORROW_LIMIT_EXCEEDED',
  ERR_PAYMENT_FAILED = 'ERR_PAYMENT_FAILED',
  ERR_DRM_VALIDATION_FAILED = 'ERR_DRM_VALIDATION_FAILED',
  ERR_RATE_LIMIT_EXCEEDED = 'ERR_RATE_LIMIT_EXCEEDED',
}
```

### Middleware & Service Naming

```typescript
// Middleware: {action}.middleware.ts
class AuthMiddleware {}
class ErrorHandlerMiddleware {}
class RateLimiterMiddleware {}

// Service: {entity}.service.ts
class UserService {}
class SubscriptionService {}
class RoyaltyService {}
class PaymentService {}

// Repository (if using): {entity}.repository.ts
class UserRepository {}

// Controller: {entity}.controller.ts
class UserController {}
class SubscriptionController {}
```

### Constants

```typescript
// CONSTANT_CASE for constants
const DEFAULT_BORROW_DURATION_DAYS = 14
const MAX_SIMULTANEOUS_BORROWS = 5
const ROYALTY_POOL_RATE = 0.7
const PLATFORM_COMMISSION_RATE = 0.3
const DEFAULT_PAGINATION_LIMIT = 20
const MAX_PAGINATION_LIMIT = 100
const JWT_ACCESS_TOKEN_EXPIRY = '1h'
const JWT_REFRESH_TOKEN_EXPIRY = '7d'
const INVALID_LOGIN_MAX_ATTEMPTS = 10
```

### Comments & Documentation

```typescript
/**
 * Calculates monthly royalty for author based on subscription reads and purchases.
 *
 * @param authorId - UUID of the author
 * @param periodStart - Start date of royalty period
 * @param periodEnd - End date of royalty period
 * @returns Promise<RoyaltyRecord> - Calculated royalty record
 * @throws {RoyaltyCalculationError} if calculation fails
 *
 * @example
 * const royalty = await royaltyService.calculateMonthlyRoyalty(
 *   'author-uuid',
 *   new Date('2025-01-01'),
 *   new Date('2025-01-31')
 * );
 */
async calculateMonthlyRoyalty(
  authorId: string,
  periodStart: Date,
  periodEnd: Date
): Promise<RoyaltyRecord> { }

// TODO: Implement retry logic for failed royalty calculations
// FIXME: Handle edge case where reading session spans multiple days
// NOTE: This query can be optimized with database index on (user_id, created_at)
```

### Branch Naming

```
feature/{feature-name}       // New feature
bugfix/{issue-description}  // Bug fix
docs/{update-name}          // Documentation
refactor/{area}             // Refactoring
chore/{maintenance-task}    // Build, CI, dependencies
```

---

## Quick Reference

| **Area**    | **Standard**         | **Example**                 |
| ----------- | -------------------- | --------------------------- |
| Variables   | camelCase            | `const userId = 'user-123'` |
| Classes     | PascalCase           | `class UserService { }`     |
| Enums       | UPPERCASE_SNAKE_CASE | `enum PaymentGateway`       |
| Collections | plural snake_case    | `users`, `subscriptions`    |
| Fields      | snake_case           | `user_id`, `password_hash`  |
| Files       | kebab-case           | `user.service.ts`           |
| Constants   | UPPERCASE_SNAKE_CASE | `DEFAULT_LIMIT = 20`        |
| Endpoints   | kebab-case resources | `GET /api/v1/reading-goals` |
| Booleans    | is/has/can prefix    | `isActive`, `hasAccess`     |

---

**End of COPILOT_CONTEXT.md**
