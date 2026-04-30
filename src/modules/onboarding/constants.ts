export const planCatalog = [
  {
    code: 'FREE',
    name: 'Free Plan',
    price: 0,
    billingCycle: 'monthly',
    isPaid: false,
  },
  {
    code: 'PRO',
    name: 'Pro Plan',
    price: 499,
    billingCycle: 'monthly',
    isPaid: true,
  },
  {
    code: 'PREMIUM',
    name: 'Premium Plan',
    price: 999,
    billingCycle: 'monthly',
    isPaid: true,
  },
] as const

export const onboardingInterestCatalog = [
  { code: 'fiction', label: 'Fiction' },
  { code: 'non-fiction', label: 'Non-Fiction' },
  { code: 'poetry', label: 'Poetry' },
  { code: 'history', label: 'History' },
  { code: 'science', label: 'Science' },
  { code: 'philosophy', label: 'Philosophy' },
  { code: 'art-design', label: 'Art & Design' },
  { code: 'technology', label: 'Technology' },
] as const
