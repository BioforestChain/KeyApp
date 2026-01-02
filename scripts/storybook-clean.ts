#!/usr/bin/env bun

import { rm } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')

const PATHS_TO_CLEAN = [
  'node_modules/.cache/storybook',
]

async function clean() {
  for (const path of PATHS_TO_CLEAN) {
    await rm(join(ROOT, path), { recursive: true, force: true })
  }
}

clean().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
