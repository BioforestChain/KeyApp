# 附录 C：mpay 迁移指南

本指南帮助开发者理解从 mpay (Angular) 到 BFM Pay (React) 的架构演进和代码迁移策略。

---

## 一、架构对比

### 1.1 技术栈对比

| 方面 | mpay (旧) | BFM Pay (新) |
|-----|----------|--------------|
| **框架** | Angular 15 | React 19 |
| **构建** | Angular CLI | Vite 7 |
| **路由** | Angular Router | Stackflow |
| **状态** | RxJS + Services | TanStack Store + Query |
| **表单** | Reactive Forms | TanStack Form |
| **样式** | Ionic Components | shadcn/ui + Tailwind |
| **测试** | Jasmine + Karma | Vitest + Playwright |
| **类型** | TypeScript | TypeScript (Strict) |

### 1.2 项目结构对比

```
# mpay 结构
src/
├── app/
│   ├── pages/           # 页面模块
│   ├── services/        # 全局服务
│   ├── components/      # 共享组件
│   └── guards/          # 路由守卫

# BFM Pay 结构
src/
├── pages/               # 页面组件
├── components/          # UI 组件
├── services/            # 服务层 (Adapter 模式)
├── stores/              # TanStack Store
├── hooks/               # React Hooks
└── stackflow/           # 导航配置
```

---

## 二、核心模块迁移

### 2.1 服务层迁移

#### mpay: Angular Service

```typescript
// mpay: wallet.service.ts
@Injectable({ providedIn: 'root' })
export class WalletService {
  private wallets$ = new BehaviorSubject<Wallet[]>([])
  
  getWallets(): Observable<Wallet[]> {
    return this.wallets$.asObservable()
  }
  
  async createWallet(mnemonic: string): Promise<Wallet> {
    // 实现...
  }
}
```

#### BFM Pay: TanStack Store + Adapter

```typescript
// BFM Pay: stores/wallet.ts
export const walletStore = new Store<WalletState>({
  wallets: [],
  activeWalletId: null
})

// services/wallet/adapter.ts
export class WalletAdapter implements IWalletService {
  async createWallet(params: CreateWalletParams): Promise<Wallet> {
    const wallet = await this.deriveWallet(params)
    walletStore.setState(state => ({
      wallets: [...state.wallets, wallet]
    }))
    return wallet
  }
}
```

### 2.2 页面迁移

#### mpay: Angular Component

```typescript
// mpay: home.component.ts
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  wallets$: Observable<Wallet[]>
  
  constructor(private walletService: WalletService) {
    this.wallets$ = this.walletService.getWallets()
  }
  
  ngOnInit() {
    this.loadWallets()
  }
}
```

#### BFM Pay: React + Hooks

```tsx
// BFM Pay: pages/home/index.tsx
export function HomePage() {
  const wallets = useStore(walletStore, state => state.wallets)
  const { data, isLoading } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => walletAdapter.getWallets()
  })
  
  return (
    <div>
      {wallets.map(wallet => (
        <WalletCard key={wallet.id} wallet={wallet} />
      ))}
    </div>
  )
}
```

### 2.3 路由迁移

#### mpay: Angular Router

```typescript
// mpay: app-routing.module.ts
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'wallet/:id', component: WalletDetailComponent },
  { 
    path: 'settings', 
    loadChildren: () => import('./settings/settings.module')
  }
]
```

#### BFM Pay: Stackflow

```typescript
// BFM Pay: stackflow/stackflow.ts
const activities = {
  HomeActivity: () => import('./activities/HomeActivity'),
  WalletDetailActivity: () => import('./activities/WalletDetailActivity'),
  SettingsActivity: () => import('./activities/SettingsActivity')
}

// 导航使用
const { push, pop } = useNavigation()
push('WalletDetailActivity', { walletId: '123' })
```

---

## 三、关键文件映射

### 3.1 页面映射

| mpay 页面 | BFM Pay 页面 | 说明 |
|----------|-------------|------|
| `pages/home/` | `stackflow/activities/HomeActivity` | 首页 |
| `pages/mnemonic/pages/home-transfer/` | `pages/transfer/` | 转账 |
| `pages/mnemonic/pages/home-receive/` | `pages/receive/` | 收款 |
| `pages/authorize/pages/signature/` | `pages/authorize/signature` | DWEB 签名授权 |
| `pages/setting/` | `stackflow/activities/tabs/SettingsTab` | 设置 |

### 3.2 服务映射

| mpay 服务 | BFM Pay 服务 | 说明 |
|----------|-------------|------|
| `wallet-data-storage.ts` | `stores/wallet.ts` | 钱包存储 |
| `bfm-chain.service.ts` | `services/chain/bfm-adapter.ts` | BFM 链服务 |
| `exchange-rate.service.ts` | `services/currency/` | 汇率服务 |
| `biometric.service.ts` | `services/platform/biometric.ts` | 生物识别 |

### 3.3 组件映射

| mpay 组件 | BFM Pay 组件 | 说明 |
|----------|-------------|------|
| `<ion-button>` | `<Button>` | 按钮 |
| `<ion-input>` | `<Input>` | 输入框 |
| `<ion-card>` | `<Card>` | 卡片 |
| `<ion-modal>` | `<Sheet>` / `<Dialog>` | 弹窗 |
| `<ion-loading>` | `<Skeleton>` / `<Spinner>` | 加载态 |

---

## 四、RxJS 到 React 迁移

### 4.1 Observable → useQuery

```typescript
// mpay: RxJS
this.balance$ = this.chainService.getBalance(address).pipe(
  switchMap(balance => this.convertToCurrency(balance)),
  shareReplay(1)
)

// BFM Pay: TanStack Query
const { data: balance } = useQuery({
  queryKey: ['balance', address],
  queryFn: () => chainAdapter.getBalance(address),
  select: data => convertToCurrency(data)
})
```

### 4.2 BehaviorSubject → Store

```typescript
// mpay: BehaviorSubject
private settings$ = new BehaviorSubject<Settings>(defaultSettings)

updateSettings(partial: Partial<Settings>) {
  this.settings$.next({ ...this.settings$.value, ...partial })
}

// BFM Pay: TanStack Store
const settingsStore = new Store<Settings>(defaultSettings)

settingsStore.setState(state => ({ ...state, ...partial }))
```

### 4.3 Subject → Event Emitter

```typescript
// mpay: Subject
private txEvent$ = new Subject<TransactionEvent>()

emitTransaction(event: TransactionEvent) {
  this.txEvent$.next(event)
}

// BFM Pay: Subscribable
class TransactionEvents implements Subscribable<TransactionEvent> {
  private listeners = new Set<(event: TransactionEvent) => void>()
  
  subscribe(callback: (event: TransactionEvent) => void) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }
  
  emit(event: TransactionEvent) {
    this.listeners.forEach(cb => cb(event))
  }
}
```

---

## 五、DWEB/Plaoc 迁移

### 5.1 DeepLink 处理

```typescript
// mpay: Angular
this.deepLinks.route({
  '/authorize/address': AddressAuthPage,
  '/authorize/signature': SignatureAuthPage
})

// BFM Pay: React
// src/services/authorize/deep-link.ts
export function handleDeepLink(url: string) {
  const parsed = parseDeepLink(url)
  
  switch (parsed.action) {
    case 'authorize-address':
      navigation.push('AuthorizeAddressActivity', parsed.params)
      break
    case 'authorize-signature':
      navigation.push('AuthorizeSignatureActivity', parsed.params)
      break
  }
}
```

### 5.2 Plaoc API 调用

```typescript
// mpay 与 BFM Pay 相同 (Plaoc API 不变)
import { dwebServiceWorker } from '@aspect/aspect'

// 返回授权结果
await dwebServiceWorker.postMessage({
  type: 'authorize-response',
  data: { address, signature }
})
```

---

## 六、数据迁移

### 6.1 存储格式兼容

```typescript
// 读取 mpay 格式数据
interface MpayWalletData {
  wallets: Array<{
    name: string
    mnemonic: string  // 加密存储
    addresses: string[]
  }>
}

// 转换为 BFM Pay 格式
function migrateMpayData(mpayData: MpayWalletData): WalletState {
  return {
    wallets: mpayData.wallets.map(w => ({
      id: generateId(),
      name: w.name,
      encryptedMnemonic: w.mnemonic,
      accounts: w.addresses.map(addr => ({ address: addr }))
    })),
    activeWalletId: null
  }
}
```

### 6.2 迁移检测

```typescript
// 应用启动时检测
async function checkMigration() {
  const mpayData = await storage.get('mpay-wallets')
  
  if (mpayData && !await storage.get('bfmpay-migrated')) {
    const migrated = migrateMpayData(mpayData)
    await storage.set('bfmpay-wallets', migrated)
    await storage.set('bfmpay-migrated', true)
  }
}
```

---

## 七、常见迁移问题

### Q1: Angular DI 如何迁移？

使用 React Context 或直接导入单例：

```typescript
// 方案 1: Context
const ChainContext = createContext<IChainAdapter>(null!)
export const useChainAdapter = () => useContext(ChainContext)

// 方案 2: 单例导入 (推荐简单场景)
import { chainAdapter } from '@/services/chain'
```

### Q2: ngOnInit / ngOnDestroy 如何迁移？

```typescript
// Angular
ngOnInit() { this.loadData() }
ngOnDestroy() { this.subscription.unsubscribe() }

// React
useEffect(() => {
  loadData()
  return () => cleanup()
}, [])
```

### Q3: 模板语法如何迁移？

```html
<!-- Angular -->
<div *ngIf="loading">Loading...</div>
<div *ngFor="let item of items">{{ item.name }}</div>

<!-- React -->
{loading && <div>Loading...</div>}
{items.map(item => <div key={item.id}>{item.name}</div>)}
```

### Q4: Ionic 组件如何替换？

参考组件映射表 (3.3)，使用 shadcn/ui 对应组件。

---

## 八、迁移检查清单

- [ ] 服务层迁移到 Adapter 模式
- [ ] RxJS 迁移到 TanStack Query/Store
- [ ] 路由迁移到 Stackflow
- [ ] 表单迁移到 TanStack Form
- [ ] Ionic 组件迁移到 shadcn/ui
- [ ] DWEB/Plaoc 功能验证
- [ ] 数据格式兼容性测试
- [ ] E2E 测试覆盖核心流程
