# Navigation System Specification

## ADDED Requirements

### Requirement: Native App-like Navigation

The application SHALL provide iOS/Android-style stack navigation with smooth animations and gesture support.

#### Scenario: Page transition animation
- **WHEN** user navigates to a new page
- **THEN** the new page slides in from the right (iOS) or fades in (Android)
- **AND** the previous page slides out to the left or dims

#### Scenario: Gesture back navigation
- **WHEN** user swipes from the left edge of the screen
- **THEN** the current page begins to slide following the gesture
- **AND** releasing past 50% threshold completes the back navigation
- **AND** releasing before 50% cancels and snaps back

#### Scenario: Pop navigation
- **WHEN** user taps the back button or calls `pop()`
- **THEN** the current page animates out
- **AND** the previous page in the stack becomes visible

### Requirement: Tab Bar Navigation

The application SHALL provide a bottom Tab Bar for primary navigation between main sections.

#### Scenario: Tab switching
- **WHEN** user taps a Tab Bar item
- **THEN** the corresponding tab content displays immediately
- **AND** the Tab Bar indicator updates to the active tab
- **AND** the page header title updates to match the tab

#### Scenario: Tab Bar visibility
- **WHEN** user is on the main tabs activity
- **THEN** the Tab Bar is visible at the bottom
- **WHEN** user navigates to a detail page (push)
- **THEN** the Tab Bar is hidden

#### Scenario: Safe area handling
- **WHEN** device has a home indicator (iPhone X+)
- **THEN** Tab Bar includes padding for `safe-area-inset-bottom`
- **AND** Tab Bar items remain fully visible and tappable

### Requirement: Multi-step Flow Navigation

The application SHALL support multi-step flows within a single activity using step navigation.

#### Scenario: Step push
- **WHEN** user completes a step and calls `stepPush({ step: "next" })`
- **THEN** the activity params update to reflect the new step
- **AND** the UI transitions to show the next step content

#### Scenario: Step pop
- **WHEN** user wants to go back within a multi-step flow
- **THEN** calling `stepPop()` returns to the previous step
- **AND** calling `pop()` exits the entire multi-step activity

#### Scenario: Transfer flow steps
- **GIVEN** user is on the Transfer activity
- **WHEN** user completes input and taps "Next"
- **THEN** step changes to "confirm"
- **WHEN** user taps "Confirm"
- **THEN** step changes to "success"
- **WHEN** user taps "Done"
- **THEN** activity pops from the stack

### Requirement: Activity Component Structure

All page-level components SHALL be implemented as Stackflow Activity components.

#### Scenario: Activity with AppScreen
- **GIVEN** an Activity component
- **THEN** it MUST be wrapped with `AppScreen` from `@stackflow/plugin-basic-ui`
- **AND** `AppScreen` MUST have an `appBar` prop with at least a `title`

#### Scenario: Activity type safety
- **GIVEN** an Activity that accepts parameters
- **THEN** it MUST be typed as `ActivityComponentType<ParamsType>`
- **AND** params MUST be accessible via `({ params }) =>` destructuring

#### Scenario: shadcn/ui integration
- **GIVEN** an Activity component
- **WHEN** using UI components inside AppScreen
- **THEN** all shadcn/ui components MUST render correctly
- **AND** no style conflicts with Stackflow styles

### Requirement: URL History Synchronization

The application SHALL synchronize navigation state with browser URL history.

#### Scenario: URL update on navigation
- **WHEN** user navigates to a new activity
- **THEN** browser URL updates to reflect the activity path
- **AND** browser history entry is added

#### Scenario: Browser back button
- **WHEN** user clicks browser back button
- **THEN** Stackflow pops the current activity
- **AND** previous activity becomes visible with animation

#### Scenario: Deep linking
- **WHEN** user opens a URL directly (e.g., `/wallet/123`)
- **THEN** the corresponding activity is initialized with correct params
- **AND** back navigation returns to the initial activity or exits

### Requirement: Header Bar Behavior

The application header bar SHALL follow platform conventions for iOS style.

#### Scenario: Header title display
- **GIVEN** an Activity with `appBar={{ title: "Page Title" }}`
- **THEN** the title displays centered in the header
- **AND** title truncates with ellipsis if too long

#### Scenario: Back button display
- **WHEN** there is more than one activity in the stack
- **THEN** a back button (chevron left) displays in the header
- **WHEN** at the root activity
- **THEN** no back button is displayed

#### Scenario: Header safe area
- **WHEN** device has a notch (iPhone X+)
- **THEN** header extends into the notch area
- **AND** header content is positioned below the notch

## ADDED Data Model

### Activity Configuration

```typescript
interface StackflowConfig {
  transitionDuration: number;  // Animation duration in ms (default: 350)
  plugins: StackflowPlugin[];  // Array of plugins
  activities: Record<string, ActivityComponentType>;
  initialActivity: () => string;
}
```

### Activity Component Type

```typescript
type ActivityComponentType<P = {}> = React.FC<{
  params: P;
}>;
```

### Navigation Actions

```typescript
interface UseFlowReturn {
  push: (activityName: string, params: object, options?: { animate?: boolean }) => void;
  pop: (count?: number, options?: { animate?: boolean }) => void;
  replace: (activityName: string, params: object, options?: { animate?: boolean }) => void;
}

interface UseStepFlowReturn {
  stepPush: (params: object) => void;
  stepPop: () => void;
  stepReplace: (params: object) => void;
}
```

### Tab Configuration

```typescript
interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

type TabId = "home" | "wallet" | "transfer" | "settings";
```
