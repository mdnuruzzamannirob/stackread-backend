# LMS Documentation Gap Report (v1)

This file captures verified gaps between the current backend project and documentation, and records what was corrected.

## Scope Used for Gap Check

- Full module inventory under `src/modules`.
- Middleware chain in `src/app/app.ts`.
- Route mounting in `src/app/routes.ts`.
- API exports: `OpenAPI_v1.json`, `Postman_Collection_v1.json`.
- Existing docs in `README.md` and `documentation/*.md`.

## Verified Gaps

1. README claimed generic “170+ endpoints”, while current OpenAPI export has 154 paths.
2. README referenced `pnpm docs:rebuild`, but package script is `pnpm generate:docs`.
3. README script table used non-existing `seed` and incorrect `seed:all` command target.
4. README lacked explicit middleware pipeline order from `app.ts`.
5. README did not provide a dedicated project-vs-doc gap tracking artifact.

## Corrections Applied

- Updated README API inventory wording to current baseline:
  - OpenAPI: 154 paths (export baseline).
  - Postman: 188 requests across 25 folders.
- Replaced docs rebuild command references to `pnpm generate:docs`.
- Corrected scripts table for seeding and docs generation command names.
- Added middleware pipeline section in README with actual execution order.
- Added this gap report file for traceable documentation maintenance.

## Notes

- Counts are baseline snapshots from current exported artifacts and can change after route updates.
- After route/schema changes, run `pnpm generate:docs` and refresh this gap report when needed.
