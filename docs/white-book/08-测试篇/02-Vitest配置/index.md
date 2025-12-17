# 单元测试规范

> 定义单元测试和组件测试要求

---

## 测试分类

| 测试类型 | 测试目标 | 运行环境 |
|---------|---------|---------|
| 单元测试 | 函数、工具类、Store | JSDOM/Node |
| 组件测试 | UI 组件渲染和交互 | JSDOM/Browser |
| Storybook 测试 | Story 组件行为 | Browser |

---

## 测试覆盖率要求

| 模块类型 | 覆盖率要求 |
|---------|-----------|
| 工具函数 | ≥90% |
| 服务层 | ≥80% |
| Store | ≥80% |
| 组件 | ≥70% |
| 页面 | ≥60% |

---

## 测试环境规范

### 全局 Setup 要求

- **MUST** 每个测试后清理 DOM
- **MUST** Mock localStorage 和 sessionStorage
- **MUST** Mock crypto API
- **SHOULD** Mock 网络请求
- **SHOULD** 重置所有 Store 状态

### Mock 策略

| 依赖 | Mock 方式 |
|-----|----------|
| localStorage | 内存 Map 实现 |
| crypto.getRandomValues | 伪随机生成 |
| fetch | Mock Server 或 vi.fn() |
| 平台 API | 模拟实现 |

---

## 单元测试规范

### 函数测试

```
测试结构：
describe('[模块名]', () => {
  describe('[函数名]', () => {
    it('should [预期行为] when [条件]', () => {
      // Arrange - 准备
      // Act - 执行
      // Assert - 断言
    })
  })
})
```

### 测试命名规范

- **MUST** 使用 `should ... when ...` 格式
- **MUST** 描述预期行为而非实现细节
- **SHOULD** 每个测试只验证一个行为

```
示例：
✓ should return formatted address when address is valid
✓ should throw error when address is invalid
✗ should call formatAddress function
```

---

## Store 测试规范

### 测试要点

- **MUST** 测试初始状态
- **MUST** 测试每个 Action 的状态变化
- **MUST** 测试边界条件
- **SHOULD** 测试持久化逻辑
- **SHOULD** 测试派生状态

### 测试模式

```
测试结构：
describe('[Store名]', () => {
  beforeEach(() => {
    // 重置 Store 到初始状态
  })
  
  describe('[Action名]', () => {
    it('should update state correctly', () => {
      // 执行 Action
      // 验证状态变化
    })
  })
})
```

---

## 组件测试规范

### 测试要点

- **MUST** 测试组件渲染
- **MUST** 测试用户交互
- **MUST** 测试 Props 变化
- **SHOULD** 测试错误状态
- **SHOULD** 测试加载状态
- **MAY** 测试可访问性

### 查询优先级

按以下顺序选择元素查询方式：

1. **getByRole** - 优先使用（可访问性）
2. **getByLabelText** - 表单元素
3. **getByPlaceholderText** - 输入框
4. **getByText** - 文本内容
5. **getByTestId** - 最后手段

### 用户交互测试

- **MUST** 使用 userEvent 模拟真实用户行为
- **MUST NOT** 直接调用 onChange 等回调
- **SHOULD** 等待异步操作完成

---

## 异步测试规范

### 等待策略

| 场景 | 方法 |
|-----|------|
| 元素出现 | waitFor / findBy* |
| 元素消失 | waitForElementToBeRemoved |
| 状态更新 | act() |
| API 响应 | waitFor |

### 超时配置

- **SHOULD** 设置合理的超时时间
- **MUST** 避免过长的超时导致测试慢
- **SHOULD** 默认超时 1000ms，特殊场景最多 5000ms

---

## Mock 规范

### Service Mock

```
Mock 结构：
vi.mock('@/services/[service-name]', () => ({
  [methodName]: vi.fn().mockResolvedValue(mockData)
}))
```

### 外部依赖 Mock

| 依赖类型 | Mock 位置 |
|---------|----------|
| 全局 API | setup 文件 |
| 服务层 | 测试文件顶部 |
| 组件 Props | 测试用例内 |

---

## 运行测试规范

### 命令规范

| 命令 | 用途 |
|-----|------|
| test | 运行单元测试（watch 模式） |
| test:run | 运行单元测试（单次） |
| test:storybook | 运行 Storybook 测试 |
| test:all | 运行所有测试 |
| test:coverage | 生成覆盖率报告 |

### CI 运行要求

- **MUST** 在 CI 中以非 watch 模式运行
- **MUST** 生成覆盖率报告
- **SHOULD** 设置覆盖率阈值检查
- **SHOULD** 并行运行测试加速

---

## 最佳实践

1. **独立性** - 每个测试独立运行，不依赖其他测试
2. **可重复** - 多次运行结果一致
3. **快速** - 单个测试应在 100ms 内完成
4. **清晰** - 测试失败时能快速定位问题
5. **真实** - 尽量模拟真实用户行为

---

## 本章小结

- 测试分为单元测试、组件测试、Storybook 测试
- 明确各模块覆盖率要求
- 使用 AAA 模式组织测试代码
- 遵循查询优先级选择元素
- 使用 userEvent 模拟真实交互
