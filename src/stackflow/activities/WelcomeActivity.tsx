import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { WelcomeScreen } from "@/pages/guide/WelcomeScreen";

export const WelcomeActivity: ActivityComponentType = () => {
  return (
    <AppScreen >
      <WelcomeScreen />
    </AppScreen>
  );
};
