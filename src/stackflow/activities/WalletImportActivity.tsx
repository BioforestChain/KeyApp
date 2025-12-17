import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { WalletImportPage } from "@/pages/wallet/import";

export const WalletImportActivity: ActivityComponentType = () => {
  return (
    <AppScreen >
      <WalletImportPage />
    </AppScreen>
  );
};
