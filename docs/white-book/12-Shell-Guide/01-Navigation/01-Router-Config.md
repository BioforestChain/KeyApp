# 01. 路由配置 (Router Config)

Code: `src/stackflow/stackflow.ts`

所有 Activity 必须在 `stackflow.ts` 中注册。

## 注册 Activity

```typescript
const { Stack, useFlow } = stackflow({
  activities: {
    MainTabsActivity,
    WalletListActivity,
    // ...
  },
  initialActivity: () => 'MainTabsActivity',
});
```

## 导航 (Navigation)

使用 `useFlow()` hook 进行跳转：

```typescript
const { push, pop, replace } = useFlow();

// Push new page
push('WalletDetailActivity', { walletId: '123' });

// Go back
pop();
```

注意：所有的参数传递必须是**可序列化**的（字符串、数字），因为它们会被同步到 URL Hash 中。
