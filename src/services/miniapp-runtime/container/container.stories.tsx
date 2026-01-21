import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState, useRef } from 'react';
import { within, userEvent, expect } from '@storybook/test';
import { IframeContainerManager, cleanupAllIframeContainers } from './iframe-container';
import { WujieContainerManager } from './wujie-container';
import type { ContainerHandle } from './types';

const meta: Meta = {
  title: 'Services/Container',
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function IframeContainerDemo() {
  const [handle, setHandle] = useState<ContainerHandle | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [isBackground, setIsBackground] = useState(false);
  const managerRef = useRef(new IframeContainerManager());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      handle?.destroy();
      cleanupAllIframeContainers();
    };
  }, [handle]);

  const handleCreate = async () => {
    if (!containerRef.current) return;
    setStatus('creating...');
    const newHandle = await managerRef.current.create({
      appId: `test-app-${Date.now()}`,
      url: 'https://example.com',
      mountTarget: containerRef.current,
      onLoad: () => setStatus('loaded'),
    });
    setHandle(newHandle);
    setStatus('created');
  };

  const handleDestroy = () => {
    handle?.destroy();
    setHandle(null);
    setStatus('destroyed');
    setIsBackground(false);
  };

  const handleBackground = () => {
    handle?.moveToBackground();
    setIsBackground(true);
    setStatus('background');
  };

  const handleForeground = () => {
    handle?.moveToForeground();
    setIsBackground(false);
    setStatus('foreground');
  };

  return (
    <div className="flex h-screen flex-col gap-4 p-4">
      <div className="flex gap-2">
        <button
          data-testid="btn-create"
          onClick={handleCreate}
          disabled={!!handle}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
        >
          Create Container
        </button>
        <button
          data-testid="btn-destroy"
          onClick={handleDestroy}
          disabled={!handle}
          className="rounded bg-red-500 px-4 py-2 text-white disabled:opacity-50"
        >
          Destroy
        </button>
        <button
          data-testid="btn-background"
          onClick={handleBackground}
          disabled={!handle || isBackground}
          className="rounded bg-yellow-500 px-4 py-2 text-white disabled:opacity-50"
        >
          Move to Background
        </button>
        <button
          data-testid="btn-foreground"
          onClick={handleForeground}
          disabled={!handle || !isBackground}
          className="rounded bg-green-500 px-4 py-2 text-white disabled:opacity-50"
        >
          Move to Foreground
        </button>
      </div>

      <div className="flex gap-4 text-sm">
        <div>
          Status:{' '}
          <span data-testid="status" className="font-mono">
            {status}
          </span>
        </div>
        <div>
          Connected:{' '}
          <span data-testid="connected" className="font-mono">
            {handle?.isConnected() ? 'yes' : 'no'}
          </span>
        </div>
        <div>
          Type:{' '}
          <span data-testid="type" className="font-mono">
            {handle?.type ?? 'none'}
          </span>
        </div>
      </div>

      <div className="flex-1 rounded border border-gray-300 bg-gray-100 p-2">
        <div className="mb-2 text-xs text-gray-500">Container will be mounted here</div>
        <div ref={containerRef} className="h-full" data-testid="container-host" />
      </div>
    </div>
  );
}

export const IframeContainer: Story = {
  render: () => <IframeContainerDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Initial state', async () => {
      expect(canvas.getByTestId('status')).toHaveTextContent('idle');
      expect(canvas.getByTestId('connected')).toHaveTextContent('no');
      expect(canvas.getByTestId('type')).toHaveTextContent('none');
    });

    await step('Create container', async () => {
      await userEvent.click(canvas.getByTestId('btn-create'));
      await new Promise((r) => setTimeout(r, 100));

      expect(canvas.getByTestId('status')).toHaveTextContent('created');
      expect(canvas.getByTestId('connected')).toHaveTextContent('yes');
      expect(canvas.getByTestId('type')).toHaveTextContent('iframe');
    });

    await step('Move to background', async () => {
      await userEvent.click(canvas.getByTestId('btn-background'));
      await new Promise((r) => setTimeout(r, 100));

      expect(canvas.getByTestId('status')).toHaveTextContent('background');
    });

    await step('Move to foreground', async () => {
      await userEvent.click(canvas.getByTestId('btn-foreground'));
      await new Promise((r) => setTimeout(r, 100));

      expect(canvas.getByTestId('status')).toHaveTextContent('foreground');
    });

    await step('Destroy container', async () => {
      await userEvent.click(canvas.getByTestId('btn-destroy'));
      await new Promise((r) => setTimeout(r, 100));

      expect(canvas.getByTestId('status')).toHaveTextContent('destroyed');
      expect(canvas.getByTestId('connected')).toHaveTextContent('no');
      expect(canvas.getByTestId('type')).toHaveTextContent('none');
    });
  },
};

function MultipleContainersDemo() {
  const [handles, setHandles] = useState<ContainerHandle[]>([]);
  const managerRef = useRef(new IframeContainerManager());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      handles.forEach((h) => h.destroy());
      cleanupAllIframeContainers();
    };
  }, [handles]);

  const handleCreate = async () => {
    if (!containerRef.current) return;
    const id = `app-${Date.now()}`;
    const newHandle = await managerRef.current.create({
      appId: id,
      url: `https://example.com/?id=${id}`,
      mountTarget: containerRef.current,
    });
    setHandles((prev) => [...prev, newHandle]);
  };

  const handleDestroyLast = () => {
    if (handles.length === 0) return;
    const last = handles[handles.length - 1];
    last.destroy();
    setHandles((prev) => prev.slice(0, -1));
  };

  const handleCleanupAll = () => {
    handles.forEach((h) => h.destroy());
    cleanupAllIframeContainers();
    setHandles([]);
  };

  return (
    <div className="flex h-screen flex-col gap-4 p-4">
      <div className="flex gap-2">
        <button
          data-testid="btn-create-multi"
          onClick={handleCreate}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          Create Container
        </button>
        <button
          data-testid="btn-destroy-last"
          onClick={handleDestroyLast}
          disabled={handles.length === 0}
          className="rounded bg-red-500 px-4 py-2 text-white disabled:opacity-50"
        >
          Destroy Last
        </button>
        <button
          data-testid="btn-cleanup-all"
          onClick={handleCleanupAll}
          disabled={handles.length === 0}
          className="rounded bg-gray-500 px-4 py-2 text-white disabled:opacity-50"
        >
          Cleanup All
        </button>
      </div>

      <div className="text-sm">
        Active containers:{' '}
        <span data-testid="count" className="font-mono">
          {handles.length}
        </span>
      </div>

      <div className="flex-1 rounded border border-gray-300 bg-gray-100 p-2">
        <div ref={containerRef} className="h-full" data-testid="container-host-multi" />
      </div>
    </div>
  );
}

export const MultipleContainers: Story = {
  render: () => <MultipleContainersDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Create 3 containers', async () => {
      for (let i = 0; i < 3; i++) {
        await userEvent.click(canvas.getByTestId('btn-create-multi'));
        await new Promise((r) => setTimeout(r, 50));
      }

      expect(canvas.getByTestId('count')).toHaveTextContent('3');
    });

    await step('Destroy last container', async () => {
      await userEvent.click(canvas.getByTestId('btn-destroy-last'));
      await new Promise((r) => setTimeout(r, 50));

      expect(canvas.getByTestId('count')).toHaveTextContent('2');
    });

    await step('Cleanup all containers', async () => {
      await userEvent.click(canvas.getByTestId('btn-cleanup-all'));
      await new Promise((r) => setTimeout(r, 50));

      expect(canvas.getByTestId('count')).toHaveTextContent('0');
    });
  },
};

function WujieContainerDemo() {
  const [handle, setHandle] = useState<ContainerHandle | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [iframeInfo, setIframeInfo] = useState<string>('none');
  const [logs, setLogs] = useState<string[]>([]);
  const managerRef = useRef(new WujieContainerManager());
  const containerRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  useEffect(() => {
    return () => {
      handle?.destroy();
    };
  }, [handle]);

  const handleCreate = async () => {
    if (!containerRef.current) return;
    setStatus('creating...');
    addLog('Creating wujie container...');

    const appId = `wujie-test-${Date.now()}`;
    try {
      const newHandle = await managerRef.current.create({
        appId,
        url: window.location.origin + '/miniapps/teleport/',
        mountTarget: containerRef.current,
        onLoad: () => {
          setStatus('loaded');
          addLog('Wujie app loaded (afterMount)');
        },
      });
      setHandle(newHandle);
      setStatus('created');
      addLog(`Container created with appId: ${appId}`);

      setTimeout(() => {
        const iframe = newHandle.getIframe();
        if (iframe) {
          setIframeInfo(`Found: iframe[name="${iframe.name}"]`);
          addLog(`Iframe found: name="${iframe.name}", src="${iframe.src.slice(0, 50)}..."`);
        } else {
          setIframeInfo('Not found');
          addLog('Iframe NOT found via getIframe()');
        }
      }, 500);
    } catch (err) {
      setStatus('error');
      addLog(`Error: ${err}`);
    }
  };

  const handleCheckIframe = () => {
    if (!handle) return;
    const iframe = handle.getIframe();
    if (iframe) {
      setIframeInfo(`Found: iframe[name="${iframe.name}"]`);
      addLog(`Iframe check: name="${iframe.name}"`);
      try {
        const hasContentWindow = !!iframe.contentWindow;
        const canAccess = hasContentWindow && typeof iframe.contentWindow.postMessage === 'function';
        addLog(`contentWindow accessible: ${canAccess}`);
      } catch (e) {
        addLog(`contentWindow access error: ${e}`);
      }
    } else {
      setIframeInfo('Not found');
      addLog('Iframe NOT found');
    }
  };

  const handleDestroy = () => {
    handle?.destroy();
    setHandle(null);
    setStatus('destroyed');
    setIframeInfo('none');
    addLog('Container destroyed');
  };

  return (
    <div className="flex h-screen flex-col gap-4 p-4">
      <div className="flex gap-2">
        <button
          data-testid="btn-create-wujie"
          onClick={handleCreate}
          disabled={!!handle}
          className="rounded bg-purple-500 px-4 py-2 text-white disabled:opacity-50"
        >
          Create Wujie Container
        </button>
        <button
          data-testid="btn-check-iframe"
          onClick={handleCheckIframe}
          disabled={!handle}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
        >
          Check Iframe
        </button>
        <button
          data-testid="btn-destroy-wujie"
          onClick={handleDestroy}
          disabled={!handle}
          className="rounded bg-red-500 px-4 py-2 text-white disabled:opacity-50"
        >
          Destroy
        </button>
      </div>

      <div className="flex gap-4 text-sm">
        <div>
          Status:{' '}
          <span data-testid="wujie-status" className="font-mono">
            {status}
          </span>
        </div>
        <div>
          Type:{' '}
          <span data-testid="wujie-type" className="font-mono">
            {handle?.type ?? 'none'}
          </span>
        </div>
        <div>
          Iframe:{' '}
          <span data-testid="wujie-iframe-info" className="font-mono">
            {iframeInfo}
          </span>
        </div>
      </div>

      <div className="flex flex-1 gap-4">
        <div className="flex-1 rounded border border-gray-300 bg-gray-100 p-2">
          <div className="mb-2 text-xs text-gray-500">Wujie Container</div>
          <div ref={containerRef} className="h-full" data-testid="wujie-container-host" />
        </div>

        <div className="w-80 rounded border border-gray-300 bg-gray-900 p-2 text-xs text-green-400">
          <div className="mb-2 text-gray-500">Logs</div>
          <div data-testid="wujie-logs" className="font-mono">
            {logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const WujieContainer: Story = {
  render: () => <WujieContainerDemo />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step('Initial state', async () => {
      expect(canvas.getByTestId('wujie-status')).toHaveTextContent('idle');
      expect(canvas.getByTestId('wujie-type')).toHaveTextContent('none');
      expect(canvas.getByTestId('wujie-iframe-info')).toHaveTextContent('none');
    });

    await step('Create wujie container', async () => {
      await userEvent.click(canvas.getByTestId('btn-create-wujie'));
      await new Promise((r) => setTimeout(r, 2000));

      expect(canvas.getByTestId('wujie-status')).toHaveTextContent(/created|loaded/);
      expect(canvas.getByTestId('wujie-type')).toHaveTextContent('wujie');
    });

    await step('Check iframe is accessible', async () => {
      await userEvent.click(canvas.getByTestId('btn-check-iframe'));
      await new Promise((r) => setTimeout(r, 500));

      expect(canvas.getByTestId('wujie-iframe-info')).toHaveTextContent(/Found|iframe/);
    });

    await step('Destroy container', async () => {
      await userEvent.click(canvas.getByTestId('btn-destroy-wujie'));
      await new Promise((r) => setTimeout(r, 100));

      expect(canvas.getByTestId('wujie-status')).toHaveTextContent('destroyed');
      expect(canvas.getByTestId('wujie-type')).toHaveTextContent('none');
    });
  },
};
