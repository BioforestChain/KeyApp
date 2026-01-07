# Button 按钮

Code: `src/components/ui/button.tsx`

基础交互组件，支持多种变体和尺寸。

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `default` \| `destructive` \| `outline` \| `secondary` \| `ghost` \| `link` | `default` | 视觉样式变体 |
| `size` | `default` \| `sm` \| `lg` \| `icon` | `default` | 尺寸大小 |
| `asChild` | `boolean` | `false` | 是否作为 Slot 渲染子元素 |

## Usage

```tsx
import { Button } from "@/components/ui/button"

export function Example() {
  return (
    <div className="flex gap-4">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline" size="icon">
        <PlusIcon />
      </Button>
    </div>
  )
}
```
