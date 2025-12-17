import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { NotificationCenterPage } from "@/pages/notifications";

export const NotificationsActivity: ActivityComponentType = () => {
  return (
    <AppScreen >
      <NotificationCenterPage />
    </AppScreen>
  );
};
