import type { DevCommand, ProcessState } from './types';

const MAX_BUFFER_LINES = 1000;
const KILL_TIMEOUT_MS = 3000;

export class ProcessManager {
  private processes: Map<string, ProcessState> = new Map();
  onOutput?: (commandId: string, text: string) => void;

  async start(command: DevCommand): Promise<ProcessState> {
    const existing = this.processes.get(command.id);
    if (existing?.status === 'running') {
      return existing;
    }

    if (command.preStart) {
      await command.preStart();
    }

    const state: ProcessState = {
      id: command.id,
      pid: null,
      status: 'starting',
      subprocess: null,
      buffer: [],
      startedAt: null,
    };
    this.processes.set(command.id, state);

    const proc = Bun.spawn(command.cmd, {
      cwd: command.cwd,
      env: { ...process.env, ...command.env, FORCE_COLOR: '1' },
      stdout: 'pipe',
      stderr: 'pipe',
    });

    state.subprocess = proc;
    state.pid = proc.pid;
    state.status = 'running';
    state.startedAt = Date.now();

    this.pipeOutput(proc.stdout, state, command);
    this.pipeOutput(proc.stderr, state, command);

    proc.exited.then(() => {
      if (state.status !== 'stopping') {
        state.status = 'stopped';
      }
      state.pid = null;
    });

    return state;
  }

  private async pipeOutput(
    stream: ReadableStream<Uint8Array> | null,
    state: ProcessState,
    command: DevCommand,
  ): Promise<void> {
    if (!stream) return;

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const prefixedText = `${command.color}[${command.name}]\x1b[0m ${text}`;

        state.buffer.push(prefixedText);
        if (state.buffer.length > MAX_BUFFER_LINES) {
          state.buffer.shift();
        }

        this.onOutput?.(command.id, prefixedText);
      }
    } catch {}
  }

  async stop(commandId: string): Promise<void> {
    const state = this.processes.get(commandId);
    if (!state || state.status !== 'running' || !state.subprocess) return;

    state.status = 'stopping';
    const pid = state.pid;

    try {
      if (pid) {
        process.kill(-pid, 'SIGTERM');
      }
    } catch {
      state.subprocess.kill('SIGTERM');
    }

    const killTimeout = setTimeout(() => {
      if (state.status === 'stopping' && state.subprocess) {
        try {
          if (pid) {
            process.kill(-pid, 'SIGKILL');
          }
        } catch {
          state.subprocess.kill('SIGKILL');
        }
      }
    }, KILL_TIMEOUT_MS);

    await state.subprocess.exited;
    clearTimeout(killTimeout);

    const command = this.findCommandById(commandId);
    if (command?.port) {
      await this.ensurePortReleased(command.port);
    }

    state.status = 'stopped';
    state.pid = null;
    state.subprocess = null;
    state.startedAt = null;
  }

  private commandsRef: DevCommand[] = [];

  setCommands(commands: DevCommand[]): void {
    this.commandsRef = commands;
  }

  private findCommandById(id: string): DevCommand | undefined {
    return this.commandsRef.find((c) => c.id === id);
  }

  private async ensurePortReleased(port: number): Promise<void> {
    try {
      const result = Bun.spawnSync(['lsof', '-ti', `:${port}`]);
      if (result.success && result.stdout.length > 0) {
        const pids = result.stdout.toString().trim().split('\n');
        for (const pid of pids) {
          if (pid) {
            Bun.spawnSync(['kill', '-9', pid]);
          }
        }
        await Bun.sleep(500);
      }
    } catch {}
  }

  async restart(command: DevCommand): Promise<ProcessState> {
    await this.stop(command.id);
    return this.start(command);
  }

  getState(commandId: string): ProcessState | undefined {
    return this.processes.get(commandId);
  }

  getAllStates(): ProcessState[] {
    return Array.from(this.processes.values());
  }

  async stopAll(): Promise<void> {
    const promises = Array.from(this.processes.keys()).map((id) => this.stop(id));
    await Promise.all(promises);
  }
}
