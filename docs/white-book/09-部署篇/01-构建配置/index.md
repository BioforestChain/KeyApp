# 构建配置

> 定义构建系统和多目标构建规范

---

## 构建目标

| 目标 | 输出目录 | 平台 | 说明 |
|-----|---------|------|------|
| Web | dist-web | 浏览器 | 标准 Web 应用 |
| DWEB | dist-dweb | Plaoc 容器 | DWEB 应用 |

---

## 构建配置规范

### 路径别名

| 别名 | 路径 | 说明 |
|-----|------|------|
| @ | /src | 源码根目录 |
| #biometric-impl | 动态 | 生物识别实现 |
| #storage-impl | 动态 | 存储实现 |
| #clipboard-impl | 动态 | 剪贴板实现 |

### 平台实现切换

通过环境变量切换平台特定实现：

```
SERVICE_IMPL=web  → 使用 Web API 实现
SERVICE_IMPL=dweb → 使用 DWEB/Plaoc 实现
```

### 实现文件结构

```
src/services/platform/
├── biometric/
│   ├── types.ts      # 接口定义
│   ├── web.ts        # Web 实现
│   └── dweb.ts       # DWEB 实现
├── storage/
│   ├── types.ts
│   ├── web.ts
│   └── dweb.ts
└── clipboard/
    ├── types.ts
    ├── web.ts
    └── dweb.ts
```

---

## 环境变量规范

### 变量命名

| 前缀 | 用途 | 暴露给客户端 |
|-----|------|------------|
| VITE_ | 客户端可用变量 | 是 |
| BUILD_ | 构建时变量 | 否 |
| 无前缀 | 服务端/构建变量 | 否 |

### 必需变量

| 变量 | 说明 | 示例 |
|-----|------|------|
| VITE_API_URL | API 基础 URL | https://api.example.com |
| SERVICE_IMPL | 平台实现 | web / dweb |

### 环境文件

| 文件 | 用途 |
|-----|------|
| .env | 所有环境 |
| .env.local | 本地覆盖（git 忽略） |
| .env.development | 开发环境 |
| .env.production | 生产环境 |

---

## 构建输出规范

### 代码分割策略

| 分割类型 | 规则 |
|---------|------|
| 路由分割 | 每个路由独立 chunk |
| 供应商分割 | node_modules 独立 chunk |
| 按需加载 | 大型库动态导入 |

### 文件命名规范

```
资产命名：
assets/[name]-[hash:8].[ext]

JS 命名：
[name]-[hash:8].js

CSS 命名：
[name]-[hash:8].css
```

### Source Map

| 环境 | Source Map |
|-----|------------|
| 开发 | inline |
| 生产 | hidden-source-map |

---

## 构建命令规范

### 标准命令

| 命令 | 用途 |
|-----|------|
| build | 构建默认目标（Web） |
| build:web | 构建 Web 版本 |
| build:dweb | 构建 DWEB 版本 |
| build:all | 构建所有目标 |
| preview | 预览构建结果 |

### 构建流程

```
清理输出目录
    │
    ▼
类型检查
    │
    ▼
编译 TypeScript
    │
    ▼
打包资源
    │
    ▼
代码分割
    │
    ▼
压缩优化
    │
    ▼
生成 Source Map
    │
    ▼
输出到目标目录
```

---

## 优化策略

### 包体积优化

- **MUST** Tree Shaking 移除未使用代码
- **MUST** 压缩 JS/CSS
- **SHOULD** 图片压缩和格式优化
- **SHOULD** 按需加载大型库

### 分析工具

- **SHOULD** 使用包体积分析工具
- **SHOULD** 在 CI 中检查包体积变化
- **MAY** 设置包体积预算告警

### 包体积预算

| 类型 | 预算 |
|-----|------|
| 首屏 JS | <200KB (gzip) |
| 首屏 CSS | <50KB (gzip) |
| 单个路由 chunk | <100KB (gzip) |
| 总资源 | <1MB (gzip) |

---

## 构建缓存

### 缓存策略

| 资源类型 | 缓存策略 |
|---------|---------|
| 带 hash 的资源 | 长期缓存（1年） |
| index.html | 不缓存 |
| Service Worker | 不缓存 |

### 缓存头配置

```
# 带 hash 的资源
Cache-Control: public, max-age=31536000, immutable

# HTML 入口
Cache-Control: no-cache, no-store, must-revalidate
```

---

## 多环境配置

### 环境差异

| 配置项 | 开发 | 预发布 | 生产 |
|--------|------|--------|------|
| API URL | localhost | staging.api | api |
| Source Map | inline | hidden | hidden |
| 压缩 | 否 | 是 | 是 |
| 调试工具 | 启用 | 启用 | 禁用 |

### 配置切换

- **MUST** 通过环境变量切换配置
- **MUST NOT** 在代码中硬编码环境配置
- **SHOULD** 验证环境变量存在性

---

## CI/CD 集成

### 构建检查

- **MUST** 类型检查通过
- **MUST** 测试通过
- **MUST** 构建成功
- **SHOULD** 包体积在预算内
- **SHOULD** 无安全漏洞依赖

### 构建产物

| 产物 | 用途 |
|-----|------|
| dist-web/ | Web 部署 |
| dist-dweb/ | DWEB 打包 |
| stats.html | 包分析报告 |
| coverage/ | 测试覆盖率 |

---

## 本章小结

- 支持多目标构建（Web/DWEB）
- 通过环境变量切换平台实现
- 代码分割优化首屏加载
- 设置包体积预算控制质量
- 合理的缓存策略提升性能
