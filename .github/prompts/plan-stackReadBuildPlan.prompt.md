# StackRead Backend - Build Plan Checklist

**Project**: StackRead Digital Library & Self-Publishing Platform
**Created**: May 4, 2026
**Status**: Ready for Development
**Scope**: MVP with MUST-priority features from COPILOT_CONTEXT.md

---

## CLEANUP PHASE (Delete unnecessary modules)

- [ ] [DELETE] `/src/modules/health/` — Not in feature scope
- [ ] [DELETE] `/src/modules/dashboard/` — Admin analytics should use `/admin/analytics` endpoints, not separate module
- [ ] [DELETE] `/src/modules/wishlist/` — Functionality covered by reading-lists module
- [ ] [DELETE] `/src/modules/categories/` — Not a separate entity; handled by genre tags and search filtering

---

## PHASE 1: INFRASTRUCTURE & CORE MODELS (Weeks 1-2)

### Core Configuration Files [MODIFY]

- [ ] [MODIFY] `/src/config/index.ts` — Ensure all environment variables are validated
- [ ] [MODIFY] `/src/config/logger.ts` — Verify Winston setup with daily rotation
- [ ] [MODIFY] `/src/config/env.ts` — Add missing vars: AWS_S3_BUCKET, DRM provider, feature flags

### Core Application Files [MODIFY]

- [ ] [MODIFY] `/src/app/app.ts` — Verify middleware order: helmet → cors → morgan → sanitize → auth → rateLimiter → routes → errorHandler
- [ ] [MODIFY] `/src/app/routes.ts` — Organize routes by domain: `/api/v1/auth/...`, `/api/v1/me/...`, `/api/v1/admin/...`
- [ ] [MODIFY] `/src/app/server.ts` — Ensure graceful shutdown, health check
- [ ] [MODIFY] `/src/app/worker.ts` — Setup worker entry point for background jobs

### Error Handling [MODIFY]

- [ ] [MODIFY] `/src/common/errors/AppError.ts` — Extend to support RFC 7807 format
- [ ] [MODIFY] `/src/common/errors/globalErrorHandler.ts` — Ensure RFC 7807 response format for all errors
- [ ] [MODIFY] `/src/common/errors/handleValidationError.ts` — Format Zod errors properly

### Middleware [MODIFY/CREATE]

- [ ] [MODIFY] `/src/common/middlewares/auth.ts` — Verify JWT validation + refresh token logic
- [ ] [MODIFY] `/src/common/middlewares/rateLimiter.ts` — Add per-endpoint rate limiting strategies
- [ ] [MODIFY] `/src/common/middlewares/validateRequest.ts` — Add Zod schema validation
- [ ] [CREATE] `/src/common/middlewares/role-based-access.ts` — RBAC enforcement (requireRole, requirePermission)
- [ ] [CREATE] `/src/common/middlewares/audit-log.ts` — Log all admin actions to audit_logs collection

### Core Models (Mongoose Schemas) [CREATE]

- [ ] [CREATE] `/src/modules/users/models/user.model.ts` — Unified user (all roles: guest, reader, author, publisher, admin)
  - Fields: email, password_hash, full_name, role, status, subscription info, 2FA, auth providers, created_at, updated_at, deleted_at
- [ ] [CREATE] `/src/modules/subscription-plans/models/subscription-plan.model.ts` — Admin-defined tiers
  - Fields: id (basic|standard|premium), name, price_monthly, price_annual, features[], trial_days
- [ ] [CREATE] `/src/modules/rbac/models/role.model.ts` — Role definitions (guest, reader, author, publisher, admin, staff)
- [ ] [CREATE] `/src/modules/rbac/models/permission.model.ts` — Permission matrix
  - Fields: code, resource, action, description
- [ ] [CREATE] `/src/modules/rbac/models/role-permission.model.ts` — Join table: role_id + permission_id
- [ ] [CREATE] `/src/modules/system/models/system-config.model.ts` — Singleton config document
  - Fields: registration_open, allow_social_login, drm_provider, payment_gateways, etc.

### Type Definitions [CREATE]

- [ ] [CREATE] `/src/types/auth.types.ts` — JWT payload, auth request/response
- [ ] [CREATE] `/src/types/user.types.ts` — User interface, role enum, status enum
- [ ] [CREATE] `/src/types/error.types.ts` — Error codes, RFC 7807 structure
- [ ] [CREATE] `/src/types/pagination.types.ts` — Cursor-based pagination request/response

### Validation Schemas [CREATE]

- [ ] [CREATE] `/src/common/validators/auth.schema.ts` — Register, login, password reset validation
- [ ] [CREATE] `/src/common/validators/user.schema.ts` — Profile update, email verification
- [ ] [CREATE] `/src/common/validators/pagination.schema.ts` — Limit, cursor, sort validation

### Seed Scripts [MODIFY/CREATE]

- [ ] [MODIFY] `/src/seeds/permissions.seed.ts` — Update to match complete permission matrix from COPILOT_CONTEXT
- [ ] [MODIFY] `/src/seeds/plans.seed.ts` — Add all 3 subscription plans (Basic, Standard, Premium)
- [ ] [CREATE] `/src/seeds/roles.seed.ts` — Create 6 roles (guest, reader, author, publisher, admin, staff)
- [ ] [MODIFY] `/src/seeds/superAdmin.seed.ts` — Ensure super-admin has all permissions

### Tests [CREATE]

- [ ] [CREATE] `/tests/unit/auth.test.ts` — JWT creation, refresh, validation
- [ ] [CREATE] `/tests/unit/rbac.test.ts` — Permission checking, role assignment
- [ ] [CREATE] `/tests/unit/error-handler.test.ts` — RFC 7807 format validation

---

## PHASE 2: GUEST & PUBLIC APIS (Weeks 3-4)

### Auth Module Restructure [MODIFY/CREATE]

- [ ] [MODIFY] `/src/modules/auth/` — Reorganize with clear service/controller/route separation
- [ ] [CREATE] `/src/modules/auth/auth.service.ts` — Register, login, refresh, password reset logic
- [ ] [CREATE] `/src/modules/auth/auth.controller.ts` — Handler functions for all auth endpoints
- [ ] [CREATE] `/src/modules/auth/auth.validation.ts` — Zod schemas (register, login, password reset)
- [ ] [CREATE] `/src/modules/auth/auth.routes.ts` — All 14 auth endpoints (register, login, oauth, sso, 2fa, etc.)

### Guest Browse Module [CREATE]

- [ ] [CREATE] `/src/modules/browse/` — New module for guest catalogue viewing
  - [ ] `/src/modules/browse/browse.service.ts` — Fetch titles with filters, featured, trending, staff-picks
  - [ ] `/src/modules/browse/browse.controller.ts` — Endpoint handlers
  - [ ] `/src/modules/browse/browse.validation.ts` — Filter validation schemas
  - [ ] `/src/modules/browse/browse.routes.ts` — GET endpoints: /catalogue, /catalogue/featured, /catalogue/trending, /curated-shelves

### Titles/Books Module Restructure [CREATE]

- [ ] [CREATE] `/src/modules/titles/models/title.model.ts` — eBook/audiobook metadata
  - Fields: author_id, title, isbn, language, genres[], formats[], access_model, stats (denormalised), created_at
- [ ] [CREATE] `/src/modules/titles/models/title-file.model.ts` — File versions (EPUB, PDF, MP3, M4B)
  - Fields: title_id, format, version, storage_url, drm_applied, processing_status
- [ ] [CREATE] `/src/modules/titles/title-detail.service.ts` — Get title, related titles, preview, TOC
- [ ] [CREATE] `/src/modules/titles/title-detail.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/titles/title-detail.routes.ts` — GET /titles/{id}, /titles/{id}/related, /titles/{id}/preview

### Search Module [CREATE]

- [ ] [CREATE] `/src/modules/search/search.service.ts` — Full-text search (basic: MongoDB $text search)
- [ ] [CREATE] `/src/modules/search/search.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/search/search.validation.ts` — Search query validation
- [ ] [CREATE] `/src/modules/search/search.routes.ts` — GET /search, /search/suggestions

### Author Profiles Module [CREATE]

- [ ] [CREATE] `/src/modules/authors/models/author-profile.model.ts` — Public author info (1:1 with users)
  - Fields: user_id, display_name, photo_url, bio, follower_count, badge_status
- [ ] [CREATE] `/src/modules/authors/author.service.ts` — Get author profile, bibliography
- [ ] [CREATE] `/src/modules/authors/author.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/authors/author.routes.ts` — GET /authors/{id}, /authors/{id}/titles

### Public Legal Pages [CREATE]

- [ ] [CREATE] `/src/modules/legal/legal.controller.ts` — Serve terms, privacy, refund, cookies
- [ ] [CREATE] `/src/modules/legal/legal.routes.ts` — GET /legal/\*, /about, /help/articles

### Tests [CREATE]

- [ ] [CREATE] `/tests/integration/auth.integration.test.ts` — Register, login, oauth flow
- [ ] [CREATE] `/tests/integration/browse.integration.test.ts` — Catalogue browse, search, filter
- [ ] [CREATE] `/tests/integration/title-detail.integration.test.ts` — Title page loads, preview access

---

## PHASE 3: READER SUBSCRIPTION & ACCESS (Weeks 5-7)

### Models [CREATE]

- [ ] [CREATE] `/src/modules/subscriptions/models/subscription.model.ts` — Active user subscription
  - Fields: user_id (unique), plan_id, status, current_period_start/end, gateway_subscription_id
- [ ] [CREATE] `/src/modules/subscriptions/models/payment-method.model.ts` — Saved cards, PayPal, bKash
  - Fields: user_id, type, gateway_token, is_default
- [ ] [CREATE] `/src/modules/subscriptions/models/invoice.model.ts` — Billing invoices
  - Fields: user_id, subscription_id|purchase_id, invoice_number (unique), paid_at, pdf_url
- [ ] [CREATE] `/src/modules/subscriptions/models/promo-code.model.ts` — Discount codes
  - Fields: code (unique), discount_type, applies_to, max_uses, total_used

- [ ] [CREATE] `/src/modules/borrowing/models/borrow.model.ts` — Active loan record
  - Fields: user_id, title_id, borrowed_at, due_at, status, renewals[]
- [ ] [CREATE] `/src/modules/borrowing/models/hold.model.ts` — Hold/waitlist record
  - Fields: user_id, title_id, queue_position, status, placed_at, available_at
- [ ] [CREATE] `/src/modules/borrowing/models/purchase.model.ts` — One-time purchase
  - Fields: user_id, title_id, amount, payment_method_id, gateway_payment_id

- [ ] [CREATE] `/src/modules/reading/models/reading-progress.model.ts` — Cross-device sync
  - Fields: user_id + title_id (unique), ebook (cfi + %), audiobook (seconds + %), sessions[], completed_at
- [ ] [CREATE] `/src/modules/reading/models/download.model.ts` — Offline access tracking
  - Fields: user_id, title_id, device_id, expires_at

### Reader Account Module [MODIFY/CREATE]

- [ ] [MODIFY] `/src/modules/` — Rename `members` to `reader-profile` or merge into users
- [ ] [CREATE] `/src/modules/reader-account/reader-account.service.ts` — Get/update profile, preferences
- [ ] [CREATE] `/src/modules/reader-account/reader-account.controller.ts` — Profile, preferences, notifications, devices
- [ ] [CREATE] `/src/modules/reader-account/reader-account.routes.ts` — GET/PATCH /me, /me/preferences, /me/notifications/settings, /me/devices

### Subscription Management [CREATE]

- [ ] [CREATE] `/src/modules/subscriptions/subscription.service.ts` — Create, upgrade, cancel, apply promo
- [ ] [CREATE] `/src/modules/subscriptions/subscription.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/subscriptions/subscription.routes.ts` — POST/GET /me/subscription, PATCH (change plan), /me/billing/methods

### Payment Integration [CREATE]

- [ ] [CREATE] `/src/modules/payments/stripe.service.ts` — Stripe API calls (create subscription, webhook handler)
- [ ] [CREATE] `/src/modules/payments/paypal.service.ts` — PayPal API calls (create subscription)
- [ ] [CREATE] `/src/modules/payments/payment.controller.ts` — Webhook handlers
- [ ] [CREATE] `/src/modules/payments/payment.routes.ts` — POST /webhooks/stripe, /webhooks/paypal

### Borrowing & Access [CREATE]

- [ ] [CREATE] `/src/modules/borrowing/borrow.service.ts` — Borrow, return, renew logic + circulation rules
- [ ] [CREATE] `/src/modules/borrowing/borrow.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/borrowing/borrow.routes.ts` — POST/GET /borrows, POST /borrows/{id}/renew, DELETE /borrows/{id}

- [ ] [CREATE] `/src/modules/borrowing/hold.service.ts` — Place hold, manage queue, notify when available
- [ ] [CREATE] `/src/modules/borrowing/hold.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/borrowing/hold.routes.ts` — POST/GET /holds, DELETE /holds/{id}, GET /titles/{id}/availability

- [ ] [CREATE] `/src/modules/borrowing/purchase.service.ts` — Purchase title
- [ ] [CREATE] `/src/modules/borrowing/purchase.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/borrowing/purchase.routes.ts` — POST/GET /purchases

### Reading Engine [CREATE]

- [ ] [CREATE] `/src/modules/reading/reading.service.ts` — Get session, save progress, retrieve progress
- [ ] [CREATE] `/src/modules/reading/reading.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/reading/reading.routes.ts` — GET /reader/{id}/session, POST/GET /reader/{id}/progress

- [ ] [CREATE] `/src/modules/reading/highlights.service.ts` — CRUD highlights, sharing to clubs
- [ ] [CREATE] `/src/modules/reading/highlights.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/reading/highlights.routes.ts` — POST/GET/PATCH/DELETE /reader/{id}/highlights/{id}

- [ ] [CREATE] `/src/modules/reading/annotations.service.ts` — CRUD annotations
- [ ] [CREATE] `/src/modules/reading/annotations.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/reading/annotations.routes.ts` — POST/GET/PATCH/DELETE /reader/{id}/annotations/{id}

- [ ] [CREATE] `/src/modules/reading/reader-settings.service.ts` — Get/update display preferences
- [ ] [CREATE] `/src/modules/reading/reader-settings.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/reading/reader-settings.routes.ts` — GET/PUT /reader/settings

### Downloads [CREATE]

- [ ] [CREATE] `/src/modules/borrowing/download.service.ts` — Manage offline downloads with expiry
- [ ] [CREATE] `/src/modules/borrowing/download.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/borrowing/download.routes.ts` — POST/GET/DELETE /downloads

### Discovery [CREATE]

- [ ] [CREATE] `/src/modules/discovery/discovery.service.ts` — Personalized recommendations, saved searches
- [ ] [CREATE] `/src/modules/discovery/discovery.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/discovery/discovery.routes.ts` — GET /recommendations, /recommendations/mood, /search/saved

### Tests [CREATE]

- [ ] [CREATE] `/tests/integration/subscription.integration.test.ts` — Create sub, upgrade, cancel, promo
- [ ] [CREATE] `/tests/integration/borrowing.integration.test.ts` — Borrow, renew, return, holds
- [ ] [CREATE] `/tests/integration/reading.integration.test.ts` — Reading progress sync, highlights

---

## PHASE 4: AUTHOR/PUBLISHER CONTENT (Weeks 8-10)

### Models [CREATE]

- [ ] [CREATE] `/src/modules/titles/models/series.model.ts` — Series grouping
  - Fields: author_id, name, slug (unique), instalments[] (ordered)
- [ ] [CREATE] `/src/modules/titles/models/bundle.model.ts` — Bundle grouping
  - Fields: author_id, name, title_ids[] (ordered), pricing

- [ ] [CREATE] `/src/modules/authors/models/publisher-account.model.ts` — Organization (1:many users)
  - Fields: owner_id, brand_name, members[], seat_limit, tax_id

### Author Profile [MODIFY]

- [ ] [MODIFY] `/src/modules/authors/author-profile.service.ts` — Update to handle author info, followers, badge requests
- [ ] [MODIFY] `/src/modules/authors/author-profile.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/authors/author-profile.routes.ts` — GET/PUT /me/author-profile, /me/followers, /me/follower-count

### Publisher Account [CREATE]

- [ ] [CREATE] `/src/modules/publishers/publisher.service.ts` — Manage publisher org, team members
- [ ] [CREATE] `/src/modules/publishers/publisher.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/publishers/publisher.routes.ts` — GET/PUT /me/publisher, /me/publisher/members, /me/publisher/logo

### Content Upload [CREATE]

- [ ] [CREATE] `/src/modules/titles/title-upload.service.ts` — Draft creation, metadata, file upload
- [ ] [CREATE] `/src/modules/titles/title-upload.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/titles/title-upload.routes.ts` — POST /titles (create), GET /titles/mine, /titles/{id}, PATCH, DELETE
  - Also: /titles/{id}/submit, /titles/{id}/unpublish, /titles/{id}/republish, /titles/{id}/bulk

- [ ] [CREATE] `/src/modules/titles/title-file-upload.service.ts` — File version management
- [ ] [CREATE] `/src/modules/titles/title-file-upload.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/titles/title-file-upload.routes.ts` — POST /titles/{id}/files, GET, DELETE, /titles/{id}/versions

### Cover Upload [CREATE]

- [ ] [CREATE] `/src/modules/titles/cover-upload.service.ts` — Upload + crop cover image
- [ ] [CREATE] `/src/modules/titles/cover-upload.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/titles/cover-upload.routes.ts` — PUT /titles/{id}/cover, POST /titles/{id}/cover/crop

### ISBN Lookup [CREATE]

- [ ] [CREATE] `/src/modules/titles/isbn-lookup.service.ts` — Fetch metadata from ISBN API
- [ ] [CREATE] `/src/modules/titles/isbn-lookup.routes.ts` — GET /isbn-lookup/{isbn}

### Series & Bundles [CREATE]

- [ ] [CREATE] `/src/modules/titles/series.service.ts` — CRUD series, add titles
- [ ] [CREATE] `/src/modules/titles/series.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/titles/series.routes.ts` — GET/POST /me/series, /me/series/{id}, /me/series/{id}/titles

- [ ] [CREATE] `/src/modules/titles/bundle.service.ts` — CRUD bundles
- [ ] [CREATE] `/src/modules/titles/bundle.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/titles/bundle.routes.ts` — GET/POST /me/bundles, /me/bundles/{id}

### Rights Configuration [CREATE]

- [ ] [CREATE] `/src/modules/titles/rights.service.ts` — Get/set access model, DRM, geo, loan duration
- [ ] [CREATE] `/src/modules/titles/rights.routes.ts` — GET/PUT /titles/{id}/rights

### Author Analytics [CREATE]

- [ ] [CREATE] `/src/modules/analytics/author-analytics.service.ts` — Reads, engagement, geography, discoverability
- [ ] [CREATE] `/src/modules/analytics/author-analytics.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/analytics/author-analytics.routes.ts` — GET /me/analytics/\*, POST reports

### Author Reviews/Engagement [CREATE]

- [ ] [CREATE] `/src/modules/reviews/models/review.model.ts` — User reviews + ratings
  - Fields: title_id, user_id, rating, body, status, like_count, comments[]
- [ ] [CREATE] `/src/modules/reviews/review.service.ts` — Submit, edit, delete, moderate
- [ ] [CREATE] `/src/modules/reviews/review.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/reviews/review.routes.ts` — POST /reviews, PATCH, DELETE, POST author-reply

### Tests [CREATE]

- [ ] [CREATE] `/tests/integration/author-upload.integration.test.ts` — Create title, upload file, submit for review
- [ ] [CREATE] `/tests/integration/analytics.integration.test.ts` — Analytics queries, report generation

---

## PHASE 5: ROYALTY & FINANCIALS (Weeks 11-12)

### Models [CREATE]

- [ ] [CREATE] `/src/modules/royalties/models/royalty.model.ts` — Monthly royalty record
  - Fields: author_id, title_id, period_start/end, gross_amount, net_amount, status, payout_id
- [ ] [CREATE] `/src/modules/royalties/models/payout-method.model.ts` — Bank, PayPal, bKash, Nagad
  - Fields: user_id, type, bank|paypal|mobile (encrypted), is_default

### Royalty Calculation Engine [CREATE]

- [ ] [CREATE] `/src/modules/royalties/royalty-calculation.service.ts` — Core calculation logic (aggregates reads/purchases, applies formula)
- [ ] [CREATE] `/src/modules/royalties/royalty-calculation.job.ts` — Background job (monthly, triggered by cron)

### Royalty Endpoints [CREATE]

- [ ] [CREATE] `/src/modules/royalties/author-royalties.service.ts` — Author dashboard, history, breakdown
- [ ] [CREATE] `/src/modules/royalties/author-royalties.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/royalties/author-royalties.routes.ts` — GET /me/royalties/\*, POST payout-request, /me/royalties/payout-methods

### Payout Processing [CREATE]

- [ ] [CREATE] `/src/modules/payments/payout.service.ts` — Process payouts via Stripe Connect, PayPal, local gateways
- [ ] [CREATE] `/src/modules/payments/payout.job.ts` — Background job (process approved payouts)

### Admin Royalty Management [CREATE]

- [ ] [CREATE] `/src/modules/admin/royalty-admin.service.ts` — Approve, process, dispute, correct royalties
- [ ] [CREATE] `/src/modules/admin/royalty-admin.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/admin/royalty-admin.routes.ts` — GET/PATCH /admin/royalties, /admin/royalties/formulas, /admin/financial/\*

### Tests [CREATE]

- [ ] [CREATE] `/tests/unit/royalty-calculation.test.ts` — Royalty formula, splits, commission
- [ ] [CREATE] `/tests/integration/royalties.integration.test.ts` — End-to-end royalty calculation

---

## PHASE 6: ADMIN GOVERNANCE (Weeks 13-14)

### Models [CREATE]

- [ ] [CREATE] `/src/modules/audit/models/audit-log.model.ts` — Immutable admin action log
  - Fields: actor_id, action, target_type, target_id, before, after, ip_address, created_at (no update)

### Admin Users [CREATE]

- [ ] [CREATE] `/src/modules/admin/user-admin.service.ts` — List, create, update, suspend, ban users
- [ ] [CREATE] `/src/modules/admin/user-admin.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/admin/user-admin.routes.ts` — GET/POST/PATCH/DELETE /admin/users, /admin/users/{id}/\*, /admin/institutions

### Admin Catalogue [CREATE]

- [ ] [CREATE] `/src/modules/admin/catalogue-admin.service.ts` — Review queue, approve, reject, audit
- [ ] [CREATE] `/src/modules/admin/catalogue-admin.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/admin/catalogue-admin.routes.ts` — GET /admin/titles, /admin/titles/review-queue, POST approve/reject, /admin/shelves

### Admin Circulation [CREATE]

- [ ] [CREATE] `/src/modules/admin/circulation-admin.service.ts` — Manage borrows, overdue, holds
- [ ] [CREATE] `/src/modules/admin/circulation-admin.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/admin/circulation-admin.routes.ts` — GET /admin/circulation, /admin/circulation/overdue, PATCH override

### Admin Subscriptions [CREATE]

- [ ] [CREATE] `/src/modules/admin/subscription-admin.service.ts` — Override plans, process refunds, manage codes
- [ ] [CREATE] `/src/modules/admin/subscription-admin.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/admin/subscription-admin.routes.ts` — GET /admin/subscriptions, PATCH override, POST refund, /admin/plans, /admin/promo-codes

### Admin Moderation [CREATE]

- [ ] [CREATE] `/src/modules/moderation/models/dmca-request.model.ts` — Takedown requests
  - Fields: complainant, infringing_title_id, status, actioned_at, counter_notice
- [ ] [CREATE] `/src/modules/moderation/models/piracy-report.model.ts` — Piracy reports
  - Fields: reported_by, infringing_url, status, action_taken
- [ ] [CREATE] `/src/modules/moderation/moderation.service.ts` — Review, approve, remove content
- [ ] [CREATE] `/src/modules/moderation/moderation.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/moderation/moderation.routes.ts` — GET /admin/reviews/reported, POST approve/remove, /admin/dmca, /admin/piracy-reports

### Audit Logging [CREATE]

- [ ] [CREATE] `/src/modules/audit/audit.middleware.ts` — Capture and log admin actions
- [ ] [CREATE] `/src/modules/audit/audit.service.ts` — Query audit log
- [ ] [CREATE] `/src/modules/audit/audit.routes.ts` — GET /admin/audit-logs

### Admin Configuration [CREATE]

- [ ] [CREATE] `/src/modules/admin/config-admin.service.ts` — Get/update platform config, auth providers, feature flags
- [ ] [CREATE] `/src/modules/admin/config-admin.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/admin/config-admin.routes.ts` — GET/PATCH /admin/config, /admin/config/auth-providers, /admin/config/feature-flags

### Admin Security & Compliance [CREATE]

- [ ] [CREATE] `/src/modules/admin/security-admin.service.ts` — Failed login tracking, suspicious activity, security policy
- [ ] [CREATE] `/src/modules/admin/security-admin.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/admin/security-admin.routes.ts` — GET /admin/security/\*, PUT policy

- [ ] [CREATE] `/src/modules/admin/privacy-admin.service.ts` — GDPR data requests, deletion, export
- [ ] [CREATE] `/src/modules/admin/privacy-admin.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/admin/privacy-admin.routes.ts` — GET /admin/privacy/\*, POST export/delete

### Admin Analytics [MODIFY/CREATE]

- [ ] [DELETE] `/src/modules/dashboard/` (already marked for deletion)
- [ ] [CREATE] `/src/modules/analytics/admin-analytics.service.ts` — Platform metrics (users, revenue, engagement)
- [ ] [CREATE] `/src/modules/analytics/admin-analytics.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/analytics/admin-analytics.routes.ts` — GET /admin/analytics/\*, POST reports, schedule

### Admin Support [CREATE]

- [ ] [CREATE] `/src/modules/support/models/support-ticket.model.ts` — Help desk tickets
  - Fields: ticket_number (unique), submitter, category, status, assigned_to, messages[]
- [ ] [CREATE] `/src/modules/support/ticket.service.ts` — CRUD support tickets
- [ ] [CREATE] `/src/modules/support/ticket.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/support/ticket.routes.ts` — GET /admin/support/tickets, POST reply, /admin/help-centre/articles

### Admin Broadcasts [CREATE]

- [ ] [CREATE] `/src/modules/admin/broadcast.service.ts` — Send platform-wide announcements
- [ ] [CREATE] `/src/modules/admin/broadcast.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/admin/broadcast.routes.ts` — POST /admin/broadcasts

### Tests [CREATE]

- [ ] [CREATE] `/tests/integration/admin.integration.test.ts` — User management, catalogue review, moderation

---

## PHASE 7: COMMUNITY & GAMIFICATION (Weeks 15-16)

### Models [CREATE]

- [ ] [CREATE] `/src/modules/social/models/follow.model.ts` — Reader→Reader and Reader→Author follows
- [ ] [CREATE] `/src/modules/social/models/book-club.model.ts` — Reading group
- [ ] [CREATE] `/src/modules/social/models/book-club-member.model.ts` — Membership
- [ ] [CREATE] `/src/modules/social/models/discussion.model.ts` — Threaded club discussions
- [ ] [CREATE] `/src/modules/gamification/models/reading-goal.model.ts` — User yearly/monthly targets
- [ ] [CREATE] `/src/modules/gamification/models/badge.model.ts` — Achievement definition
- [ ] [CREATE] `/src/modules/gamification/models/user-badge.model.ts` — Earned badge record
- [ ] [CREATE] `/src/modules/research/models/citation.model.ts` — Saved citations (APA, MLA, etc.)

### Social Features [CREATE]

- [ ] [CREATE] `/src/modules/social/follow.service.ts` — Follow/unfollow reader/author
- [ ] [CREATE] `/src/modules/social/follow.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/social/follow.routes.ts` — POST /follows/readers/{id}, /follows/authors/{id}, GET /me/following, /me/followers

- [ ] [CREATE] `/src/modules/social/feed.service.ts` — Social feed (followed activity)
- [ ] [CREATE] `/src/modules/social/feed.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/social/feed.routes.ts` — GET /me/feed

- [ ] [CREATE] `/src/modules/social/book-club.service.ts` — Create, join, manage clubs
- [ ] [CREATE] `/src/modules/social/book-club.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/social/book-club.routes.ts` — GET/POST /book-clubs, /book-clubs/{id}, /book-clubs/{id}/members, /book-clubs/{id}/discussions

### Reading Goals [CREATE]

- [ ] [CREATE] `/src/modules/gamification/reading-goal.service.ts` — Set, track reading goals
- [ ] [CREATE] `/src/modules/gamification/reading-goal.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/gamification/reading-goal.routes.ts` — GET/PUT /me/goals

### Reading Stats [CREATE]

- [ ] [CREATE] `/src/modules/gamification/reader-stats.service.ts` — Lifetime stats, annual wrapped
- [ ] [CREATE] `/src/modules/gamification/reader-stats.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/gamification/reader-stats.routes.ts` — GET /me/stats, /me/stats/wrapped

### Badges & Gamification [CREATE]

- [ ] [CREATE] `/src/modules/gamification/badge.service.ts` — Check triggers, award badges
- [ ] [CREATE] `/src/modules/gamification/badge.job.ts` — Background job (evaluate triggers daily)
- [ ] [CREATE] `/src/modules/gamification/badge.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/gamification/badge.routes.ts` — GET /me/badges, /me/badges/available

### Research Tools [CREATE]

- [ ] [CREATE] `/src/modules/research/citation.service.ts` — Generate citations, export bibliography
- [ ] [CREATE] `/src/modules/research/citation.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/research/citation.routes.ts` — POST/GET /citations, POST bibliography, GET export

### Lists & Tags [CREATE]

- [ ] [CREATE] `/src/modules/lists/models/reading-list.model.ts` — User-created lists
- [ ] [CREATE] `/src/modules/lists/reading-list.service.ts` — CRUD lists, add titles
- [ ] [CREATE] `/src/modules/lists/reading-list.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/lists/reading-list.routes.ts` — GET/POST /me/lists, /me/lists/{id}, /me/lists/{id}/titles

- [ ] [CREATE] `/src/modules/lists/user-tags.service.ts` — Tag titles
- [ ] [CREATE] `/src/modules/lists/user-tags.routes.ts` — POST/GET /me/tags, GET /me/tags/{tag}/titles

### Sharing [CREATE]

- [ ] [CREATE] `/src/modules/sharing/share.service.ts` — Share title, highlights
- [ ] [CREATE] `/src/modules/sharing/share.routes.ts` — POST /me/share/title/{id}

### Tests [CREATE]

- [ ] [CREATE] `/tests/integration/social.integration.test.ts` — Follow, book clubs, discussions
- [ ] [CREATE] `/tests/integration/gamification.integration.test.ts` — Goals, badges, stats

---

## PHASE 8: EVENTS & PROMOTION (Weeks 17-18)

### Models [CREATE]

- [ ] [CREATE] `/src/modules/events/models/event.model.ts` — Author/admin events
  - Fields: title, type, organiser_id, starts_at, ends_at, platform, meeting_url, recording_url
- [ ] [CREATE] `/src/modules/events/models/event-rsvp.model.ts` — Attendance records
- [ ] [CREATE] `/src/modules/promotions/models/promo-campaign.model.ts` — Placements, banners, preorders, free windows
- [ ] [CREATE] `/src/modules/promotions/models/affiliate-link.model.ts` — Tracking links

### Events [CREATE]

- [ ] [CREATE] `/src/modules/events/event.service.ts` — List, create, RSVP
- [ ] [CREATE] `/src/modules/events/event.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/events/event.routes.ts` — GET /events, /events/{id}, GET calendar, POST /events/{id}/rsvp

- [ ] [CREATE] `/src/modules/admin/event-admin.service.ts` — Admin event management
- [ ] [CREATE] `/src/modules/admin/event-admin.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/admin/event-admin.routes.ts` — GET/POST /admin/events, PATCH, /admin/events/{id}/attendees

### Promotion Campaigns [CREATE]

- [ ] [CREATE] `/src/modules/promotions/promotion.service.ts` — Placement requests, banners, preorders, free windows
- [ ] [CREATE] `/src/modules/promotions/promotion.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/promotions/promotion.routes.ts` — GET/POST /me/promotions/placement-request, /me/promotions/banners, /me/promotions/preorders, /me/promotions/free-windows

- [ ] [CREATE] `/src/modules/admin/promotion-admin.service.ts` — Approve/reject placement requests
- [ ] [CREATE] `/src/modules/admin/promotion-admin.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/admin/promotion-admin.routes.ts` — GET /admin/placement-requests, POST approve/reject

### Affiliate Links [CREATE]

- [ ] [CREATE] `/src/modules/promotions/affiliate.service.ts` — Generate tracking links, track clicks/conversions
- [ ] [CREATE] `/src/modules/promotions/affiliate.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/promotions/affiliate.routes.ts` — GET /me/affiliate-links, POST create

### Author Community Tools [CREATE]

- [ ] [CREATE] `/src/modules/authors/book-club-kit.service.ts` — Create discussion guides
- [ ] [CREATE] `/src/modules/authors/book-club-kit.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/authors/book-club-kit.routes.ts` — GET/POST /me/book-club-kits

- [ ] [CREATE] `/src/modules/authors/announcement.service.ts` — Send newsletters
- [ ] [CREATE] `/src/modules/authors/announcement.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/authors/announcement.routes.ts` — POST /me/announcements, GET

- [ ] [CREATE] `/src/modules/authors/reader-question.service.ts` — Q&A system
- [ ] [CREATE] `/src/modules/authors/reader-question.controller.ts` — Endpoint handlers
- [ ] [CREATE] `/src/modules/authors/reader-question.routes.ts` — GET /me/reader-questions, POST answer

### Notifications System [MODIFY/CREATE]

- [ ] [CREATE] `/src/modules/notifications/models/notification.model.ts` — User notification inbox
  - Fields: user_id, type, title, body, action_url, read, expires_at
- [ ] [MODIFY] `/src/modules/notifications/notification.service.ts` — Send notifications (email, push, in-app)
- [ ] [MODIFY] `/src/modules/notifications/notification.controller.ts` — Endpoint handlers for inbox
- [ ] [MODIFY] `/src/modules/notifications/notification.routes.ts` — GET /me/notifications, PATCH read, DELETE

### Tests [CREATE]

- [ ] [CREATE] `/tests/integration/events.integration.test.ts` — Create event, RSVP, calendar
- [ ] [CREATE] `/tests/integration/promotion.integration.test.ts` — Preorder, affiliate links, free windows

---

## PHASE 9: PERFORMANCE & HARDENING (Weeks 19-20)

### Caching & Optimization [CREATE]

- [ ] [CREATE] `/src/common/cache/redis.service.ts` — Redis client wrapper
- [ ] [CREATE] `/src/common/cache/cache.middleware.ts` — Cache popular endpoints (catalogue, search, author profiles)

### Database Optimization [MODIFY]

- [ ] [MODIFY] All Mongoose schemas — Add indexes based on query patterns (see COPILOT_CONTEXT Section 4)
- [ ] [CREATE] `/src/scripts/create-indexes.ts` — Script to create all recommended indexes

### Query Optimization [MODIFY]

- [ ] Review and optimize all database queries (N+1 queries, lean(), select())
- [ ] Add pagination cursors to list endpoints
- [ ] Implement field projection (don't return unnecessary fields)

### Load Testing [CREATE]

- [ ] [CREATE] `/tests/load/k6-script.js` — Load test 500 concurrent users (500 → 10K target)

### Security Audit [MODIFY]

- [ ] Audit all endpoints for OWASP Top 10 vulnerabilities
- [ ] Verify input validation on all endpoints
- [ ] Verify authentication/authorization checks
- [ ] Review SQL/NoSQL injection protection
- [ ] Verify CORS configuration

### GDPR/PDPA Compliance [CREATE]

- [ ] [CREATE] `/src/modules/admin/data-export.service.ts` — Export user data (RFC compliant format)
- [ ] [CREATE] `/src/modules/admin/data-deletion.service.ts` — Delete user data (hard + soft delete strategy)
- [ ] [CREATE] Audit log for all data access

### DRM Integration Validation [CREATE]

- [ ] Verify DRM wrapping for all content
- [ ] Test signed URL generation + 1-hour expiry
- [ ] Validate device fingerprinting

### Tests [CREATE]

- [ ] [CREATE] `/tests/security/security.test.ts` — OWASP Top 10 checks
- [ ] [CREATE] `/tests/load/load.test.ts` — Load testing with k6
- [ ] [CREATE] `/tests/integration/gdpr.integration.test.ts` — Data export/deletion workflows

---

## PHASE 10: QA & DEPLOYMENT PREP (Weeks 21-22)

### Full Regression Testing [MODIFY]

- [ ] Complete test suite with >80% code coverage
- [ ] All 360 endpoints tested
- [ ] Happy path + error path for all features

### Documentation [CREATE]

- [ ] [CREATE] `/docs/API-IMPLEMENTATION-STATUS.md` — Endpoint checklist
- [ ] [MODIFY] `/docs/openAPI.json` — Generate from code (Swagger/OpenAPI auto-generation)
- [ ] [CREATE] `/docs/DEPLOYMENT.md` — Production deployment guide
- [ ] [CREATE] `/docs/TROUBLESHOOTING.md` — Common issues + solutions
- [ ] [MODIFY] `README.md` — Update with setup instructions

### Docker & CI/CD [CREATE]

- [ ] [MODIFY] `/Dockerfile` — Ensure multi-stage build for production
- [ ] [CREATE] `/.github/workflows/ci.yml` — CI pipeline (lint, test, build)
- [ ] [CREATE] `/.github/workflows/deploy.yml` — Deployment pipeline

### Environment Configuration [MODIFY]

- [ ] [MODIFY] `.env.example` — Ensure all required env vars documented
- [ ] Verify production `.env` with all services configured

### Database Migration [CREATE]

- [ ] [CREATE] `/src/migrations/` scripts for any schema updates
- [ ] Test migration up + down scenarios

### Monitoring & Logging [CREATE]

- [ ] [CREATE] Datadog/New Relic integration (if using)
- [ ] [CREATE] Sentry integration for error tracking
- [ ] [CREATE] ELK Stack or Datadog for log aggregation

### Production Checklist [CREATE]

- [ ] [CREATE] `/docs/PRODUCTION-CHECKLIST.md`
  - ✅ All MUST endpoints functional
  - ✅ Test coverage >80%
  - ✅ All compliance checks passed
  - ✅ Performance targets met
  - ✅ Security audit passed
  - ✅ GDPR/DMCA workflows operational
  - ✅ DRM integration validated
  - ✅ Monitoring in place
  - ✅ Backup/recovery tested

### Postman Collection [MODIFY]

- [ ] Export Postman collection with all endpoints
- [ ] Save to `/docs/postman-collection.json`

### Tests [MODIFY]

- [ ] Ensure all test suites are complete and passing

---

## Summary

**Total Files to Handle:**

- **DELETE**: 4 modules (health, dashboard, wishlist, categories)
- **MODIFY**: ~10 core files (app.ts, routes.ts, config files, auth module, error handlers, middleware)
- **CREATE**: ~180+ new files (models, services, controllers, routes, tests, jobs)

**Implementation Timeline**: 22 weeks (5+ months) for complete MVP with MUST-priority features

**Recommended Start**: Phase 1 (infrastructure) immediately, then proceed sequentially through Phases 2-4 for MVP launch readiness
