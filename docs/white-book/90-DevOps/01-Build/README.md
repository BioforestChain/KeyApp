# Build System

## Overview

KeyApp uses a modern build toolchain centered around Vite and pnpm workspaces.

## Commands

- `pnpm dev`: Start development server (HMR enabled).
- `pnpm build`: Production build (outputs to `dist`).
- `pnpm preview`: Preview production build locally.
- `pnpm typecheck`: Run TypeScript type validation.
- `pnpm lint`: Run ESLint.

## Configuration

- **Vite**: `vite.config.ts` handles alias mapping (`@/`), plugin configuration (React, SVGR), and build optimizations.
- **TypeScript**: `tsconfig.app.json` defines strict type checking rules.
- **Tailwind**: `tailwind.config.js` (or v4 CSS) manages design tokens.

## Environment Variables

- `.env`: Default environment variables.
- `.env.local`: Local overrides (git-ignored).
- `VITE_API_URL`: Backend API endpoint.
- `VITE_CHAIN_CONFIG_URL`: URL to fetch chain configurations.
