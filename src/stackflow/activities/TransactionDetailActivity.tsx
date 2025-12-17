import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { ActivityParamsProvider } from "../hooks";
import { TransactionDetailPage } from "@/pages/history/detail";

type TransactionDetailParams = {
  txId: string;
};

export const TransactionDetailActivity: ActivityComponentType<TransactionDetailParams> = ({ params }) => {
  return (
    <AppScreen >
      <ActivityParamsProvider params={params}>
        <TransactionDetailPage />
      </ActivityParamsProvider>
    </AppScreen>
  );
};
