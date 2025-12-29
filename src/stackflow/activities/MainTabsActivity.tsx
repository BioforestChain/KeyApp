import { useState, Activity } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { TabBar, type TabId } from "../components/TabBar";
import { WalletTab } from "./tabs/WalletTab";
import { EcosystemTab } from "./tabs/EcosystemTab";
import { SettingsTab } from "./tabs/SettingsTab";

type MainTabsParams = {
  tab?: TabId;
};

export const MainTabsActivity: ActivityComponentType<MainTabsParams> = ({ params }) => {
  const [activeTab, setActiveTab] = useState<TabId>(params.tab || "wallet");

  return (
    <AppScreen>
      {/* 外层禁止滚动，让各 Tab 内部自己管理滚动 */}
      <div className="h-dvh overflow-hidden bg-background">
        <div className="flex h-full flex-col">
          {/* Content area - 使用 Activity 保持 Tab 状态 */}
          <div className="flex-1 overflow-hidden">
            <Activity mode={activeTab === "wallet" ? "visible" : "hidden"} className="h-full">
              <WalletTab />
            </Activity>
            <Activity mode={activeTab === "ecosystem" ? "visible" : "hidden"} className="h-full">
              <EcosystemTab />
            </Activity>
            <Activity mode={activeTab === "settings" ? "visible" : "hidden"} className="h-full">
              <SettingsTab />
            </Activity>
          </div>

          {/* TabBar - 固定在底部 */}
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>
    </AppScreen>
  );
};
