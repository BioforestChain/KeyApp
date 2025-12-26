import { useState } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { TabBar, type TabId } from "../components/TabBar";
import { WalletTab } from "./tabs/WalletTab";
import { SettingsTab } from "./tabs/SettingsTab";

type MainTabsParams = {
  tab?: TabId;
};

export const MainTabsActivity: ActivityComponentType<MainTabsParams> = ({ params }) => {
  // 默认显示钱包页（合并了原来的首页）
  const [activeTab, setActiveTab] = useState<TabId>(params.tab || "wallet");

  return (
    <AppScreen>
      <div className="flex h-full flex-col bg-background">
        {/* Content area */}
        <div className="flex-1 overflow-auto pb-20">
          {activeTab === "wallet" && <WalletTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>

        {/* Bottom Tab Bar */}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </AppScreen>
  );
};
