import type { ActivityComponentType } from "@stackflow/react";
import { WalletChainsPage } from "@/pages/settings/wallet-chains";
import { AppScreen } from "@stackflow/plugin-basic-ui";

export const SettingsWalletChainsActivity: ActivityComponentType = () => {
  return (
    <AppScreen>
      <WalletChainsPage />
    </AppScreen>
  );
};
