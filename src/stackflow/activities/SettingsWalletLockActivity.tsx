import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { ChangeWalletLockPage } from "@/pages/settings/change-wallet-lock";

export const SettingsWalletLockActivity: ActivityComponentType = () => {
  return (
    <AppScreen>
      <ChangeWalletLockPage />
    </AppScreen>
  );
};
