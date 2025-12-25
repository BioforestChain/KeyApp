/**
 * 最佳实践管理
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { BEST_PRACTICES_FILE, log } from './utils'

interface PracticeDocument {
  headerLines: string[]
  items: string[]
  footerLines: string[]
}

function readDocument(): PracticeDocument {
  if (!existsSync(BEST_PRACTICES_FILE)) {
    log.error(`最佳实践文件不存在: ${BEST_PRACTICES_FILE}`)
    process.exit(1)
  }

  const raw = readFileSync(BEST_PRACTICES_FILE, 'utf-8')
  const lines = raw.split('\n')
  const listIndex = lines.findIndex(line => line.trim() === '## 列表')

  if (listIndex === -1) {
    log.error('最佳实践文件缺少 "## 列表" 标记')
    process.exit(1)
  }

  const headerLines = lines.slice(0, listIndex + 1)
  const itemLines: string[] = []
  const footerLines: string[] = []

  let inItems = true
  for (let i = listIndex + 1; i < lines.length; i += 1) {
    const line = lines[i]
    if (inItems) {
      if (line.startsWith('## ') && line.trim() !== '## 列表') {
        inItems = false
        footerLines.push(line)
        continue
      }
      if (line.trim().startsWith('- ')) {
        itemLines.push(line.trim().slice(2))
        continue
      }
      if (line.trim().length === 0) {
        continue
      }
      itemLines.push(line.trim())
      continue
    }
    footerLines.push(line)
  }

  return {
    headerLines,
    items: itemLines,
    footerLines,
  }
}

function writeDocument(doc: PracticeDocument): void {
  const lines = [...doc.headerLines]
  lines.push('')
  for (const item of doc.items) {
    lines.push(`- ${item}`)
  }
  if (doc.footerLines.length > 0) {
    lines.push('')
    lines.push(...doc.footerLines)
  }
  const content = lines.join('\n').trimEnd() + '\n'
  writeFileSync(BEST_PRACTICES_FILE, content)
}

export function listPractices(): void {
  const doc = readDocument()
  if (doc.items.length === 0) {
    console.log('暂无最佳实践')
    return
  }
  console.log('# 最佳实践\n')
  doc.items.forEach((item, index) => {
    console.log(`${index + 1}. ${item}`)
  })
  console.log()
}

export function addPractice(text?: string): void {
  const value = text?.trim()
  if (!value) {
    log.error('请提供要添加的最佳实践文本')
    process.exit(1)
  }
  const doc = readDocument()
  doc.items.push(value)
  writeDocument(doc)
  log.success('已添加最佳实践')
}

export function removePractice(target?: string): void {
  const value = target?.trim()
  if (!value) {
    log.error('请提供要删除的序号或文本')
    process.exit(1)
  }

  const doc = readDocument()
  const index = Number.parseInt(value, 10)
  if (!Number.isNaN(index)) {
    if (index < 1 || index > doc.items.length) {
      log.error(`序号超出范围: ${index}`)
      process.exit(1)
    }
    doc.items.splice(index - 1, 1)
    writeDocument(doc)
    log.success('已删除最佳实践')
    return
  }

  const matchIndex = doc.items.findIndex(item => item === value)
  if (matchIndex === -1) {
    log.error('未找到匹配的最佳实践')
    process.exit(1)
  }
  doc.items.splice(matchIndex, 1)
  writeDocument(doc)
  log.success('已删除最佳实践')
}

export function updatePractice(indexText?: string, text?: string): void {
  const indexValue = indexText?.trim()
  const value = text?.trim()
  if (!indexValue || !value) {
    log.error('请提供序号与新的最佳实践文本')
    process.exit(1)
  }

  const index = Number.parseInt(indexValue, 10)
  if (Number.isNaN(index)) {
    log.error('序号必须是数字')
    process.exit(1)
  }

  const doc = readDocument()
  if (index < 1 || index > doc.items.length) {
    log.error(`序号超出范围: ${index}`)
    process.exit(1)
  }

  doc.items[index - 1] = value
  writeDocument(doc)
  log.success('已更新最佳实践')
}

export function printBestPracticesContent(): void {
  if (!existsSync(BEST_PRACTICES_FILE)) {
    log.warn(`最佳实践文件缺失: ${BEST_PRACTICES_FILE}`)
    return
  }
  console.log(readFileSync(BEST_PRACTICES_FILE, 'utf-8'))
}
