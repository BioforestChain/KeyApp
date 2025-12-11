## 1. Welcome Flow
- [x] 1.1 Create WelcomeScreen component with app introduction
- [x] 1.2 Add welcome state persistence to localStorage
- [x] 1.3 Add welcome illustrations/SVG assets (using lucide-react icons)
- [x] 1.4 Integrate welcome screen into router (show on first visit)

## 2. Wallet Creation Walkthrough
- [ ] 2.1 Create CreateWalletGuide overlay component
- [ ] 2.2 Add step-by-step tooltips for each creation step
- [ ] 2.3 Emphasize mnemonic backup importance
- [ ] 2.4 Add skip/later option for experienced users

## 3. Feature Discovery
- [ ] 3.1 Create Spotlight component for feature highlights
- [ ] 3.2 Create Tooltip component for inline hints
- [ ] 3.3 Add spotlights for key features (send, receive, scanner)
- [ ] 3.4 Add first-action celebration (confetti/animation)
- [ ] 3.5 Track guide completion per feature

## 4. State Management
- [x] 4.1 Create guide-store with Zustand (localStorage-based in WelcomeScreen)
- [x] 4.2 Persist guide state to localStorage
- [ ] 4.3 Track which guides user has seen/completed

## 5. i18n
- [x] 5.1 Add guide namespace to all locales (en, zh-CN, zh-TW, ar)

## 6. Testing
- [x] 6.1 Unit tests for guide components (14 tests for WelcomeScreen)
- [ ] 6.2 Unit tests for guide store
- [ ] 6.3 E2E tests for onboarding flow
