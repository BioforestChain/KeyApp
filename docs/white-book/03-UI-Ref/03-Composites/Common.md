# Common Components

> **Code Source**: [`src/components/common`](../../../../src/components/common)

## Overview

High-level reusable components that don't fit into a specific business domain.

## Components

### AmountDisplay

A powerful component for formatting crypto and fiat amounts.

- **Features**:
  - **Auto-Formatting**: Handles decimals, grouping, and scientific notation fallback.
  - **Animation**: Uses `NumberFlow` for smooth value transitions.
  - **Privacy**: Supports `hidden` prop to mask values (e.g. `••••••`).
  - **Coloring**: Auto-colors positive/negative values if `color="auto"`.

```tsx
<AmountDisplay 
  value="1234.56" 
  symbol="ETH" 
  loading={isLoading} 
/>
```

### EmptyState

Standardized placeholder for lists with no data.
- **Props**: `title`, `description`, `icon`, `action` (button).

### QRCode

Wrapper around `qrcode.react` with styling and logo support.

### SafeMarkdown

Renders Markdown content with strict sanitization (no HTML, no scripts). Used for DApp descriptions and release notes.
