#!/usr/bin/env bun

import { execSync } from 'node:child_process'

console.log('[set-secret] 已弃用，请使用 pnpm set-env 或 bun scripts/set-env.ts')
execSync('bun scripts/set-env.ts', { stdio: 'inherit' })
