# Plan: LMS Backend Modular Monolith (v2)

Create and evolve the Stackread backend as a production-grade TypeScript modular monolith, using the current codebase as source of truth.

## Context Baseline (verified)

- Runtime: Node.js + Express + TypeScript + MongoDB/Mongoose.
- Architecture: modular monolith with 25 domain modules under `src/modules`.
- Process model: separate API process (`src/app/server.ts`) and worker process (`src/app/worker.ts`).
- Middleware baseline: request context, response time, morgan logging, CORS, helmet, route-segmented rate limits, sanitization, auth guards, RBAC permission checks, zod validation.
- API artifacts: `documentation/OpenAPI_v1.json` and `documentation/Postman_Collection_v1.json`.
- API inventory baseline: OpenAPI includes ~154 paths; Postman includes ~188 requests across 25 folders.

## v2 Objectives

1. Keep modular boundaries strict and predictable.
2. Improve testability and operational reliability without splitting to microservices.
3. Standardize contracts for Web and Dashboard clients.
4. Keep payment orchestration provider-driven (SSLCommerz/Stripe/PayPal abstraction).
5. Preserve backward compatibility for existing v1 endpoints unless explicitly versioned.

## Rules for Implementation

- Keep user auth and staff auth separated at route + token + middleware levels.
- Keep response format consistent: `success`, `message`, `data`, optional `meta`.
- Apply `validateRequest` before controller logic on any typed endpoint.
- Keep permission checks server-side only via RBAC middleware.
- Favor additive changes and explicit deprecation when introducing v2 contracts.
- No cross-module leakage of private internals; expose service APIs through module indexes.

## Execution Phases

### Phase 1 — Foundation Hardening

- Normalize app boot and worker boot readiness checks.
- Enforce consistent error taxonomy for auth/permission/not-found/validation cases.
- Ensure all middleware ordering is deterministic and documented.
- Confirm docs rebuild command (`pnpm generate:docs`) remains green.

### Phase 2 — Core Domain Stability

- Stabilize identity modules: `auth`, `staff-auth`, `rbac`, `staff`, `members`.
- Ensure onboarding-plan-subscription flow is transaction-safe where needed.
- Consolidate shared validation primitives under `src/common/validators`.

### Phase 3 — Commerce and Circulation

- Standardize payment and webhook handling paths with provider adapter boundaries.
- Harden subscriptions, borrows, reservations, and promotions consistency checks.
- Ensure idempotent handling in webhook and retry-prone flows.

### Phase 4 — Experience and Operations

- Refine `search`, `notifications`, `dashboard`, `reports`, and `settings` modules.
- Improve worker scheduling observability and retry behavior.
- Keep audit reportability complete for admin workflows.

### Phase 5 — Documentation + Verification

- Keep OpenAPI and Postman in sync with route-level validations.
- Update docs whenever contracts/flows change.
- Keep test suites passing (`pnpm test:unit`, `pnpm test:integration`) and type safety strict (`pnpm typecheck`).

## Minimum Acceptance Checklist

- Typecheck passes.
- Critical module tests pass (auth, subscriptions, payments, borrows, reservations, rbac).
- OpenAPI/Postman artifacts regenerated after endpoint/schema changes.
- No permission bypass route exists in admin/staff scopes.
- Worker jobs remain isolated from API request latency.

## Delivery Notes

- Work in small, reviewable increments.
- For each change, include: affected module(s), contract impact, migration/seed impact, docs impact.
- If a change affects Web or Dashboard integration, document backward-compatibility behavior explicitly.
