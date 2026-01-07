# Testing Strategy

## Overview

KeyApp employs a "Testing Pyramid" approach with a strong emphasis on integration and E2E tests for critical user flows.

## Test Levels

### 1. Unit Tests (`*.test.ts`)
- **Tool**: Vitest
- **Scope**: Pure logic, utilities, helpers, state reducers.
- **Example**: `src/lib/utils.test.ts`

### 2. Component Tests (`*.test.tsx`)
- **Tool**: Vitest + React Testing Library
- **Scope**: Isolated UI components, interaction logic.
- **Example**: `src/components/ui/button.test.tsx`

### 3. Visual Tests (`*.stories.tsx`)
- **Tool**: Storybook
- **Scope**: UI states, responsiveness, visual regression.
- **Example**: `src/components/ui/button.stories.tsx`

### 4. E2E Tests (`e2e/*.spec.ts`)
- **Tool**: Playwright
- **Scope**: Full user journeys (Create Wallet, Transfer, Settings).
- **Example**: `e2e/onboarding.spec.ts`

## Best Practices

- **Selectors**: Use `data-testid` for stable selectors.
- **Mocking**: Mock external APIs (MSW) but test the full frontend stack.
- **Snapshots**: Use cautiously; prefer explicit assertions.
