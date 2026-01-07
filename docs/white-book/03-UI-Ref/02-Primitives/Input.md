# Input Primitive

## Overview

The `Input` component is a wrapper around the HTML `input` element, styled with Tailwind CSS to match the KeyApp design system. It is built on top of `@base-ui/react/input` primitive.

## Usage

```tsx
import { Input } from '@/components/ui/input';

export function Example() {
  return <Input placeholder="Enter your text" />;
}
```

## Props

Inherits all standard HTML input attributes via `React.ComponentProps<typeof InputPrimitive>`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes. |
| `type` | `string` | `text` | Input type (text, password, email, etc.). |
| `placeholder` | `string` | - | Placeholder text. |
| `disabled` | `boolean` | `false` | Whether the input is disabled. |

## Styling

- **Base**: `h-8 rounded-lg border bg-transparent px-2.5 py-1 text-base`
- **Dark Mode**: `dark:bg-input/30`
- **Focus**: `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- **Invalid**: `aria-invalid:border-destructive aria-invalid:ring-destructive/20`
- **Disabled**: `disabled:opacity-50 disabled:cursor-not-allowed`

## Accessibility

- Automatically handles `aria-invalid` styling.
- Supports standard keyboard navigation and focus states.
- Uses `data-slot="input"` for internal targeting.
