import { cn } from '@/lib/utils'

export interface TabItem {
  id: string
  label: string
  icon: React.ReactNode
  activeIcon?: React.ReactNode
  badge?: number | string
}

interface TabBarProps {
  items: TabItem[]
  activeId: string
  onTabChange: (id: string) => void
  className?: string
}

export function TabBar({ items, activeId, onTabChange, className }: TabBarProps) {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border safe-area-inset-bottom',
        className
      )}
    >
      <div className="flex items-center justify-around h-14">
        {items.map((item) => {
          const isActive = item.id === activeId
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors relative',
                isActive ? 'text-primary' : 'text-muted hover:text-foreground'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="relative">
                {isActive && item.activeIcon ? item.activeIcon : item.icon}
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 text-[10px] font-medium text-white bg-destructive rounded-full flex items-center justify-center">
                    {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
