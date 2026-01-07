# 06. 编码规范 (Guidelines)

> 源自原 `00-必读/best-practices.md`，持续更新。

## Do's ✅

### 架构与模式
*   **使用 Hooks 访问服务**: 永远不要直接导入 Service 单例，使用 `useWallet()`, `useBiometric()` 等 Hooks。
*   **Zod Schema 验证**: 所有外部输入（API 响应、URL 参数）必须经过 Zod 验证。
    ```typescript
    const ResponseSchema = z.object({ result: z.string() });
    const data = ResponseSchema.parse(json);
    ```
*   **Adapter 模式**: 涉及链交互时，必须通过 `ChainProvider`，禁止直接调用特定链的 API。

### UI 开发
*   **Tailwind CSS**: 优先使用 Tailwind 类名，避免手写 `style={{}}`。
*   **语义化颜色**: 使用 `text-muted-foreground` 而不是 `text-gray-500`。
*   **响应式**: 考虑移动端优先，使用 `@xs:`, `@md:` 断点。

## Don'ts ❌

*   **禁止 hack**: 不要使用 `as any` 绕过类型检查。
*   **禁止硬编码**: 文本必须放入 `i18n`，API URL 必须放入配置文件。
*   **禁止过度封装**: 不要为了复用而创造极其复杂的组件，保持组件的单一职责。

## 最佳实践清单

*   **滚动动画**: 使用 CSS `scroll-driven animations` 而不是 JS 监听 scroll 事件。
*   **组件样式**: 复杂组件使用 CSS Modules (`*.module.css`) 配合 Tailwind。
*   **测试**: 业务逻辑必须有 Unit Test，关键流程必须有 E2E Test。
