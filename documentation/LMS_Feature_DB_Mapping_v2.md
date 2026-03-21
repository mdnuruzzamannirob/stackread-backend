# Digital Library Management System

## Feature to Data Mapping (v2)

This v2 mapping aligns features with the current modular monolith codebase (`src/modules`) and API artifacts (`OpenAPI_v1.json`, `Postman_Collection_v1.json`).

## Mapping Principles

- Primary collection: source-of-truth persistence for a feature.
- Supporting collections: lookup, derived state, history, or workflow records.
- Module ownership: module expected to enforce business rules for that feature.

## Auth and Identity

| Feature                              | Module          | Primary Collection(s)           | Supporting Collection(s)                     |
| ------------------------------------ | --------------- | ------------------------------- | -------------------------------------------- |
| User registration/login/social login | `auth`          | `users`                         | `login_history`                              |
| Email verification                   | `auth`          | `email_verify_tokens`           | `users`                                      |
| Password reset                       | `auth`          | `password_reset_tokens`         | `users`                                      |
| User profile + preferences           | `auth`          | `users`                         | `device_tokens`                              |
| Staff login and invite acceptance    | `staff-auth`    | `staff`                         | `staff_invite_tokens`, `login_history`       |
| Staff and role governance            | `staff`, `rbac` | `roles`, `permissions`, `staff` | `staff_activity_logs`, `admin_activity_logs` |

## Plans, Subscriptions, Payments

| Feature                         | Module          | Primary Collection(s)    | Supporting Collection(s)        |
| ------------------------------- | --------------- | ------------------------ | ------------------------------- |
| Plan catalog (free/paid)        | `plans`         | `plans`                  | -                               |
| Onboarding plan selection       | `onboarding`    | `users`, `subscriptions` | `plans`                         |
| Subscription lifecycle          | `subscriptions` | `subscriptions`          | `users`, `plans`, `payments`    |
| Payment initiation/verification | `payments`      | `payments`               | `subscriptions`, `webhook_logs` |
| Refund handling                 | `payments`      | `refunds`                | `payments`, `staff`             |
| Promotions and discounting      | `promotions`    | `coupons`, `flash_sales` | `coupon_usages`, `payments`     |

## Catalog and Reading

| Feature                       | Module         | Primary Collection(s)                  | Supporting Collection(s)  |
| ----------------------------- | -------------- | -------------------------------------- | ------------------------- |
| Author management             | `authors`      | `authors`                              | `books`                   |
| Category taxonomy             | `categories`   | `categories`                           | `books`                   |
| Book metadata and assets      | `books`        | `books`, `book_files`                  | `authors`, `categories`   |
| Reading progress and sessions | `reading`      | `reading_progress`, `reading_sessions` | `book_files`              |
| Bookmarks and highlights      | `reading`      | `bookmarks`, `highlights`              | `books`, `book_files`     |
| Borrowing flow                | `borrows`      | `borrows`                              | `books`, `plans`, `users` |
| Reservation queue             | `reservations` | `reservations`                         | `books`, `users`          |
| Wishlist                      | `wishlist`     | `wishlists`                            | `books`                   |
| Ratings and reviews           | `reviews`      | `reviews`                              | `books`, `users`          |

## Discovery, Notifications, Operations

| Feature                     | Module          | Primary Collection(s)                        | Supporting Collection(s)                                         |
| --------------------------- | --------------- | -------------------------------------------- | ---------------------------------------------------------------- |
| Search and suggestions      | `search`        | `search_logs`                                | `books`                                                          |
| User-facing dashboard stats | `dashboard`     | Derived via aggregation                      | `users`, `subscriptions`, `borrows`, `reservations`, `wishlists` |
| In-app notifications        | `notifications` | `notifications`                              | `notification_logs`, `device_tokens`                             |
| Admin member management     | `members`       | `users`                                      | `subscriptions`, `payments`, `reading_progress`                  |
| Audit trail and exports     | `audit`         | `admin_activity_logs`, `staff_activity_logs` | `staff`, `users`                                                 |
| Report jobs                 | `reports`       | `report_jobs`                                | domain collections via aggregation                               |
| System settings             | `settings`      | `settings`                                   | -                                                                |

## Cross-Cutting Flow Checks (v2)

1. Auth + RBAC rules must be enforced by middleware before module service execution.
2. Payment and webhook flows should remain idempotent on `gateway_txn_id`/provider event identity.
3. Borrow/reservation transitions must preserve consistency with plan and subscription state.
4. Report jobs should read from canonical collections and avoid writing derived business state.

## Coverage Summary

- Module folders covered: 25.
- API artifacts aligned: OpenAPI v1 + Postman v1.
- Data design aligned to modular ownership boundaries for monolith v2 planning.
