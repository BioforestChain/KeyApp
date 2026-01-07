# Button Primitive

## Overview

The `Button` component is the primary interactive element, built on top of `@base-ui/react/button`. It supports multiple variants, sizes, and icon integrations.

## Usage

```tsx
import { Button } from '@/components/ui/button';
import { IconPlus } from '@tabler/icons-react';

export function Example() {
  return (
    <div className="flex gap-2">
      <Button variant="default">Primary</Button>
      <Button variant="outline" size="sm">Secondary</Button>
      <Button variant="ghost" size="icon">
        <IconPlus />
      </Button>
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `default` | Visual style (`default`, `outline`, `ghost`, `secondary`, `destructive`, `link`). |
| `size` | `string` | `default` | Size preset (`default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`). |
| `asChild` | `boolean` | `false` | Merges props into the child element (Slot pattern). |

## Styling

- **Base**: `rounded-lg border font-medium transition-all`
- **Focus**: `focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- **Icons**: Automatically sizes SVGs based on button size (e.g., `size-4` for default).

## Variants

- **Default**: `bg-primary text-primary-foreground`
- **Secondary**: `bg-secondary text-secondary-foreground`
- **Outline**: `border-border bg-background hover:bg-muted`
- **Ghost**: `hover:bg-muted`
- **Destructive**: `bg-destructive/10 text-destructive`

## Accessibility

- Fully accessible via keyboard.
- Supports `aria-invalid` states.
- `disabled` state handles pointer events and opacity.
