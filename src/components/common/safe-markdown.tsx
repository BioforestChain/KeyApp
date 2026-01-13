import React, { Fragment, useMemo } from 'react';
import { cn } from '@/lib/utils';

type SafeMarkdownProps = {
  content: string;
  className?: string | undefined;
};

type Block =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'code'; lang?: string | undefined; code: string };

function sanitizeMarkdown(source: string): string {
  return (
    source
      // Normalize line endings
      .replace(/\r\n?/g, '\n')
      // Drop HTML blocks/tags (keep it conservative: do not render as HTML)
      .replace(/<[^>]*>/g, '')
      // Drop images: ![alt](url)
      .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
      // Replace links with plain text: [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Drop autolinks: <https://...>
      .replace(/<https?:\/\/[^>]+>/g, '')
      // Drop bare URLs
      .replace(/https?:\/\/\S+/g, '')
  );
}

function toInlineNodes(text: string): Array<string | React.ReactElement> {
  // Very conservative inline support:
  // - Inline code: `code`
  // - Bold: **text**
  const nodes: Array<string | React.ReactElement> = [];
  const parts = text.split('`');
  if (parts.length === 1) {
    return toBoldNodes(text);
  }

  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i] ?? '';
    const isCode = i % 2 === 1;
    if (isCode) {
      nodes.push(
        <code key={`code:${i}`} className="bg-muted rounded px-1 py-0.5 font-mono text-[0.85em]">
          {part}
        </code>,
      );
    } else {
      nodes.push(...toBoldNodes(part, `t:${i}`));
    }
  }
  return nodes;
}

function toBoldNodes(text: string, keyPrefix = 'b'): Array<string | React.ReactElement> {
  const parts = text.split('**');
  if (parts.length === 1) return [text];

  const nodes: Array<string | React.ReactElement> = [];
  let isBold = false;
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i] ?? '';
    if (part.length === 0) {
      isBold = !isBold;
      continue;
    }
    if (isBold) {
      nodes.push(
        <strong key={`${keyPrefix}:${i}`} className="text-foreground font-semibold">
          {part}
        </strong>,
      );
    } else {
      nodes.push(part);
    }
    isBold = !isBold;
  }
  return nodes;
}

function parseBlocks(source: string): Block[] {
  const result: Block[] = [];
  const lines = source.split('\n');

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i] ?? '';
    const line = raw.trimEnd();

    // Skip empty lines
    if (line.trim().length === 0) {
      i += 1;
      continue;
    }

    // Fenced code blocks
    const fenceMatch = line.match(/^```(\S+)?\s*$/);
    if (fenceMatch) {
      const lang = fenceMatch[1];
      i += 1;
      const codeLines: string[] = [];
      while (i < lines.length) {
        const l = lines[i] ?? '';
        if (l.trimEnd().match(/^```\s*$/)) break;
        codeLines.push(l);
        i += 1;
      }
      // Skip closing fence line
      i += 1;
      result.push({ type: 'code', lang, code: codeLines.join('\n') });
      continue;
    }

    // Headings (limit to h1-h3)
    const hMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (hMatch) {
      const level = hMatch[1].length as 1 | 2 | 3;
      const text = hMatch[2] ?? '';
      result.push({ type: 'heading', level, text });
      i += 1;
      continue;
    }

    // Unordered list
    if (line.match(/^\s*[-*+]\s+/)) {
      const items: string[] = [];
      while (i < lines.length) {
        const l = (lines[i] ?? '').trimEnd();
        const m = l.match(/^\s*[-*+]\s+(.+)$/);
        if (!m) break;
        items.push(m[1] ?? '');
        i += 1;
      }
      result.push({ type: 'ul', items });
      continue;
    }

    // Ordered list
    if (line.match(/^\s*\d+\.\s+/)) {
      const items: string[] = [];
      while (i < lines.length) {
        const l = (lines[i] ?? '').trimEnd();
        const m = l.match(/^\s*\d+\.\s+(.+)$/);
        if (!m) break;
        items.push(m[1] ?? '');
        i += 1;
      }
      result.push({ type: 'ol', items });
      continue;
    }

    // Paragraph (collect until blank line)
    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const l = (lines[i] ?? '').trimEnd();
      if (l.trim().length === 0) break;
      // Stop if the next block starts
      if (l.match(/^```(\S+)?\s*$/)) break;
      if (l.match(/^(#{1,3})\s+(.+)$/)) break;
      if (l.match(/^\s*[-*+]\s+/)) break;
      if (l.match(/^\s*\d+\.\s+/)) break;

      paragraphLines.push(l);
      i += 1;
    }
    result.push({ type: 'paragraph', text: paragraphLines.join('\n') });
  }

  return result;
}

export function SafeMarkdown({ content, className }: SafeMarkdownProps) {
  const blocks = useMemo(() => parseBlocks(sanitizeMarkdown(content)), [content]);

  return (
    <div className={cn('space-y-3 text-sm', className)} data-testid="safe-markdown">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h4
              // h1-h3 are mapped to the same semantic element but different visual weights
              key={`h:${index}`}
              className={cn(
                'text-foreground font-semibold',
                block.level === 1 && 'text-base',
                block.level === 2 && 'text-sm',
                block.level === 3 && 'text-sm',
              )}
            >
              {toInlineNodes(block.text).map((node, i) => (
                <Fragment key={`hi:${index}:${i}`}>{node}</Fragment>
              ))}
            </h4>
          );
        }

        if (block.type === 'code') {
          return (
            <pre
              key={`c:${index}`}
              className="bg-muted text-foreground overflow-x-auto rounded-xl p-3 text-xs leading-relaxed"
            >
              <code className="font-mono">{block.code}</code>
            </pre>
          );
        }

        if (block.type === 'ul' || block.type === 'ol') {
          const ListTag = block.type === 'ul' ? 'ul' : 'ol';
          return (
            <ListTag
              key={`l:${index}`}
              className={cn('text-muted-foreground space-y-1 ps-5', block.type === 'ul' ? 'list-disc' : 'list-decimal')}
            >
              {block.items.map((item, itemIndex) => (
                <li key={`li:${index}:${itemIndex}`}>
                  {toInlineNodes(item).map((node, i) => (
                    <Fragment key={`li:${index}:${itemIndex}:${i}`}>{node}</Fragment>
                  ))}
                </li>
              ))}
            </ListTag>
          );
        }

        return (
          <p key={`p:${index}`} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {toInlineNodes(block.text).map((node, i) => (
              <Fragment key={`pi:${index}:${i}`}>{node}</Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
