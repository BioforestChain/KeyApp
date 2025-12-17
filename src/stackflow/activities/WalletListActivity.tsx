import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { WalletListPage } from "@/pages/wallet/list";

export const WalletListActivity: ActivityComponentType = () => {
  return (
    <AppScreen >
      <WalletListPage />
    </AppScreen>
  );
};
