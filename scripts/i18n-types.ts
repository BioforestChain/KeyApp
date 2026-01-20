#!/usr/bin/env bun

import { runTypesGenerator } from 'i18next-cli';

const CONFIG = {
  localesDir: 'src/i18n/locales',
  primaryLocale: 'zh-CN',
  outputPath: 'src/i18n/i18next.d.ts',
  resourcesPath: 'src/i18n/resources.d.ts',
};

export async function generateI18nTypes(): Promise<void> {
  await runTypesGenerator({
    locales: [CONFIG.primaryLocale],
    extract: {
      input: ['src/**/*.{ts,tsx}'],
      output: `${CONFIG.localesDir}/{{language}}/{{namespace}}.json`,
      primaryLanguage: CONFIG.primaryLocale,
    },
    types: {
      input: [`${CONFIG.localesDir}/${CONFIG.primaryLocale}/*.json`],
      output: CONFIG.outputPath,
      resourcesFile: CONFIG.resourcesPath,
      enableSelector: true,
    },
  });
  console.log('\x1b[32m✓ i18n types generated\x1b[0m');
}

if (import.meta.main) {
  generateI18nTypes().catch((err) => {
    console.error('\x1b[31m✗ Failed to generate i18n types:\x1b[0m', err);
    process.exit(1);
  });
}

if (import.meta.main) {
  generateI18nTypes().catch((err) => {
    console.error('\x1b[31m✗ Failed to generate i18n types:\x1b[0m', err);
    process.exit(1);
  });
}
