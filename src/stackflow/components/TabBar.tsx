import { cn } from "@/lib/utils";
import { useMemo, useRef, useCallback } from "react";
import {
  IconWallet,
  IconSettings,
  IconApps,
  IconBrandMiniprogram,
  IconAppWindowFilled,
  type Icon,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useStore } from "@tanstack/react-store";
import { ecosystemStore } from "@/stores/ecosystem";
import {
  miniappRuntimeStore,
  miniappRuntimeSelectors,
  openStackView,
} from "@/services/miniapp-runtime";

// 3个tab：钱包、生态、设置
export type TabId = "wallet" | "ecosystem" | "settings";

interface Tab {
  id: TabId;
  label: string;
  icon: Icon;
}

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  className?: string;
}

export function TabBar({ activeTab, onTabChange, className }: TabBarProps) {
  const { t } = useTranslation('common');
  const ecosystemSubPage = useStore(ecosystemStore, (s) => s.activeSubPage);
  const hasRunningApps = useStore(miniappRuntimeStore, (s) => miniappRuntimeSelectors.getApps(s).length > 0);

  // 生态 tab 图标：
  // - 在"应用堆栈"页或有运行中应用时：IconAppWindowFilled
  // - 在"我的"页：IconBrandMiniprogram
  // - 在"发现"页：IconApps
  const ecosystemIcon = useMemo(() => {
    if (ecosystemSubPage === 'stack' || hasRunningApps) {
      return IconAppWindowFilled;
    }
    if (ecosystemSubPage === 'mine') {
      return IconBrandMiniprogram;
    }
    return IconApps;
  }, [ecosystemSubPage, hasRunningApps]);

  const tabConfigs: Tab[] = useMemo(() => [
    { id: "wallet", label: t('a11y.tabWallet'), icon: IconWallet },
    { id: "ecosystem", label: t('a11y.tabEcosystem', '生态'), icon: ecosystemIcon },
    { id: "settings", label: t('a11y.tabSettings'), icon: IconSettings },
  ], [t, ecosystemIcon]);

  // 生态按钮上滑手势检测
  const touchState = useRef({ startY: 0, startTime: 0 });
  const SWIPE_THRESHOLD = 30;
  const SWIPE_VELOCITY = 0.3;

  const handleEcosystemTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      touchState.current = { startY: touch.clientY, startTime: Date.now() };
    }
  }, []);

  const handleEcosystemTouchEnd = useCallback((e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    if (!touch) return;

    const deltaY = touchState.current.startY - touch.clientY;
    const deltaTime = Date.now() - touchState.current.startTime;
    const velocity = deltaY / deltaTime;

    // 检测上滑手势：需要有运行中的应用才能打开层叠视图
    if (hasRunningApps && (deltaY > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY)) {
      e.preventDefault();
      openStackView();
    }
  }, [hasRunningApps]);

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "border-t bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
        "pb-[env(safe-area-inset-bottom)]",
        className
      )}
      style={{ height: 'var(--tab-bar-height)' }}
    >
      <div className="mx-auto flex h-[52px] max-w-md">
        {tabConfigs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const label = tab.label;
          const isEcosystem = tab.id === 'ecosystem';

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              onTouchStart={isEcosystem ? handleEcosystemTouchStart : undefined}
              onTouchEnd={isEcosystem ? handleEcosystemTouchEnd : undefined}
              data-testid={`tab-${tab.id}`}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
                // 如果有运行中的应用，生态按钮添加小红点指示
                isEcosystem && hasRunningApps && "relative"
              )}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon className={cn("size-5", isActive && "text-primary")} stroke={1.5} />
                {/* 运行中应用指示器 */}
                {isEcosystem && hasRunningApps && (
                  <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const tabIds: TabId[] = ["wallet", "ecosystem", "settings"];
