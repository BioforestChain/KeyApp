# Ecosystem Service

> Source: [src/services/ecosystem/](https://github.com/BioforestChain/KeyApp/tree/main/src/services/ecosystem)

## 概览

Ecosystem Service 管理小程序市场、PostMessage Bridge 通信和权限控制。

---

## 文件结构

```
ecosystem/
├── types.ts          # 类型定义
├── schema.ts         # Zod Schema
├── storage.ts        # 本地存储
├── permissions.ts    # 权限管理
├── bridge.ts         # PostMessage Bridge
├── scoring.ts        # 应用评分
├── registry.ts       # 应用注册表
├── my-apps.ts        # 我的应用
├── provider.ts       # Bridge Provider 导出
├── handlers/         # 消息处理器
│   ├── wallet.ts
│   ├── chain.ts
│   ├── signing.ts
│   └── ...
└── __tests__/
```

---

## 核心类型

### MiniappManifest

```typescript
interface MiniappManifest {
  id: string;                    // 唯一标识 (reverse domain)
  name: string;
  version: string;
  description?: string;
  icon: string;                  // 图标 URL
  url: string;                   // 入口 URL
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  permissions?: MiniappPermission[];
  splashScreen?: SplashScreenConfig;
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
  };
}

type MiniappPermission =
  | 'wallet:read'           // 读取钱包地址
  | 'wallet:sign'           // 签名交易
  | 'wallet:send'           // 发送交易
  | 'chain:read'            // 读取链信息
  | 'chain:switch'          // 切换链
  | 'notification:send'     // 发送通知
  | 'clipboard:write'       // 写入剪贴板
  | 'camera:scan';          // 扫描二维码
```

### AppSource

```typescript
interface AppSource {
  id: string;
  name: string;
  url: string;                   // 应用源 URL
  type: 'official' | 'community' | 'custom';
  verified: boolean;
  apps: MiniappManifest[];
  lastUpdated: number;
}
```

---

## PostMessage Bridge

### 架构

```
┌─────────────────┐                    ┌─────────────────┐
│   Host (KeyApp) │                    │  MiniApp (iframe)│
│                 │                    │                 │
│  ┌───────────┐  │   postMessage()   │  ┌───────────┐  │
│  │  Bridge   │◀─┼───────────────────┼──│ BioProvider│  │
│  │  Handler  │  │                    │  │   SDK     │  │
│  │           │──┼───────────────────┼─▶│           │  │
│  └───────────┘  │   postMessage()   │  └───────────┘  │
└─────────────────┘                    └─────────────────┘
```

### Bridge 实现

```typescript
// bridge.ts
class EcosystemBridge {
  private handlers = new Map<string, MessageHandler>();
  private appContexts = new Map<string, MiniappContext>();
  
  // 注册 iframe
  attach(
    iframe: HTMLIFrameElement,
    appId: string,
    appName: string,
    permissions: MiniappPermission[]
  ): void {
    const context: MiniappContext = {
      appId,
      appName,
      permissions,
      iframe,
    };
    
    this.appContexts.set(appId, context);
    
    // 监听消息
    window.addEventListener('message', (event) => {
      if (event.source !== iframe.contentWindow) return;
      this.handleMessage(appId, event.data);
    });
  }
  
  // 处理消息
  private async handleMessage(appId: string, message: BridgeMessage): Promise<void> {
    const context = this.appContexts.get(appId);
    if (!context) return;
    
    // 权限检查
    if (!this.checkPermission(context, message.method)) {
      this.sendError(context, message.id, 'PERMISSION_DENIED');
      return;
    }
    
    // 调用处理器
    const handler = this.handlers.get(message.method);
    if (!handler) {
      this.sendError(context, message.id, 'METHOD_NOT_FOUND');
      return;
    }
    
    try {
      const result = await handler(context, message.params);
      this.sendResponse(context, message.id, result);
    } catch (error) {
      this.sendError(context, message.id, error.message);
    }
  }
  
  // 发送响应
  private sendResponse(context: MiniappContext, id: string, result: unknown): void {
    context.iframe.contentWindow?.postMessage({
      jsonrpc: '2.0',
      id,
      result,
    }, '*');
  }
}
```

### 消息格式 (JSON-RPC 2.0)

```typescript
// 请求
interface BridgeRequest {
  jsonrpc: '2.0';
  id: string;
  method: string;
  params?: unknown;
}

// 响应
interface BridgeResponse {
  jsonrpc: '2.0';
  id: string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}
```

---

## 消息处理器

### Wallet Handlers

```typescript
// handlers/wallet.ts

// 获取当前地址
bridge.registerHandler('wallet_getAddress', async (context) => {
  requirePermission(context, 'wallet:read');
  
  const { currentWalletId, selectedChain } = walletStore.state;
  const wallet = walletStore.state.wallets.find(w => w.id === currentWalletId);
  const chainAddress = wallet?.chainAddresses.find(ca => ca.chain === selectedChain);
  
  return chainAddress?.address ?? null;
});

// 请求签名
bridge.registerHandler('wallet_signMessage', async (context, params) => {
  requirePermission(context, 'wallet:sign');
  
  // 弹出确认弹窗
  const approved = await showSigningConfirmJob({
    appId: context.appId,
    appName: context.appName,
    message: params.message,
  });
  
  if (!approved) throw new Error('User rejected');
  
  // 执行签名
  return await signMessage(params.message);
});

// 发送交易
bridge.registerHandler('wallet_sendTransaction', async (context, params) => {
  requirePermission(context, 'wallet:send');
  
  // 弹出确认弹窗
  const approved = await showMiniappTransferConfirmJob({
    appId: context.appId,
    transfer: params,
  });
  
  if (!approved) throw new Error('User rejected');
  
  // 执行交易
  return await sendTransaction(params);
});
```

### Chain Handlers

```typescript
// handlers/chain.ts

// 获取当前链
bridge.registerHandler('chain_getId', async (context) => {
  requirePermission(context, 'chain:read');
  return walletStore.state.selectedChain;
});

// 切换链
bridge.registerHandler('chain_switch', async (context, params) => {
  requirePermission(context, 'chain:switch');
  
  // 弹出确认弹窗
  const approved = await showChainSwitchConfirmJob({
    appId: context.appId,
    fromChain: walletStore.state.selectedChain,
    toChain: params.chainId,
  });
  
  if (!approved) throw new Error('User rejected');
  
  walletActions.setSelectedChain(params.chainId);
  return true;
});
```

---

## 权限管理

```typescript
// permissions.ts

const PERMISSION_METHODS: Record<string, MiniappPermission[]> = {
  'wallet_getAddress': ['wallet:read'],
  'wallet_signMessage': ['wallet:sign'],
  'wallet_sendTransaction': ['wallet:send'],
  'chain_getId': ['chain:read'],
  'chain_switch': ['chain:switch'],
};

function checkPermission(context: MiniappContext, method: string): boolean {
  const required = PERMISSION_METHODS[method] ?? [];
  return required.every(p => context.permissions.includes(p));
}

function requirePermission(context: MiniappContext, permission: MiniappPermission): void {
  if (!context.permissions.includes(permission)) {
    throw new PermissionDeniedError(permission);
  }
}
```

---

## 应用注册表

```typescript
// registry.ts

class AppRegistry {
  private sources: AppSource[] = [];
  
  // 添加应用源
  async addSource(url: string): Promise<AppSource> {
    const manifest = await fetch(url).then(r => r.json());
    const source = AppSourceSchema.parse(manifest);
    this.sources.push(source);
    await this.persist();
    return source;
  }
  
  // 刷新所有源
  async refreshAll(): Promise<void> {
    await Promise.all(
      this.sources.map(source => this.refreshSource(source.id))
    );
  }
  
  // 搜索应用
  search(query: string): MiniappManifest[] {
    const results: MiniappManifest[] = [];
    for (const source of this.sources) {
      for (const app of source.apps) {
        if (
          app.name.toLowerCase().includes(query.toLowerCase()) ||
          app.description?.toLowerCase().includes(query.toLowerCase())
        ) {
          results.push(app);
        }
      }
    }
    return results;
  }
}
```

---

## 相关文档

- [MiniApp Runtime](./01-Runtime.md)
- [Authorize Service](../08-Authorize/01-PlaocAdapter.md)
- [Ecosystem Components](../../03-UI-Ref/04-Domain/04-Ecosystem.md)
