#!/usr/bin/env bun

import { commands } from './dev/commands';
import { ProcessManager } from './dev/process-manager';
import { ControlPanel } from './dev/control-panel';
import type { TabState } from './dev/types';

const processManager = new ProcessManager();
processManager.setCommands(commands);

const tabState: TabState = { activeTab: 0, selectedCommand: 0 };
const scrollState = new Map<string, { top: number; follow: boolean }>();

const controlPanel = new ControlPanel(commands, (id) => processManager.getState(id));

function getRunningCommandAtTabIndex(tabIndex: number) {
  const runningCommands = controlPanel.getRunningCommands();
  return runningCommands[tabIndex - 1];
}

function getMaxTabIndex(): number {
  return controlPanel.getRunningCommands().length;
}

function render() {
  if (tabState.activeTab === 0) {
    console.clear();
    console.log(controlPanel.render(tabState));
  }
}

function renderProcessOutput(commandId: string) {
  const state = processManager.getState(commandId);
  if (state) {
    console.clear();
    const header = controlPanel.renderHeader(tabState);
    const headerLines = header.split('\n');
    const rows = process.stdout.rows || 24;
    const outputHeight = Math.max(1, rows - headerLines.length);
    const { lines, totalLines } = normalizeBuffer(state.buffer);
    const { top, follow } = getScrollState(commandId, totalLines, outputHeight);
    const maxTop = Math.max(0, totalLines - outputHeight);
    const finalTop = follow ? maxTop : Math.min(Math.max(0, top), maxTop);
    const view = renderOutputLines(lines, finalTop, totalLines, outputHeight, process.stdout.columns || 80);
    setScrollState(commandId, finalTop, follow && finalTop === maxTop);

    console.log(header);
    if (view.length > 0) {
      console.log(view.join('\n'));
    }
  }
}

processManager.onOutput = (commandId, _text) => {
  const state = processManager.getState(commandId);
  if (!state) return;
  const runningCommands = controlPanel.getRunningCommands();
  const cmdIndex = runningCommands.findIndex((c) => c.id === commandId);
  updateScrollStateForAppend(commandId, state.buffer);
  if (tabState.activeTab === cmdIndex + 1) {
    renderProcessOutput(commandId);
  }
};

async function handleKeypress(key: string): Promise<boolean> {
  if (key === '\x1b[1;3D' || key === '\x1bb') {
    tabState.activeTab = Math.max(0, tabState.activeTab - 1);
    if (tabState.activeTab === 0) {
      render();
    } else {
      const cmd = getRunningCommandAtTabIndex(tabState.activeTab);
      if (cmd) renderProcessOutput(cmd.id);
    }
    return true;
  }

  if (key === '\x1b[1;3C' || key === '\x1bf') {
    const maxTab = getMaxTabIndex();
    tabState.activeTab = Math.min(maxTab, tabState.activeTab + 1);
    if (tabState.activeTab === 0) {
      render();
    } else {
      const cmd = getRunningCommandAtTabIndex(tabState.activeTab);
      if (cmd) renderProcessOutput(cmd.id);
    }
    return true;
  }

  if (tabState.activeTab === 0) {
    if (key === '\x1b[A') {
      tabState.selectedCommand = Math.max(0, tabState.selectedCommand - 1);
      render();
      return true;
    }

    if (key === '\x1b[B') {
      tabState.selectedCommand = Math.min(commands.length - 1, tabState.selectedCommand + 1);
      render();
      return true;
    }

    if (key === '\r') {
      const cmd = commands[tabState.selectedCommand];
      await processManager.start(cmd);
      render();
      return true;
    }

    if (key === 's' || key === 'S') {
      const cmd = commands[tabState.selectedCommand];
      await processManager.stop(cmd.id);
      render();
      return true;
    }

    if (key === 'r' || key === 'R') {
      const cmd = commands[tabState.selectedCommand];
      await processManager.restart(cmd);
      render();
      return true;
    }

    if (key === 'q' || key === 'Q' || key === '\x03') {
      return false;
    }
  } else {
    const cmd = getRunningCommandAtTabIndex(tabState.activeTab);
    if (!cmd) return true;

    if (key === 'q' || key === 'Q') {
      tabState.activeTab = 0;
      render();
      return true;
    }

    if (key === '\x1b[A') {
      updateScroll(commandIdFromTab(cmd.id), -1);
      renderProcessOutput(cmd.id);
      return true;
    }

    if (key === '\x1b[B') {
      updateScroll(commandIdFromTab(cmd.id), 1);
      renderProcessOutput(cmd.id);
      return true;
    }

    if (key === '\x1b[D') {
      updateScroll(commandIdFromTab(cmd.id), -getPageSize());
      renderProcessOutput(cmd.id);
      return true;
    }

    if (key === '\x1b[C') {
      updateScroll(commandIdFromTab(cmd.id), getPageSize());
      renderProcessOutput(cmd.id);
      return true;
    }

    if (key === '\x1b[5~') {
      updateScroll(commandIdFromTab(cmd.id), -getPageSize());
      renderProcessOutput(cmd.id);
      return true;
    }

    if (key === '\x1b[6~') {
      updateScroll(commandIdFromTab(cmd.id), getPageSize());
      renderProcessOutput(cmd.id);
      return true;
    }

    if (key === '\x03') {
      return false;
    }
  }

  return true;
}

async function cleanup() {
  console.log('\n\x1b[33mStopping all processes...\x1b[0m');
  await processManager.stopAll();
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }
}

async function main() {
  const isHeadless = !process.stdin.isTTY || process.env.CI === 'true';

  console.clear();
  console.log('\x1b[36mStarting Dev Runner...\\x1b[0m\n');

  for (const cmd of commands) {
    if (cmd.autoStart) {
      console.log(`Starting ${cmd.name}...`);
      await processManager.start(cmd);
    }
  }

  if (isHeadless) {
    console.log('\x1b[33mRunning in headless mode (no TTY). Press Ctrl+C to stop.\x1b[0m\n');

    processManager.onOutput = (_commandId, text) => {
      process.stdout.write(text);
    };

    await new Promise<void>((resolve) => {
      process.on('SIGINT', async () => {
        await cleanup();
        resolve();
      });
      process.on('SIGTERM', async () => {
        await cleanup();
        resolve();
      });
    });

    process.exit(0);
  }

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  render();

  process.stdin.on('data', async (data: string) => {
    const shouldContinue = await handleKeypress(data);
    if (!shouldContinue) {
      await cleanup();
      process.exit(0);
    }
  });

  process.on('SIGINT', async () => {
    await cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await cleanup();
    process.exit(0);
  });
}

main().catch(async (err) => {
  console.error('Fatal error:', err);
  await cleanup();
  process.exit(1);
});

function commandIdFromTab(commandId: string): string {
  return commandId;
}

function normalizeBuffer(buffer: string[]): { lines: string[]; totalLines: number } {
  const text = buffer.join('');
  const lines = text.length > 0 ? text.split('\n') : [];
  return { lines, totalLines: lines.length };
}

function getScrollState(commandId: string, totalLines: number, height: number): { top: number; follow: boolean } {
  const existing = scrollState.get(commandId);
  const maxTop = Math.max(0, totalLines - height);
  if (!existing) {
    const top = maxTop;
    scrollState.set(commandId, { top, follow: true });
    return { top, follow: true };
  }
  const top = Math.min(Math.max(0, existing.top), maxTop);
  return { top, follow: existing.follow };
}

function setScrollState(commandId: string, top: number, follow: boolean): void {
  scrollState.set(commandId, { top, follow });
}

function updateScrollStateForAppend(commandId: string, buffer: string[]): void {
  const { totalLines } = normalizeBuffer(buffer);
  if (totalLines === 0) return;
  const rows = process.stdout.rows || 24;
  const headerLines = controlPanel.renderHeader(tabState).split('\n').length;
  const height = Math.max(1, rows - headerLines);
  const maxTop = Math.max(0, totalLines - height);
  const current = getScrollState(commandId, totalLines, height);
  if (current.follow) {
    setScrollState(commandId, maxTop, true);
  } else {
    setScrollState(commandId, current.top, false);
  }
}

function updateScroll(commandId: string, delta: number): void {
  const state = processManager.getState(commandId);
  if (!state) return;
  const headerLines = controlPanel.renderHeader(tabState).split('\n').length;
  const height = Math.max(1, (process.stdout.rows || 24) - headerLines);
  const { totalLines } = normalizeBuffer(state.buffer);
  const maxTop = Math.max(0, totalLines - height);
  const current = getScrollState(commandId, totalLines, height);
  const nextTop = Math.min(Math.max(0, current.top + delta), maxTop);
  setScrollState(commandId, nextTop, nextTop === maxTop);
}

function getPageSize(): number {
  const headerLines = controlPanel.renderHeader(tabState).split('\n').length;
  return Math.max(1, (process.stdout.rows || 24) - headerLines);
}

function renderOutputLines(
  lines: string[],
  top: number,
  totalLines: number,
  height: number,
  width: number,
): string[] {
  const view: string[] = [];
  const maxTop = Math.max(0, totalLines - height);
  const safeTop = Math.min(Math.max(0, top), maxTop);
  const contentWidth = Math.max(1, width - 1);
  const bar = getScrollbar(height, totalLines, safeTop);

  for (let i = 0; i < height; i++) {
    const line = lines[safeTop + i] ?? '';
    const padded = padLine(line, contentWidth);
    view.push(`${padded}${bar[i] ?? ' '}`);
  }
  return view;
}

function padLine(line: string, width: number): string {
  const len = stripAnsi(line).length;
  if (len >= width) return line;
  return line + ' '.repeat(width - len);
}

function stripAnsi(input: string): string {
  return input.replace(
    /\x1b(\[(\[H\x1b\[2J|\d+;\d+H|\d+(;\d+;\d+(;\d+;\d+)?m|[mABCDFGd])|[HJK]|1K)|[78]|\d*[PMX]|\(B\x1b\[m)/g,
    '',
  );
}

function getScrollbar(height: number, totalLines: number, top: number): string[] {
  const bar = Array.from({ length: height }, () => ' ');
  if (totalLines <= height) {
    return bar;
  }
  const maxTop = Math.max(0, totalLines - height);
  const barHeight = Math.max(1, Math.round((height * height) / totalLines));
  const barTop = maxTop === 0 ? 0 : Math.round((top / maxTop) * (height - barHeight));
  for (let i = 0; i < height; i++) {
    bar[i] = i >= barTop && i < barTop + barHeight ? '█' : '│';
  }
  return bar;
}
