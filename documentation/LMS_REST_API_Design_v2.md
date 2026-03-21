# Digital Library Management System

## REST API Design (v2)

This v2 API design updates the contract guide to match the current modular backend and v1 exported artifacts.

## API Conventions

- Base URL (dev): `http://localhost:5000/api/v1`
- Content type: `application/json`
- Auth: Bearer JWT (`Authorization: Bearer <token>`)
- Response envelope: `success`, `message`, `data`, optional `meta`
- Pagination: `page`, `limit`
- Search/sort patterns: `search`, `sortBy`, `sortOrder`

## Auth Domains

- Public: no token required.
- User: user token from `/auth/*` flow.
- Staff/Admin: staff token from `/staff/*` flow plus permission middleware for protected admin routes.

## Status Code Semantics

- `200` success read/update actions.
- `201` resource created.
- `204` no content delete style response.
- `400` request validation or malformed input.
- `401` missing/invalid authentication.
- `403` authenticated but permission denied.
- `404` route/resource not found.
- `409` conflict (duplicate or conflicting state).
- `422` business rule violation.
- `429` rate limit exceeded.
- `500` unhandled server error.

## Route Group Inventory (v2)

Current exported API inventory baseline:

- OpenAPI paths: ~154.
- Postman requests: ~188.
- Route groups/modules: 25.

### Public/User Core

- `/auth/*`
- `/onboarding/*`
- `/plans/*`
- `/subscriptions/my*`
- `/payments/my*`
- `/books*`, `/authors*`, `/categories*`
- `/reading*`, `/borrows*`, `/reservations*`, `/wishlist*`, `/reviews*`
- `/search*`, `/dashboard*`, `/notifications*`
- `/health*`

### Staff/Admin Core

- `/staff/*` (staff auth lifecycle)
- `/admin/staff*`
- `/admin/roles*`, `/admin/permissions*`
- `/admin/members*`
- `/admin/books*`
- `/admin/reviews*`
- `/admin/reports*`
- `/admin/settings*`
- `/admin/audit*`

### Commerce and Webhooks

- `/payments/initiate`
- `/payments/verify`
- `/payments/:id/refund`
- `/webhooks/:gateway`

## Request Validation Pattern

- Validate request input with zod middleware before controller execution.
- Keep path/query/body contracts explicit and stable.
- Reject unknown/malformed payloads with consistent validation errors.

## RBAC Pattern

- `authenticateStaff` first.
- `requirePermission(<permission-key>)` second.
- Controller execution only after both pass.

## Versioning Strategy

- Maintain `/api/v1` as stable baseline.
- Introduce breaking changes behind explicit new version namespace.
- Keep additive fields backward-compatible in existing responses.

## Documentation Contract Workflow

1. Update route + validation schema.
2. Rebuild docs artifacts (`pnpm generate:docs`).
3. Verify OpenAPI/Postman include expected routes and params.
4. Update design docs when auth/permission/response contracts change.
