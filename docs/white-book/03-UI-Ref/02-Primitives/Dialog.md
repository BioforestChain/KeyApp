# Dialog Primitive

## Overview

The `Dialog` (and `AlertDialog`) components provide modal overlays for critical interactions or information. Built on `@base-ui/react/alert-dialog`.

## Usage

```tsx
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';

export function Example() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Open Dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

## Components

- **AlertDialog**: Root container, manages open state.
- **AlertDialogContent**: The modal popup itself.
- **AlertDialogOverlay**: Backdrop (dimmed background).
- **AlertDialogHeader**: Container for title/description/media.
- **AlertDialogMedia**: Slot for an icon or illustration at the top.
- **AlertDialogFooter**: Container for actions (buttons).

## Styling

- **Overlay**: `bg-black/10 backdrop-blur-xs`
- **Content**: `bg-background rounded-xl ring-1 ring-foreground/10 shadow-lg`
- **Animations**:
  - `zoom-in-95` / `zoom-out-95` scale effect.
  - `fade-in` / `fade-out` opacity effect.

## Accessibility

- Focus trapped inside the dialog when open.
- Clicking overlay or pressing ESC closes the dialog (unless configured otherwise).
- Appropriate ARIA roles (`alertdialog`) applied automatically.
