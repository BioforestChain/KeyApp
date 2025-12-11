# Change: Add Guide/Onboarding Flow

## Why
First-time users need guidance to understand app features and create their wallet safely. The mpay app has guide pages that should be migrated to improve onboarding UX and user retention.

## What Changes
- Add WelcomeScreen component for first-time users
- Add CreateWalletGuide with step-by-step tooltips during wallet creation
- Add Feature discovery spotlights for key actions (send, receive, scanner)
- Add guide completion tracking in localStorage
- Add skip/complete functionality for experienced users

## Impact
- Affected specs: guide (new)
- Affected code:
  - src/pages/guide/WelcomeScreen.tsx (new)
  - src/pages/guide/CreateWalletGuide.tsx (new)
  - src/stores/guide-store.ts (new)
  - src/components/common/Tooltip.tsx (new)
  - src/components/common/Spotlight.tsx (new)
  - src/locales/*/guide.json (new i18n namespace)
