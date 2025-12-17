import { cn } from "@/lib/utils";
import {
  IconHome,
  IconWallet,
  IconArrowsExchange,
  IconSettings,
  type Icon,
} from "@tabler/icons-react";

export type TabId = "home" | "wallet" | "transfer" | "settings";

interface Tab {
  id: TabId;
  label: string;
  icon: Icon;
}

const tabs: Tab[] = [
  { id: "home", label: "首页", icon: IconHome },
  { id: "wallet", label: "钱包", icon: IconWallet },
  { id: "transfer", label: "转账", icon: IconArrowsExchange },
  { id: "settings", label: "设置", icon: IconSettings },
];

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-md">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("size-5", isActive && "text-primary")} stroke={1.5} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}

export { tabs };
