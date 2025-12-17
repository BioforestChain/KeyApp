import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { ViewMnemonicPage } from "@/pages/settings/view-mnemonic";

export const SettingsMnemonicActivity: ActivityComponentType = () => {
  return (
    <AppScreen >
      <ViewMnemonicPage />
    </AppScreen>
  );
};

