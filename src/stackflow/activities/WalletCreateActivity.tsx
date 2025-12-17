import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { WalletCreatePage } from "@/pages/wallet/create";

export const WalletCreateActivity: ActivityComponentType = () => {
  return (
    <AppScreen appBar={{ title: "创建钱包" }}>
      <WalletCreatePage />
    </AppScreen>
  );
};
