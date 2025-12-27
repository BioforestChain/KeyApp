import type { ActivityComponentType } from "@stackflow/react";
import { useActivityParams } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { TransactionHistoryPage } from "@/pages/history";
import type { ChainType } from "@/stores";

interface HistoryActivityParams {
  chain?: ChainType | "all";
}

export const HistoryActivity: ActivityComponentType = () => {
  const params = useActivityParams<HistoryActivityParams>();

  return (
    <AppScreen>
      <TransactionHistoryPage initialChain={params.chain} />
    </AppScreen>
  );
};
