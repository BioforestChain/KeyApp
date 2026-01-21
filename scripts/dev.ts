#!/usr/bin/env bun

import type { Subprocess, Terminal } from 'bun';

interface TaskConfig {
  name: string;
  command: string[];
  cwd?: string;
  port?: number;
  description?: string;
  autoStart?: boolean;
}

interface TaskState {
  config: TaskConfig;
  process: Subprocess | null;
  terminal: Terminal | null;
  output: string[];
  status: 'stopped' | 'starting' | 'running' | 'error';
  stoppedByUser: boolean;
}

const TASKS: TaskConfig[] = [
  { name: 'vite', command: ['pnpm', 'dev:vite'], port: 5173, description: 'Vite dev server', autoStart: true },
  {
    name: 'tsc',
    command: ['pnpm', 'tsc', '--watch', '--noEmit', '--preserveWatchOutput'],
    description: 'TypeScript watch',
    autoStart: true,
  },
  { name: 'i18n', command: ['bun', 'scripts/i18n-types-watch.ts'], description: 'i18n types watcher', autoStart: true },
  { name: 'test', command: ['pnpm', 'vitest', '--watch'], description: 'Vitest watch', autoStart: false },
  { name: 'storybook', command: ['pnpm', 'storybook'], port: 6006, description: 'Storybook dev', autoStart: false },
  { name: 'docs', command: ['pnpm', 'docs:dev'], port: 5174, description: 'VitePress docs', autoStart: false },
  { name: 'mock', command: ['pnpm', 'dev:mock'], port: 5174, description: 'Vite mock mode', autoStart: false },
  { name: 'lint', command: ['pnpm', 'lint'], description: 'Oxlint check', autoStart: false },
  { name: 'i18n:check', command: ['pnpm', 'i18n:run'], description: 'i18n validation', autoStart: false },
  { name: 'theme:check', command: ['pnpm', 'theme:run'], description: 'Theme check', autoStart: false },
  { name: 'build', command: ['pnpm', 'build'], description: 'Vite build', autoStart: false },
  { name: 'e2e:audit', command: ['pnpm', 'e2e:audit:run'], description: 'E2E audit', autoStart: false },
];

const MAX_OUTPUT_LINES = 500;

const CURSOR_CONTROL_REGEX =
  /\x1b\[[0-9;]*[HJKfsu]|\x1b\[[\?]?[0-9;]*[hl]|\x1b\[\d*[ABCD]|\x1b\[s|\x1b\[u|\x1b7|\x1b8|\r/g;

function stripCursorControls(text: string): string {
  return text.replace(CURSOR_CONTROL_REGEX, '');
}

class TaskManager {
  private tasks: Map<string, TaskState> = new Map();
  private currentTab = 0;
  private selectedIndex = 0;
  private rootDir: string;
  private scrollOffset = 0;
  private focusMode = false;
  private inputBuffer = '';

  constructor() {
    this.rootDir = process.cwd();
    for (const config of TASKS) {
      this.tasks.set(config.name, {
        config,
        process: null,
        terminal: null,
        output: [],
        status: 'stopped',
        stoppedByUser: false,
      });
    }
  }

  private getTaskList(): TaskState[] {
    return Array.from(this.tasks.values());
  }

  async startTask(name: string): Promise<void> {
    const task = this.tasks.get(name);
    if (!task || task.process) return;

    task.status = 'starting';
    task.output = [];
    task.stoppedByUser = false;
    this.render();

    const cwd = task.config.cwd ? `${this.rootDir}/${task.config.cwd}` : this.rootDir;
    const { columns, rows } = process.stdout;

    try {
      const terminal = new Bun.Terminal({
        cols: columns,
        rows: rows - 6,
        data: (_term, data) => {
          const text = new TextDecoder().decode(data);

          if (this.focusMode && this.currentTab === this.getTaskIndex(task) + 1) {
            process.stdout.write(data);
          }

          this.appendOutput(task, text);

          if (!this.focusMode) {
            this.render();
          }
        },
      });

      const proc = Bun.spawn(task.config.command, {
        cwd,
        terminal,
        env: { ...process.env, FORCE_COLOR: '1', TERM: 'xterm-256color' },
      });

      task.process = proc;
      task.terminal = terminal;
      task.status = 'running';

      proc.exited.then((code) => {
        if (!task.stoppedByUser) {
          task.status = code === 0 ? 'stopped' : 'error';
          this.appendOutput(task, `\n[Process exited with code ${code}]`);
        }
        task.process = null;
        task.terminal?.close();
        task.terminal = null;

        if (this.focusMode && this.currentTab === this.getTaskIndex(task) + 1) {
          this.focusMode = false;
          process.stdout.write('\x1b[?25l');
        }
        this.render();
      });
    } catch (e) {
      task.status = 'error';
      this.appendOutput(task, `[Error starting process: ${e}]`);
    }
    this.render();
  }

  private getTaskIndex(task: TaskState): number {
    return this.getTaskList().indexOf(task);
  }

  private appendOutput(task: TaskState, text: string): void {
    const cleanText = stripCursorControls(text);
    const lines = cleanText.split('\n');
    for (const line of lines) {
      if (line || task.output.length === 0 || task.output[task.output.length - 1] !== '') {
        task.output.push(line);
      }
    }
    while (task.output.length > MAX_OUTPUT_LINES) {
      task.output.shift();
    }
  }

  async stopTask(name: string): Promise<void> {
    const task = this.tasks.get(name);
    if (!task?.process) return;

    task.stoppedByUser = true;
    task.process.kill();
    task.process = null;
    task.terminal?.close();
    task.terminal = null;
    task.status = 'stopped';
    this.appendOutput(task, '\n[Process stopped by user]');
    this.render();
  }

  async restartTask(name: string): Promise<void> {
    await this.stopTask(name);
    await new Promise((r) => setTimeout(r, 500));
    await this.startTask(name);
  }

  private clearScreen(): void {
    process.stdout.write('\x1b[2J\x1b[H');
  }

  private moveCursor(row: number, col: number): void {
    process.stdout.write(`\x1b[${row};${col}H`);
  }

  private getStatusIcon(status: TaskState['status']): string {
    switch (status) {
      case 'stopped':
        return '⚫';
      case 'starting':
        return '🟡';
      case 'running':
        return '🟢';
      case 'error':
        return '🔴';
    }
  }

  private getTabName(task: TaskState): string {
    if (task.process) {
      return `${task.process.pid}:${task.config.name}`;
    }
    return task.config.name;
  }

  private getHelpLine(): string {
    const taskList = this.getTaskList();

    if (this.focusMode) {
      return '\x1b[90mCtrl+] 退出聚焦模式\x1b[0m';
    }

    if (this.currentTab === 0) {
      const task = taskList[this.selectedIndex];
      if (task?.process) {
        return '\x1b[90mOption+←/→ 切换Tab | ↑/↓ 选择 | S 停止 | R 重启 | A 全部启动 | X 全部停止 | Q 退出\x1b[0m';
      }
      return '\x1b[90mOption+←/→ 切换Tab | ↑/↓ 选择 | Enter 启动 | A 全部启动 | Q 退出\x1b[0m';
    }

    const task = taskList[this.currentTab - 1];
    if (task?.process) {
      return '\x1b[90mOption+←/→ 切换Tab | ↑/↓/PgUp/PgDn 滚动 | Enter 聚焦 | S 停止 | R 重启 | Q 退出\x1b[0m';
    }
    return '\x1b[90mOption+←/→ 切换Tab | Enter 启动 | Q 退出\x1b[0m';
  }

  render(): void {
    if (this.focusMode) {
      return;
    }

    const { columns, rows } = process.stdout;
    this.clearScreen();

    this.moveCursor(1, 1);
    const taskList = this.getTaskList();
    let tabLine = '\x1b[48;5;236m';

    if (this.currentTab === 0) {
      tabLine += '\x1b[1;37;44m [Control] \x1b[0;48;5;236m';
    } else {
      tabLine += '\x1b[37m [Control] ';
    }

    for (let i = 0; i < taskList.length; i++) {
      const task = taskList[i];
      const tabName = this.getTabName(task);
      const icon = this.getStatusIcon(task.status);

      if (this.currentTab === i + 1) {
        tabLine += `\x1b[1;37;44m ${icon} ${tabName} \x1b[0;48;5;236m`;
      } else {
        tabLine += `\x1b[37m ${icon} ${tabName} `;
      }
    }
    tabLine += '\x1b[0m';
    process.stdout.write(tabLine.slice(0, columns * 2) + '\n');

    this.moveCursor(2, 1);
    process.stdout.write(this.getHelpLine() + '\n');
    process.stdout.write('─'.repeat(columns) + '\n');

    const contentRows = rows - 4;

    if (this.currentTab === 0) {
      this.renderControlPanel(contentRows);
    } else {
      const task = taskList[this.currentTab - 1];
      this.renderTaskOutput(task, contentRows);
    }
  }

  private renderControlPanel(availableRows: number): void {
    const taskList = this.getTaskList();

    for (let i = 0; i < Math.min(taskList.length, availableRows); i++) {
      const task = taskList[i];
      const icon = this.getStatusIcon(task.status);
      const selected = i === this.selectedIndex;
      const prefix = selected ? '\x1b[1;36m▸ ' : '  ';
      const suffix = selected ? '\x1b[0m' : '';

      const port = task.config.port ? `http://localhost:${task.config.port}/` : '';
      const pid = task.process ? `[PID: ${task.process.pid}]` : '';
      const desc = task.config.description || '';

      process.stdout.write(
        `${prefix}${icon} ${task.config.name.padEnd(15)} ${task.status.padEnd(10)} ${port.padEnd(28)} ${pid.padEnd(14)} ${desc}${suffix}\n`,
      );
    }
  }

  private renderTaskOutput(task: TaskState, availableRows: number): void {
    const { columns } = process.stdout;
    const totalLines = task.output.length;
    const maxScroll = Math.max(0, totalLines - availableRows);

    if (this.scrollOffset > maxScroll) {
      this.scrollOffset = maxScroll;
    }

    const startLine = Math.max(0, totalLines - availableRows - this.scrollOffset);
    const endLine = startLine + availableRows;
    const lines = task.output.slice(startLine, endLine);

    const scrollbarWidth = 1;
    const contentWidth = columns - scrollbarWidth - 1;

    for (let i = 0; i < availableRows; i++) {
      const line = lines[i] || '';
      const truncatedLine = line.slice(0, contentWidth);

      let scrollChar = ' ';
      if (totalLines > availableRows) {
        const scrollbarHeight = Math.max(1, Math.floor((availableRows * availableRows) / totalLines));
        const scrollbarPos = Math.floor(
          ((totalLines - availableRows - this.scrollOffset) / maxScroll) * (availableRows - scrollbarHeight),
        );
        if (i >= scrollbarPos && i < scrollbarPos + scrollbarHeight) {
          scrollChar = '█';
        } else {
          scrollChar = '░';
        }
      }

      process.stdout.write(truncatedLine + '\x1b[' + columns + 'G\x1b[90m' + scrollChar + '\x1b[0m\n');
    }
  }

  private handleKeypress(key: Buffer): void {
    const keyStr = key.toString();
    const taskList = this.getTaskList();
    const { rows } = process.stdout;
    const inputHeight = this.focusMode ? 2 : 0;
    const availableRows = rows - 4 - inputHeight;

    if (this.focusMode) {
      const task = taskList[this.currentTab - 1];

      // Escape sequence: Ctrl+] to exit focus mode
      if (keyStr === '\x1d') {
        this.focusMode = false;
        process.stdout.write('\x1b[?25l');
        this.render();
        return;
      }

      // Pass all input directly to terminal
      if (task?.terminal) {
        task.terminal.write(key);
      }
      return;
    }

    if (keyStr === '\x1b[1;3D' || keyStr === '\x1bb') {
      this.currentTab = Math.max(0, this.currentTab - 1);
      this.scrollOffset = 0;
      this.render();
      return;
    }
    if (keyStr === '\x1b[1;3C' || keyStr === '\x1bf') {
      this.currentTab = Math.min(taskList.length, this.currentTab + 1);
      this.scrollOffset = 0;
      this.render();
      return;
    }

    if (this.currentTab > 0) {
      const task = taskList[this.currentTab - 1];
      const maxScroll = Math.max(0, task.output.length - availableRows);

      if (keyStr === '\x1b[5~') {
        this.scrollOffset = Math.min(maxScroll, this.scrollOffset + availableRows);
        this.render();
        return;
      }
      if (keyStr === '\x1b[6~') {
        this.scrollOffset = Math.max(0, this.scrollOffset - availableRows);
        this.render();
        return;
      }
      if (keyStr === '\x1b[H' || keyStr === '\x1b[1~') {
        this.scrollOffset = maxScroll;
        this.render();
        return;
      }
      if (keyStr === '\x1b[F' || keyStr === '\x1b[4~') {
        this.scrollOffset = 0;
        this.render();
        return;
      }
      if (keyStr === '\x1b[A') {
        this.scrollOffset = Math.min(maxScroll, this.scrollOffset + 1);
        this.render();
        return;
      }
      if (keyStr === '\x1b[B') {
        this.scrollOffset = Math.max(0, this.scrollOffset - 1);
        this.render();
        return;
      }

      if (keyStr === '\r' || keyStr === '\n') {
        if (task.process) {
          this.focusMode = true;
          this.inputBuffer = '';
          this.render();
        } else {
          this.startTask(task.config.name);
        }
        return;
      }

      if (keyStr.toLowerCase() === 's' && task.process) {
        this.stopTask(task.config.name);
        return;
      }
      if (keyStr.toLowerCase() === 'r' && task.process) {
        this.restartTask(task.config.name);
        return;
      }
      if (keyStr.toLowerCase() === 'q' || keyStr === '\x03') {
        this.shutdown();
        return;
      }
      return;
    }

    if (keyStr === '\x1b[A') {
      if (this.currentTab === 0) {
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      }
      this.render();
      return;
    }
    if (keyStr === '\x1b[B') {
      if (this.currentTab === 0) {
        this.selectedIndex = Math.min(taskList.length - 1, this.selectedIndex + 1);
      }
      this.render();
      return;
    }

    const selectedTask = taskList[this.selectedIndex];

    switch (keyStr.toLowerCase()) {
      case '\r':
      case '\n':
        if (this.currentTab === 0 && selectedTask) {
          this.startTask(selectedTask.config.name);
        }
        break;
      case 's':
        if (this.currentTab === 0 && selectedTask) {
          this.stopTask(selectedTask.config.name);
        }
        break;
      case 'r':
        if (this.currentTab === 0 && selectedTask) {
          this.restartTask(selectedTask.config.name);
        }
        break;
      case 'q':
      case '\x03':
        this.shutdown();
        break;
      case 'a':
        if (this.currentTab === 0) {
          for (const task of taskList) {
            if (!task.process) {
              this.startTask(task.config.name);
            }
          }
        }
        break;
      case 'x':
        if (this.currentTab === 0) {
          for (const task of taskList) {
            if (task.process) {
              this.stopTask(task.config.name);
            }
          }
        }
        break;
    }
  }

  private shutdown(): void {
    for (const task of this.tasks.values()) {
      if (task.process) {
        task.process.kill();
      }
    }
    process.stdout.write('\x1b[?25h');
    process.exit(0);
  }

  async run(): Promise<void> {
    if (!process.stdin.isTTY) {
      this.printHelp();
      process.exit(0);
    }

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdout.write('\x1b[?25l');

    process.stdout.on('resize', () => this.render());

    process.stdin.on('data', (key: Buffer) => {
      this.handleKeypress(key);
    });

    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());

    for (const task of this.tasks.values()) {
      if (task.config.autoStart) {
        await this.startTask(task.config.name);
      }
    }

    this.render();
  }

  private printHelp(): void {
    console.log(`
\x1b[36mDev Runner\x1b[0m - Development process manager

\x1b[33mUSAGE:\x1b[0m
  pnpm dev              Interactive mode (requires TTY)

\x1b[33mKEYS:\x1b[0m
  Option+←/→  Switch tabs
  ↑/↓         Navigate commands
  Enter       Start selected command
  s           Stop selected command
  r           Restart selected command
  a           Start all
  x           Stop all
  q/Ctrl+C    Quit
`);
  }
}

const manager = new TaskManager();
manager.run().catch(console.error);
