#!/usr/bin/env bun
/**
 * 清理构建缓存和临时文件
 * 
 * Usage: pnpm clean
 */

import { rm } from 'node:fs/promises'
import { join } from 'node:path'

const ROOT = join(import.meta.dirname, '..')

const PATHS_TO_CLEAN = [
  'dist',
  'node_modules/.vite',
  'node_modules/.cache',
  '.tsbuildinfo',
  'e2e/test-results',
  'coverage',
]

async function clean() {
  console.log('🧹 Cleaning build artifacts...\n')

  for (const path of PATHS_TO_CLEAN) {
    const fullPath = join(ROOT, path)
    try {
      await rm(fullPath, { recursive: true, force: true })
      console.log(`  ✓ ${path}`)
    } catch (error) {
      // Ignore if doesn't exist
    }
  }

  console.log('\n✨ Done!')
}

clean().catch(console.error)
