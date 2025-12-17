import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { TransactionHistoryPage } from "@/pages/history";

export const HistoryActivity: ActivityComponentType = () => {
  return (
    <AppScreen >
      <TransactionHistoryPage />
    </AppScreen>
  );
};
