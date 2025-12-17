import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { OnboardingRecoverPage } from "@/pages/onboarding/recover";

export const OnboardingRecoverActivity: ActivityComponentType = () => {
  return (
    <AppScreen appBar={{ title: "恢复钱包" }}>
      <OnboardingRecoverPage />
    </AppScreen>
  );
};
