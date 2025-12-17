import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { ChangePasswordPage } from "@/pages/settings/change-password";

export const SettingsPasswordActivity: ActivityComponentType = () => {
  return (
    <AppScreen >
      <ChangePasswordPage />
    </AppScreen>
  );
};

