# Colors

## Overview

KeyApp uses a semantic color system based on Tailwind CSS v4 and OKLCH color space. This ensures consistency across light and dark modes and provides a vibrant, accessible palette.

## Palette

### Semantic Tokens

| Token | Light (OKLCH) | Dark (OKLCH) | Usage |
|-------|---------------|--------------|-------|
| `primary` | `0.59 0.26 323` | `0.67 0.26 323` | Main brand color (Pink/Magenta). |
| `background` | `1 0 0` (White) | `0.14 0.005 285` (Deep Purple) | Page background. |
| `foreground` | `0.14 0.005 285` | `0.985 0 0` | Primary text color. |
| `muted` | `0.967 0.001 286` | `0.274 0.006 286` | Secondary backgrounds (cards, inputs). |
| `destructive` | `0.577 0.245 27` | `0.704 0.191 22` | Error states, delete actions. |

### Chain Colors

Specific colors are assigned to each supported blockchain for branding and easy identification.

- **Ethereum**: `oklch(55% 0.2 260)` (Blue)
- **Tron**: `oklch(55% 0.25 25)` (Red)
- **Bitcoin**: `oklch(70% 0.18 60)` (Orange)
- **BioForest**: `oklch(60% 0.2 290)` (Purple)

### Transaction Types

Colors used to distinguish transaction directions and types.

- **Out (Sent)**: `oklch(65% 0.22 25)` (Red-Orange)
- **In (Received)**: `oklch(60% 0.18 145)` (Green)
- **Exchange**: `oklch(55% 0.2 260)` (Blue)
- **Stake**: `oklch(60% 0.2 290)` (Purple)

## Usage in Code

```tsx
// Using utility classes
<div className="bg-primary text-primary-foreground">
  Brand Button
</div>

// Using generic theme variable
<span className="text-muted-foreground">
  Secondary Text
</span>

// Using extended colors
<div className="text-chain-bitcoin">
  BTC
</div>
```

## Configuration

Colors are defined in `src/styles/theme.css` using CSS custom properties and registered with `@property` for animation support.
