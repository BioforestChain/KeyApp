/**
 * Best Practice Tools
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT_DIR = process.cwd();
const PRACTICE_FILE = join(ROOT_DIR, "docs/white-book/00-Manifesto/best-practices.md");

export interface Practice {
  index: number;
  content: string;
}

export interface PracticeList {
  practices: Practice[];
  formatted: string;
}

/**
 * Parse practices from markdown file
 */
function parsePractices(content: string): Practice[] {
  const lines = content.split("\n");
  const practices: Practice[] = [];
  let index = 0;

  for (const line of lines) {
    const match = line.match(/^\d+\.\s+(.+)$/);
    if (match) {
      practices.push({ index: ++index, content: match[1] });
    }
  }

  return practices;
}

/**
 * List all best practices
 */
export function listPractices(): PracticeList {
  if (!existsSync(PRACTICE_FILE)) {
    return { practices: [], formatted: "最佳实践文件不存在" };
  }

  const content = readFileSync(PRACTICE_FILE, "utf-8");
  const practices = parsePractices(content);

  const formatted = practices.length > 0
    ? `# 最佳实践\n\n${practices.map((p) => `${p.index}. ${p.content}`).join("\n")}`
    : "暂无最佳实践";

  return { practices, formatted };
}

/**
 * Add a new practice
 */
export function addPractice(content: string): PracticeList {
  const { practices } = listPractices();
  practices.push({ index: practices.length + 1, content });

  const newContent = `# 最佳实践\n\n${practices.map((p) => `${p.index}. ${p.content}`).join("\n")}\n`;
  writeFileSync(PRACTICE_FILE, newContent, "utf-8");

  return listPractices();
}

/**
 * Remove a practice by index or content
 */
export function removePractice(target: string): PracticeList {
  const { practices } = listPractices();
  const index = parseInt(target, 10);

  let filtered: Practice[];
  if (!isNaN(index)) {
    filtered = practices.filter((p) => p.index !== index);
  } else {
    filtered = practices.filter((p) => !p.content.includes(target));
  }

  // Re-index
  filtered = filtered.map((p, i) => ({ ...p, index: i + 1 }));

  const newContent = `# 最佳实践\n\n${filtered.map((p) => `${p.index}. ${p.content}`).join("\n")}\n`;
  writeFileSync(PRACTICE_FILE, newContent, "utf-8");

  return listPractices();
}

/**
 * Update a practice
 */
export function updatePractice(index: number, content: string): PracticeList {
  const { practices } = listPractices();

  const updated = practices.map((p) =>
    p.index === index ? { ...p, content } : p
  );

  const newContent = `# 最佳实践\n\n${updated.map((p) => `${p.index}. ${p.content}`).join("\n")}\n`;
  writeFileSync(PRACTICE_FILE, newContent, "utf-8");

  return listPractices();
}

/**
 * Get practices content for readme
 */
export function getPracticesContent(): string {
  const { formatted } = listPractices();
  return formatted;
}
