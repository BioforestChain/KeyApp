# eslint-plugin-file-component-constraints

基于文件路径模式约束组件使用的 ESLint 插件。

## 规则

### `file-component-constraints/enforce`

根据文件路径模式，强制要求或禁止使用特定组件。

## 配置示例

```json
{
  "jsPlugins": ["eslint-plugin-file-component-constraints"],
  "rules": {
    "file-component-constraints/enforce": ["error", {
      "rules": [
        {
          "fileMatch": "**/sheets/Miniapp*.tsx",
          "mustUse": ["MiniappSheetHeader"],
          "mustNotUse": ["IconApps"]
        },
        {
          "fileMatch": "**/sheets/*Job.tsx",
          "fileMatchProps": ["appName", "appIcon"],
          "mustUse": ["MiniappSheetHeader"]
        }
      ]
    }]
  }
}
```

## 配置选项

### `rules`

数组，每个元素包含：

| 字段 | 类型 | 说明 |
|------|------|------|
| `fileMatch` | `string \| string[]` | 文件路径 glob 模式 |
| `fileExclude` | `string \| string[]` | 排除的文件路径模式 |
| `fileMatchProps` | `string[]` | 可选，仅当文件包含这些 props 时才应用规则 |
| `mustUse` | `string[]` | 必须使用的组件名称列表 |
| `mustNotUse` | `string[]` | 禁止使用的组件名称列表 |
| `mustImportFrom` | `Record<string, string[]>` | 组件必须从指定路径导入 |

## 使用场景

1. **统一授权弹窗头部**: 确保所有 `Miniapp*Job.tsx` 使用 `MiniappSheetHeader`
2. **禁止直接使用底层组件**: 禁止在页面中直接使用 `IconApps`，必须使用封装组件
3. **架构约束**: 确保特定目录下的文件遵循设计规范
