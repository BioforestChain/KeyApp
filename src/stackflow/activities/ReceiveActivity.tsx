import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { ReceivePage } from "@/pages/receive";

export const ReceiveActivity: ActivityComponentType = () => {
  return (
    <AppScreen >
      <ReceivePage />
    </AppScreen>
  );
};
