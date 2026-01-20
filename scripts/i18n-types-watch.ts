#!/usr/bin/env bun

import { watch } from 'fs';
import { generateI18nTypes } from './i18n-types';

const LOCALES_DIR = 'src/i18n/locales/zh-CN';

console.log(`\x1b[33m[i18n] Watching ${LOCALES_DIR}...\x1b[0m`);

await generateI18nTypes();

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

watch(LOCALES_DIR, { recursive: true }, (_event, filename) => {
  if (!filename?.endsWith('.json')) return;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    console.log(`\x1b[33m[i18n] ${filename} changed, regenerating types...\x1b[0m`);
    await generateI18nTypes();
    debounceTimer = null;
  }, 100);
});

await new Promise(() => {});
