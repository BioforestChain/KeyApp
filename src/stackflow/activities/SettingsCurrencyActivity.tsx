import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { CurrencyPage } from "@/pages/settings/currency";

export const SettingsCurrencyActivity: ActivityComponentType = () => {
  return (
    <AppScreen >
      <CurrencyPage />
    </AppScreen>
  );
};

