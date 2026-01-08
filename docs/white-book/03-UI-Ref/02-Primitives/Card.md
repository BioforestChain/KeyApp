# Card Primitive

## Overview

The `Card` component is a flexible container for grouping related content. It provides a consistent background, border, and spacing structure.

## Usage

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction
} from '@/components/ui/card';

export function Example() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Optional description</CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon">...</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>Main content area.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  );
}
```

## Components

- **Card**: Main container. Supports `size="sm"` for tighter padding.
- **CardHeader**: Top section, supports grid layout for title/description/action.
- **CardTitle**: Bold heading text (`text-base font-medium`).
- **CardDescription**: Muted secondary text.
- **CardAction**: Positioned in the top-right of the header.
- **CardContent**: Main body area.
- **CardFooter**: Bottom section, often with a different background or border.

## Styling

- **Base**: `bg-card text-card-foreground rounded-xl ring-1 ring-foreground/10`
- **Footer**: `bg-muted/50 border-t` (visual separation).
- **Responsive**: `size="sm"` reduces padding and font sizes for dense layouts.

## Behavior

- **Image Integration**: First/last child images automatically get rounded corners to match the card.
- **Grid Layout**: Header uses CSS Grid to align title, description, and action button.
