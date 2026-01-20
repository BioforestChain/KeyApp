import type { DevCommand } from './types';

export const commands: DevCommand[] = [
  {
    id: 'vite',
    name: 'vite',
    description: 'Vite dev server',
    cmd: ['bun', 'vite'],
    color: '\x1b[36m',
    autoStart: true,
    port: 5173,
  },
  {
    id: 'tsc',
    name: 'tsc',
    description: 'TypeScript watch',
    cmd: ['bun', 'tsc', '--build', '--noEmit', '--watch', '--preserveWatchOutput'],
    color: '\x1b[34m',
    autoStart: true,
  },
  {
    id: 'i18n',
    name: 'i18n',
    description: 'i18n types watcher',
    cmd: ['bun', 'scripts/i18n-types-watch.ts'],
    color: '\x1b[33m',
    autoStart: true,
  },
  {
    id: 'storybook',
    name: 'storybook',
    description: 'Storybook dev',
    cmd: ['bun', 'run', 'storybook'],
    color: '\x1b[35m',
    autoStart: false,
    port: 6006,
  },
];
