import { cn } from "@/lib/utils";
import { useMemo } from "react";
import {
  IconWallet,
  IconSettings,
  IconApps,
  IconBrandMiniprogram,
  type Icon,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useStore } from "@tanstack/react-store";
import { ecosystemStore } from "@/stores/ecosystem";

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

  // 生态 tab 图标：发现用 IconApps，我的用 IconBrandMiniprogram
  const ecosystemIcon = ecosystemSubPage === 'mine' ? IconBrandMiniprogram : IconApps;

  const tabConfigs: Tab[] = useMemo(() => [
    { id: "wallet", label: t('a11y.tabWallet'), icon: IconWallet },
    { id: "ecosystem", label: t('a11y.tabEcosystem', '生态'), icon: ecosystemIcon },
    { id: "settings", label: t('a11y.tabSettings'), icon: IconSettings },
  ], [t, ecosystemIcon]);

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
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              data-testid={`tab-${tab.id}`}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn("size-5", isActive && "text-primary")} stroke={1.5} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export const tabIds: TabId[] = ["wallet", "ecosystem", "settings"];
