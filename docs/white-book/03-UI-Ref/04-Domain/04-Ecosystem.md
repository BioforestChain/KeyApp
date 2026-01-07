# Ecosystem Components

> Source: [src/components/ecosystem/](https://github.com/aspect-build/aspect-workflows/tree/main/src/components/ecosystem)

## Overview

Domain components for the miniapp ecosystem — app discovery, windowing, and iOS-style desktop experience.

---

## Discovery Components

### DiscoverPage
**Source**: `src/components/ecosystem/discover-page.tsx`

App store discovery interface with categories and search.

```tsx
interface DiscoverPageProps {
  className?: string;
}
```

**Features**:
- Category browsing
- Search functionality
- Featured apps carousel
- App recommendations

### MyAppsPage
**Source**: `src/components/ecosystem/my-apps-page.tsx`

Installed apps grid with management options.

**Features**:
- iOS-style app grid layout
- Drag-to-rearrange (planned)
- Long-press context menu
- App folders (planned)

### EcosystemDesktop
**Source**: `src/components/ecosystem/ecosystem-desktop.tsx`

iOS Springboard-style desktop shell.

```tsx
interface EcosystemDesktopProps {
  className?: string;
}
```

**Storybook**: `ecosystem-desktop.stories.tsx` demonstrates all visual states.

---

## MiniApp Visual Components

### MiniappIcon
**Source**: `src/components/ecosystem/miniapp-icon.tsx`

App icon with iOS-style rendering (rounded corners, shadows).

```tsx
interface MiniappIconProps {
  appId: string;
  iconUrl?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}
```

### MiniappCapsule
**Source**: `src/components/ecosystem/miniapp-capsule.tsx`

iOS-style status bar capsule (minimize/close controls).

### SourceIcon
**Source**: `src/components/ecosystem/source-icon.tsx`

App source indicator (official, third-party, developer).

### IosSearchCapsule
**Source**: `src/components/ecosystem/ios-search-capsule.tsx`

iOS-style search input capsule.

### IosWallpaper
**Source**: `src/components/ecosystem/ios-wallpaper.tsx`

Dynamic wallpaper background component.

---

## MiniApp Window System

### MiniappWindow
**Source**: `src/components/ecosystem/miniapp-window.tsx`

Main miniapp container with portal rendering.

```tsx
interface MiniappWindowProps {
  className?: string;
}
```

**Architecture**:
- Uses React Portal for rendering into desktop slots
- Manages splash screen → iframe transitions
- Handles window focus and z-index stacking
- Integrates with `miniapp-runtime` store

### MiniappSplashScreen
**Source**: `src/components/ecosystem/miniapp-splash-screen.tsx`

App launch splash with icon animation.

```tsx
interface MiniappSplashScreenProps {
  app: MiniappManifest;
  onDismiss?: () => void;
}
```

**Storybook**: `miniapp-splash-screen.stories.tsx` shows launch animations.

### MiniappStackView
**Source**: `src/components/ecosystem/miniapp-stack-view.tsx`

Multi-window stack management (app switcher).

### MiniappStackCard
**Source**: `src/components/ecosystem/miniapp-stack-card.tsx`

Individual app card in stack view.

### MiniappWindowStack
**Source**: `src/components/ecosystem/miniapp-window-stack.tsx`

Window stacking order manager.

### AppStackPage
**Source**: `src/components/ecosystem/app-stack-page.tsx`

Full-screen app switcher view.

---

## Animation & Motion

### MiniappMotionFlow
**Source**: `src/components/ecosystem/miniapp-motion-flow.ts`

Motion preset generators for miniapp transitions.

```tsx
// Flow functions for coordinated animations
flowToCapsule(flowId: string): MotionProps
flowToSplashBgLayer(flowId: string): MotionProps
flowToSplashIconLayer(flowId: string): MotionProps
flowToIframeLayer(flowId: string): MotionProps
flowToWindowContainer(flowId: string): MotionProps
```

### EcosystemTabIndicator
**Source**: `src/components/ecosystem/ecosystem-tab-indicator.tsx`

Animated tab indicator for navigation.

### SwiperSyncDemo
**Source**: `src/components/ecosystem/swiper-sync-demo.tsx`

Demo component for synced swiper animations.

---

## MiniApp Sheet

### MiniappSheetHeader
**Source**: `src/components/ecosystem/miniapp-sheet-header.tsx`

Bottom sheet header for miniapp modals.

---

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                     EcosystemDesktop                            │
│  ┌────────────────────────────────────────────────────────────┐│
│  │                    IosWallpaper                            ││
│  └────────────────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────────────────┐│
│  │                    IosSearchCapsule                        ││
│  └────────────────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────────────────┐│
│  │                      MyAppsPage                            ││
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          ││
│  │  │MiniappIcon│MiniappIcon│MiniappIcon│MiniappIcon│          ││
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘          ││
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          ││
│  │  │MiniappIcon│MiniappIcon│MiniappIcon│MiniappIcon│          ││
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘          ││
│  └────────────────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────────────────┐│
│  │                 EcosystemTabIndicator                      ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ (tap icon)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MiniappWindow                              │
│  ┌────────────────────────────────────────────────────────────┐│
│  │                 MiniappSplashScreen                        ││
│  │              (animate icon → fullscreen)                   ││
│  └────────────────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────────────────┐│
│  │                   MiniappCapsule                           ││
│  │            [○ ○ ○] status   [−] [×]                        ││
│  └────────────────────────────────────────────────────────────┘│
│  ┌────────────────────────────────────────────────────────────┐│
│  │                    <iframe>                                ││
│  │              (miniapp content)                             ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Window States

```
      launch
         │
         ▼
┌─────────────────┐
│    splashing    │ (splash screen visible)
└─────────────────┘
         │
         ▼
┌─────────────────┐
│    presented    │ (iframe visible, focused)
└─────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌─────────────┐
│minimize│ │   dismiss   │
└────────┘ └─────────────┘
    │              │
    ▼              ▼
┌────────┐    ┌────────┐
│ hidden │    │ closed │
└────────┘    └────────┘
```

---

## Integration Points

| Component | Service | Store |
|-----------|---------|-------|
| MiniappWindow | `miniapp-runtime` | `miniappRuntimeStore` |
| MiniappSplashScreen | `miniapp-runtime` | - |
| MyAppsPage | `ecosystem-service` | `ecosystemStore` |
| DiscoverPage | `app-registry` | - |

---

## Related Documentation

- [MiniApp Runtime](../../01-Kernel-Ref/01-Overview.md)
- [PostMessage Bridge](../../06-Service-Ref/02-Ecosystem/01-PostMessage-Bridge.md)
- [Shell Navigation](../../12-Shell-Guide/01-Navigation/Router-Config.md)
