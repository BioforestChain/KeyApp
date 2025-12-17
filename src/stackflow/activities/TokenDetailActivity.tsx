import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { ActivityParamsProvider } from "../hooks";
import { TokenDetailPage } from "@/pages/token/detail";

type TokenDetailParams = {
  tokenId: string;
};

export const TokenDetailActivity: ActivityComponentType<TokenDetailParams> = ({ params }) => {
  return (
    <AppScreen appBar={{ title: "代币详情" }}>
      <ActivityParamsProvider params={params}>
        <TokenDetailPage />
      </ActivityParamsProvider>
    </AppScreen>
  );
};
