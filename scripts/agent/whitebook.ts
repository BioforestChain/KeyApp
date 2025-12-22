/**
 * 白皮书相关功能
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { WHITE_BOOK_DIR, colors, log } from './utils'

export interface ChapterInfo {
  name: string
  path: string
  indexPath?: string
  subChapters: ChapterInfo[]
}

export function getChapters(dir: string): ChapterInfo[] {
  if (!existsSync(dir)) return []

  const items = readdirSync(dir)
    .filter(item => !item.startsWith('.'))
    .sort()

  const chapters: ChapterInfo[] = []

  for (const item of items) {
    const fullPath = join(dir, item)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      const indexPath = join(fullPath, 'index.md')
      const subChapters = getChapters(fullPath)

      chapters.push({
        name: item,
        path: fullPath,
        indexPath: existsSync(indexPath) ? indexPath : undefined,
        subChapters,
      })
    } else if (item.endsWith('.md') && item !== 'index.md') {
      chapters.push({
        name: item.replace('.md', ''),
        path: fullPath,
        subChapters: [],
      })
    }
  }

  return chapters
}

export function printToc(chapters: ChapterInfo[], indent = 0): void {
  for (const chapter of chapters) {
    const prefix = '  '.repeat(indent)
    const relPath = relative(WHITE_BOOK_DIR, chapter.path)
    console.log(`${prefix}- ${chapter.name} (${relPath})`)
    if (chapter.subChapters.length > 0) {
      printToc(chapter.subChapters, indent + 1)
    }
  }
}

function readMarkdownFile(filePath: string): string {
  if (!existsSync(filePath)) return ''
  return readFileSync(filePath, 'utf-8')
}

export function printChapterContent(chapterPath: string): void {
  const fullPath = join(WHITE_BOOK_DIR, chapterPath)

  if (!existsSync(fullPath)) {
    console.error(`${colors.red}错误: 章节不存在: ${chapterPath}${colors.reset}`)
    process.exit(1)
  }

  const stat = statSync(fullPath)

  if (stat.isDirectory()) {
    const indexPath = join(fullPath, 'index.md')
    if (existsSync(indexPath)) {
      console.log(readMarkdownFile(indexPath))
    }

    const subFiles = readdirSync(fullPath)
      .filter(f => f.endsWith('.md') && f !== 'index.md')
      .sort()

    for (const subFile of subFiles) {
      log.subsection(subFile.replace('.md', ''))
      console.log(readMarkdownFile(join(fullPath, subFile)))
    }
  } else if (fullPath.endsWith('.md')) {
    console.log(readMarkdownFile(fullPath))
  }
}

export function printWhiteBookToc(): void {
  console.log('# 白皮书目录结构\n')
  const chapters = getChapters(WHITE_BOOK_DIR)
  printToc(chapters)
}
