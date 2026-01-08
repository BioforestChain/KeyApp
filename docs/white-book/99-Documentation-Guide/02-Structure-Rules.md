# 02. 结构化规则 (Structure Rules)

为了便于 AI 索引和自动化工具处理，每个文档必须遵循严格的结构。

## 文件头 (Header)

每个技术文档 (**Reference/Guide**) 必须包含以下 Frontmatter (以注释形式)：

```markdown
<!--
Type: Reference | Guide | Spec
Area: Kernel | Driver | UI | ...
Code Source: src/services/miniapp-runtime/
Created: 2026-01-07
-->

# 01. 模块名称 (Module Name)
```

## 标准段落结构

1.  **Overview (概览)**: 一句话解释该模块是做什么的。
2.  **Architecture (架构)**: (可选) Mermaid 图或数据流图。
3.  **Key Concepts (核心概念)**: 解释核心名词和数据结构。
4.  **API / Implementation (接口/实现)**: 详细的代码逻辑解析。
5.  **Usage (用法)**: 如何在其他模块调用此模块。
6.  **Constraints (约束)**: 限制条件和注意事项。

## 链接规范

*   **内部链接**: 使用相对路径引用其他章节 (e.g., `[Window Manager](../02-Window/README.md)`)。
*   **代码链接**: 如果可能，提供指向 GitHub 源码的 permalink。
