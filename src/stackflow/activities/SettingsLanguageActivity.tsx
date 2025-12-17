import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { LanguagePage } from "@/pages/settings/language";

export const SettingsLanguageActivity: ActivityComponentType = () => {
  return (
    <AppScreen >
      <LanguagePage />
    </AppScreen>
  );
};

