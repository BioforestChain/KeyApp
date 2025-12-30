import { useState, Activity } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { SwiperSyncProvider } from "@/components/common/swiper-sync-context";
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
      <SwiperSyncProvider>
        <div className="bg-background relative h-dvh">
          {/* Content area - 各 Tab 内部自己管理滚动和 pb */}
          <Activity mode={activeTab === "wallet" ? "visible" : "hidden"}>
            <WalletTab />
          </Activity>
          <Activity mode={activeTab === "ecosystem" ? "visible" : "hidden"}>
            <EcosystemTab />
          </Activity>
          <Activity mode={activeTab === "settings" ? "visible" : "hidden"}>
            <SettingsTab />
          </Activity>

          {/* TabBar - 固定在底部 */}
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </SwiperSyncProvider>
    </AppScreen>
  );
};
