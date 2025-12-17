import { useState } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { TabBar, tabs, type TabId } from "../components/TabBar";
import { HomeTab } from "./tabs/HomeTab";
import { WalletTab } from "./tabs/WalletTab";
import { TransferTab } from "./tabs/TransferTab";
import { SettingsTab } from "./tabs/SettingsTab";

type MainTabsParams = {
  tab?: TabId;
};

export const MainTabsActivity: ActivityComponentType<MainTabsParams> = ({ params }) => {
  const [activeTab, setActiveTab] = useState<TabId>(params.tab || "home");

  return (
    <AppScreen
      appBar={{
        title: tabs.find((t) => t.id === activeTab)?.label || "BFM Pay",
        border: false,
      }}
    >
      <div className="flex h-full flex-col bg-background">
        {/* Content area */}
        <div className="flex-1 overflow-auto pb-20">
          {activeTab === "home" && <HomeTab />}
          {activeTab === "wallet" && <WalletTab />}
          {activeTab === "transfer" && <TransferTab />}
          {activeTab === "settings" && <SettingsTab />}
        </div>

        {/* Bottom Tab Bar */}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </AppScreen>
  );
};
