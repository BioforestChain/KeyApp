import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { ActivityParamsProvider } from "../hooks";
import { WalletDetailPage } from "@/pages/wallet/detail";

type WalletDetailParams = {
  walletId: string;
  walletName?: string;
};

export const WalletDetailActivity: ActivityComponentType<WalletDetailParams> = ({ params }) => {
  return (
    <AppScreen appBar={{ title: params.walletName || "钱包详情" }}>
      <ActivityParamsProvider params={params}>
        <WalletDetailPage />
      </ActivityParamsProvider>
    </AppScreen>
  );
};
