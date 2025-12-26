import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { SettingsStoragePage } from "@/pages/settings/storage";

export const SettingsStorageActivity: ActivityComponentType = () => {
  return (
    <AppScreen>
      <SettingsStoragePage />
    </AppScreen>
  );
};
