# 01. Bio-SDK 通讯机制 (Communication)

> Code: `src/services/miniapp-runtime/bio-bridge/`, `packages/bio-sdk/`

本文档描述 Miniapp 与 KeyApp Host 之间的通讯机制，以及如何在不同容器类型下保持一致的通讯行为。

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│ Miniapp (iframe/Wujie)                                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ bio-sdk                                               │  │
│  │  - window.bio.wallet.requestAccounts()                │  │
│  │  - window.bio.kv.get(key)                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│                    postMessage                               │
│                           ▼                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                    window.postMessage
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ KeyApp Host                                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ PostMessageBridge                                     │  │
│  │  - 监听 iframe 的 message 事件                        │  │
│  │  - 路由到对应的 Handler                               │  │
│  └───────────────────────────────────────────────────────┘  │
│                           │                                  │
│                           ▼                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ BioProvider                                           │  │
│  │  - WalletHandler: 钱包操作                            │  │
│  │  - KVHandler: 键值存储                                │  │
│  │  - ...                                                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 消息协议

基于 JSON-RPC 2.0：

```typescript
// 请求
interface BioRequest {
  id: string; // UUID v4
  jsonrpc: '2.0';
  method: string; // e.g., 'wallet_requestAccounts'
  params?: unknown[];
}

// 响应
interface BioResponse {
  id: string;
  jsonrpc: '2.0';
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}
```

## 容器类型与通讯

### iframe 模式

直接使用 iframe 的 `contentWindow` 进行通讯：

```typescript
// Host 端
const iframe = containerHandle.element as HTMLIFrameElement;
iframe.contentWindow?.postMessage(response, '*');

// Miniapp 端
window.parent.postMessage(request, '*');
```

### Wujie 模式

Wujie 将 JS 运行在一个隐藏的 iframe 中，需要通过 `getIframe()` 获取：

```typescript
// Host 端 - 获取 Wujie 的隐藏 iframe
const iframe = containerHandle.getIframe();
// Wujie 创建的 iframe 的 name 属性等于 appId
// 即: document.querySelector(`iframe[name="${appId}"]`)

if (iframe) {
  iframe.contentWindow?.postMessage(response, '*');
}
```

**关键发现**: Wujie 的 JS 沙箱运行在同域 iframe 中，因此 `PostMessageBridge` 可以无缝复用。

## Host 端实现

### attachBioProviderToContainer

将 BioProvider 附加到容器，统一处理两种容器类型：

```typescript
import { attachBioProviderToContainer } from '@/services/miniapp-runtime'

const handle = await createContainer({ type: 'wujie', ... })

attachBioProviderToContainer(handle, {
  appId: 'my-miniapp',
  handlers: {
    wallet: walletHandler,
    kv: kvHandler,
  }
})
```

### PostMessageBridge

核心通讯桥梁：

```typescript
class PostMessageBridge {
  constructor(
    private iframe: HTMLIFrameElement,
    private handlers: Record<string, Handler>,
  ) {
    window.addEventListener('message', this.handleMessage);
  }

  private handleMessage = (event: MessageEvent) => {
    // 验证消息来源
    if (event.source !== this.iframe.contentWindow) return;

    const request = event.data as BioRequest;
    const [namespace, method] = request.method.split('_');

    // 路由到对应 handler
    const handler = this.handlers[namespace];
    if (handler) {
      handler
        .handle(method, request.params)
        .then((result) => this.respond(request.id, { result }))
        .catch((error) => this.respond(request.id, { error }));
    }
  };

  private respond(id: string, payload: Partial<BioResponse>) {
    this.iframe.contentWindow?.postMessage(
      {
        id,
        jsonrpc: '2.0',
        ...payload,
      },
      '*',
    );
  }
}
```

## Miniapp 端实现 (bio-sdk)

### 安装

```bash
pnpm add @bioforest/bio-sdk
```

### 使用

```typescript
import { bio } from '@bioforest/bio-sdk';

// 请求钱包地址
const accounts = await bio.wallet.requestAccounts();

// 签名交易
const txHash = await bio.wallet.sendTransaction({
  to: '0x...',
  value: '1000000000000000000',
});

// 键值存储
await bio.kv.set('user-preference', { theme: 'dark' });
const pref = await bio.kv.get('user-preference');
```

## Miniapp Context SDK

用于获取 KeyApp 上下文（safe area、宿主版本等），并订阅更新，避免业务侧直接使用 postMessage。

```typescript
import {
  getMiniappContext,
  onMiniappContextUpdate,
  applyMiniappSafeAreaCssVars,
} from '@bioforest/bio-sdk';

const context = await getMiniappContext();
applyMiniappSafeAreaCssVars(context);

const unsubscribe = onMiniappContextUpdate((next) => {
  applyMiniappSafeAreaCssVars(next);
});
```

SDK 行为要点：

- `getMiniappContext()` 无缓存时自动发起一次请求，超时会回退默认值并告警。
- `onMiniappContextUpdate()` 会回放最近一次 context，并在需要时触发刷新。
- `applyMiniappSafeAreaCssVars()` 会写入 `--keyapp-safe-area-*` 四个变量。

### 内部实现

```typescript
// bio-sdk 内部
class BioSDK {
  private pending = new Map<string, { resolve; reject }>();

  constructor() {
    window.addEventListener('message', this.handleResponse);
  }

  async request(method: string, params?: unknown[]) {
    const id = crypto.randomUUID();

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });

      window.parent.postMessage(
        {
          id,
          jsonrpc: '2.0',
          method,
          params,
        },
        '*',
      );
    });
  }

  private handleResponse = (event: MessageEvent) => {
    const { id, result, error } = event.data;
    const pending = this.pending.get(id);

    if (pending) {
      this.pending.delete(id);
      if (error) {
        pending.reject(new Error(error.message));
      } else {
        pending.resolve(result);
      }
    }
  };
}
```

## 安全考虑

1. **来源验证**: Host 端应验证 `event.source` 确保消息来自预期的 iframe
2. **权限控制**: 基于 Manifest 中声明的 `permissions` 进行访问控制
3. **沙箱隔离**: Wujie 提供 JS 沙箱，防止恶意代码访问主文档

## 相关文档

- [Container 架构](../01-Runtime-Env/01-Container-Architecture.md)
- [BioBridge Protocol](./README.md)
- [Miniapp Manifest](../01-Runtime-Env/02-Miniapp-Manifest.md) - permissions 字段
