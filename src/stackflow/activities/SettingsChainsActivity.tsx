import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { ChainConfigPage } from "@/pages/settings/chain-config";

export const SettingsChainsActivity: ActivityComponentType = () => {
  return (
    <AppScreen >
      <ChainConfigPage />
    </AppScreen>
  );
};

