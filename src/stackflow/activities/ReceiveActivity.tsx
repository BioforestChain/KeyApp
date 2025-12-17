import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { ReceivePage } from "@/pages/receive";

export const ReceiveActivity: ActivityComponentType = () => {
  return (
    <AppScreen appBar={{ title: "收款" }}>
      <ReceivePage />
    </AppScreen>
  );
};
