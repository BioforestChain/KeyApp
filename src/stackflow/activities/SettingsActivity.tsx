import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { SettingsPage } from "@/pages/settings";

type SettingsParams = {
  section?: string;
};

export const SettingsActivity: ActivityComponentType<SettingsParams> = () => {
  return (
    <AppScreen >
      <SettingsPage />
    </AppScreen>
  );
};
