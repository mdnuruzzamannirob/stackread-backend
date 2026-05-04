**MongoDB Database Design**

**Digital Library & Self-Publishing Portal**

59 Collections · 4 Roles · JWT Auth · Full Feature Coverage

**Design Principles**

**UUIDs as \_id:** All \_id fields are UUID v4 strings for API consistency.

**Soft deletes:** deleted_at: Date | null on every top-level document.

**Embedded vs Referenced:** Small stable sub-documents are embedded; large or shared entities are referenced by ID.

**Indexes:** Defined after each collection schema for query optimisation.

**Timestamps:** Every collection carries created_at and updated_at.

**Transactions:** Use multi-document ACID transactions for: borrow + hold update, purchase + invoice, royalty + payout.

**TTL Indexes:** Apply to notifications.expires_at, uploads.presigned_expires_at, and jobs.expires_at.

# **Collection Index**

| **#** | **Collection**       | **Domain**   | **Purpose**                                              |
| ----- | -------------------- | ------------ | -------------------------------------------------------- |
| 1     | users                | Core         | All user accounts (readers, authors, publishers, admins) |
| ---   | ---                  | ---          | ---                                                      |
| 2     | author_profiles      | Core         | Extended author public profile data                      |
| ---   | ---                  | ---          | ---                                                      |
| 3     | publisher_accounts   | Core         | Publisher organisation & team seats                      |
| ---   | ---                  | ---          | ---                                                      |
| 4     | titles               | Catalogue    | Book / audiobook catalogue entries                       |
| ---   | ---                  | ---          | ---                                                      |
| 5     | title_files          | Catalogue    | Uploaded file versions per title                         |
| ---   | ---                  | ---          | ---                                                      |
| 6     | series               | Catalogue    | Series groupings of related titles                       |
| ---   | ---                  | ---          | ---                                                      |
| 7     | bundles              | Catalogue    | Promotional title bundles                                |
| ---   | ---                  | ---          | ---                                                      |
| 8     | subscription_plans   | Billing      | Plan definitions managed by admin                        |
| ---   | ---                  | ---          | ---                                                      |
| 9     | subscriptions        | Billing      | Active user subscriptions                                |
| ---   | ---                  | ---          | ---                                                      |
| 10    | payment_methods      | Billing      | Stored reader payment instruments                        |
| ---   | ---                  | ---          | ---                                                      |
| 11    | invoices             | Billing      | Billing invoices & receipts                              |
| ---   | ---                  | ---          | ---                                                      |
| 12    | promo_codes          | Billing      | Discount & promotional codes                             |
| ---   | ---                  | ---          | ---                                                      |
| 13    | borrows              | Circulation  | Active & historical borrow events                        |
| ---   | ---                  | ---          | ---                                                      |
| 14    | purchases            | Circulation  | One-time title purchase records                          |
| ---   | ---                  | ---          | ---                                                      |
| 15    | holds                | Circulation  | Waitlist / hold queue                                    |
| ---   | ---                  | ---          | ---                                                      |
| 16    | downloads            | Circulation  | Offline download records                                 |
| ---   | ---                  | ---          | ---                                                      |
| 17    | reading_progress     | Reading      | Cross-device reading position sync                       |
| ---   | ---                  | ---          | ---                                                      |
| 18    | highlights           | Reading      | Reader text highlights inside eBooks                     |
| ---   | ---                  | ---          | ---                                                      |
| 19    | annotations          | Reading      | Reader notes attached to book positions                  |
| ---   | ---                  | ---          | ---                                                      |
| 20    | reader_settings      | Reading      | eReader display & audio preferences per user             |
| ---   | ---                  | ---          | ---                                                      |
| 21    | reading_lists        | Organisation | Named lists of titles created by readers                 |
| ---   | ---                  | ---          | ---                                                      |
| 22    | user_tags            | Organisation | User-defined tags applied to titles                      |
| ---   | ---                  | ---          | ---                                                      |
| 23    | reading_goals        | Gamification | Yearly / monthly reading targets                         |
| ---   | ---                  | ---          | ---                                                      |
| 24    | badges               | Gamification | Badge definitions managed by admin                       |
| ---   | ---                  | ---          | ---                                                      |
| 25    | user_badges          | Gamification | Badge awards per user                                    |
| ---   | ---                  | ---          | ---                                                      |
| 26    | reviews              | Social       | Reader reviews & ratings with moderation                 |
| ---   | ---                  | ---          | ---                                                      |
| 27    | follows              | Social       | Reader↔Reader and Reader↔Author follows                  |
| ---   | ---                  | ---          | ---                                                      |
| 28    | book_clubs           | Social       | Reader-created book club groups                          |
| ---   | ---                  | ---          | ---                                                      |
| 29    | book_club_members    | Social       | Book club membership records                             |
| ---   | ---                  | ---          | ---                                                      |
| 30    | discussions          | Social       | Threaded discussions inside book clubs                   |
| ---   | ---                  | ---          | ---                                                      |
| 31    | citations            | Research     | Saved research citations                                 |
| ---   | ---                  | ---          | ---                                                      |
| 32    | events               | Events       | Author events, webinars & live Q&As                      |
| ---   | ---                  | ---          | ---                                                      |
| 33    | event_rsvps          | Events       | RSVP records for events                                  |
| ---   | ---                  | ---          | ---                                                      |
| 34    | notifications        | Comms        | Per-user notification inbox                              |
| ---   | ---                  | ---          | ---                                                      |
| 35    | saved_searches       | Discovery    | Saved search queries & keyword alerts                    |
| ---   | ---                  | ---          | ---                                                      |
| 36    | royalties            | Finance      | Per-period royalty calculation records                   |
| ---   | ---                  | ---          | ---                                                      |
| 37    | payout_methods       | Finance      | Author / publisher payout accounts                       |
| ---   | ---                  | ---          | ---                                                      |
| 38    | payout_requests      | Finance      | Payout disbursement records                              |
| ---   | ---                  | ---          | ---                                                      |
| 39    | promotions           | Marketing    | Placement requests, banners, pre-orders, free windows    |
| ---   | ---                  | ---          | ---                                                      |
| 40    | affiliate_links      | Marketing    | External promotion tracking links                        |
| ---   | ---                  | ---          | ---                                                      |
| 41    | book_club_kits       | Author Tools | Author-created discussion guide kits                     |
| ---   | ---                  | ---          | ---                                                      |
| 42    | announcements        | Author Tools | Author-to-follower newsletters                           |
| ---   | ---                  | ---          | ---                                                      |
| 43    | reader_questions     | Author Tools | Questions submitted to author profile pages              |
| ---   | ---                  | ---          | ---                                                      |
| 44    | webhooks             | Integration  | Author / publisher webhook subscriptions                 |
| ---   | ---                  | ---          | ---                                                      |
| 45    | api_keys             | Integration  | Author / publisher API keys                              |
| ---   | ---                  | ---          | ---                                                      |
| 46    | uploads              | System       | Upload job tracking (pre-signed URL flow)                |
| ---   | ---                  | ---          | ---                                                      |
| 47    | jobs                 | System       | Async background job result tracker                      |
| ---   | ---                  | ---          | ---                                                      |
| 48    | audit_logs           | Admin        | Immutable admin action audit trail                       |
| ---   | ---                  | ---          | ---                                                      |
| 49    | support_tickets      | Admin        | Unified support inbox all roles                          |
| ---   | ---                  | ---          | ---                                                      |
| 50    | support_templates    | Admin        | Canned response templates for staff                      |
| ---   | ---                  | ---          | ---                                                      |
| 51    | help_articles        | Admin        | Help centre knowledge base articles                      |
| ---   | ---                  | ---          | ---                                                      |
| 52    | broadcasts           | Admin        | Platform-wide admin-to-user announcements                |
| ---   | ---                  | ---          | ---                                                      |
| 53    | surveys              | Admin        | NPS & satisfaction surveys                               |
| ---   | ---                  | ---          | ---                                                      |
| 54    | survey_responses     | Admin        | Individual survey response records                       |
| ---   | ---                  | ---          | ---                                                      |
| 55    | dmca_requests        | Compliance   | DMCA takedown requests & workflow                        |
| ---   | ---                  | ---          | ---                                                      |
| 56    | piracy_reports       | Compliance   | Unauthorised content sharing reports                     |
| ---   | ---                  | ---          | ---                                                      |
| 57    | community_guidelines | Compliance   | Published guidelines with version history                |
| ---   | ---                  | ---          | ---                                                      |
| 58    | system_config        | Config       | Singleton platform configuration document                |
| ---   | ---                  | ---          | ---                                                      |
| 59    | institutions         | Config       | Institutional access groups                              |
| ---   | ---                  | ---          | ---                                                      |

# **Collection Schemas**

## **1\. users**

All user accounts (readers, authors, publishers, admins)

| **Field**               | **Type**       | **Description / Notes**                                          |
| ----------------------- | -------------- | ---------------------------------------------------------------- |
| \_id                    | string (UUID)  | Primary key - UUID v4                                            |
| ---                     | ---            | ---                                                              |
| email                   | string         | Unique; indexed. User's login email.                             |
| ---                     | ---            | ---                                                              |
| email_verified          | boolean        | True after email confirmation link clicked.                      |
| ---                     | ---            | ---                                                              |
| email_verified_at       | Date \| null   | Timestamp of verification.                                       |
| ---                     | ---            | ---                                                              |
| password_hash           | string \| null | bcrypt hash. Null for social-only accounts.                      |
| ---                     | ---            | ---                                                              |
| full_name               | string         | Display name.                                                    |
| ---                     | ---            | ---                                                              |
| avatar_url              | string \| null | CDN URL for profile avatar.                                      |
| ---                     | ---            | ---                                                              |
| bio                     | string \| null | Short reader biography.                                          |
| ---                     | ---            | ---                                                              |
| role                    | enum           | guest \| reader \| author \| publisher \| admin \| staff         |
| ---                     | ---            | ---                                                              |
| secondary_roles         | string\[\]     | Additional roles (e.g. a reader who is also an author).          |
| ---                     | ---            | ---                                                              |
| status                  | enum           | active \| suspended \| banned \| deleted \| pending_verification |
| ---                     | ---            | ---                                                              |
| status_reason           | string \| null | Reason for suspension or ban.                                    |
| ---                     | ---            | ---                                                              |
| active_subscription_id  | UUID \| null   | Ref: subscriptions.\_id                                          |
| ---                     | ---            | ---                                                              |
| plan_id                 | string \| null | Denormalised for fast auth checks.                               |
| ---                     | ---            | ---                                                              |
| plan_override_by_admin  | boolean        | True when admin manually assigned plan.                          |
| ---                     | ---            | ---                                                              |
| favourite_genres        | string\[\]     | Preferred genre slugs for recommendations.                       |
| ---                     | ---            | ---                                                              |
| reading_language        | string         | ISO 639-1 language code, e.g. 'en'.                              |
| ---                     | ---            | ---                                                              |
| privacy                 | object         | hide_reading_history, lists_public, profile_public.              |
| ---                     | ---            | ---                                                              |
| notification_prefs      | object         | Granular email / push / in-app preferences per event type.       |
| ---                     | ---            | ---                                                              |
| social_accounts         | object\[\]     | Embedded: provider, provider_id, linked_at.                      |
| ---                     | ---            | ---                                                              |
| sso_provider            | string \| null | ldap \| saml \| null.                                            |
| ---                     | ---            | ---                                                              |
| sso_subject             | string \| null | External SSO identifier.                                         |
| ---                     | ---            | ---                                                              |
| institution_id          | UUID \| null   | Ref: institutions.\_id                                           |
| ---                     | ---            | ---                                                              |
| two_factor_enabled      | boolean        | Whether 2FA is active.                                           |
| ---                     | ---            | ---                                                              |
| two_factor_secret       | string \| null | TOTP secret (encrypted at rest).                                 |
| ---                     | ---            | ---                                                              |
| two_factor_backup_codes | string\[\]     | Hashed backup codes.                                             |
| ---                     | ---            | ---                                                              |
| referral_code           | string         | User's own unique referral code.                                 |
| ---                     | ---            | ---                                                              |
| referred_by_code        | string \| null | Code used at registration.                                       |
| ---                     | ---            | ---                                                              |
| warnings                | object\[\]     | Embedded: reason, issued_at, issued_by.                          |
| ---                     | ---            | ---                                                              |
| last_login_at           | Date \| null   | Last successful login timestamp.                                 |
| ---                     | ---            | ---                                                              |
| deletion_requested_at   | Date \| null   | When user requested account deletion.                            |
| ---                     | ---            | ---                                                              |
| deleted_at              | Date \| null   | Soft delete timestamp.                                           |
| ---                     | ---            | ---                                                              |
| created_at              | Date           | Account creation timestamp.                                      |
| ---                     | ---            | ---                                                              |
| updated_at              | Date           | Last modification timestamp.                                     |
| ---                     | ---            | ---                                                              |

**Indexes**

| **Index Definition**                                                | **Purpose**                   |
| ------------------------------------------------------------------- | ----------------------------- |
| { email: 1 }                                                        | Unique - login lookup         |
| ---                                                                 | ---                           |
| { role: 1, status: 1 }                                              | Admin user filtering          |
| ---                                                                 | ---                           |
| { institution_id: 1 }                                               | Institutional access grouping |
| ---                                                                 | ---                           |
| { 'social_accounts.provider': 1, 'social_accounts.provider_id': 1 } | OAuth login lookup            |
| ---                                                                 | ---                           |
| { sso_subject: 1 }                                                  | SSO authentication            |
| ---                                                                 | ---                           |
| { referral_code: 1 }                                                | Unique - referral tracking    |
| ---                                                                 | ---                           |
| { deleted_at: 1 }                                                   | Soft delete filtering         |
| ---                                                                 | ---                           |

## **2\. author_profiles**

Extended author public profile data

| **Field**          | **Type**       | **Description / Notes**                                      |
| ------------------ | -------------- | ------------------------------------------------------------ |
| \_id               | UUID           | Same value as users.\_id (1:1 relationship).                 |
| ---                | ---            | ---                                                          |
| user_id            | UUID           | Ref: users.\_id                                              |
| ---                | ---            | ---                                                          |
| display_name       | string         | Public author name (may differ from full_name).              |
| ---                | ---            | ---                                                          |
| slug               | string         | Unique URL-friendly identifier e.g. 'karim-ahmed'.           |
| ---                | ---            | ---                                                          |
| photo_url          | string \| null | CDN URL for author photo.                                    |
| ---                | ---            | ---                                                          |
| bio                | string         | Full author biography shown on profile page.                 |
| ---                | ---            | ---                                                          |
| website            | string \| null | Author's personal website URL.                               |
| ---                | ---            | ---                                                          |
| social_links       | object         | twitter, instagram, facebook, linkedin, youtube URLs.        |
| ---                | ---            | ---                                                          |
| genre_tags         | string\[\]     | Author's primary genre tags.                                 |
| ---                | ---            | ---                                                          |
| badge_status       | enum           | none \| pending \| approved \| rejected                      |
| ---                | ---            | ---                                                          |
| badge_approved_at  | Date \| null   | When admin approved verified badge.                          |
| ---                | ---            | ---                                                          |
| badge_approved_by  | UUID \| null   | Admin who approved badge.                                    |
| ---                | ---            | ---                                                          |
| follower_count     | number         | Denormalised count; updated on follow/unfollow events.       |
| ---                | ---            | ---                                                          |
| upcoming_event_ids | UUID\[\]       | Denormalised for fast profile page load.                     |
| ---                | ---            | ---                                                          |
| publisher_id       | UUID \| null   | Ref: publisher_accounts.\_id if author is under a publisher. |
| ---                | ---            | ---                                                          |
| created_at         | Date           |                                                              |
| ---                | ---            | ---                                                          |
| updated_at         | Date           |                                                              |
| ---                | ---            | ---                                                          |

**Indexes**

| **Index Definition** | **Purpose**                     |
| -------------------- | ------------------------------- |
| { user_id: 1 }       | Unique - profile lookup by user |
| ---                  | ---                             |
| { slug: 1 }          | Unique - URL routing            |
| ---                  | ---                             |
| { genre_tags: 1 }    | Discovery by genre              |
| ---                  | ---                             |
| { badge_status: 1 }  | Admin badge review queue        |
| ---                  | ---                             |

## **3\. publisher_accounts**

Publisher organisation & team seats

| **Field**     | **Type**       | **Description / Notes**                                                                        |
| ------------- | -------------- | ---------------------------------------------------------------------------------------------- |
| \_id          | UUID           | Publisher account ID.                                                                          |
| ---           | ---            | ---                                                                                            |
| owner_user_id | UUID           | Ref: users.\_id - account owner.                                                               |
| ---           | ---            | ---                                                                                            |
| brand_name    | string         | Publisher display name.                                                                        |
| ---           | ---            | ---                                                                                            |
| slug          | string         | Unique URL slug.                                                                               |
| ---           | ---            | ---                                                                                            |
| logo_url      | string \| null | CDN URL for publisher logo.                                                                    |
| ---           | ---            | ---                                                                                            |
| about         | string         | Publisher description.                                                                         |
| ---           | ---            | ---                                                                                            |
| website       | string \| null |                                                                                                |
| ---           | ---            | ---                                                                                            |
| contact_email | string         | Primary contact email.                                                                         |
| ---           | ---            | ---                                                                                            |
| members       | object\[\]     | Embedded team: user_id, role (owner\|admin\|editor\|finance\|uploader), invited_at, joined_at. |
| ---           | ---            | ---                                                                                            |
| seat_limit    | number         | Max team members allowed.                                                                      |
| ---           | ---            | ---                                                                                            |
| tax_id        | string \| null | VAT or local tax registration number.                                                          |
| ---           | ---            | ---                                                                                            |
| country       | string         | ISO 3166-1 alpha-2 country code.                                                               |
| ---           | ---            | ---                                                                                            |
| currency      | string         | Default payout currency (e.g. BDT).                                                            |
| ---           | ---            | ---                                                                                            |
| status        | enum           | active \| suspended                                                                            |
| ---           | ---            | ---                                                                                            |
| created_at    | Date           |                                                                                                |
| ---           | ---            | ---                                                                                            |
| updated_at    | Date           |                                                                                                |
| ---           | ---            | ---                                                                                            |
| deleted_at    | Date \| null   | Soft delete.                                                                                   |
| ---           | ---            | ---                                                                                            |

**Indexes**

| **Index Definition**     | **Purpose**            |
| ------------------------ | ---------------------- |
| { owner_user_id: 1 }     | Owner's account lookup |
| ---                      | ---                    |
| { slug: 1 }              | Unique - URL routing   |
| ---                      | ---                    |
| { 'members.user_id': 1 } | Team member lookup     |
| ---                      | ---                    |

## **4\. titles**

Book / audiobook catalogue entries

| **Field**            | **Type**       | **Description / Notes**                                                                                                      |
| -------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| \_id                 | UUID           | Title ID.                                                                                                                    |
| ---                  | ---            | ---                                                                                                                          |
| author_id            | UUID           | Ref: users.\_id - primary author.                                                                                            |
| ---                  | ---            | ---                                                                                                                          |
| co_authors           | object\[\]     | Embedded: user_id, revenue_share_percent.                                                                                    |
| ---                  | ---            | ---                                                                                                                          |
| publisher_id         | UUID \| null   | Ref: publisher_accounts.\_id                                                                                                 |
| ---                  | ---            | ---                                                                                                                          |
| title                | string         | Book title.                                                                                                                  |
| ---                  | ---            | ---                                                                                                                          |
| subtitle             | string \| null |                                                                                                                              |
| ---                  | ---            | ---                                                                                                                          |
| slug                 | string         | Unique URL slug.                                                                                                             |
| ---                  | ---            | ---                                                                                                                          |
| isbn                 | string \| null | ISBN-13 if available.                                                                                                        |
| ---                  | ---            | ---                                                                                                                          |
| language             | string         | ISO 639-1 code.                                                                                                              |
| ---                  | ---            | ---                                                                                                                          |
| publication_date     | Date \| null   |                                                                                                                              |
| ---                  | ---            | ---                                                                                                                          |
| page_count           | number \| null | For eBook / PDF.                                                                                                             |
| ---                  | ---            | ---                                                                                                                          |
| duration_seconds     | number \| null | For audiobooks.                                                                                                              |
| ---                  | ---            | ---                                                                                                                          |
| series_id            | UUID \| null   | Ref: series.\_id                                                                                                             |
| ---                  | ---            | ---                                                                                                                          |
| series_order         | number \| null | Position within the series.                                                                                                  |
| ---                  | ---            | ---                                                                                                                          |
| genres               | string\[\]     | Genre slugs.                                                                                                                 |
| ---                  | ---            | ---                                                                                                                          |
| tags                 | string\[\]     | Freeform searchable tags.                                                                                                    |
| ---                  | ---            | ---                                                                                                                          |
| synopsis             | string         | Full book description.                                                                                                       |
| ---                  | ---            | ---                                                                                                                          |
| cover_url            | string \| null | CDN URL for cover image.                                                                                                     |
| ---                  | ---            | ---                                                                                                                          |
| formats              | string\[\]     | ebook \| audiobook \| pdf                                                                                                    |
| ---                  | ---            | ---                                                                                                                          |
| status               | enum           | draft \| submitted \| under_review \| revision_requested \| approved \| published \| unpublished \| withdrawn                |
| ---                  | ---            | ---                                                                                                                          |
| rejection_reason     | object \| null | Embedded: code, message, rejected_at, rejected_by.                                                                           |
| ---                  | ---            | ---                                                                                                                          |
| scheduled_publish_at | Date \| null   | Future publish date.                                                                                                         |
| ---                  | ---            | ---                                                                                                                          |
| access_model         | enum           | subscription \| purchase \| both                                                                                             |
| ---                  | ---            | ---                                                                                                                          |
| purchase_price       | number \| null | Price for individual purchase.                                                                                               |
| ---                  | ---            | ---                                                                                                                          |
| currency             | string         | e.g. BDT                                                                                                                     |
| ---                  | ---            | ---                                                                                                                          |
| rights               | object         | Embedded: simultaneous_copies, loan_duration_days, geo_availability, drm_enabled, licence_model, expiry, free_access_window. |
| ---                  | ---            | ---                                                                                                                          |
| stats                | object         | Denormalised: total_reads, total_purchases, active_borrows, holds_count, average_rating, review_count, completion_rate.      |
| ---                  | ---            | ---                                                                                                                          |
| featured             | boolean        | Admin-flagged for featured shelf.                                                                                            |
| ---                  | ---            | ---                                                                                                                          |
| staff_pick           | boolean        | Admin-flagged as staff pick.                                                                                                 |
| ---                  | ---            | ---                                                                                                                          |
| created_at           | Date           |                                                                                                                              |
| ---                  | ---            | ---                                                                                                                          |
| updated_at           | Date           |                                                                                                                              |
| ---                  | ---            | ---                                                                                                                          |
| deleted_at           | Date \| null   | Soft delete.                                                                                                                 |
| ---                  | ---            | ---                                                                                                                          |

**Indexes**

| **Index Definition**                              | **Purpose**                 |
| ------------------------------------------------- | --------------------------- |
| { slug: 1 }                                       | Unique - URL routing        |
| ---                                               | ---                         |
| { author_id: 1, status: 1 }                       | Author's title management   |
| ---                                               | ---                         |
| { genres: 1 }                                     | Genre browse & filter       |
| ---                                               | ---                         |
| { language: 1 }                                   | Language filter             |
| ---                                               | ---                         |
| { status: 1 }                                     | Review queue & publishing   |
| ---                                               | ---                         |
| { 'stats.average_rating': -1 }                    | Rating sort                 |
| ---                                               | ---                         |
| { 'stats.total_reads': -1 }                       | Trending sort               |
| ---                                               | ---                         |
| { publication_date: -1 }                          | New releases sort           |
| ---                                               | ---                         |
| { isbn: 1 }                                       | Sparse unique - ISBN lookup |
| ---                                               | ---                         |
| { title: 'text', synopsis: 'text', tags: 'text' } | Full-text search            |
| ---                                               | ---                         |

## **5\. title_files**

Uploaded file versions per title

| **Field**         | **Type**     | **Description / Notes**                                    |
| ----------------- | ------------ | ---------------------------------------------------------- |
| \_id              | UUID         |                                                            |
| ---               | ---          | ---                                                        |
| title_id          | UUID         | Ref: titles.\_id                                           |
| ---               | ---          | ---                                                        |
| upload_id         | UUID         | Ref: uploads.\_id                                          |
| ---               | ---          | ---                                                        |
| format            | enum         | ebook \| audiobook \| pdf \| reading_guide \| author_notes |
| ---               | ---          | ---                                                        |
| mime_type         | string       | e.g. application/epub+zip                                  |
| ---               | ---          | ---                                                        |
| storage_url       | string       | Private S3 URL.                                            |
| ---               | ---          | ---                                                        |
| cdn_url           | string\|null | Public CDN URL for processed files.                        |
| ---               | ---          | ---                                                        |
| filename_original | string       | Original uploaded filename.                                |
| ---               | ---          | ---                                                        |
| size_bytes        | number       | File size in bytes.                                        |
| ---               | ---          | ---                                                        |
| version           | number       | Version number (increments on re-upload).                  |
| ---               | ---          | ---                                                        |
| is_current        | boolean      | True for the active version.                               |
| ---               | ---          | ---                                                        |
| changelog         | string       | What changed in this version.                              |
| ---               | ---          | ---                                                        |
| processing_status | enum         | pending \| processing \| ready \| failed                   |
| ---               | ---          | ---                                                        |
| drm_applied       | boolean      |                                                            |
| ---               | ---          | ---                                                        |
| drm_provider      | string       | LCP \| Adobe \| none                                       |
| ---               | ---          | ---                                                        |
| uploaded_by       | UUID         | Ref: users.\_id                                            |
| ---               | ---          | ---                                                        |
| created_at        | Date         |                                                            |
| ---               | ---          | ---                                                        |
| deleted_at        | Date\|null   | Soft delete.                                               |
| ---               | ---          | ---                                                        |

**Indexes**

| **Index Definition**                      | **Purpose**                   |
| ----------------------------------------- | ----------------------------- |
| { title_id: 1, format: 1, is_current: 1 } | Serve current file for format |
| ---                                       | ---                           |
| { title_id: 1, version: -1 }              | Version history listing       |
| ---                                       | ---                           |
| { processing_status: 1 }                  | Processing queue monitoring   |
| ---                                       | ---                           |

## **6\. series**

Series groupings of related titles

| **Field**        | **Type**     | **Description / Notes**                                       |
| ---------------- | ------------ | ------------------------------------------------------------- |
| \_id             | UUID         |                                                               |
| ---              | ---          | ---                                                           |
| author_id        | UUID         | Ref: users.\_id                                               |
| ---              | ---          | ---                                                           |
| publisher_id     | UUID\|null   | Ref: publisher_accounts.\_id                                  |
| ---              | ---          | ---                                                           |
| name             | string       | Series display name.                                          |
| ---              | ---          | ---                                                           |
| slug             | string       | Unique URL slug.                                              |
| ---              | ---          | ---                                                           |
| description      | string       | Series description.                                           |
| ---              | ---          | ---                                                           |
| cover_url        | string\|null | CDN URL for series cover.                                     |
| ---              | ---          | ---                                                           |
| genres           | string\[\]   | Genre tags for the series.                                    |
| ---              | ---          | ---                                                           |
| instalments      | object\[\]   | Denormalised: title_id, order, title (name). Sorted by order. |
| ---              | ---          | ---                                                           |
| instalment_count | number       | Total number of books in series.                              |
| ---              | ---          | ---                                                           |
| is_complete      | boolean      | Whether the series is fully published.                        |
| ---              | ---          | ---                                                           |
| created_at       | Date         |                                                               |
| ---              | ---          | ---                                                           |
| updated_at       | Date         |                                                               |
| ---              | ---          | ---                                                           |
| deleted_at       | Date\|null   |                                                               |
| ---              | ---          | ---                                                           |

**Indexes**

| **Index Definition** | **Purpose**                |
| -------------------- | -------------------------- |
| { author_id: 1 }     | Author's series management |
| ---                  | ---                        |
| { slug: 1 }          | Unique - URL routing       |
| ---                  | ---                        |

## **7\. bundles**

Promotional title bundles

| **Field**       | **Type**     | **Description / Notes**                                    |
| --------------- | ------------ | ---------------------------------------------------------- |
| \_id            | UUID         |                                                            |
| ---             | ---          | ---                                                        |
| author_id       | UUID         | Ref: users.\_id                                            |
| ---             | ---          | ---                                                        |
| publisher_id    | UUID\|null   |                                                            |
| ---             | ---          | ---                                                        |
| name            | string       | Bundle display name.                                       |
| ---             | ---          | ---                                                        |
| description     | string       |                                                            |
| ---             | ---          | ---                                                        |
| cover_url       | string\|null |                                                            |
| ---             | ---          | ---                                                        |
| title_ids       | UUID\[\]     | Ref: titles.\_id - ordered list of included titles.        |
| ---             | ---          | ---                                                        |
| pricing         | object       | bundle_price, currency, individual_total, savings_percent. |
| ---             | ---          | ---                                                        |
| access_model    | enum         | purchase \| subscription \| both                           |
| ---             | ---          | ---                                                        |
| active          | boolean      | Whether bundle is currently available.                     |
| ---             | ---          | ---                                                        |
| available_from  | Date\|null   | Bundle availability window start.                          |
| ---             | ---          | ---                                                        |
| available_until | Date\|null   | Bundle availability window end.                            |
| ---             | ---          | ---                                                        |
| created_at      | Date         |                                                            |
| ---             | ---          | ---                                                        |
| deleted_at      | Date\|null   |                                                            |
| ---             | ---          | ---                                                        |

**Indexes**

| **Index Definition** | **Purpose**                     |
| -------------------- | ------------------------------- |
| { author_id: 1 }     | Author's bundle management      |
| ---                  | ---                             |
| { title_ids: 1 }     | Find bundles containing a title |
| ---                  | ---                             |
| { active: 1 }        | Active bundle listings          |
| ---                  | ---                             |

## **8\. subscription_plans**

Plan definitions managed by admin

| **Field**                | **Type**   | **Description / Notes**                          |
| ------------------------ | ---------- | ------------------------------------------------ |
| \_id                     | string     | Human-readable ID: basic \| standard \| premium  |
| ---                      | ---        | ---                                              |
| name                     | string     | Display name.                                    |
| ---                      | ---        | ---                                              |
| description              | string     | Plan marketing description.                      |
| ---                      | ---        | ---                                              |
| price_monthly            | number     | Monthly price in smallest currency unit.         |
| ---                      | ---        | ---                                              |
| price_annual             | number     | Annual price (usually discounted).               |
| ---                      | ---        | ---                                              |
| currency                 | string     | e.g. BDT                                         |
| ---                      | ---        | ---                                              |
| features                 | string\[\] | Feature flag identifiers included in plan.       |
| ---                      | ---        | ---                                              |
| download_limit_per_month | number     | \-1 for unlimited.                               |
| ---                      | ---        | ---                                              |
| simultaneous_devices     | number     | Max devices that can access at once.             |
| ---                      | ---        | ---                                              |
| offline_reading          | boolean    |                                                  |
| ---                      | ---        | ---                                              |
| audiobook_access         | boolean    |                                                  |
| ---                      | ---        | ---                                              |
| research_tools           | boolean    |                                                  |
| ---                      | ---        | ---                                              |
| ai_recommendations       | boolean    |                                                  |
| ---                      | ---        | ---                                              |
| trial_days               | number     | Free trial duration.                             |
| ---                      | ---        | ---                                              |
| is_active                | boolean    | Whether plan is available for new subscriptions. |
| ---                      | ---        | ---                                              |
| display_order            | number     | UI ordering on plan comparison page.             |
| ---                      | ---        | ---                                              |
| created_at               | Date       |                                                  |
| ---                      | ---        | ---                                              |
| updated_at               | Date       |                                                  |
| ---                      | ---        | ---                                              |

## **9\. subscriptions**

Active user subscriptions

| **Field**                  | **Type**     | **Description / Notes**                                          |
| -------------------------- | ------------ | ---------------------------------------------------------------- |
| \_id                       | UUID         |                                                                  |
| ---                        | ---          | ---                                                              |
| user_id                    | UUID         | Ref: users.\_id - unique (one subscription per user).            |
| ---                        | ---          | ---                                                              |
| plan_id                    | string       | Ref: subscription_plans.\_id                                     |
| ---                        | ---          | ---                                                              |
| billing_cycle              | enum         | monthly \| annual                                                |
| ---                        | ---          | ---                                                              |
| status                     | enum         | trialing \| active \| past_due \| paused \| cancelled \| expired |
| ---                        | ---          | ---                                                              |
| trial_ends_at              | Date\|null   |                                                                  |
| ---                        | ---          | ---                                                              |
| trial_converted_at         | Date\|null   | When trial converted to paid.                                    |
| ---                        | ---          | ---                                                              |
| current_period_start       | Date         |                                                                  |
| ---                        | ---          | ---                                                              |
| current_period_end         | Date         |                                                                  |
| ---                        | ---          | ---                                                              |
| renewal_date               | Date         | Next billing date.                                               |
| ---                        | ---          | ---                                                              |
| cancelled_at               | Date\|null   |                                                                  |
| ---                        | ---          | ---                                                              |
| cancel_reason              | string\|null | user_requested \| payment_failed                                 |
| ---                        | ---          | ---                                                              |
| payment_method_id          | UUID         | Ref: payment_methods.\_id                                        |
| ---                        | ---          | ---                                                              |
| promo_code_applied         | string\|null | Applied promo code.                                              |
| ---                        | ---          | ---                                                              |
| discount_percent           | number\|null |                                                                  |
| ---                        | ---          | ---                                                              |
| gateway                    | string       | stripe \| paypal \| bkash \| nagad                               |
| ---                        | ---          | ---                                                              |
| gateway_subscription_id    | string       | External gateway reference.                                      |
| ---                        | ---          | ---                                                              |
| downloads_used_this_period | number       | Reset at period start by scheduled job.                          |
| ---                        | ---          | ---                                                              |
| created_at                 | Date         |                                                                  |
| ---                        | ---          | ---                                                              |
| updated_at                 | Date         |                                                                  |
| ---                        | ---          | ---                                                              |

**Indexes**

| **Index Definition**           | **Purpose**                        |
| ------------------------------ | ---------------------------------- |
| { user_id: 1 }                 | Unique - one subscription per user |
| ---                            | ---                                |
| { status: 1 }                  | Active/churned reporting           |
| ---                            | ---                                |
| { renewal_date: 1 }            | Scheduled renewal processing       |
| ---                            | ---                                |
| { gateway_subscription_id: 1 } | Webhook event matching             |
| ---                            | ---                                |

## **10\. payment_methods**

Stored reader payment instruments

| **Field**     | **Type**     | **Description / Notes**                                            |
| ------------- | ------------ | ------------------------------------------------------------------ |
| \_id          | UUID         |                                                                    |
| ---           | ---          | ---                                                                |
| user_id       | UUID         | Ref: users.\_id                                                    |
| ---           | ---          | ---                                                                |
| type          | enum         | card \| paypal \| bkash \| nagad \| bank_transfer                  |
| ---           | ---          | ---                                                                |
| is_default    | boolean      |                                                                    |
| ---           | ---          | ---                                                                |
| card          | object\|null | last4, brand (visa\|mastercard), exp_month, exp_year, holder_name. |
| ---           | ---          | ---                                                                |
| mobile        | object\|null | provider (bkash\|nagad), number.                                   |
| ---           | ---          | ---                                                                |
| paypal        | object\|null | email.                                                             |
| ---           | ---          | ---                                                                |
| gateway_token | string       | Gateway tokenisation reference. Never store raw card data.         |
| ---           | ---          | ---                                                                |
| gateway       | string       | stripe \| paypal \| bkash \| nagad                                 |
| ---           | ---          | ---                                                                |
| created_at    | Date         |                                                                    |
| ---           | ---          | ---                                                                |
| deleted_at    | Date\|null   | Soft delete on removal.                                            |
| ---           | ---          | ---                                                                |

**Indexes**

| **Index Definition**          | **Purpose**           |
| ----------------------------- | --------------------- |
| { user_id: 1, is_default: 1 } | Default method lookup |
| ---                           | ---                   |

## **11\. invoices**

Billing invoices & receipts

| **Field**          | **Type**     | **Description / Notes**                                                    |
| ------------------ | ------------ | -------------------------------------------------------------------------- |
| \_id               | UUID         |                                                                            |
| ---                | ---          | ---                                                                        |
| user_id            | UUID         | Ref: users.\_id                                                            |
| ---                | ---          | ---                                                                        |
| subscription_id    | UUID\|null   | Ref: subscriptions.\_id                                                    |
| ---                | ---          | ---                                                                        |
| purchase_id        | UUID\|null   | Ref: purchases.\_id                                                        |
| ---                | ---          | ---                                                                        |
| type               | enum         | subscription \| purchase                                                   |
| ---                | ---          | ---                                                                        |
| status             | enum         | draft \| open \| paid \| void \| uncollectible                             |
| ---                | ---          | ---                                                                        |
| invoice_number     | string       | Unique human-readable e.g. INV-2025-00342.                                 |
| ---                | ---          | ---                                                                        |
| issued_at          | Date         |                                                                            |
| ---                | ---          | ---                                                                        |
| paid_at            | Date\|null   |                                                                            |
| ---                | ---          | ---                                                                        |
| line_items         | object\[\]   | Embedded: description, quantity, unit_price, discount, subtotal, currency. |
| ---                | ---          | ---                                                                        |
| subtotal           | number       |                                                                            |
| ---                | ---          | ---                                                                        |
| tax                | number       |                                                                            |
| ---                | ---          | ---                                                                        |
| total              | number       |                                                                            |
| ---                | ---          | ---                                                                        |
| currency           | string       |                                                                            |
| ---                | ---          | ---                                                                        |
| gateway_invoice_id | string       | External gateway invoice reference.                                        |
| ---                | ---          | ---                                                                        |
| pdf_url            | string\|null | CDN URL for downloadable PDF receipt.                                      |
| ---                | ---          | ---                                                                        |
| created_at         | Date         |                                                                            |
| ---                | ---          | ---                                                                        |

**Indexes**

| **Index Definition**          | **Purpose**                    |
| ----------------------------- | ------------------------------ |
| { user_id: 1, issued_at: -1 } | User billing history           |
| ---                           | ---                            |
| { invoice_number: 1 }         | Unique - direct lookup         |
| ---                           | ---                            |
| { status: 1 }                 | Outstanding invoice monitoring |
| ---                           | ---                            |

## **12\. promo_codes**

Discount & promotional codes

| **Field**      | **Type**     | **Description / Notes**                   |
| -------------- | ------------ | ----------------------------------------- |
| \_id           | UUID         |                                           |
| ---            | ---          | ---                                       |
| code           | string       | Unique uppercase code e.g. LAUNCH50.      |
| ---            | ---          | ---                                       |
| description    | string       | Internal admin description.               |
| ---            | ---          | ---                                       |
| discount_type  | enum         | percentage \| fixed                       |
| ---            | ---          | ---                                       |
| discount_value | number       | Percent (0-100) or fixed currency amount. |
| ---            | ---          | ---                                       |
| applies_to     | enum         | first_month \| first_year \| all_periods  |
| ---            | ---          | ---                                       |
| eligible_plans | string\[\]   | Which plan IDs can use this code.         |
| ---            | ---          | ---                                       |
| max_uses       | number\|null | null = unlimited.                         |
| ---            | ---          | ---                                       |
| per_user_limit | number       | Max times one user can apply this code.   |
| ---            | ---          | ---                                       |
| total_used     | number       | Denormalised usage counter.               |
| ---            | ---          | ---                                       |
| expires_at     | Date\|null   |                                           |
| ---            | ---          | ---                                       |
| is_active      | boolean      |                                           |
| ---            | ---          | ---                                       |
| created_by     | UUID         | Admin who created this code.              |
| ---            | ---          | ---                                       |
| created_at     | Date         |                                           |
| ---            | ---          | ---                                       |

**Indexes**

| **Index Definition**            | **Purpose**                |
| ------------------------------- | -------------------------- |
| { code: 1 }                     | Unique - redemption lookup |
| ---                             | ---                        |
| { is_active: 1, expires_at: 1 } | Valid code filter          |
| ---                             | ---                        |

## **13\. borrows**

Active & historical borrow events

| **Field**     | **Type**   | **Description / Notes**                    |
| ------------- | ---------- | ------------------------------------------ |
| \_id          | UUID       |                                            |
| ---           | ---        | ---                                        |
| user_id       | UUID       | Ref: users.\_id                            |
| ---           | ---        | ---                                        |
| title_id      | UUID       | Ref: titles.\_id                           |
| ---           | ---        | ---                                        |
| format        | enum       | ebook \| audiobook \| pdf                  |
| ---           | ---        | ---                                        |
| status        | enum       | active \| returned \| expired \| renewed   |
| ---           | ---        | ---                                        |
| borrowed_at   | Date       |                                            |
| ---           | ---        | ---                                        |
| due_at        | Date       | Return deadline.                           |
| ---           | ---        | ---                                        |
| returned_at   | Date\|null |                                            |
| ---           | ---        | ---                                        |
| auto_returned | boolean    | True if system auto-returned after expiry. |
| ---           | ---        | ---                                        |
| renewals      | object\[\] | Embedded history: renewed_at, new_due_at.  |
| ---           | ---        | ---                                        |
| renewal_count | number     | Number of times renewed.                   |
| ---           | ---        | ---                                        |
| max_renewals  | number     | Max allowed renewals (default 2).          |
| ---           | ---        | ---                                        |
| created_at    | Date       |                                            |
| ---           | ---        | ---                                        |
| updated_at    | Date       |                                            |
| ---           | ---        | ---                                        |

**Indexes**

| **Index Definition**        | **Purpose**                      |
| --------------------------- | -------------------------------- |
| { user_id: 1, status: 1 }   | User's active borrows            |
| ---                         | ---                              |
| { title_id: 1, status: 1 }  | Title availability check         |
| ---                         | ---                              |
| { due_at: 1, status: 1 }    | Overdue detection job            |
| ---                         | ---                              |
| { user_id: 1, title_id: 1 } | Prevent duplicate active borrows |
| ---                         | ---                              |

## **14\. purchases**

One-time title purchase records

| **Field**          | **Type**   | **Description / Notes**           |
| ------------------ | ---------- | --------------------------------- |
| \_id               | UUID       |                                   |
| ---                | ---        | ---                               |
| user_id            | UUID       | Ref: users.\_id                   |
| ---                | ---        | ---                               |
| title_id           | UUID       | Ref: titles.\_id                  |
| ---                | ---        | ---                               |
| format             | enum       | ebook \| audiobook \| pdf \| all  |
| ---                | ---        | ---                               |
| amount             | number     | Amount charged.                   |
| ---                | ---        | ---                               |
| currency           | string     |                                   |
| ---                | ---        | ---                               |
| payment_method_id  | UUID       |                                   |
| ---                | ---        | ---                               |
| invoice_id         | UUID       | Ref: invoices.\_id                |
| ---                | ---        | ---                               |
| gateway            | string     | stripe \| paypal \| bkash         |
| ---                | ---        | ---                               |
| gateway_payment_id | string     | External payment reference.       |
| ---                | ---        | ---                               |
| status             | enum       | completed \| refunded \| disputed |
| ---                | ---        | ---                               |
| refunded_at        | Date\|null |                                   |
| ---                | ---        | ---                               |
| created_at         | Date       |                                   |
| ---                | ---        | ---                               |

**Indexes**

| **Index Definition**           | **Purpose**           |
| ------------------------------ | --------------------- |
| { user_id: 1, created_at: -1 } | User purchase history |
| ---                            | ---                   |
| { title_id: 1 }                | Title sales reporting |
| ---                            | ---                   |
| { status: 1 }                  | Refund monitoring     |
| ---                            | ---                   |

## **15\. holds**

Waitlist / hold queue

| **Field**      | **Type**   | **Description / Notes**                                   |
| -------------- | ---------- | --------------------------------------------------------- |
| \_id           | UUID       |                                                           |
| ---            | ---        | ---                                                       |
| user_id        | UUID       | Ref: users.\_id                                           |
| ---            | ---        | ---                                                       |
| title_id       | UUID       | Ref: titles.\_id                                          |
| ---            | ---        | ---                                                       |
| format         | enum       | ebook \| audiobook \| pdf                                 |
| ---            | ---        | ---                                                       |
| status         | enum       | waiting \| available \| expired \| cancelled \| fulfilled |
| ---            | ---        | ---                                                       |
| queue_position | number     | Recalculated when holds ahead are fulfilled or cancelled. |
| ---            | ---        | ---                                                       |
| placed_at      | Date       | When user placed the hold.                                |
| ---            | ---        | ---                                                       |
| available_at   | Date\|null | When a copy became available for this user.               |
| ---            | ---        | ---                                                       |
| expires_at     | Date\|null | User has a limited window to borrow before hold expires.  |
| ---            | ---        | ---                                                       |
| notified_at    | Date\|null | When availability notification was sent.                  |
| ---            | ---        | ---                                                       |
| fulfilled_at   | Date\|null | When user borrowed the available copy.                    |
| ---            | ---        | ---                                                       |
| created_at     | Date       |                                                           |
| ---            | ---        | ---                                                       |

**Indexes**

| **Index Definition**                                | **Purpose**                     |
| --------------------------------------------------- | ------------------------------- |
| { user_id: 1, status: 1 }                           | User's active holds             |
| ---                                                 | ---                             |
| { title_id: 1, format: 1, status: 1, placed_at: 1 } | Queue ordering per title+format |
| ---                                                 | ---                             |

## **16\. downloads**

Offline download records

| **Field**     | **Type**   | **Description / Notes**                  |
| ------------- | ---------- | ---------------------------------------- |
| \_id          | UUID       |                                          |
| ---           | ---        | ---                                      |
| user_id       | UUID       | Ref: users.\_id                          |
| ---           | ---        | ---                                      |
| title_id      | UUID       | Ref: titles.\_id                         |
| ---           | ---        | ---                                      |
| borrow_id     | UUID\|null | Ref: borrows.\_id - if via borrow.       |
| ---           | ---        | ---                                      |
| purchase_id   | UUID\|null | Ref: purchases.\_id - if via purchase.   |
| ---           | ---        | ---                                      |
| format        | enum       | ebook \| audiobook \| pdf                |
| ---           | ---        | ---                                      |
| device_id     | UUID       | Device fingerprint.                      |
| ---           | ---        | ---                                      |
| device_name   | string     | e.g. iPhone 15 Pro                       |
| ---           | ---        | ---                                      |
| downloaded_at | Date       |                                          |
| ---           | ---        | ---                                      |
| expires_at    | Date\|null | Tied to loan/subscription period.        |
| ---           | ---        | ---                                      |
| removed_at    | Date\|null | When user manually removed the download. |
| ---           | ---        | ---                                      |
| file_id       | UUID       | Ref: title_files.\_id                    |
| ---           | ---        | ---                                      |
| created_at    | Date       |                                          |
| ---           | ---        | ---                                      |

**Indexes**

| **Index Definition**                      | **Purpose**                      |
| ----------------------------------------- | -------------------------------- |
| { user_id: 1 }                            | User's download list             |
| ---                                       | ---                              |
| { user_id: 1, title_id: 1, device_id: 1 } | Deduplicate downloads per device |
| ---                                       | ---                              |
| { expires_at: 1 }                         | TTL - auto-expiry cleanup job    |
| ---                                       | ---                              |

## **17\. reading_progress**

Cross-device reading position sync

| **Field**             | **Type**     | **Description / Notes**                                                                            |
| --------------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| \_id                  | UUID         |                                                                                                    |
| ---                   | ---          | ---                                                                                                |
| user_id               | UUID         | Ref: users.\_id                                                                                    |
| ---                   | ---          | ---                                                                                                |
| title_id              | UUID         | Ref: titles.\_id                                                                                   |
| ---                   | ---          | ---                                                                                                |
| ebook                 | object\|null | cfi (EPUB CFI position), chapter, percentage, last_updated_at, last_device_id.                     |
| ---                   | ---          | ---                                                                                                |
| audiobook             | object\|null | position_seconds, chapter, percentage, last_updated_at, last_device_id.                            |
| ---                   | ---          | ---                                                                                                |
| total_reading_seconds | number       | Cumulative reading time for this title.                                                            |
| ---                   | ---          | ---                                                                                                |
| sessions              | object\[\]   | Last 30 sessions: started_at, ended_at, seconds, format, device_id. Older sessions are aggregated. |
| ---                   | ---          | ---                                                                                                |
| completed             | boolean      | True when percentage reaches 100%.                                                                 |
| ---                   | ---          | ---                                                                                                |
| completed_at          | Date\|null   |                                                                                                    |
| ---                   | ---          | ---                                                                                                |
| created_at            | Date         |                                                                                                    |
| ---                   | ---          | ---                                                                                                |
| updated_at            | Date         |                                                                                                    |
| ---                   | ---          | ---                                                                                                |

**Indexes**

| **Index Definition**         | **Purpose**                     |
| ---------------------------- | ------------------------------- |
| { user_id: 1, title_id: 1 }  | Unique - one doc per user+title |
| ---                          | ---                             |
| { user_id: 1, completed: 1 } | Reading goal calculation        |
| ---                          | ---                             |

## **18\. highlights**

Reader text highlights inside eBooks

| **Field**      | **Type**     | **Description / Notes**                       |
| -------------- | ------------ | --------------------------------------------- |
| \_id           | UUID         |                                               |
| ---            | ---          | ---                                           |
| user_id        | UUID         |                                               |
| ---            | ---          | ---                                           |
| title_id       | UUID         |                                               |
| ---            | ---          | ---                                           |
| format         | enum         | ebook \| pdf                                  |
| ---            | ---          | ---                                           |
| cfi_start      | string       | EPUB CFI start position.                      |
| ---            | ---          | ---                                           |
| cfi_end        | string       | EPUB CFI end position.                        |
| ---            | ---          | ---                                           |
| selected_text  | string       | The highlighted passage.                      |
| ---            | ---          | ---                                           |
| color          | enum         | yellow \| green \| blue \| pink               |
| ---            | ---          | ---                                           |
| chapter        | number       | Chapter number for navigation.                |
| ---            | ---          | ---                                           |
| note           | string\|null | Optional reader comment on the highlight.     |
| ---            | ---          | ---                                           |
| shared_club_id | UUID\|null   | Ref: book_clubs.\_id - if shared with a club. |
| ---            | ---          | ---                                           |
| created_at     | Date         |                                               |
| ---            | ---          | ---                                           |
| deleted_at     | Date\|null   |                                               |
| ---            | ---          | ---                                           |

**Indexes**

| **Index Definition**                    | **Purpose**                        |
| --------------------------------------- | ---------------------------------- |
| { user_id: 1, title_id: 1 }             | Reader's highlights in a book      |
| ---                                     | ---                                |
| { user_id: 1, title_id: 1, chapter: 1 } | Chapter-level highlight navigation |
| ---                                     | ---                                |
| { shared_club_id: 1 }                   | Club shared highlights             |
| ---                                     | ---                                |

## **19\. annotations**

Reader notes attached to book positions

| **Field**      | **Type**     | **Description / Notes**   |
| -------------- | ------------ | ------------------------- |
| \_id           | UUID         |                           |
| ---            | ---          | ---                       |
| user_id        | UUID         |                           |
| ---            | ---          | ---                       |
| title_id       | UUID         |                           |
| ---            | ---          | ---                       |
| cfi            | string       | EPUB CFI anchor position. |
| ---            | ---          | ---                       |
| chapter        | number       |                           |
| ---            | ---          | ---                       |
| note           | string       | Reader's free-text note.  |
| ---            | ---          | ---                       |
| page_reference | string\|null | e.g. p. 142               |
| ---            | ---          | ---                       |
| shared_club_id | UUID\|null   | Ref: book_clubs.\_id      |
| ---            | ---          | ---                       |
| created_at     | Date         |                           |
| ---            | ---          | ---                       |
| deleted_at     | Date\|null   |                           |
| ---            | ---          | ---                       |

**Indexes**

| **Index Definition**        | **Purpose**                    |
| --------------------------- | ------------------------------ |
| { user_id: 1, title_id: 1 } | Reader's annotations in a book |
| ---                         | ---                            |
| { shared_club_id: 1 }       | Club shared annotations        |
| ---                         | ---                            |

## **20\. reader_settings**

eReader display & audio preferences per user

| **Field**              | **Type**     | **Description / Notes**                           |
| ---------------------- | ------------ | ------------------------------------------------- |
| \_id                   | UUID         | Same as users.\_id (1:1).                         |
| ---                    | ---          | ---                                               |
| user_id                | UUID         | Unique ref to users.\_id.                         |
| ---                    | ---          | ---                                               |
| font_family            | string       | Georgia \| OpenDyslexic \| Merriweather \| System |
| ---                    | ---          | ---                                               |
| font_size              | number       | Point size (e.g. 18).                             |
| ---                    | ---          | ---                                               |
| line_spacing           | number       | e.g. 1.6                                          |
| ---                    | ---          | ---                                               |
| margin                 | enum         | normal \| wide \| narrow                          |
| ---                    | ---          | ---                                               |
| theme                  | enum         | light \| dark \| sepia \| system                  |
| ---                    | ---          | ---                                               |
| text_to_speech_enabled | boolean      |                                                   |
| ---                    | ---          | ---                                               |
| high_contrast          | boolean      | Accessibility setting.                            |
| ---                    | ---          | ---                                               |
| colour_blind_mode      | enum         | none \| protanopia \| deuteranopia \| tritanopia  |
| ---                    | ---          | ---                                               |
| audio_playback_speed   | number       | e.g. 1.25                                         |
| ---                    | ---          | ---                                               |
| sleep_timer_minutes    | number\|null | null = no sleep timer.                            |
| ---                    | ---          | ---                                               |
| page_turn_animation    | boolean      |                                                   |
| ---                    | ---          | ---                                               |
| show_progress_bar      | boolean      |                                                   |
| ---                    | ---          | ---                                               |
| created_at             | Date         |                                                   |
| ---                    | ---          | ---                                               |
| updated_at             | Date         |                                                   |
| ---                    | ---          | ---                                               |

**Indexes**

| **Index Definition** | **Purpose**                |
| -------------------- | -------------------------- |
| { user_id: 1 }       | Unique - settings per user |
| ---                  | ---                        |

## **21\. reading_lists**

Named lists of titles created by readers

| **Field**    | **Type**     | **Description / Notes**                                                                     |
| ------------ | ------------ | ------------------------------------------------------------------------------------------- |
| \_id         | UUID         |                                                                                             |
| ---          | ---          | ---                                                                                         |
| user_id      | UUID         | Ref: users.\_id                                                                             |
| ---          | ---          | ---                                                                                         |
| name         | string       | e.g. Want to Read, Favourites.                                                              |
| ---          | ---          | ---                                                                                         |
| description  | string\|null |                                                                                             |
| ---          | ---          | ---                                                                                         |
| emoji        | string\|null | Optional decorative emoji.                                                                  |
| ---          | ---          | ---                                                                                         |
| is_public    | boolean      | Whether the list is visible to other users.                                                 |
| ---          | ---          | ---                                                                                         |
| is_system    | boolean      | True for default system lists like Favourites.                                              |
| ---          | ---          | ---                                                                                         |
| titles       | object\[\]   | Embedded entries: title_id, title_snapshot (title, cover_url, author_name), added_at, note. |
| ---          | ---          | ---                                                                                         |
| title_count  | number       | Denormalised count for list header display.                                                 |
| ---          | ---          | ---                                                                                         |
| export_token | string       | Random token for shareable URL.                                                             |
| ---          | ---          | ---                                                                                         |
| created_at   | Date         |                                                                                             |
| ---          | ---          | ---                                                                                         |
| deleted_at   | Date\|null   |                                                                                             |
| ---          | ---          | ---                                                                                         |

**Indexes**

| **Index Definition**          | **Purpose**                      |
| ----------------------------- | -------------------------------- |
| { user_id: 1, deleted_at: 1 } | User's lists                     |
| ---                           | ---                              |
| { user_id: 1, is_public: 1 }  | Public list discovery            |
| ---                           | ---                              |
| { 'titles.title_id': 1 }      | Find which lists contain a title |
| ---                           | ---                              |
| { export_token: 1 }           | Shareable link lookup            |
| ---                           | ---                              |

## **22\. user_tags**

User-defined tags applied to titles

| **Field**  | **Type**   | **Description / Notes**                 |
| ---------- | ---------- | --------------------------------------- |
| \_id       | UUID       |                                         |
| ---        | ---        | ---                                     |
| user_id    | UUID       |                                         |
| ---        | ---        | ---                                     |
| title_id   | UUID       |                                         |
| ---        | ---        | ---                                     |
| tags       | string\[\] | User-defined tag strings on this title. |
| ---        | ---        | ---                                     |
| created_at | Date       |                                         |
| ---        | ---        | ---                                     |
| updated_at | Date       |                                         |
| ---        | ---        | ---                                     |

**Indexes**

| **Index Definition**        | **Purpose**                  |
| --------------------------- | ---------------------------- |
| { user_id: 1, title_id: 1 } | Unique - tags per user+title |
| ---                         | ---                          |
| { user_id: 1, tags: 1 }     | Filter titles by tag         |
| ---                         | ---                          |

## **23\. reading_goals**

Yearly / monthly reading targets

| **Field**           | **Type**     | **Description / Notes**                      |
| ------------------- | ------------ | -------------------------------------------- |
| \_id                | UUID         |                                              |
| ---                 | ---          | ---                                          |
| user_id             | UUID         |                                              |
| ---                 | ---          | ---                                          |
| year                | number       | e.g. 2025                                    |
| ---                 | ---          | ---                                          |
| month               | number\|null | 1-12 for monthly goal; null for yearly goal. |
| ---                 | ---          | ---                                          |
| target_books        | number       |                                              |
| ---                 | ---          | ---                                          |
| target_pages        | number\|null |                                              |
| ---                 | ---          | ---                                          |
| target_hours        | number\|null |                                              |
| ---                 | ---          | ---                                          |
| books_completed     | number       | Denormalised progress counter.               |
| ---                 | ---          | ---                                          |
| pages_read          | number       | Denormalised.                                |
| ---                 | ---          | ---                                          |
| hours_read          | number       | Denormalised.                                |
| ---                 | ---          | ---                                          |
| current_streak_days | number       | Days read in a row.                          |
| ---                 | ---          | ---                                          |
| longest_streak_days | number       | All-time longest streak.                     |
| ---                 | ---          | ---                                          |
| last_read_date      | Date         | Date of last reading session.                |
| ---                 | ---          | ---                                          |
| created_at          | Date         |                                              |
| ---                 | ---          | ---                                          |
| updated_at          | Date         |                                              |
| ---                 | ---          | ---                                          |

**Indexes**

| **Index Definition**              | **Purpose**                           |
| --------------------------------- | ------------------------------------- |
| { user_id: 1, year: 1, month: 1 } | Unique - one goal per period per user |
| ---                               | ---                                   |

## **24\. badges**

Badge definitions managed by admin

| **Field**   | **Type** | **Description / Notes**                                              |
| ----------- | -------- | -------------------------------------------------------------------- |
| \_id        | UUID     |                                                                      |
| ---         | ---      | ---                                                                  |
| code        | string   | Unique machine-readable code e.g. first_borrow.                      |
| ---         | ---      | ---                                                                  |
| name        | string   | Display name e.g. First Borrow.                                      |
| ---         | ---      | ---                                                                  |
| description | string   | Shown to reader when earned.                                         |
| ---         | ---      | ---                                                                  |
| icon_url    | string   | CDN URL for badge SVG icon.                                          |
| ---         | ---      | ---                                                                  |
| category    | enum     | reading \| social \| milestone \| genre \| streak                    |
| ---         | ---      | ---                                                                  |
| trigger     | object   | type (borrow_count\|completion_count\|streak_days\|etc.), threshold. |
| ---         | ---      | ---                                                                  |
| is_active   | boolean  |                                                                      |
| ---         | ---      | ---                                                                  |
| created_at  | Date     |                                                                      |
| ---         | ---      | ---                                                                  |

**Indexes**

| **Index Definition**         | **Purpose**                 |
| ---------------------------- | --------------------------- |
| { code: 1 }                  | Unique - trigger evaluation |
| ---                          | ---                         |
| { category: 1, is_active: 1} | Badge catalogue display     |
| ---                          | ---                         |

## **25\. user_badges**

Badge awards per user

| **Field**  | **Type** | **Description / Notes**       |
| ---------- | -------- | ----------------------------- |
| \_id       | UUID     |                               |
| ---        | ---      | ---                           |
| user_id    | UUID     |                               |
| ---        | ---      | ---                           |
| badge_id   | UUID     | Ref: badges.\_id              |
| ---        | ---      | ---                           |
| badge_code | string   | Denormalised for fast lookup. |
| ---        | ---      | ---                           |
| earned_at  | Date     |                               |
| ---        | ---      | ---                           |

**Indexes**

| **Index Definition**        | **Purpose**                       |
| --------------------------- | --------------------------------- |
| { user_id: 1 }              | User's badge collection           |
| ---                         | ---                               |
| { user_id: 1, badge_id: 1 } | Unique - prevent duplicate awards |
| ---                         | ---                               |

## **26\. reviews**

Reader reviews & ratings with moderation

| **Field**        | **Type**     | **Description / Notes**                                           |
| ---------------- | ------------ | ----------------------------------------------------------------- |
| \_id             | UUID         |                                                                   |
| ---              | ---          | ---                                                               |
| title_id         | UUID         | Ref: titles.\_id                                                  |
| ---              | ---          | ---                                                               |
| user_id          | UUID         | Ref: users.\_id                                                   |
| ---              | ---          | ---                                                               |
| rating           | number       | 1-5 star rating.                                                  |
| ---              | ---          | ---                                                               |
| headline         | string\|null |                                                                   |
| ---              | ---          | ---                                                               |
| body             | string       | Review text.                                                      |
| ---              | ---          | ---                                                               |
| status           | enum         | pending \| approved \| removed                                    |
| ---              | ---          | ---                                                               |
| moderated_by     | UUID\|null   | Admin who actioned this review.                                   |
| ---              | ---          | ---                                                               |
| removal_reason   | string\|null |                                                                   |
| ---              | ---          | ---                                                               |
| report_count     | number       | Number of reader reports.                                         |
| ---              | ---          | ---                                                               |
| reported_by      | UUID\[\]     | User IDs who reported.                                            |
| ---              | ---          | ---                                                               |
| like_count       | number       | Denormalised.                                                     |
| ---              | ---          | ---                                                               |
| liked_by         | UUID\[\]     | User IDs (move to separate collection when large).                |
| ---              | ---          | ---                                                               |
| comment_count    | number       | Denormalised.                                                     |
| ---              | ---          | ---                                                               |
| comments         | object\[\]   | Embedded: \_id, user_id, user_name, body, created_at, deleted_at. |
| ---              | ---          | ---                                                               |
| author_reply     | object\|null | Embedded: body, replied_at, updated_at.                           |
| ---              | ---          | ---                                                               |
| contains_spoiler | boolean      | Reader-flagged spoiler warning.                                   |
| ---              | ---          | ---                                                               |
| format_read      | enum\|null   | ebook \| audiobook \| pdf                                         |
| ---              | ---          | ---                                                               |
| created_at       | Date         |                                                                   |
| ---              | ---          | ---                                                               |
| deleted_at       | Date\|null   |                                                                   |
| ---              | ---          | ---                                                               |

**Indexes**

| **Index Definition**                       | **Purpose**                        |
| ------------------------------------------ | ---------------------------------- |
| { title_id: 1, status: 1, created_at: -1 } | Title review listing               |
| ---                                        | ---                                |
| { user_id: 1 }                             | User's reviews                     |
| ---                                        | ---                                |
| { title_id: 1, user_id: 1 }                | Unique - one review per user+title |
| ---                                        | ---                                |
| { status: 1, report_count: -1 }            | Moderation queue priority          |
| ---                                        | ---                                |

## **27\. follows**

Reader↔Reader and Reader↔Author follows

| **Field**     | **Type** | **Description / Notes**                  |
| ------------- | -------- | ---------------------------------------- |
| \_id          | UUID     |                                          |
| ---           | ---      | ---                                      |
| follower_id   | UUID     | Ref: users.\_id - the user following.    |
| ---           | ---      | ---                                      |
| followed_id   | UUID     | Ref: users.\_id or author_profiles.\_id. |
| ---           | ---      | ---                                      |
| followed_type | enum     | reader \| author                         |
| ---           | ---      | ---                                      |
| created_at    | Date     |                                          |
| ---           | ---      | ---                                      |

**Indexes**

| **Index Definition**                 | **Purpose**                        |
| ------------------------------------ | ---------------------------------- |
| { follower_id: 1, followed_type: 1 } | Who I follow (by type)             |
| ---                                  | ---                                |
| { followed_id: 1, followed_type: 1 } | Who follows me                     |
| ---                                  | ---                                |
| { follower_id: 1, followed_id: 1 }   | Unique - prevent duplicate follows |
| ---                                  | ---                                |

## **28\. book_clubs**

Reader-created book club groups

| **Field**        | **Type**     | **Description / Notes** |
| ---------------- | ------------ | ----------------------- |
| \_id             | UUID         |                         |
| ---              | ---          | ---                     |
| owner_id         | UUID         | Ref: users.\_id         |
| ---              | ---          | ---                     |
| name             | string       |                         |
| ---              | ---          | ---                     |
| slug             | string       | Unique URL slug.        |
| ---              | ---          | ---                     |
| description      | string       |                         |
| ---              | ---          | ---                     |
| cover_url        | string\|null |                         |
| ---              | ---          | ---                     |
| genre_focus      | string\[\]   | Genre focus tags.       |
| ---              | ---          | ---                     |
| current_title_id | UUID\|null   | Currently reading book. |
| ---              | ---          | ---                     |
| is_public        | boolean      |                         |
| ---              | ---          | ---                     |
| member_limit     | number\|null | null = unlimited.       |
| ---              | ---          | ---                     |
| member_count     | number       | Denormalised.           |
| ---              | ---          | ---                     |
| created_at       | Date         |                         |
| ---              | ---          | ---                     |
| deleted_at       | Date\|null   |                         |
| ---              | ---          | ---                     |

**Indexes**

| **Index Definition** | **Purpose**                |
| -------------------- | -------------------------- |
| { owner_id: 1 }      | Owner's clubs              |
| ---                  | ---                        |
| { slug: 1 }          | Unique - URL routing       |
| ---                  | ---                        |
| { is_public: 1 }     | Public club discovery      |
| ---                  | ---                        |
| { genre_focus: 1 }   | Genre-based club discovery |
| ---                  | ---                        |

## **29\. book_club_members**

Book club membership records

| **Field** | **Type**   | **Description / Notes**          |
| --------- | ---------- | -------------------------------- |
| \_id      | UUID       |                                  |
| ---       | ---        | ---                              |
| club_id   | UUID       | Ref: book_clubs.\_id             |
| ---       | ---        | ---                              |
| user_id   | UUID       | Ref: users.\_id                  |
| ---       | ---        | ---                              |
| role      | enum       | owner \| moderator \| member     |
| ---       | ---        | ---                              |
| joined_at | Date       |                                  |
| ---       | ---        | ---                              |
| left_at   | Date\|null | When member left or was removed. |
| ---       | ---        | ---                              |

**Indexes**

| **Index Definition**       | **Purpose**                 |
| -------------------------- | --------------------------- |
| { club_id: 1, user_id: 1 } | Unique - membership record  |
| ---                        | ---                         |
| { user_id: 1 }             | All clubs a user belongs to |
| ---                        | ---                         |
| { club_id: 1, role: 1 }    | Moderator lookup            |
| ---                        | ---                         |

## **30\. discussions**

Threaded discussions inside book clubs

| **Field**      | **Type**   | **Description / Notes**                               |
| -------------- | ---------- | ----------------------------------------------------- |
| \_id           | UUID       |                                                       |
| ---            | ---        | ---                                                   |
| club_id        | UUID       | Ref: book_clubs.\_id                                  |
| ---            | ---        | ---                                                   |
| title_id       | UUID\|null | Discussion about a specific book.                     |
| ---            | ---        | ---                                                   |
| parent_id      | UUID\|null | null = thread root. Set = reply to parent.            |
| ---            | ---        | ---                                                   |
| depth          | number     | 0 = root, 1 = reply, 2 = reply to reply. Max depth 2. |
| ---            | ---        | ---                                                   |
| author_id      | UUID       | Ref: users.\_id                                       |
| ---            | ---        | ---                                                   |
| body           | string     | Post content.                                         |
| ---            | ---        | ---                                                   |
| annotation_ids | UUID\[\]   | Shared annotations attached to this post.             |
| ---            | ---        | ---                                                   |
| status         | enum       | visible \| removed \| flagged                         |
| ---            | ---        | ---                                                   |
| report_count   | number     |                                                       |
| ---            | ---        | ---                                                   |
| like_count     | number     | Denormalised.                                         |
| ---            | ---        | ---                                                   |
| reply_count    | number     | Denormalised (root posts only).                       |
| ---            | ---        | ---                                                   |
| created_at     | Date       |                                                       |
| ---            | ---        | ---                                                   |
| deleted_at     | Date\|null |                                                       |
| ---            | ---        | ---                                                   |

**Indexes**

| **Index Definition**                        | **Purpose**                  |
| ------------------------------------------- | ---------------------------- |
| { club_id: 1, parent_id: 1, created_at: 1 } | Thread listing in time order |
| ---                                         | ---                          |
| { author_id: 1 }                            | User's posts                 |
| ---                                         | ---                          |
| { status: 1, report_count: -1 }             | Moderation queue             |
| ---                                         | ---                          |

## **31\. citations**

Saved research citations

| **Field**  | **Type**     | **Description / Notes**          |
| ---------- | ------------ | -------------------------------- |
| \_id       | UUID         |                                  |
| ---        | ---          | ---                              |
| user_id    | UUID         |                                  |
| ---        | ---          | ---                              |
| title_id   | UUID         |                                  |
| ---        | ---          | ---                              |
| style      | enum         | APA \| MLA \| Chicago \| Harvard |
| ---        | ---          | ---                              |
| page_range | string\|null | e.g. 45-52                       |
| ---        | ---          | ---                              |
| formatted  | string       | Formatted citation string.       |
| ---        | ---          | ---                              |
| annotation | string\|null | Annotated bibliography note.     |
| ---        | ---          | ---                              |
| created_at | Date         |                                  |
| ---        | ---          | ---                              |
| deleted_at | Date\|null   |                                  |
| ---        | ---          | ---                              |

**Indexes**

| **Index Definition**           | **Purpose**             |
| ------------------------------ | ----------------------- |
| { user_id: 1, created_at: -1 } | User's citation library |
| ---                            | ---                     |
| { user_id: 1, title_id: 1 }    | Citations per title     |
| ---                            | ---                     |

## **32\. events**

Author events, webinars & live Q&As

| **Field**      | **Type**         | **Description / Notes**                                |
| -------------- | ---------------- | ------------------------------------------------------ |
| \_id           | UUID             |                                                        |
| ---            | ---              | ---                                                    |
| title          | string           | Event display title.                                   |
| ---            | ---              | ---                                                    |
| slug           | string           | Unique URL slug.                                       |
| ---            | ---              | ---                                                    |
| description    | string           |                                                        |
| ---            | ---              | ---                                                    |
| type           | enum             | webinar \| live_qa \| author_talk \| workshop \| other |
| ---            | ---              | ---                                                    |
| format         | enum             | virtual \| in_person \| hybrid                         |
| ---            | ---              | ---                                                    |
| organiser_type | enum             | admin \| author                                        |
| ---            | ---              | ---                                                    |
| organiser_id   | UUID             | Ref: users.\_id                                        |
| ---            | ---              | ---                                                    |
| title_id       | UUID\|null       | Associated book if applicable.                         |
| ---            | ---              | ---                                                    |
| platform       | string\|null     | zoom \| teams \| native_stream                         |
| ---            | ---              | ---                                                    |
| meeting_url    | string\|null     |                                                        |
| ---            | ---              | ---                                                    |
| starts_at      | Date             |                                                        |
| ---            | ---              | ---                                                    |
| ends_at        | Date             |                                                        |
| ---            | ---              | ---                                                    |
| timezone       | string           | e.g. Asia/Dhaka                                        |
| ---            | ---              | ---                                                    |
| rsvp_limit     | number\|null     | null = unlimited.                                      |
| ---            | ---              | ---                                                    |
| rsvp_count     | number           | Denormalised.                                          |
| ---            | ---              | ---                                                    |
| is_public      | boolean          |                                                        |
| ---            | ---              | ---                                                    |
| eligible_plans | string\[\]\|null | Plan restrictions if any.                              |
| ---            | ---              | ---                                                    |
| recording_url  | string\|null     | Post-event recording.                                  |
| ---            | ---              | ---                                                    |
| resources      | object\[\]       | Attached files: label, url.                            |
| ---            | ---              | ---                                                    |
| status         | enum             | scheduled \| live \| completed \| cancelled            |
| ---            | ---              | ---                                                    |
| created_at     | Date             |                                                        |
| ---            | ---              | ---                                                    |

**Indexes**

| **Index Definition**              | **Purpose**              |
| --------------------------------- | ------------------------ |
| { organiser_id: 1, starts_at: 1 } | Author's events          |
| ---                               | ---                      |
| { starts_at: 1, status: 1 }       | Upcoming events calendar |
| ---                               | ---                      |
| { slug: 1 }                       | Unique - URL routing     |
| ---                               | ---                      |

## **33\. event_rsvps**

RSVP records for events

| **Field**   | **Type**     | **Description / Notes**                        |
| ----------- | ------------ | ---------------------------------------------- |
| \_id        | UUID         |                                                |
| ---         | ---          | ---                                            |
| event_id    | UUID         | Ref: events.\_id                               |
| ---         | ---          | ---                                            |
| user_id     | UUID         | Ref: users.\_id                                |
| ---         | ---          | ---                                            |
| status      | enum         | confirmed \| cancelled \| attended             |
| ---         | ---          | ---                                            |
| rsvped_at   | Date         |                                                |
| ---         | ---          | ---                                            |
| attended_at | Date\|null   |                                                |
| ---         | ---          | ---                                            |
| feedback    | object\|null | Embedded: rating (1-5), comment, submitted_at. |
| ---         | ---          | ---                                            |

**Indexes**

| **Index Definition**        | **Purpose**                      |
| --------------------------- | -------------------------------- |
| { event_id: 1, user_id: 1 } | Unique - one RSVP per user+event |
| ---                         | ---                              |
| { user_id: 1, status: 1 }   | User's upcoming events           |
| ---                         | ---                              |
| { event_id: 1, status: 1 }  | Attendance count                 |
| ---                         | ---                              |

## **34\. notifications**

Per-user notification inbox

| **Field**    | **Type**     | **Description / Notes**                                                                                                                                                          |
| ------------ | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \_id         | UUID         |                                                                                                                                                                                  |
| ---          | ---          | ---                                                                                                                                                                              |
| user_id      | UUID         | Ref: users.\_id                                                                                                                                                                  |
| ---          | ---          | ---                                                                                                                                                                              |
| type         | enum         | hold_available \| new_follower \| review_liked \| new_release \| event_reminder \| badge_earned \| payout_processed \| title_approved \| title_rejected \| admin_warning \| etc. |
| ---          | ---          | ---                                                                                                                                                                              |
| title        | string       | Short notification title.                                                                                                                                                        |
| ---          | ---          | ---                                                                                                                                                                              |
| body         | string       | Notification message.                                                                                                                                                            |
| ---          | ---          | ---                                                                                                                                                                              |
| action_url   | string\|null | Deep link URL.                                                                                                                                                                   |
| ---          | ---          | ---                                                                                                                                                                              |
| action_label | string\|null | CTA button label.                                                                                                                                                                |
| ---          | ---          | ---                                                                                                                                                                              |
| ref_type     | string\|null | title \| event \| review \| club \| payout                                                                                                                                       |
| ---          | ---          | ---                                                                                                                                                                              |
| ref_id       | UUID\|null   | Reference entity ID.                                                                                                                                                             |
| ---          | ---          | ---                                                                                                                                                                              |
| read         | boolean      |                                                                                                                                                                                  |
| ---          | ---          | ---                                                                                                                                                                              |
| read_at      | Date\|null   |                                                                                                                                                                                  |
| ---          | ---          | ---                                                                                                                                                                              |
| created_at   | Date         |                                                                                                                                                                                  |
| ---          | ---          | ---                                                                                                                                                                              |
| expires_at   | Date\|null   | TTL index for auto-deletion of old notifications.                                                                                                                                |
| ---          | ---          | ---                                                                                                                                                                              |
| deleted_at   | Date\|null   |                                                                                                                                                                                  |
| ---          | ---          | ---                                                                                                                                                                              |

**Indexes**

| **Index Definition**                    | **Purpose**                 |
| --------------------------------------- | --------------------------- |
| { user_id: 1, read: 1, created_at: -1 } | Unread inbox                |
| ---                                     | ---                         |
| { user_id: 1, type: 1 }                 | Filter by notification type |
| ---                                     | ---                         |
| { expires_at: 1 }                       | TTL - auto-expiry           |
| ---                                     | ---                         |

## **35\. saved_searches**

Saved search queries & keyword alerts

| **Field**       | **Type**   | **Description / Notes**                                               |
| --------------- | ---------- | --------------------------------------------------------------------- |
| \_id            | UUID       |                                                                       |
| ---             | ---        | ---                                                                   |
| user_id         | UUID       |                                                                       |
| ---             | ---        | ---                                                                   |
| name            | string     | User-given label for the search.                                      |
| ---             | ---        | ---                                                                   |
| query           | object     | Embedded filter state: keyword, genres, language, format, rating_min. |
| ---             | ---        | ---                                                                   |
| alert_enabled   | boolean    | Notify user when new matching titles appear.                          |
| ---             | ---        | ---                                                                   |
| last_alerted_at | Date\|null |                                                                       |
| ---             | ---        | ---                                                                   |
| last_run_at     | Date\|null |                                                                       |
| ---             | ---        | ---                                                                   |
| created_at      | Date       |                                                                       |
| ---             | ---        | ---                                                                   |

**Indexes**

| **Index Definition** | **Purpose**           |
| -------------------- | --------------------- |
| { user_id: 1 }       | User's saved searches |
| ---                  | ---                   |
| { alert_enabled: 1 } | Alert processing job  |
| ---                  | ---                   |

## **36\. royalties**

Per-period royalty calculation records

| **Field**           | **Type**   | **Description / Notes**                                 |
| ------------------- | ---------- | ------------------------------------------------------- |
| \_id                | UUID       |                                                         |
| ---                 | ---        | ---                                                     |
| author_id           | UUID       | Ref: users.\_id                                         |
| ---                 | ---        | ---                                                     |
| publisher_id        | UUID\|null |                                                         |
| ---                 | ---        | ---                                                     |
| title_id            | UUID       |                                                         |
| ---                 | ---        | ---                                                     |
| period_start        | Date       | Start of royalty calculation period.                    |
| ---                 | ---        | ---                                                     |
| period_end          | Date       |                                                         |
| ---                 | ---        | ---                                                     |
| subscription_reads  | number     | Reads via subscription in this period.                  |
| ---                 | ---        | ---                                                     |
| purchases           | number     | One-time purchases in this period.                      |
| ---                 | ---        | ---                                                     |
| formula_snapshot    | object     | Rate and calculation method at time of calculation.     |
| ---                 | ---        | ---                                                     |
| gross_amount        | number     |                                                         |
| ---                 | ---        | ---                                                     |
| platform_commission | number     |                                                         |
| ---                 | ---        | ---                                                     |
| net_amount          | number     | Amount owed to author/publisher.                        |
| ---                 | ---        | ---                                                     |
| currency            | string     |                                                         |
| ---                 | ---        | ---                                                     |
| revenue_shares      | object\[\] | Co-author split: user_id, share_percent, amount.        |
| ---                 | ---        | ---                                                     |
| status              | enum       | calculated \| approved \| paid \| disputed \| corrected |
| ---                 | ---        | ---                                                     |
| approved_by         | UUID\|null |                                                         |
| ---                 | ---        | ---                                                     |
| payout_id           | UUID\|null | Ref: payout_requests.\_id when included in a payout.    |
| ---                 | ---        | ---                                                     |
| created_at          | Date       |                                                         |
| ---                 | ---        | ---                                                     |

**Indexes**

| **Index Definition**               | **Purpose**                 |
| ---------------------------------- | --------------------------- |
| { author_id: 1, period_start: -1 } | Author royalty history      |
| ---                                | ---                         |
| { title_id: 1, period_start: -1 }  | Per-title royalty reporting |
| ---                                | ---                         |
| { status: 1 }                      | Pending approval queue      |
| ---                                | ---                         |
| { payout_id: 1 }                   | Payout reconciliation       |
| ---                                | ---                         |

## **37\. payout_methods**

Author / publisher payout accounts

| **Field**  | **Type**     | **Description / Notes**                                                      |
| ---------- | ------------ | ---------------------------------------------------------------------------- |
| \_id       | UUID         |                                                                              |
| ---        | ---          | ---                                                                          |
| user_id    | UUID         |                                                                              |
| ---        | ---          | ---                                                                          |
| is_default | boolean      |                                                                              |
| ---        | ---          | ---                                                                          |
| type       | enum         | bank_transfer \| paypal \| bkash \| nagad                                    |
| ---        | ---          | ---                                                                          |
| bank       | object\|null | bank_name, account_number_last4, routing_number, account_holder, swift_code. |
| ---        | ---          | ---                                                                          |
| mobile     | object\|null | provider (bkash\|nagad), number.                                             |
| ---        | ---          | ---                                                                          |
| paypal     | object\|null | email.                                                                       |
| ---        | ---          | ---                                                                          |
| currency   | string       |                                                                              |
| ---        | ---          | ---                                                                          |
| country    | string       |                                                                              |
| ---        | ---          | ---                                                                          |
| created_at | Date         |                                                                              |
| ---        | ---          | ---                                                                          |
| deleted_at | Date\|null   |                                                                              |
| ---        | ---          | ---                                                                          |

**Indexes**

| **Index Definition**          | **Purpose**           |
| ----------------------------- | --------------------- |
| { user_id: 1, is_default: 1 } | Default payout method |
| ---                           | ---                   |

## **38\. payout_requests**

Payout disbursement records

| **Field**              | **Type**     | **Description / Notes**                                                           |
| ---------------------- | ------------ | --------------------------------------------------------------------------------- |
| \_id                   | UUID         |                                                                                   |
| ---                    | ---          | ---                                                                               |
| user_id                | UUID         |                                                                                   |
| ---                    | ---          | ---                                                                               |
| payout_method_id       | UUID         | Ref: payout_methods.\_id                                                          |
| ---                    | ---          | ---                                                                               |
| royalty_ids            | UUID\[\]     | Royalty records included in this payout.                                          |
| ---                    | ---          | ---                                                                               |
| amount                 | number       |                                                                                   |
| ---                    | ---          | ---                                                                               |
| currency               | string       |                                                                                   |
| ---                    | ---          | ---                                                                               |
| type                   | enum         | manual_request \| scheduled_auto                                                  |
| ---                    | ---          | ---                                                                               |
| status                 | enum         | pending \| approved \| processing \| completed \| failed \| disputed \| corrected |
| ---                    | ---          | ---                                                                               |
| approved_by            | UUID\|null   |                                                                                   |
| ---                    | ---          | ---                                                                               |
| processed_at           | Date\|null   |                                                                                   |
| ---                    | ---          | ---                                                                               |
| gateway_transaction_id | string\|null | External payment reference.                                                       |
| ---                    | ---          | ---                                                                               |
| created_at             | Date         |                                                                                   |
| ---                    | ---          | ---                                                                               |

**Indexes**

| **Index Definition**           | **Purpose**                   |
| ------------------------------ | ----------------------------- |
| { user_id: 1, created_at: -1 } | Author payout history         |
| ---                            | ---                           |
| { status: 1 }                  | Admin payout processing queue |
| ---                            | ---                           |
| { royalty_ids: 1 }             | Royalty reconciliation        |
| ---                            | ---                           |

## **39\. promotions**

Placement requests, banners, pre-orders, free windows

| **Field**        | **Type**     | **Description / Notes**                                           |
| ---------------- | ------------ | ----------------------------------------------------------------- |
| \_id             | UUID         |                                                                   |
| ---              | ---          | ---                                                               |
| author_id        | UUID         |                                                                   |
| ---              | ---          | ---                                                               |
| title_id         | UUID\|null   |                                                                   |
| ---              | ---          | ---                                                               |
| type             | enum         | placement_request \| banner \| preorder \| free_window            |
| ---              | ---          | ---                                                               |
| placement        | object\|null | shelf_type, message, requested_from, requested_until.             |
| ---              | ---          | ---                                                               |
| banner           | object\|null | image_url, headline, target_url.                                  |
| ---              | ---          | ---                                                               |
| preorder         | object\|null | release_date, preorder_price, landing_url.                        |
| ---              | ---          | ---                                                               |
| free_window      | object\|null | starts_at, ends_at.                                               |
| ---              | ---          | ---                                                               |
| status           | enum         | pending \| approved \| rejected \| active \| expired \| cancelled |
| ---              | ---          | ---                                                               |
| reviewed_by      | UUID\|null   |                                                                   |
| ---              | ---          | ---                                                               |
| reviewed_at      | Date\|null   |                                                                   |
| ---              | ---          | ---                                                               |
| rejection_reason | string\|null |                                                                   |
| ---              | ---          | ---                                                               |
| created_at       | Date         |                                                                   |
| ---              | ---          | ---                                                               |
| deleted_at       | Date\|null   |                                                                   |
| ---              | ---          | ---                                                               |

**Indexes**

| **Index Definition**           | **Purpose**                   |
| ------------------------------ | ----------------------------- |
| { author_id: 1, type: 1 }      | Author's promotions by type   |
| ---                            | ---                           |
| { status: 1, type: 1 }         | Admin approval queue          |
| ---                            | ---                           |
| { 'free_window.starts_at': 1 } | Active free window scheduling |
| ---                            | ---                           |

## **40\. affiliate_links**

External promotion tracking links

| **Field**          | **Type**   | **Description / Notes**                  |
| ------------------ | ---------- | ---------------------------------------- |
| \_id               | UUID       |                                          |
| ---                | ---        | ---                                      |
| user_id            | UUID       |                                          |
| ---                | ---        | ---                                      |
| title_id           | UUID\|null |                                          |
| ---                | ---        | ---                                      |
| bundle_id          | UUID\|null |                                          |
| ---                | ---        | ---                                      |
| slug               | string     | Unique short identifier appended to URL. |
| ---                | ---        | ---                                      |
| full_url           | string     | Full trackable URL.                      |
| ---                | ---        | ---                                      |
| clicks             | number     | Total click count.                       |
| ---                | ---        | ---                                      |
| conversions        | number     | Purchases / subscriptions via this link. |
| ---                | ---        | ---                                      |
| revenue_attributed | number     | Revenue generated through this link.     |
| ---                | ---        | ---                                      |
| currency           | string     |                                          |
| ---                | ---        | ---                                      |
| is_active          | boolean    |                                          |
| ---                | ---        | ---                                      |
| expires_at         | Date\|null |                                          |
| ---                | ---        | ---                                      |
| created_at         | Date       |                                          |
| ---                | ---        | ---                                      |

**Indexes**

| **Index Definition** | **Purpose**                       |
| -------------------- | --------------------------------- |
| { user_id: 1 }       | Author's links                    |
| ---                  | ---                               |
| { slug: 1 }          | Unique - tracking redirect lookup |
| ---                  | ---                               |
| { title_id: 1 }      | Links per title                   |
| ---                  | ---                               |

## **41\. book_club_kits**

Author-created discussion guide kits

| **Field**            | **Type**   | **Description / Notes**                    |
| -------------------- | ---------- | ------------------------------------------ |
| \_id                 | UUID       |                                            |
| ---                  | ---        | ---                                        |
| author_id            | UUID       |                                            |
| ---                  | ---        | ---                                        |
| title_id             | UUID       |                                            |
| ---                  | ---        | ---                                        |
| name                 | string     | Kit display name.                          |
| ---                  | ---        | ---                                        |
| description          | string     |                                            |
| ---                  | ---        | ---                                        |
| files                | object\[\] | label, url, file_type (pdf\|audio\|video). |
| ---                  | ---        | ---                                        |
| discussion_questions | string\[\] | Suggested book club discussion questions.  |
| ---                  | ---        | ---                                        |
| is_public            | boolean    |                                            |
| ---                  | ---        | ---                                        |
| created_at           | Date       |                                            |
| ---                  | ---        | ---                                        |
| deleted_at           | Date\|null |                                            |
| ---                  | ---        | ---                                        |

**Indexes**

| **Index Definition** | **Purpose**               |
| -------------------- | ------------------------- |
| { author_id: 1 }     | Author's kits             |
| ---                  | ---                       |
| { title_id: 1 }      | Kits for a specific title |
| ---                  | ---                       |
| { is_public: 1 }     | Public kit discovery      |
| ---                  | ---                       |

## **42\. announcements**

Author-to-follower newsletters

| **Field**       | **Type**     | **Description / Notes**                 |
| --------------- | ------------ | --------------------------------------- |
| \_id            | UUID         |                                         |
| ---             | ---          | ---                                     |
| author_id       | UUID         |                                         |
| ---             | ---          | ---                                     |
| subject         | string       | Announcement subject line.              |
| ---             | ---          | ---                                     |
| body            | string       | HTML or plain text body.                |
| ---             | ---          | ---                                     |
| title_id        | UUID\|null   | Optional associated title.              |
| ---             | ---          | ---                                     |
| channel         | enum         | email \| in_app \| both                 |
| ---             | ---          | ---                                     |
| status          | enum         | draft \| scheduled \| sent \| cancelled |
| ---             | ---          | ---                                     |
| scheduled_at    | Date\|null   |                                         |
| ---             | ---          | ---                                     |
| sent_at         | Date\|null   |                                         |
| ---             | ---          | ---                                     |
| recipient_count | number       | Number of followers targeted.           |
| ---             | ---          | ---                                     |
| open_count      | number\|null | Email open tracking.                    |
| ---             | ---          | ---                                     |
| created_at      | Date         |                                         |
| ---             | ---          | ---                                     |

**Indexes**

| **Index Definition**             | **Purpose**            |
| -------------------------------- | ---------------------- |
| { author_id: 1, created_at: -1 } | Author's announcements |
| ---                              | ---                    |
| { status: 1, scheduled_at: 1 }   | Scheduled send queue   |
| ---                              | ---                    |

## **43\. reader_questions**

Questions submitted to author profile pages

| **Field**   | **Type**     | **Description / Notes**               |
| ----------- | ------------ | ------------------------------------- |
| \_id        | UUID         |                                       |
| ---         | ---          | ---                                   |
| author_id   | UUID         | Ref: author_profiles.\_id             |
| ---         | ---          | ---                                   |
| reader_id   | UUID\|null   | null if anonymous submission.         |
| ---         | ---          | ---                                   |
| reader_name | string\|null |                                       |
| ---         | ---          | ---                                   |
| question    | string       | Reader's question text.               |
| ---         | ---          | ---                                   |
| answer      | string\|null | Author's answer.                      |
| ---         | ---          | ---                                   |
| answered_at | Date\|null   |                                       |
| ---         | ---          | ---                                   |
| is_public   | boolean      | Author can choose to publish the Q&A. |
| ---         | ---          | ---                                   |
| created_at  | Date         |                                       |
| ---         | ---          | ---                                   |

**Indexes**

| **Index Definition**             | **Purpose**                        |
| -------------------------------- | ---------------------------------- |
| { author_id: 1, answered_at: 1 } | Author's unanswered question queue |
| ---                              | ---                                |
| { reader_id: 1 }                 | Reader's submitted questions       |
| ---                              | ---                                |

## **44\. webhooks**

Author / publisher webhook subscriptions

| **Field**           | **Type**     | **Description / Notes**                               |
| ------------------- | ------------ | ----------------------------------------------------- |
| \_id                | UUID         |                                                       |
| ---                 | ---          | ---                                                   |
| user_id             | UUID         |                                                       |
| ---                 | ---          | ---                                                   |
| url                 | string       | Target endpoint URL.                                  |
| ---                 | ---          | ---                                                   |
| secret              | string       | Hashed HMAC signing secret.                           |
| ---                 | ---          | ---                                                   |
| events              | string\[\]   | Subscribed event types e.g. title.read, royalty.paid. |
| ---                 | ---          | ---                                                   |
| is_active           | boolean      |                                                       |
| ---                 | ---          | ---                                                   |
| failure_count       | number       | Consecutive delivery failures.                        |
| ---                 | ---          | ---                                                   |
| last_triggered_at   | Date\|null   |                                                       |
| ---                 | ---          | ---                                                   |
| last_failure_at     | Date\|null   |                                                       |
| ---                 | ---          | ---                                                   |
| last_failure_reason | string\|null |                                                       |
| ---                 | ---          | ---                                                   |
| created_at          | Date         |                                                       |
| ---                 | ---          | ---                                                   |
| deleted_at          | Date\|null   |                                                       |
| ---                 | ---          | ---                                                   |

**Indexes**

| **Index Definition**        | **Purpose**            |
| --------------------------- | ---------------------- |
| { user_id: 1 }              | User's webhooks        |
| ---                         | ---                    |
| { events: 1, is_active: 1 } | Event dispatch routing |
| ---                         | ---                    |

## **45\. api_keys**

Author / publisher API keys

| **Field**    | **Type**   | **Description / Notes**                                       |
| ------------ | ---------- | ------------------------------------------------------------- |
| \_id         | UUID       |                                                               |
| ---          | ---        | ---                                                           |
| user_id      | UUID       |                                                               |
| ---          | ---        | ---                                                           |
| name         | string     | Human-readable label.                                         |
| ---          | ---        | ---                                                           |
| key_prefix   | string     | e.g. dlk\_ - shown to user for identification.                |
| ---          | ---        | ---                                                           |
| key_hash     | string     | SHA-256 hash of the key. Raw key shown once at creation only. |
| ---          | ---        | ---                                                           |
| last4        | string     | Last 4 chars for display.                                     |
| ---          | ---        | ---                                                           |
| scopes       | string\[\] | Permission scopes e.g. titles:read, analytics:read.           |
| ---          | ---        | ---                                                           |
| last_used_at | Date\|null |                                                               |
| ---          | ---        | ---                                                           |
| expires_at   | Date\|null |                                                               |
| ---          | ---        | ---                                                           |
| is_active    | boolean    |                                                               |
| ---          | ---        | ---                                                           |
| created_at   | Date       |                                                               |
| ---          | ---        | ---                                                           |
| revoked_at   | Date\|null |                                                               |
| ---          | ---        | ---                                                           |

**Indexes**

| **Index Definition** | **Purpose**                           |
| -------------------- | ------------------------------------- |
| { user_id: 1 }       | User's API keys                       |
| ---                  | ---                                   |
| { key_hash: 1 }      | API authentication lookup per request |
| ---                  | ---                                   |

## **46\. uploads**

Upload job tracking (pre-signed URL flow)

| **Field**            | **Type**     | **Description / Notes**                                             |
| -------------------- | ------------ | ------------------------------------------------------------------- |
| \_id                 | UUID         |                                                                     |
| ---                  | ---          | ---                                                                 |
| user_id              | UUID         |                                                                     |
| ---                  | ---          | ---                                                                 |
| filename_original    | string       |                                                                     |
| ---                  | ---          | ---                                                                 |
| content_type         | string       | MIME type e.g. application/epub+zip.                                |
| ---                  | ---          | ---                                                                 |
| size_bytes           | number       |                                                                     |
| ---                  | ---          | ---                                                                 |
| presigned_url        | string       | S3 pre-signed PUT URL (expired after use).                          |
| ---                  | ---          | ---                                                                 |
| presigned_expires_at | Date         | URL expiry time.                                                    |
| ---                  | ---          | ---                                                                 |
| status               | enum         | initiated \| uploaded \| confirmed \| processing \| ready \| failed |
| ---                  | ---          | ---                                                                 |
| error                | string\|null |                                                                     |
| ---                  | ---          | ---                                                                 |
| title_id             | UUID\|null   | Assigned after confirmation step.                                   |
| ---                  | ---          | ---                                                                 |
| format               | string\|null |                                                                     |
| ---                  | ---          | ---                                                                 |
| file_id              | UUID\|null   | Ref: title_files.\_id - set when processing complete.               |
| ---                  | ---          | ---                                                                 |
| created_at           | Date         |                                                                     |
| ---                  | ---          | ---                                                                 |

**Indexes**

| **Index Definition**        | **Purpose**              |
| --------------------------- | ------------------------ |
| { user_id: 1, status: 1 }   | User's active uploads    |
| ---                         | ---                      |
| { presigned_expires_at: 1 } | Stale upload cleanup job |
| ---                         | ---                      |

## **47\. jobs**

Async background job result tracker

| **Field**        | **Type**     | **Description / Notes**                                                                                         |
| ---------------- | ------------ | --------------------------------------------------------------------------------------------------------------- |
| \_id             | UUID         |                                                                                                                 |
| ---              | ---          | ---                                                                                                             |
| type             | enum         | report_generation \| bulk_metadata \| catalogue_audit \| bulk_user_import \| royalty_calculation \| data_export |
| ---              | ---          | ---                                                                                                             |
| initiated_by     | UUID         | User or admin who triggered the job.                                                                            |
| ---              | ---          | ---                                                                                                             |
| status           | enum         | pending \| processing \| done \| failed                                                                         |
| ---              | ---          | ---                                                                                                             |
| input            | object       | Job-specific input parameters.                                                                                  |
| ---              | ---          | ---                                                                                                             |
| result_url       | string\|null | CDN URL for downloadable result file.                                                                           |
| ---              | ---          | ---                                                                                                             |
| error            | string\|null |                                                                                                                 |
| ---              | ---          | ---                                                                                                             |
| progress_percent | number\|null | 0-100 for progress polling.                                                                                     |
| ---              | ---          | ---                                                                                                             |
| created_at       | Date         |                                                                                                                 |
| ---              | ---          | ---                                                                                                             |
| started_at       | Date\|null   |                                                                                                                 |
| ---              | ---          | ---                                                                                                             |
| completed_at     | Date\|null   |                                                                                                                 |
| ---              | ---          | ---                                                                                                             |
| expires_at       | Date         | Result URL expiry.                                                                                              |
| ---              | ---          | ---                                                                                                             |

**Indexes**

| **Index Definition**                | **Purpose**          |
| ----------------------------------- | -------------------- |
| { initiated_by: 1, created_at: -1 } | User's job history   |
| ---                                 | ---                  |
| { status: 1 }                       | Worker queue polling |
| ---                                 | ---                  |
| { expires_at: 1 }                   | Result cleanup       |
| ---                                 | ---                  |

## **48\. audit_logs**

Immutable admin action audit trail

| **Field**   | **Type**     | **Description / Notes**                                 |
| ----------- | ------------ | ------------------------------------------------------- |
| \_id        | UUID         |                                                         |
| ---         | ---          | ---                                                     |
| actor_id    | UUID         | Admin or staff user who performed the action.           |
| ---         | ---          | ---                                                     |
| actor_role  | enum         | admin \| staff                                          |
| ---         | ---          | ---                                                     |
| action      | string       | e.g. user.suspended, title.approved, royalty.processed. |
| ---         | ---          | ---                                                     |
| target_type | string       | Collection name of the affected entity.                 |
| ---         | ---          | ---                                                     |
| target_id   | UUID\|null   | ID of the affected entity.                              |
| ---         | ---          | ---                                                     |
| before      | object\|null | Snapshot of document state before action.               |
| ---         | ---          | ---                                                     |
| after       | object\|null | Snapshot of document state after action.                |
| ---         | ---          | ---                                                     |
| ip_address  | string       | Admin's IP address.                                     |
| ---         | ---          | ---                                                     |
| user_agent  | string       |                                                         |
| ---         | ---          | ---                                                     |
| created_at  | Date         | Immutable - no updated_at.                              |
| ---         | ---          | ---                                                     |

**Indexes**

| **Index Definition**             | **Purpose**                             |
| -------------------------------- | --------------------------------------- |
| { actor_id: 1, created_at: -1 }  | Admin activity by actor                 |
| ---                              | ---                                     |
| { target_type: 1, target_id: 1 } | History of changes to a specific entity |
| ---                              | ---                                     |
| { action: 1, created_at: -1 }    | Action type filtering                   |
| ---                              | ---                                     |
| { created_at: -1 }               | Full log chronological view             |
| ---                              | ---                                     |

## **49\. support_tickets**

Unified support inbox all roles

| **Field**          | **Type**     | **Description / Notes**                                                                      |
| ------------------ | ------------ | -------------------------------------------------------------------------------------------- |
| \_id               | UUID         |                                                                                              |
| ---                | ---          | ---                                                                                          |
| ticket_number      | string       | Unique e.g. TKT-2025-08421.                                                                  |
| ---                | ---          | ---                                                                                          |
| submitter_id       | UUID\|null   | null for pre-login contact form.                                                             |
| ---                | ---          | ---                                                                                          |
| submitter_email    | string       |                                                                                              |
| ---                | ---          | ---                                                                                          |
| submitter_name     | string       |                                                                                              |
| ---                | ---          | ---                                                                                          |
| submitter_role     | enum         | reader \| author \| publisher \| guest                                                       |
| ---                | ---          | ---                                                                                          |
| subject            | string       |                                                                                              |
| ---                | ---          | ---                                                                                          |
| category           | enum         | billing \| access \| content \| account \| technical \| other                                |
| ---                | ---          | ---                                                                                          |
| priority           | enum         | low \| medium \| high \| urgent                                                              |
| ---                | ---          | ---                                                                                          |
| status             | enum         | open \| in_progress \| waiting_user \| resolved \| closed                                    |
| ---                | ---          | ---                                                                                          |
| assigned_to        | UUID\|null   | Staff member handling this ticket.                                                           |
| ---                | ---          | ---                                                                                          |
| sla_due_at         | Date\|null   | SLA deadline.                                                                                |
| ---                | ---          | ---                                                                                          |
| messages           | object\[\]   | Embedded thread: \_id, sender_id, sender_role, body, attachments, sent_at, is_internal_note. |
| ---                | ---          | ---                                                                                          |
| satisfaction_score | number\|null | CSAT score after resolution.                                                                 |
| ---                | ---          | ---                                                                                          |
| created_at         | Date         |                                                                                              |
| ---                | ---          | ---                                                                                          |

**Indexes**

| **Index Definition**                      | **Purpose**                |
| ----------------------------------------- | -------------------------- |
| { ticket_number: 1 }                      | Unique - direct lookup     |
| ---                                       | ---                        |
| { submitter_id: 1 }                       | User's ticket history      |
| ---                                       | ---                        |
| { assigned_to: 1, status: 1 }             | Staff queue                |
| ---                                       | ---                        |
| { status: 1, priority: 1, created_at: 1 } | Priority-sorted open queue |
| ---                                       | ---                        |
| { sla_due_at: 1, status: 1 }              | SLA breach monitoring      |
| ---                                       | ---                        |

## **50\. support_templates**

Canned response templates for staff

| **Field**  | **Type**   | **Description / Notes**                       |
| ---------- | ---------- | --------------------------------------------- |
| \_id       | UUID       |                                               |
| ---        | ---        | ---                                           |
| name       | string     | Template display name.                        |
| ---        | ---        | ---                                           |
| category   | string     | Matches ticket category.                      |
| ---        | ---        | ---                                           |
| body       | string     | Template text with {{variable}} placeholders. |
| ---        | ---        | ---                                           |
| variables  | string\[\] | List of variable names used in the body.      |
| ---        | ---        | ---                                           |
| created_by | UUID       |                                               |
| ---        | ---        | ---                                           |
| created_at | Date       |                                               |
| ---        | ---        | ---                                           |
| deleted_at | Date\|null |                                               |
| ---        | ---        | ---                                           |

## **51\. help_articles**

Help centre knowledge base articles

| **Field**           | **Type**   | **Description / Notes**                              |
| ------------------- | ---------- | ---------------------------------------------------- |
| \_id                | UUID       |                                                      |
| ---                 | ---        | ---                                                  |
| slug                | string     | Unique URL slug.                                     |
| ---                 | ---        | ---                                                  |
| title               | string     |                                                      |
| ---                 | ---        | ---                                                  |
| body_html           | string     | Full article HTML content.                           |
| ---                 | ---        | ---                                                  |
| category            | enum       | reading \| billing \| account \| author \| technical |
| ---                 | ---        | ---                                                  |
| tags                | string\[\] |                                                      |
| ---                 | ---        | ---                                                  |
| related_article_ids | UUID\[\]   |                                                      |
| ---                 | ---        | ---                                                  |
| is_published        | boolean    |                                                      |
| ---                 | ---        | ---                                                  |
| view_count          | number     |                                                      |
| ---                 | ---        | ---                                                  |
| helpful_votes       | number     |                                                      |
| ---                 | ---        | ---                                                  |
| unhelpful_votes     | number     |                                                      |
| ---                 | ---        | ---                                                  |
| created_at          | Date       |                                                      |
| ---                 | ---        | ---                                                  |
| updated_at          | Date       |                                                      |
| ---                 | ---        | ---                                                  |

**Indexes**

| **Index Definition**                 | **Purpose**            |
| ------------------------------------ | ---------------------- |
| { slug: 1 }                          | Unique - URL routing   |
| ---                                  | ---                    |
| { category: 1, is_published: 1 }     | Help centre navigation |
| ---                                  | ---                    |
| { title: 'text', body_html: 'text' } | Full-text search       |
| ---                                  | ---                    |

## **52\. broadcasts**

Platform-wide admin-to-user announcements

| **Field**       | **Type**     | **Description / Notes**                                            |
| --------------- | ------------ | ------------------------------------------------------------------ |
| \_id            | UUID         |                                                                    |
| ---             | ---          | ---                                                                |
| created_by      | UUID         | Admin who created this broadcast.                                  |
| ---             | ---          | ---                                                                |
| subject         | string       |                                                                    |
| ---             | ---          | ---                                                                |
| body            | string       |                                                                    |
| ---             | ---          | ---                                                                |
| channel         | enum         | email \| push \| in_app \| all                                     |
| ---             | ---          | ---                                                                |
| audience        | object       | Targeting: roles\[\], plans\[\], regions\[\], institution_ids\[\]. |
| ---             | ---          | ---                                                                |
| status          | enum         | draft \| scheduled \| sent \| cancelled                            |
| ---             | ---          | ---                                                                |
| scheduled_at    | Date\|null   |                                                                    |
| ---             | ---          | ---                                                                |
| sent_at         | Date\|null   |                                                                    |
| ---             | ---          | ---                                                                |
| recipient_count | number\|null |                                                                    |
| ---             | ---          | ---                                                                |
| created_at      | Date         |                                                                    |
| ---             | ---          | ---                                                                |

**Indexes**

| **Index Definition**           | **Purpose**               |
| ------------------------------ | ------------------------- |
| { status: 1, scheduled_at: 1 } | Scheduled broadcast queue |
| ---                            | ---                       |
| { created_by: 1 }              | Admin's broadcasts        |
| ---                            | ---                       |

## **53\. surveys**

NPS & satisfaction surveys

| **Field**       | **Type**   | **Description / Notes**                                                                         |
| --------------- | ---------- | ----------------------------------------------------------------------------------------------- |
| \_id            | UUID       |                                                                                                 |
| ---             | ---        | ---                                                                                             |
| name            | string     | Internal survey name.                                                                           |
| ---             | ---        | ---                                                                                             |
| type            | enum       | nps \| csat \| custom                                                                           |
| ---             | ---        | ---                                                                                             |
| questions       | object\[\] | Embedded: \_id, text, type (rating_10\|rating_5\|text\|multiple_choice), options\[\], required. |
| ---             | ---        | ---                                                                                             |
| trigger         | object     | event (post_event_attend\|subscription_cancel\|manual), delay_hours.                            |
| ---             | ---        | ---                                                                                             |
| target_audience | object     | roles\[\], event_id.                                                                            |
| ---             | ---        | ---                                                                                             |
| is_active       | boolean    |                                                                                                 |
| ---             | ---        | ---                                                                                             |
| responses_count | number     | Denormalised.                                                                                   |
| ---             | ---        | ---                                                                                             |
| created_by      | UUID       |                                                                                                 |
| ---             | ---        | ---                                                                                             |
| created_at      | Date       |                                                                                                 |
| ---             | ---        | ---                                                                                             |

## **54\. survey_responses**

Individual survey response records

| **Field**    | **Type**   | **Description / Notes** |
| ------------ | ---------- | ----------------------- |
| \_id         | UUID       |                         |
| ---          | ---        | ---                     |
| survey_id    | UUID       | Ref: surveys.\_id       |
| ---          | ---        | ---                     |
| user_id      | UUID\|null |                         |
| ---          | ---        | ---                     |
| answers      | object\[\] | question_id, value.     |
| ---          | ---        | ---                     |
| submitted_at | Date       |                         |
| ---          | ---        | ---                     |

**Indexes**

| **Index Definition** | **Purpose**           |
| -------------------- | --------------------- |
| { survey_id: 1 }     | Responses per survey  |
| ---                  | ---                   |
| { user_id: 1 }       | User's survey history |
| ---                  | ---                   |

## **55\. dmca_requests**

DMCA takedown requests & workflow

| **Field**                 | **Type**     | **Description / Notes**                                             |
| ------------------------- | ------------ | ------------------------------------------------------------------- |
| \_id                      | UUID         |                                                                     |
| ---                       | ---          | ---                                                                 |
| complainant               | object       | name, email, organisation, country.                                 |
| ---                       | ---          | ---                                                                 |
| infringing_title_id       | UUID\|null   |                                                                     |
| ---                       | ---          | ---                                                                 |
| infringing_url            | string\|null |                                                                     |
| ---                       | ---          | ---                                                                 |
| original_work_description | string       |                                                                     |
| ---                       | ---          | ---                                                                 |
| evidence_urls             | string\[\]   |                                                                     |
| ---                       | ---          | ---                                                                 |
| status                    | enum         | received \| under_review \| actioned \| rejected \| counter_noticed |
| ---                       | ---          | ---                                                                 |
| actioned_at               | Date\|null   |                                                                     |
| ---                       | ---          | ---                                                                 |
| actioned_by               | UUID\|null   |                                                                     |
| ---                       | ---          | ---                                                                 |
| action_taken              | string\|null | title_removed \| access_restricted \| no_action                     |
| ---                       | ---          | ---                                                                 |
| rejection_reason          | string\|null |                                                                     |
| ---                       | ---          | ---                                                                 |
| counter_notice            | object\|null | submitted_at, submitted_by, statement.                              |
| ---                       | ---          | ---                                                                 |
| created_at                | Date         |                                                                     |
| ---                       | ---          | ---                                                                 |

**Indexes**

| **Index Definition**          | **Purpose**       |
| ----------------------------- | ----------------- |
| { status: 1, created_at: -1 } | Active DMCA queue |
| ---                           | ---               |
| { infringing_title_id: 1 }    | DMCA by title     |
| ---                           | ---               |

## **56\. piracy_reports**

Unauthorised content sharing reports

| **Field**               | **Type**     | **Description / Notes**                        |
| ----------------------- | ------------ | ---------------------------------------------- |
| \_id                    | UUID         |                                                |
| ---                     | ---          | ---                                            |
| reported_by             | UUID\|null   |                                                |
| ---                     | ---          | ---                                            |
| title_id                | UUID\|null   |                                                |
| ---                     | ---          | ---                                            |
| infringing_url          | string       |                                                |
| ---                     | ---          | ---                                            |
| description             | string       |                                                |
| ---                     | ---          | ---                                            |
| evidence_screenshot_url | string\|null |                                                |
| ---                     | ---          | ---                                            |
| status                  | enum         | open \| investigating \| actioned \| dismissed |
| ---                     | ---          | ---                                            |
| actioned_at             | Date\|null   |                                                |
| ---                     | ---          | ---                                            |
| action_taken            | string\|null | dmca_sent \| url_reported \| no_action         |
| ---                     | ---          | ---                                            |
| created_at              | Date         |                                                |
| ---                     | ---          | ---                                            |

**Indexes**

| **Index Definition** | **Purpose**        |
| -------------------- | ------------------ |
| { status: 1 }        | Open reports queue |
| ---                  | ---                |
| { title_id: 1 }      | Reports per title  |
| ---                  | ---                |

## **57\. community_guidelines**

Published guidelines with version history

| **Field**           | **Type**   | **Description / Notes**          |
| ------------------- | ---------- | -------------------------------- |
| \_id                | UUID       |                                  |
| ---                 | ---        | ---                              |
| version             | string     | Semantic version e.g. 3.1.       |
| ---                 | ---        | ---                              |
| content_html        | string     | Full guideline HTML.             |
| ---                 | ---        | ---                              |
| summary_of_changes  | string     | What changed in this version.    |
| ---                 | ---        | ---                              |
| published_by        | UUID       |                                  |
| ---                 | ---        | ---                              |
| published_at        | Date       |                                  |
| ---                 | ---        | ---                              |
| is_current          | boolean    | Only one document has this true. |
| ---                 | ---        | ---                              |
| previous_version_id | UUID\|null | Chain to previous version.       |
| ---                 | ---        | ---                              |

**Indexes**

| **Index Definition** | **Purpose**               |
| -------------------- | ------------------------- |
| { is_current: 1 }    | Current guidelines lookup |
| ---                  | ---                       |
| { version: 1 }       | Unique - version audit    |
| ---                  | ---                       |

## **58\. system_config**

Singleton platform configuration document

| **Field**                   | **Type**     | **Description / Notes**                                                                     |
| --------------------------- | ------------ | ------------------------------------------------------------------------------------------- |
| \_id                        | string       | 'platform_config' - fixed singleton ID.                                                     |
| ---                         | ---          | ---                                                                                         |
| registration_open           | boolean      |                                                                                             |
| ---                         | ---          | ---                                                                                         |
| require_email_verification  | boolean      |                                                                                             |
| ---                         | ---          | ---                                                                                         |
| allow_social_login          | boolean      |                                                                                             |
| ---                         | ---          | ---                                                                                         |
| allow_sso                   | boolean      |                                                                                             |
| ---                         | ---          | ---                                                                                         |
| default_loan_duration_days  | number       |                                                                                             |
| ---                         | ---          | ---                                                                                         |
| default_simultaneous_copies | number       |                                                                                             |
| ---                         | ---          | ---                                                                                         |
| hold_expiry_days            | number       |                                                                                             |
| ---                         | ---          | ---                                                                                         |
| supported_formats           | string\[\]   | epub \| pdf \| mp3 \| m4b                                                                   |
| ---                         | ---          | ---                                                                                         |
| supported_languages         | string\[\]   | ISO 639-1 codes.                                                                            |
| ---                         | ---          | ---                                                                                         |
| drm_provider                | string       | LCP \| Adobe \| none                                                                        |
| ---                         | ---          | ---                                                                                         |
| session_timeout_minutes     | number       |                                                                                             |
| ---                         | ---          | ---                                                                                         |
| two_factor_enforcement      | enum         | optional \| required_admin \| required_all                                                  |
| ---                         | ---          | ---                                                                                         |
| payment_gateways            | object       | Per-gateway config: enabled, public_key / client_id.                                        |
| ---                         | ---          | ---                                                                                         |
| royalty_defaults            | object       | ebook_rate, audiobook_rate, platform_commission, minimum_payout_threshold, payout_schedule. |
| ---                         | ---          | ---                                                                                         |
| cdn_base_url                | string       |                                                                                             |
| ---                         | ---          | ---                                                                                         |
| maintenance_mode            | boolean      |                                                                                             |
| ---                         | ---          | ---                                                                                         |
| maintenance_message         | string\|null |                                                                                             |
| ---                         | ---          | ---                                                                                         |
| updated_at                  | Date         |                                                                                             |
| ---                         | ---          | ---                                                                                         |
| updated_by                  | UUID         |                                                                                             |
| ---                         | ---          | ---                                                                                         |

## **59\. institutions**

Institutional access groups

| **Field**         | **Type**     | **Description / Notes**                                           |
| ----------------- | ------------ | ----------------------------------------------------------------- |
| \_id              | UUID         |                                                                   |
| ---               | ---          | ---                                                               |
| name              | string       |                                                                   |
| ---               | ---          | ---                                                               |
| slug              | string       | Unique URL slug.                                                  |
| ---               | ---          | ---                                                               |
| type              | enum         | university \| school \| corporate \| public_library \| government |
| ---               | ---          | ---                                                               |
| country           | string       | ISO 3166-1 alpha-2.                                               |
| ---               | ---          | ---                                                               |
| sso_provider      | string       | saml \| ldap \| none                                              |
| ---               | ---          | ---                                                               |
| sso_config        | object\|null | entity_id, sso_url, certificate.                                  |
| ---               | ---          | ---                                                               |
| allowed_ip_ranges | string\[\]   | CIDR ranges for on-campus IP-based access.                        |
| ---               | ---          | ---                                                               |
| plan_id           | string       | Subscription plan for all institution members.                    |
| ---               | ---          | ---                                                               |
| seat_limit        | number\|null | null = unlimited.                                                 |
| ---               | ---          | ---                                                               |
| active_seat_count | number       | Denormalised.                                                     |
| ---               | ---          | ---                                                               |
| contract_start    | Date         |                                                                   |
| ---               | ---          | ---                                                               |
| contract_end      | Date         |                                                                   |
| ---               | ---          | ---                                                               |
| auto_renew        | boolean      |                                                                   |
| ---               | ---          | ---                                                               |
| billing_contact   | object       | name, email.                                                      |
| ---               | ---          | ---                                                               |
| invoice_frequency | enum         | annual \| monthly                                                 |
| ---               | ---          | ---                                                               |
| status            | enum         | active \| suspended \| expired                                    |
| ---               | ---          | ---                                                               |
| created_at        | Date         |                                                                   |
| ---               | ---          | ---                                                               |
| deleted_at        | Date\|null   |                                                                   |
| ---               | ---          | ---                                                               |

**Indexes**

| **Index Definition**     | **Purpose**            |
| ------------------------ | ---------------------- |
| { slug: 1 }              | Unique - URL routing   |
| ---                      | ---                    |
| { status: 1 }            | Active institutions    |
| ---                      | ---                    |
| { allowed_ip_ranges: 1 } | IP-based access lookup |
| ---                      | ---                    |

# **Relationships Overview**

Key relationships between collections:

users

├── author_profiles (1:1)

├── publisher_accounts (1:1, owner)

│ └── members\[\] (embedded team)

├── subscriptions (1:1)

├── payment_methods (1:N)

├── borrows (1:N)

├── purchases (1:N)

├── holds (1:N)

├── downloads (1:N)

├── reading_progress (1:N by title)

├── highlights (1:N)

├── annotations (1:N)

├── reader_settings (1:1)

├── reading_lists (1:N)

├── reading_goals (1:N by period)

├── user_badges (1:N)

├── reviews (1:N by title)

├── follows (M:N)

├── book_clubs (1:N owned)

├── citations (1:N)

├── royalties (1:N - author)

└── webhooks / api_keys (1:N)

titles

├── title_files (1:N)

├── series (N:1)

├── bundles (M:N)

├── borrows (1:N)

├── purchases (1:N)

├── holds (1:N)

├── reviews (1:N)

├── reading_progress (1:N by user)

└── royalties (1:N)

book_clubs

├── book_club_members (1:N)

├── discussions (1:N threaded)

└── book_club_kits (via title)

admin / ops

├── audit_logs

├── support_tickets

├── broadcasts

├── surveys + survey_responses

├── dmca_requests

├── system_config (singleton)

└── institutions

# **MongoDB Configuration Recommendations**

**Replica Set:** Minimum 3-node replica set for HA. All reads from primary for financial / royalty data; secondary reads acceptable for analytics.

**Sharding:** Shard reading_progress, highlights, annotations, notifications, and audit_logs on user_id when collection size demands horizontal scale.

**Atlas Search:** Use MongoDB Atlas Search (Lucene-backed) for full-text search on titles (title, synopsis, tags) and help_articles.

**Time-Series Collections:** Consider MongoDB time-series collections for high-frequency read-event analytics feeding dashboards.

**Encryption at Rest:** Enable WiredTiger encryption or Atlas Encryption at Rest for two_factor_secret, gateway tokens, and payout account details.

**TTL Indexes:** Apply TTL indexes to notifications.expires_at, uploads.presigned_expires_at, and jobs.expires_at for automatic document expiry.
