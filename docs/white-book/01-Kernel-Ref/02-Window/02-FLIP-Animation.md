# 02. FLIP 动画引擎 (FLIP Animation)

KeyApp 的标志性特征是其流畅的 **App 打开/关闭动画**，这完全基于 **FLIP (First, Last, Invert, Play)** 技术实现。

## 原理

1.  **First (初始态)**: 获取图标 (`IconRef`) 在屏幕上的 `DOMRect`。
2.  **Last (最终态)**: 获取应用窗口 (`SlotRef`) 在屏幕上的 `DOMRect`。
3.  **Invert (反转)**:
    *   计算两个 Rect 之间的位移 (`deltaX`, `deltaY`) 和缩放比例 (`scaleX`, `scaleY`)。
    *   将窗口元素通过 CSS `transform` 瞬间移动到图标的位置和大小，使其看起来像是在图标那里。
4.  **Play (播放)**:
    *   移除 `transform`，并添加 `transition` 属性。
    *   浏览器会自动补间，使窗口从图标位置平滑放大到全屏位置。

## 性能优化

*   **Will-Change**: 在动画开始前添加 `will-change: transform` 提示浏览器创建合成层。
*   **Layout ID**: 利用 Framer Motion 的 `layoutId` 自动处理复杂的共享元素过渡。
*   **遮罩同步**: 动画过程中，同步调整圆角 (`borderRadius`) 和遮罩，确保视觉连贯性。
