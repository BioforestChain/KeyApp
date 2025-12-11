# Change: Add MarqueeText component for overflowing critical text

## Why
Current UI relies on truncation for long identifiers (e.g., chain names, addresses). We need a compact way to show the full value without sacrificing layout width.

## What Changes
- Add `MarqueeText` component that auto-scrolls only when content overflows and pauses on hover/focus.
- Include optional copy-to-clipboard affordance with transient feedback.
- Document and showcase the component in Storybook with short/long text examples.
- Export the component through the base UI library entrypoints.

## Impact
- Affected specs: `ui-components`
- Affected code: `src/components/ui/MarqueeText`, Storybook stories, tests, library exports
