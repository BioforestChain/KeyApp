import { cn } from "@/lib/utils";
import {
  IconHome,
  IconWallet,
  IconArrowsExchange,
  IconSettings,
  type Icon,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export type TabId = "home" | "wallet" | "transfer" | "settings";

interface Tab {
  id: TabId;
  labelKey: string;
  icon: Icon;
}

const tabConfigs: Tab[] = [
  { id: "home", labelKey: "a11y.tabHome", icon: IconHome },
  { id: "wallet", labelKey: "a11y.tabWallet", icon: IconWallet },
  { id: "transfer", labelKey: "a11y.tabTransfer", icon: IconArrowsExchange },
  { id: "settings", labelKey: "a11y.tabSettings", icon: IconSettings },
];

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-md">
        {tabConfigs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const label = t(tab.labelKey);
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              data-testid={`tab-${tab.id}`}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 transition-colors",
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
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}

export { tabConfigs as tabs };
