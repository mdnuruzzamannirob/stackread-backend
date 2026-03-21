# Digital Library Management System

## MongoDB Design (v2)

This v2 MongoDB design aligns the data model with the current backend module architecture.

## Collection Groups

### Auth

- `users`
- `email_verify_tokens`
- `password_reset_tokens`
- `login_history`
- `device_tokens`

### Subscription and Payment

- `plans`
- `subscriptions`
- `payments`
- `refunds`
- `webhook_logs`
- `coupons`
- `coupon_usages`
- `flash_sales`

### Library and Reading

- `authors`
- `categories`
- `books`
- `book_files`
- `reading_progress`
- `reading_sessions`
- `bookmarks`
- `highlights`
- `borrows`
- `reservations`
- `wishlists`
- `reviews`

### System, RBAC, Reports

- `notifications`
- `notification_logs`
- `search_logs`
- `roles`
- `permissions`
- `staff`
- `staff_invite_tokens`
- `staff_activity_logs`
- `admin_activity_logs`
- `settings`
- `report_jobs`

## Relationship Baseline

- `subscriptions` reference `users` and `plans`.
- `payments` reference `subscriptions` and may drive `refunds`.
- `books` reference `authors` and `categories`; reading and circulation collections reference `books`.
- `staff` references `roles`; roles map to permission keys from `permissions`.

## Recommended Core Indexes

- Unique: `users.email`.
- Sparse unique: `users.google_id`, `users.facebook_id`.
- `subscriptions(user_id, status, ends_at)`.
- `payments(gateway, gateway_txn_id)` for provider reconciliation.
- `reading_progress(user_id, book_id)` unique compound.
- `borrows(user_id, status, due_at)`.
- `reservations(book_id, status, queue_position)`.
- `report_jobs(status, created_at)`.

## TTL/Retention Guidance

- TTL on verification/reset/invite token collections.
- Bounded retention for high-volume operational logs as needed.
- Do not TTL financial records (`payments`, `refunds`) unless explicit compliance policy is introduced.

## Data Consistency Rules

1. Use service-level state transitions for subscription, borrow, and reservation lifecycles.
2. Use transactions for multi-collection critical writes.
3. Keep denormalized fields synchronized in module services.
4. Preserve auditability for staff/admin and member management actions.
