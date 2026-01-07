# Layout Components

> **Code Source**: [`src/components/layout`](../../../../src/components/layout)

## Overview

Layout components provide the structural scaffolding for pages (Activities) and modal overlays.

## Components

### PageHeader

The standard navigation bar.

- **Props**:
  - `title`: Center title string.
  - `onBack`: Callback for the back button (renders button if present).
  - `rightAction`: Node to render on the right side (e.g., Settings icon).
  - `transparent`: Visual style toggle.

```tsx
<PageHeader 
  title="Wallet" 
  onBack={() => pop()} 
  rightAction={<Button icon="settings" />} 
/>
```

### BottomSheet / Modal

Wrappers for Stackflow's Activity/Sheet presentation.
- **Usage**: Used internally by `stackflow` jobs but can be used for custom overlays.
- **Styling**: Handles backdrop blur, safe area insets, and entry animations.

### TabBar

The main navigation controller for the `MainTabsActivity`.
- **Items**: Wallet, Ecosystem, Settings.
- **Behavior**: Switches tabs without pushing new history entries (internal state).
