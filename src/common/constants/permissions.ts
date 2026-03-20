/**
 * Permission constants for the LMS system.
 *
 * All permissions follow the pattern: <module>.<action>
 * - module: lowercase identifiers (audit, staff, books, etc.)
 * - action: one of: manage, view, refund, export
 */

export const PERMISSIONS = {
  // Audit
  AUDIT_MANAGE: 'audit.manage',
  AUDIT_VIEW: 'audit.view',

  // Authors
  AUTHORS_MANAGE: 'authors.manage',
  AUTHORS_VIEW: 'authors.view',

  // Books
  BOOKS_MANAGE: 'books.manage',
  BOOKS_VIEW: 'books.view',

  // Borrows
  BORROWS_MANAGE: 'borrows.manage',
  BORROWS_VIEW: 'borrows.view',

  // Categories
  CATEGORIES_MANAGE: 'categories.manage',
  CATEGORIES_VIEW: 'categories.view',

  // Members
  MEMBERS_MANAGE: 'members.manage',
  MEMBERS_VIEW: 'members.view',

  // Notifications
  NOTIFICATIONS_MANAGE: 'notifications.manage',
  NOTIFICATIONS_VIEW: 'notifications.view',

  // Onboarding
  ONBOARDING_MANAGE: 'onboarding.manage',
  ONBOARDING_VIEW: 'onboarding.view',

  // Payments
  PAYMENTS_MANAGE: 'payments.manage',
  PAYMENTS_VIEW: 'payments.view',

  // Plans
  PLANS_MANAGE: 'plans.manage',
  PLANS_VIEW: 'plans.view',

  // Promotions
  PROMOTIONS_MANAGE: 'promotions.manage',
  PROMOTIONS_VIEW: 'promotions.view',

  // RBAC
  RBAC_MANAGE: 'rbac.manage',
  RBAC_VIEW: 'rbac.view',

  // Reports
  REPORTS_MANAGE: 'reports.manage',
  REPORTS_VIEW: 'reports.view',

  // Reservations
  RESERVATIONS_MANAGE: 'reservations.manage',
  RESERVATIONS_VIEW: 'reservations.view',

  // Reviews
  REVIEWS_MANAGE: 'reviews.manage',
  REVIEWS_VIEW: 'reviews.view',

  // Search
  SEARCH_VIEW: 'search.view',

  // Settings
  SETTINGS_MANAGE: 'settings.manage',
  SETTINGS_VIEW: 'settings.view',

  // Staff
  STAFF_MANAGE: 'staff.manage',
  STAFF_VIEW: 'staff.view',

  // Subscriptions
  SUBSCRIPTIONS_MANAGE: 'subscriptions.manage',
  SUBSCRIPTIONS_VIEW: 'subscriptions.view',
} as const

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

/**
 * All available permissions derived from PERMISSIONS object.
 * Used for seeding and validation.
 */
export const ALL_PERMISSIONS = Object.values(PERMISSIONS)

// Verify no duplicates exist at compile time
const permissionValues = ALL_PERMISSIONS
const uniquePermissions = new Set(permissionValues)
if (permissionValues.length !== uniquePermissions.size) {
  throw new Error(
    `Duplicate permissions detected in PERMISSIONS constant. Found ${permissionValues.length} values but only ${uniquePermissions.size} unique.`,
  )
}
