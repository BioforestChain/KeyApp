# 01. 风格指南 (Style Guide)

遵循 [Google Developer Documentation Style Guide](https://developers.google.com/style) 和 [Microsoft Style Guide](https://learn.microsoft.com/en-us/style-guide/welcome)。

## 语言与语气 (Tone)
*   **专业 (Professional)**: 客观、冷静，避免情绪化词汇。
*   **直接 (Direct)**: 使用祈使句。例如："Create a file" 而不是 "You should create a file"。
*   **中英混排**:
    *   专有名词使用英文 (e.g., `Provider`, `Store`, `miniapp-runtime`)。
    *   中英文之间保留一个空格 (e.g., "配置 Webpack 插件")。

## 格式化 (Formatting)

### 标题
*   使用 Atx 风格 (`#`, `##`)。
*   H1 仅用于文件标题。
*   标题应包含英文对照，格式为 `中文 (English)`。

### 代码块
*   必须指定语言 (e.g., ````typescript`)。
*   关键代码应包含注释。
*   长代码应截取核心片段，并使用 `...` 表示省略。

### 引用与提示
使用 GitHub Markdown 扩展语法：

> [!NOTE]
> 这是一个普通提示。

> [!WARNING]
> 这是一个警告，用于强调潜在风险。

> [!TIP]
> 这是一个最佳实践建议。
